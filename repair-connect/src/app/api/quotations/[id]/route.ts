import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/quotations/[id] - Get specific quotation
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
    
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }
    
    // Check permissions
    const isCustomer = session.user.role === 'customer' && quotation.customerId.toString() === session.user.id
    const isTargetedWorkshop = session.user.role === 'workshop' && (
      quotation.targetWorkshops?.some((id: ObjectId) => id.toString() === session.user.id) ||
      quotation.quotes?.some((quote: any) => quote.workshopId.toString() === session.user.id)
    )
    const isOpenToWorkshops = session.user.role === 'workshop' && !quotation.targetWorkshops
    
    if (!isCustomer && !isTargetedWorkshop && !isOpenToWorkshops) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Increment view count if not the customer
    if (session.user.role === 'workshop') {
      await db.collection('quotations').updateOne(
        { _id: new ObjectId(resolvedParams.id) },
        { $inc: { viewCount: 1 } }
      )
    }
    
    // Fetch car images if carId exists
    let carImages: string[] = []
    if (quotation.carId) {
      try {
        const car = await db.collection('cars').findOne({
          _id: new ObjectId(quotation.carId)
        })
        if (car && car.media) {
          carImages = car.media
            .filter((media: any) => media.type === 'photo')
            .map((media: any) => media.url)
        }
      } catch (error) {
        console.error('Error fetching car images:', error)
        // Continue without images if fetch fails
      }
    }

    // Auto-detect and link service request if not already linked or data needs syncing
    let serviceRequestId = quotation.sourceServiceRequestId
    let shouldUpdateQuotation = false

    if (!serviceRequestId) {
      // Try to extract from damage description text
      const damageDesc = quotation.damageDescription?.[0]?.description || ''
      const match = damageDesc.match(/service request ([a-f0-9]{24})/i)
      if (match) {
        serviceRequestId = match[1]
        shouldUpdateQuotation = true
        console.log('Auto-detected service request ID:', serviceRequestId)
      }
    } else {
      // Check if quotation data is still generic and needs syncing
      const hasGenericData = (
        quotation.requestedServices?.includes('repair') ||
        quotation.damageDescription?.[0]?.area === 'General'
      )

      if (hasGenericData) {
        shouldUpdateQuotation = true
        console.log('Quotation has generic data, will re-sync with service request')
      }
    }

    // Fetch service request data and update quotation if needed
    if (serviceRequestId) {
      try {
        const serviceRequest = await db.collection('servicerequests').findOne({
          _id: new ObjectId(serviceRequestId)
        })

        if (serviceRequest) {
          // Add service request photos to carImages
          if (serviceRequest.photos) {
            const serviceRequestImages = serviceRequest.photos.map((photo: any) => photo.url)
            carImages = [...carImages, ...serviceRequestImages]
          }

          // Update quotation with service request data if not already linked
          if (shouldUpdateQuotation) {
            const updateData: any = {
              sourceServiceRequestId: new ObjectId(serviceRequestId),
              updatedAt: new Date()
            }

            // Update with actual service request data
            if (serviceRequest.requestedServices) {
              updateData.requestedServices = serviceRequest.requestedServices
            }

            if (serviceRequest.damageAssessments?.length > 0) {
              updateData.damageDescription = serviceRequest.damageAssessments.map((assessment: any) => ({
                area: assessment.location || assessment.area || 'General',
                description: assessment.description,
                severity: assessment.severity,
                images: assessment.photos || [],
                estimatedCost: assessment.estimatedCost
              }))
            }

            try {
              await db.collection('quotations').updateOne(
                { _id: new ObjectId(resolvedParams.id) },
                { $set: updateData }
              )
              console.log('Auto-updated quotation with service request data')

              // Update the quotation object for response
              Object.assign(quotation, updateData)
            } catch (updateError) {
              console.error('Error auto-updating quotation:', updateError)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching service request:', error)
      }
    }
    
    // Fetch customer info if missing from quotation
    let customerInfo = {
      customerName: quotation.customerName,
      customerEmail: quotation.customerEmail,
      customerPhone: quotation.customerPhone
    }

    if (!quotation.customerName || !quotation.customerEmail) {
      try {
        const customer = await db.collection('users').findOne({
          _id: new ObjectId(quotation.customerId)
        })

        if (customer) {
          // Build customer name from profile data
          const customerName = customer.profile ?
            `${customer.profile.firstName || ''} ${customer.profile.lastName || ''}`.trim() :
            quotation.customerName

          customerInfo = {
            customerName: customerName || quotation.customerName,
            customerEmail: customer.email || quotation.customerEmail,
            customerPhone: customer.profile?.phone || customer.phone || quotation.customerPhone
          }
        }
      } catch (error) {
        console.error('Error fetching customer info:', error)
      }
    }

    // Fetch workshop details for targetWorkshops
    let targetWorkshopsWithDetails: any[] = []
    if (quotation.targetWorkshops && quotation.targetWorkshops.length > 0) {
      try {
        const workshopIds = quotation.targetWorkshops.map((id: ObjectId) => new ObjectId(id))
        const workshops = await db.collection('workshops').find({
          userId: { $in: workshopIds }
        }).toArray()

        // Create a map of workshopId to workshop details
        const workshopMap = new Map()
        workshops.forEach((workshop: any) => {
          workshopMap.set(workshop.userId.toString(), {
            workshopId: workshop.userId.toString(),
            workshopName: workshop.profile?.businessName || 'Unknown Workshop',
            workshopLogo: workshop.profile?.logo,
            status: 'pending', // Default status if no quote submitted
            requestedAt: quotation.createdAt
          })
        })

        // Check if any of these workshops have submitted quotes
        if (quotation.quotes && quotation.quotes.length > 0) {
          quotation.quotes.forEach((quote: any) => {
            const workshopId = quote.workshopId.toString()
            if (workshopMap.has(workshopId)) {
              // Update status to actual quote status
              const workshopDetails = workshopMap.get(workshopId)
              workshopDetails.status = quote.status
              workshopDetails.submittedAt = quote.submittedAt
            }
          })
        }

        targetWorkshopsWithDetails = Array.from(workshopMap.values())
      } catch (error) {
        console.error('Error fetching workshop details:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...quotation,
        ...customerInfo, // Override with fetched customer info
        _id: quotation._id.toString(),
        customerId: quotation.customerId.toString(),
        carId: quotation.carId?.toString(),
        carImages, // Add car images to response
        targetWorkshops: quotation.targetWorkshops?.map((id: ObjectId) => id.toString()),
        targetWorkshopsWithDetails, // Add enriched workshop details
        quotes: quotation.quotes?.map((quote: any) => ({
          ...quote,
          workshopId: quote.workshopId.toString()
        }))
      }
    })
    
  } catch (error) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotation' },
      { status: 500 }
    )
  }
}

