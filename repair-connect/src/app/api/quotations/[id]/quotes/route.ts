import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/quotations/[id]/quotes - Get enriched quotes with workshop details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quotation ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get the quotation
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Check permissions - customer must own quotation, workshop must be involved
    const isCustomer = session.user.role === 'customer' && quotation.customerId.toString() === session.user.id
    const isInvolvedWorkshop = session.user.role === 'workshop' &&
      quotation.quotes?.some((quote: any) => quote.workshopId.toString() === session.user.id)

    if (!isCustomer && !isInvolvedWorkshop) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all workshop IDs from quotes
    const workshopIds = quotation.quotes?.map((quote: any) => new ObjectId(quote.workshopId.toString())) || []

    if (workshopIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          quotation: {
            _id: quotation._id.toString(),
            status: quotation.status,
            vehicle: quotation.vehicle
          },
          quotes: []
        }
      })
    }

    // Fetch workshop details in parallel
    const workshops = await db.collection('workshops')
      .find({ userId: { $in: workshopIds } })
      .toArray()

    // Create a map for quick lookup
    const workshopMap = new Map()
    workshops.forEach(workshop => {
      workshopMap.set(workshop.userId.toString(), workshop)
    })

    // Enrich quotes with workshop data
    const enrichedQuotes = quotation.quotes?.map((quote: any) => {
      const workshop = workshopMap.get(quote.workshopId.toString())

      if (!workshop) {
        return {
          ...quote,
          workshopId: quote.workshopId.toString(),
          location: null,
          rating: null,
          distance: null
        }
      }

      // Calculate distance from customer location if available
      let distance = null
      if (quotation.location && workshop.location) {
        // Simple distance calculation (in km) - can be improved with more accurate geospatial queries
        const customerLng = quotation.location.coordinates[0]
        const customerLat = quotation.location.coordinates[1]
        const workshopLng = workshop.location.coordinates[0]
        const workshopLat = workshop.location.coordinates[1]

        const R = 6371 // Earth's radius in km
        const dLat = (workshopLat - customerLat) * Math.PI / 180
        const dLng = (workshopLng - customerLng) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(customerLat * Math.PI / 180) * Math.cos(workshopLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        distance = Math.round(R * c * 10) / 10 // Round to 1 decimal place
      }

      // Get service-specific rating if available
      const serviceRating = getServiceSpecificRating(workshop, quotation.requestedServices)

      return {
        ...quote,
        workshopId: quote.workshopId.toString(),
        location: {
          address: workshop.address?.street || 'Address not provided',
          city: workshop.address?.city || 'Unknown',
          state: workshop.address?.state || 'Unknown',
          coordinates: workshop.location?.coordinates || null
        },
        rating: {
          overall: workshop.stats?.averageRating || 0,
          totalReviews: workshop.stats?.totalReviews || 0,
          serviceSpecific: serviceRating
        },
        distance,
        workshopInfo: {
          businessName: workshop.profile?.businessName || quote.workshopName,
          logo: workshop.profile?.logo || quote.workshopLogo,
          phone: workshop.contact?.phone || quote.contactPhone,
          email: workshop.contact?.email || quote.contactEmail,
          certifications: workshop.certifications?.filter((cert: any) => cert.verified) || [],
          specializations: workshop.profile?.specializations || {}
        }
      }
    }) || []

    // Filter quotes based on user role and competition status
    let quotesToReturn = enrichedQuotes
    let competitionSummary = null

    if (session.user.role === 'workshop') {
      // For workshops, show their own quote plus competition status summary
      const ownQuote = enrichedQuotes.find((quote: any) => quote.workshopId === session.user.id)
      quotesToReturn = ownQuote ? [ownQuote] : []

      // Provide competition summary without revealing competitor details
      const competitorQuotes = enrichedQuotes.filter((quote: any) => quote.workshopId !== session.user.id)
      const submittedCompetitors = competitorQuotes.filter((quote: any) => quote.status === 'submitted')

      competitionSummary = {
        totalCompetitors: competitorQuotes.length,
        competitorsSubmitted: submittedCompetitors.length,
        competitionStatus: quotation.status === 'accepted' ? 'closed' : 'active',
        winnerInfo: quotation.status === 'accepted' && quotation.acceptedQuoteId ? {
          isWinner: ownQuote?.id === quotation.acceptedQuoteId,
          winnerWorkshop: quotation.status === 'accepted' ?
            enrichedQuotes.find((q: any) => q.id === quotation.acceptedQuoteId)?.workshopName : null,
          winningAmount: quotation.status === 'accepted' ?
            enrichedQuotes.find((q: any) => q.id === quotation.acceptedQuoteId)?.totalAmount : null
        } : null,
        statusMessage: getWorkshopStatusMessage(quotation.status, ownQuote, competitorQuotes.length, submittedCompetitors.length)
      }
    }

    // Sort quotes by price for customers (lowest first)
    if (session.user.role === 'customer') {
      quotesToReturn = quotesToReturn
        .filter((quote: any) => quote.status === 'submitted' || quote.status === 'accepted' || quote.status === 'declined')
        .sort((a: any, b: any) => a.totalAmount - b.totalAmount)
    }

    return NextResponse.json({
      success: true,
      data: {
        quotation: {
          _id: quotation._id.toString(),
          status: quotation.status,
          vehicle: quotation.vehicle,
          requestedServices: quotation.requestedServices,
          createdAt: quotation.createdAt,
          expiresAt: quotation.expiresAt,
          acceptedQuoteId: quotation.acceptedQuoteId
        },
        quotes: quotesToReturn,
        competitionSummary,
        summary: {
          totalQuotes: enrichedQuotes.length,
          submittedQuotes: enrichedQuotes.filter((q: any) => q.status === 'submitted').length,
          acceptedQuotes: enrichedQuotes.filter((q: any) => q.status === 'accepted').length,
          priceRange: session.user.role === 'customer' && enrichedQuotes.length > 0 ? {
            min: Math.min(...enrichedQuotes.map((q: any) => q.totalAmount)),
            max: Math.max(...enrichedQuotes.map((q: any) => q.totalAmount)),
            average: enrichedQuotes.reduce((sum: number, q: any) => sum + q.totalAmount, 0) / enrichedQuotes.length
          } : null
        }
      }
    })

  } catch (error) {
    console.error('Error fetching enriched quotes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}

// Helper function to generate status messages for workshops
function getWorkshopStatusMessage(
  quotationStatus: string,
  ownQuote: any,
  totalCompetitors: number,
  submittedCompetitors: number
): string {
  if (quotationStatus === 'accepted') {
    if (ownQuote?.status === 'accepted') {
      return 'Congratulations! Your quote was selected by the customer.'
    } else {
      return `Competition closed. Another workshop was selected from ${totalCompetitors + 1} participants.`
    }
  }

  if (quotationStatus === 'cancelled' || quotationStatus === 'expired') {
    return 'This quotation request is no longer active.'
  }

  // Active competition status
  if (!ownQuote || ownQuote.status === 'pending') {
    if (submittedCompetitors === 0) {
      return `You can submit your quote. ${totalCompetitors} other workshops invited.`
    } else {
      return `${submittedCompetitors} of ${totalCompetitors} competitors have submitted quotes. You can still submit yours.`
    }
  }

  if (ownQuote.status === 'submitted') {
    if (submittedCompetitors === 0) {
      return `Your quote is submitted. Waiting for ${totalCompetitors} competitors.`
    } else {
      return `Your quote is submitted. ${submittedCompetitors} of ${totalCompetitors} competitors have also submitted.`
    }
  }

  return 'Competition is active. You can submit or update your quote.'
}

// Helper function to get service-specific rating
function getServiceSpecificRating(workshop: any, requestedServices: string[]) {
  if (!workshop.stats?.serviceRatings) {
    return null
  }

  // Find ratings for requested services
  const relevantRatings = requestedServices
    .map(service => workshop.stats.serviceRatings[service])
    .filter(rating => rating !== undefined)

  if (relevantRatings.length === 0) {
    return null
  }

  // Calculate average of service-specific ratings
  const average = relevantRatings.reduce((sum: number, rating: any) =>
    sum + (rating.averageRating || 0), 0) / relevantRatings.length

  const totalReviews = relevantRatings.reduce((sum: number, rating: any) =>
    sum + (rating.reviewCount || 0), 0)

  return {
    averageRating: Math.round(average * 10) / 10,
    reviewCount: totalReviews,
    services: requestedServices
  }
}