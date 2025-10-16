import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { AppointmentService } from '@/lib/appointment-service'

// POST /api/appointments/compare - Compare availability across multiple workshops
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only customers should compare workshop availability
    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Only customers can compare workshop availability' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { workshopIds, duration, preferredDate, quotationId } = body

    // Validate required fields
    if (!workshopIds || !Array.isArray(workshopIds) || workshopIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'workshopIds array is required' },
        { status: 400 }
      )
    }

    if (workshopIds.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 workshops can be compared at once' },
        { status: 400 }
      )
    }

    // Validate workshop IDs
    const validWorkshopIds = workshopIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id))

    if (validWorkshopIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid workshop IDs provided' },
        { status: 400 }
      )
    }

    let estimatedDuration = duration || 2 // Default 2 hours

    // If quotationId is provided, estimate duration from services
    if (quotationId && ObjectId.isValid(quotationId)) {
      try {
        const { db } = await connectToDatabase()
        const quotation = await db.collection('quotations').findOne({
          _id: new ObjectId(quotationId),
          customerId: new ObjectId(session.user.id)
        })

        if (quotation?.requestedServices) {
          estimatedDuration = AppointmentService.estimateServiceDuration(quotation.requestedServices)
        }
      } catch (error) {
        console.warn('Could not estimate duration from quotation:', error)
      }
    }

    // Validate duration
    if (estimatedDuration < 0.5 || estimatedDuration > 12) {
      return NextResponse.json(
        { success: false, error: 'Duration must be between 0.5 and 12 hours' },
        { status: 400 }
      )
    }

    // Get comparison data
    const comparisonResults = await AppointmentService.compareWorkshopAvailability(
      validWorkshopIds,
      estimatedDuration,
      preferredDate ? new Date(preferredDate) : undefined,
      7 // Check next 7 days
    )

    // Get detailed availability for each workshop if requested
    const includeDetailedAvailability = body.includeDetailedAvailability === true
    let detailedAvailability: any = {}

    if (includeDetailedAvailability) {
      const startDate = preferredDate ? new Date(preferredDate) : new Date()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7) // Next 7 days

      for (const workshop of comparisonResults) {
        try {
          const availability = await AppointmentService.getWorkshopAvailability(
            workshop.workshopId,
            startDate,
            endDate,
            estimatedDuration
          )

          detailedAvailability[workshop.workshopId.toString()] = {
            availability,
            summary: {
              totalDays: availability.length,
              daysWithAvailability: availability.filter(day =>
                day.availableSlots.some(slot => slot.isAvailable)
              ).length,
              totalAvailableSlots: availability.reduce((sum, day) =>
                sum + day.availableSlots.filter(slot => slot.isAvailable).length, 0
              ),
              earliestAvailable: availability
                .flatMap(day => day.availableSlots)
                .find(slot => slot.isAvailable)
            }
          }
        } catch (error) {
          console.warn(`Could not get detailed availability for workshop ${workshop.workshopId}:`, error)
          detailedAvailability[workshop.workshopId.toString()] = null
        }
      }
    }

    // Sort results by availability (earliest first, then by most available slots)
    const sortedResults = comparisonResults.sort((a, b) => {
      // First by earliest availability (lower wait time is better)
      if (a.averageWaitTime !== b.averageWaitTime) {
        return a.averageWaitTime - b.averageWaitTime
      }
      // Then by number of available slots (more is better)
      return b.availableSlotsCount - a.availableSlotsCount
    })

    // Calculate availability score for each workshop (0-100)
    const maxAvailableSlots = Math.max(...sortedResults.map(r => r.availableSlotsCount), 1)
    const maxWaitTime = Math.max(...sortedResults.map(r => r.averageWaitTime), 1)

    const resultsWithScores = sortedResults.map(result => {
      // Availability score: 60% based on available slots, 40% based on wait time
      const slotsScore = (result.availableSlotsCount / maxAvailableSlots) * 60
      const waitTimeScore = ((maxWaitTime - result.averageWaitTime) / maxWaitTime) * 40
      const availabilityScore = Math.round(slotsScore + waitTimeScore)

      return {
        ...result,
        workshopId: result.workshopId.toString(),
        availabilityScore,
        recommendation: availabilityScore >= 80 ? 'excellent' :
                      availabilityScore >= 60 ? 'good' :
                      availabilityScore >= 40 ? 'limited' : 'poor'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        comparisonSummary: {
          workshopsCompared: validWorkshopIds.length,
          estimatedDuration,
          preferredDate: preferredDate || null,
          daysChecked: 7
        },
        results: resultsWithScores,
        recommendations: {
          bestAvailability: resultsWithScores[0], // First is best due to sorting
          mostFlexible: resultsWithScores.find(r => r.availableSlotsCount === maxAvailableSlots),
          earliest: resultsWithScores.find(r => r.averageWaitTime === Math.min(...resultsWithScores.map(x => x.averageWaitTime)))
        },
        detailedAvailability: includeDetailedAvailability ? detailedAvailability : undefined
      }
    })

  } catch (error) {
    console.error('Error comparing workshop availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to compare workshop availability' },
      { status: 500 }
    )
  }
}

// GET /api/appointments/compare - Get quick comparison for workshops in a quotation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Only customers can compare workshop availability' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const quotationId = searchParams.get('quotationId')

    if (!quotationId || !ObjectId.isValid(quotationId)) {
      return NextResponse.json(
        { success: false, error: 'Valid quotationId is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get the quotation and its quotes
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(quotationId),
      customerId: new ObjectId(session.user.id)
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found or access denied' },
        { status: 404 }
      )
    }

    // Get workshop IDs from submitted quotes
    const submittedQuotes = quotation.quotes.filter((q: any) => q.status === 'submitted')
    const workshopIds = submittedQuotes.map((q: any) => q.workshopId)

    if (workshopIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No submitted quotes available for comparison',
          quotationId,
          results: []
        }
      })
    }

    // Estimate duration from requested services
    const estimatedDuration = quotation.requestedServices ?
      AppointmentService.estimateServiceDuration(quotation.requestedServices) : 2

    // Get comparison results
    const comparisonResults = await AppointmentService.compareWorkshopAvailability(
      workshopIds,
      estimatedDuration,
      quotation.timeline?.preferredStartDate ? new Date(quotation.timeline.preferredStartDate) : undefined,
      7
    )

    // Enhance results with quote information
    const enhancedResults = comparisonResults.map(result => {
      const correspondingQuote = submittedQuotes.find((q: any) =>
        q.workshopId.toString() === result.workshopId.toString()
      )

      return {
        ...result,
        workshopId: result.workshopId.toString(),
        quote: correspondingQuote ? {
          id: correspondingQuote.id,
          totalAmount: correspondingQuote.totalAmount,
          currency: correspondingQuote.currency,
          estimatedDuration: correspondingQuote.estimatedDuration,
          validUntil: correspondingQuote.validUntil
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        quotationId,
        estimatedDuration,
        workshopsWithQuotes: workshopIds.length,
        results: enhancedResults
      }
    })

  } catch (error) {
    console.error('Error getting quotation availability comparison:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get availability comparison' },
      { status: 500 }
    )
  }
}