// PUT /api/quotations/[id] - Update quotation
export async function PUT(
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
    const body = await request.json()
    
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }
    
    let updateData: any = {}
    
    if (session.user.role === 'customer' && quotation.customerId.toString() === session.user.id) {
      // Customer can update quotation details or accept/decline quotes
      const { status, acceptedQuoteId, ...otherUpdates } = body
      
      updateData.$set = { updatedAt: new Date() }
      
      if (status) {
        updateData.$set.status = status
      }
      
      if (acceptedQuoteId) {
        updateData.$set.acceptedQuoteId = acceptedQuoteId
        updateData.$set.status = 'accepted'
        
        // Update quote statuses using array filters
        updateData.$set['quotes.$[accepted].status'] = 'accepted'
        updateData.$set['quotes.$[others].status'] = 'declined'
      }
      
      // Allow updates to timeline, budget, etc. if still pending
      if (quotation.status === 'pending') {
        Object.assign(updateData.$set, otherUpdates)
      }
      
    } else if (session.user.role === 'workshop') {
      // Workshop can submit/update their quote
      const { quote } = body
      
      if (!quote) {
        return NextResponse.json(
          { success: false, error: 'Quote data required' },
          { status: 400 }
        )
      }
      
      // Check if quotation is still open for quotes
      if (quotation.status === 'accepted' || quotation.status === 'completed' || quotation.status === 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'This quotation is no longer accepting quotes' },
          { status: 400 }
        )
      }

      // Check if workshop is allowed to quote
      const canQuote = quotation.targetWorkshops?.some((id: ObjectId) => id.toString() === session.user.id) ||
                     !quotation.targetWorkshops ||
                     quotation.quotes?.some((q: any) => q.workshopId.toString() === session.user.id)

      if (!canQuote) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to quote on this request' },
          { status: 403 }
        )
      }
      
      // Get workshop info
      const workshop = await db.collection('workshops').findOne({
        userId: new ObjectId(session.user.id)
      })
      
      if (!workshop) {
        return NextResponse.json(
          { success: false, error: 'Workshop profile not found' },
          { status: 404 }
        )
      }
      
      // Prepare quote data
      const quoteData = {
        ...quote,
        id: quote.id || new ObjectId().toString(),
        workshopId: new ObjectId(session.user.id),
        workshopName: workshop.profile.businessName,
        workshopLogo: workshop.profile.logo,
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
        contactPerson: workshop.profile.businessName,
        contactPhone: workshop.contact.phone,
        contactEmail: workshop.contact.email
      }
      
      // Check if quote already exists
      const existingQuoteIndex = quotation.quotes?.findIndex((q: any) => 
        q.workshopId.toString() === session.user.id
      )
      
      if (existingQuoteIndex !== undefined && existingQuoteIndex >= 0) {
        // Update existing quote - use $set for atomic operation
        updateData.$set = {
          [`quotes.${existingQuoteIndex}`]: quoteData,
          updatedAt: new Date()
        }
        
        // Update quotation status if needed
        if (quotation.status === 'pending') {
          updateData.$set.status = 'quoted'
        }
        
      } else {
        // Add new quote - use atomic operators only
        updateData.$push = { quotes: quoteData }
        updateData.$inc = { responseCount: 1 }
        updateData.$set = { updatedAt: new Date() }
        
        // Update quotation status if first quote
        if (quotation.status === 'pending') {
          updateData.$set.status = 'quoted'
        }
      }
    }
    
    // Apply filters for array updates if needed
    const arrayFilters: any[] = []
    if (body.acceptedQuoteId) {
      arrayFilters.push({ 'accepted.id': body.acceptedQuoteId })
      arrayFilters.push({ 'others.id': { $ne: body.acceptedQuoteId } })
    }
    
    const updateOptions = arrayFilters.length > 0 ? { arrayFilters } : {}
    
    const result = await db.collection('quotations').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      updateData,
      updateOptions
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }
    
    // Get updated quotation
    const updatedQuotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!updatedQuotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found after update' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedQuotation,
        _id: updatedQuotation._id.toString(),
        customerId: updatedQuotation.customerId.toString(),
        targetWorkshops: updatedQuotation.targetWorkshops?.map((id: ObjectId) => id.toString()),
        quotes: updatedQuotation.quotes?.map((quote: any) => ({
          ...quote,
          workshopId: quote.workshopId.toString()
        }))
      }
    })
    
  } catch (error) {
    console.error('Error updating quotation:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update quotation', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// DELETE /api/quotations/[id] - Delete quotation
export async function DELETE(
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
    
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }
    
    // Only customer can delete their quotation, and only if pending
    if (session.user.role !== 'customer' || 
        quotation.customerId.toString() !== session.user.id ||
        quotation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete this quotation' },
        { status: 403 }
      )
    }
    
    await db.collection('quotations').deleteOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete quotation' },
      { status: 500 }
    )
  }
}
