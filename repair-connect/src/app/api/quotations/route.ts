import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { Quotation, QuotationSearchFilters, QuotationSearchResult } from '@/models/Quotation'
import { ObjectId } from 'mongodb'

// Simple notification function - can be enhanced with email/SMS later
async function notifyWorkshops(workshopIds: string[], quotationId: string, db: any) {
  try {
    // Create notifications in database
    const notifications = workshopIds.map(workshopId => ({
      _id: new ObjectId(),
      userId: new ObjectId(workshopId),
      type: 'quotation_request',
      title: 'New Quotation Request',
      message: 'You have received a new quotation request',
      data: {
        quotationId: new ObjectId(quotationId)
      },
      read: false,
      createdAt: new Date()
    }))

    await db.collection('notifications').insertMany(notifications)
  } catch (error) {
    console.error('Failed to create notifications:', error)
    // Don't fail the entire operation if notifications fail
  }
}

// GET /api/quotations - Get quotations with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Build filter based on user role
    let baseFilter: any = {}
    
    if (session.user.role === 'customer') {
      baseFilter.customerId = new ObjectId(session.user.id)
    } else if (session.user.role === 'workshop') {
      // For workshops, show quotations where they are targeted or can bid
      baseFilter.$or = [
        { targetWorkshops: new ObjectId(session.user.id) },
        { targetWorkshops: { $exists: false } }, // Open to all workshops
        { 'quotes.workshopId': new ObjectId(session.user.id) }
      ]
    }
    
    // Additional filters
    const status = searchParams.get('status')
    if (status) {
      baseFilter.status = { $in: status.split(',') }
    }
    
    const serviceTypes = searchParams.get('serviceTypes')
    if (serviceTypes) {
      baseFilter.requestedServices = { $in: serviceTypes.split(',') }
    }
    
    const priority = searchParams.get('priority')
    if (priority) {
      baseFilter.priority = { $in: priority.split(',') }
    }
    
    const budgetMin = searchParams.get('budgetMin')
    const budgetMax = searchParams.get('budgetMax')
    if (budgetMin || budgetMax) {
      baseFilter['budget.max'] = {}
      if (budgetMin) baseFilter['budget.max'].$gte = parseInt(budgetMin)
      if (budgetMax) baseFilter['budget.max'].$lte = parseInt(budgetMax)
    }
    
    // Location filter
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    if (lat && lng && radius) {
      baseFilter.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            parseInt(radius) / 6371 // Convert km to radians
          ]
        }
      }
    }
    
    // Date range filter
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate || endDate) {
      baseFilter.createdAt = {}
      if (startDate) baseFilter.createdAt.$gte = new Date(startDate)
      if (endDate) baseFilter.createdAt.$lte = new Date(endDate)
    }
    
    // Get total count
    const total = await db.collection('quotations').countDocuments(baseFilter)
    
    // Get quotations
    const quotations = await db.collection('quotations')
      .find(baseFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Enrich quotations with customer info if missing (for workshop views)
    const enrichedQuotations = await Promise.all(quotations.map(async (quotation) => {
      let customerInfo = {
        customerName: quotation.customerName,
        customerEmail: quotation.customerEmail,
        customerPhone: quotation.customerPhone
      }

      // If customer info is missing and user is workshop, fetch it
      if (session.user.role === 'workshop' && (!quotation.customerName || !quotation.customerEmail)) {
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
          console.error('Error fetching customer info for quotation:', quotation._id, error)
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
          console.error('Error fetching workshop details for quotation:', quotation._id, error)
        }
      }

      return {
        ...quotation,
        ...customerInfo,
        _id: quotation._id.toString(),
        customerId: quotation.customerId.toString(),
        targetWorkshops: quotation.targetWorkshops?.map((id: ObjectId) => id.toString()),
        targetWorkshopsWithDetails, // Add enriched workshop details
        quotes: quotation.quotes?.map((quote: any) => ({
          ...quote,
          workshopId: quote.workshopId.toString()
        })) || []
      }
    }))

    // Transform to proper type
    const transformedQuotations = enrichedQuotations as unknown as Quotation[]
    
    const result: QuotationSearchResult = {
      quotations: transformedQuotations,
      total,
      page,
      limit,
      hasMore: skip + quotations.length < total
    }
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

// POST /api/quotations - Create new quotation request
export async function POST(request: NextRequest) {
  console.log('=== QUOTATIONS API CALLED ===')
  try {
    const session = await getServerSession(authOptions)
    console.log('Session user:', session?.user?.id)

    if (!session?.user || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Customer authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()

    // Check for idempotency key
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      console.log('Idempotency key provided:', idempotencyKey);

      // Check if this request was already processed
      const existingQuotation = await db.collection('quotations').findOne({
        idempotencyKey,
        customerId: new ObjectId(session.user.id),
      });

      if (existingQuotation) {
        console.log('Duplicate request detected, returning existing quotation');
        return NextResponse.json({
          success: true,
          data: {
            ...existingQuotation,
            _id: existingQuotation._id.toString(),
            customerId: existingQuotation.customerId.toString(),
            targetWorkshops: existingQuotation.targetWorkshops?.map((id: ObjectId) => id.toString()) || [],
          },
        }, { status: 200 });
      }
    }

    const body = await request.json()
    console.log('Request body:', body)

    // Handle both simplified and complex form data structures
    const {
      // Simplified form fields
      selectedCarId,
      make,
      model,
      year,
      licensePlate,
      requestedServices,
      damageDescription,
      urgency = 'medium',
      budgetMin,
      budgetMax,
      budgetFlexible = true,
      address,
      city,
      state,
      maxDistance = 50,
      notes,
      location,
      
      // Legacy complex form fields (for backward compatibility)
      vehicle,
      timeline,
      budget,
      targetWorkshops,
      priority,

      // New fields for service request linking
      sourceServiceRequestId
    } = body

    console.log('Extracted selectedCarId:', selectedCarId)
    console.log('User ID from session:', session.user.id)
    console.log('Session user object:', session.user)

    if (!requestedServices || !damageDescription || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Transform simplified form data to expected structure
    let vehicleInfo
    if (selectedCarId && selectedCarId !== '') {
      console.log('Looking for car with ID:', selectedCarId, 'for user:', session.user.id)

      // Validate ObjectId format
      if (!ObjectId.isValid(selectedCarId)) {
        console.error('Invalid car ObjectId format:', selectedCarId)
        return NextResponse.json(
          { success: false, error: 'Invalid car ID format' },
          { status: 400 }
        )
      }

      // First, let's see what cars exist for this user
      const userCars = await db.collection('cars').find({
        ownerId: session.user.id
      }).toArray()

      console.log(`User has ${userCars.length} cars with ownerId matching session.user.id`)
      console.log('User cars:', userCars.map(c => ({ _id: c._id.toString(), ownerId: c.ownerId })))

      // Check if the specific car exists in database at all (without ownership filter)
      const specificCar = await db.collection('cars').findOne({
        _id: new ObjectId(selectedCarId)
      })

      console.log('Specific car exists in database:', specificCar ? 'Yes' : 'No')
      if (specificCar) {
        console.log('Specific car ownerId:', specificCar.ownerId)
        console.log('Expected ownerId:', session.user.id)
        console.log('Owner IDs match:', specificCar.ownerId === session.user.id)
        console.log('Owner ID types match:', typeof specificCar.ownerId, typeof session.user.id)
      }

      // Also check with ownerId as ObjectId format
      const userCarsObjectId = await db.collection('cars').find({
        ownerId: new ObjectId(session.user.id)
      }).toArray()

      console.log(`User has ${userCarsObjectId.length} cars with ownerId as ObjectId`)

      // Fetch car details from database - try both formats
      let car = await db.collection('cars').findOne({
        _id: new ObjectId(selectedCarId),
        ownerId: session.user.id // Try string format first
      })

      console.log('Car lookup with string ownerId:', car ? 'Found' : 'Not found')

      // If not found with string, try with ObjectId
      if (!car) {
        car = await db.collection('cars').findOne({
          _id: new ObjectId(selectedCarId),
          ownerId: new ObjectId(session.user.id) // Try ObjectId format
        })
        console.log('Car lookup with ObjectId ownerId:', car ? 'Found' : 'Not found')
      }


      if (car) {
        console.log('Car data structure check:', {
          hasBasicInfo: !!car.basicInfo,
          hasDirectMake: !!car.make,
          ownerId: car.ownerId
        })
      }

      if (car) {
        // Handle both flat and nested car data structures
        vehicleInfo = {
          make: car.basicInfo?.make || car.make,
          model: car.basicInfo?.model || car.model,
          year: car.basicInfo?.year || car.year,
          color: car.basicInfo?.color || car.color,
          vin: car.basicInfo?.vin || car.vin,
          licensePlate: car.basicInfo?.licensePlate || car.licensePlate,
          mileage: car.basicInfo?.mileage || car.mileage
        }
        console.log('Vehicle info created:', vehicleInfo)
      } else {
        return NextResponse.json(
          { success: false, error: 'Selected car not found' },
          { status: 404 }
        )
      }
    } else if (make && model && year) {
      // Use manually entered vehicle info
      vehicleInfo = {
        make,
        model,
        year,
        licensePlate,
        color: '',
        vin: '',
        mileage: 0
      }
    } else if (vehicle) {
      // Use legacy vehicle structure
      vehicleInfo = vehicle
    } else {
      return NextResponse.json(
        { success: false, error: 'Vehicle information is required' },
        { status: 400 }
      )
    }
    
    // If linking to a service request, fetch and use its data
    let enrichedData: any = {}
    if (sourceServiceRequestId) {
      try {
        const serviceRequest = await db.collection('servicerequests').findOne({
          _id: new ObjectId(sourceServiceRequestId)
        })

        if (serviceRequest) {
          console.log('Found service request with data:', {
            requestedServices: serviceRequest.requestedServices,
            damageAssessments: serviceRequest.damageAssessments?.length,
            photos: serviceRequest.photos?.length
          })

          // Use service request data instead of generic form data
          enrichedData = {
            requestedServices: serviceRequest.requestedServices || requestedServices,
            damageDescriptionArray: serviceRequest.damageAssessments?.map((assessment: any) => ({
              area: assessment.location || assessment.area || 'General',
              description: assessment.description,
              severity: assessment.severity,
              images: assessment.photos || [],
              estimatedCost: assessment.estimatedCost
            })) || [],
            carImages: serviceRequest.photos?.map((photo: any) => photo.url) || [],
            timeline: {
              preferredStartDate: serviceRequest.timeline?.preferredStartDate,
              preferredCompletionDate: serviceRequest.timeline?.preferredCompletionDate,
              flexibility: serviceRequest.timeline?.flexibility || 'flexible',
              urgency: serviceRequest.timeline?.urgency || urgency || 'medium'
            },
            serviceLocation: serviceRequest.serviceLocation,
            additionalNotes: serviceRequest.additionalNotes || serviceRequest.description
          }
        }
      } catch (error) {
        console.error('Error fetching service request:', error)
        // Fall back to generic data if service request fetch fails
      }
    }

    // Transform damage description - use enriched data if available
    const damageDescriptionArray = enrichedData.damageDescriptionArray?.length > 0
      ? enrichedData.damageDescriptionArray
      : Array.isArray(damageDescription)
        ? damageDescription
        : [{
            area: 'General',
            description: damageDescription,
            severity: 'moderate' as const,
            images: []
          }]
    
    // Transform timeline - use enriched data if available
    const timelineInfo = enrichedData.timeline || timeline || {
      preferredStartDate: undefined,
      preferredCompletionDate: undefined,
      flexibility: 'flexible' as const,
      urgency: urgency || priority || 'medium'
    }
    
    // Transform budget
    const budgetInfo = budget || (budgetMin || budgetMax ? {
      min: budgetMin,
      max: budgetMax,
      currency: 'AED',
      isFlexible: budgetFlexible
    } : undefined)
    
    // Get customer info
    const customer = await db.collection('users').findOne({
      _id: new ObjectId(session.user.id)
    })
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check for existing ACTIVE quotations to prevent duplicates
    // Only check if we have both carId and targetWorkshops
    if (selectedCarId && targetWorkshops && targetWorkshops.length > 0) {
      const activeQuotation = await db.collection('quotations').findOne({
        customerId: new ObjectId(session.user.id),
        carId: new ObjectId(selectedCarId),
        status: { $in: ['pending', 'open', 'viewed', 'quoted'] },
        // Combined $and to handle workshop match AND expiration check
        $and: [
          {
            $or: [
              { targetWorkshops: { $in: targetWorkshops.map((id: string) => new ObjectId(id)) } },
              { 'quotes.workshopId': { $in: targetWorkshops.map((id: string) => new ObjectId(id)) } }
            ]
          },
          {
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: { $gte: new Date() } }
            ]
          }
        ]
      })

      if (activeQuotation) {
        console.log('Active quotation already exists:', activeQuotation._id)
        return NextResponse.json(
          {
            success: false,
            error: 'Active quote already exists',
            message: 'You already have an active quote request to this workshop for this car',
            existingQuotationId: activeQuotation._id.toString()
          },
          { status: 409 } // Conflict
        )
      }
    }

    // Create quotation
    const quotation: Omit<Quotation, '_id'> & { idempotencyKey?: string; sourceServiceRequestId?: ObjectId } = {
      customerId: new ObjectId(session.user.id),
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || '',

      carId: selectedCarId ? new ObjectId(selectedCarId) : undefined,
      vehicle: vehicleInfo,
      requestedServices: enrichedData.requestedServices || requestedServices,
      damageDescription: damageDescriptionArray,
      timeline: timelineInfo,
      budget: budgetInfo,

      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      address,
      city,
      state,

      targetWorkshops: targetWorkshops?.map((id: string) => new ObjectId(id)),
      maxDistance,

      // Link to source service request if provided
      sourceServiceRequestId: sourceServiceRequestId ? new ObjectId(sourceServiceRequestId) : undefined,

      // Store idempotency key for duplicate detection
      idempotencyKey: idempotencyKey || undefined,

      status: 'pending',
      priority: urgency || priority || 'medium',

      quotes: [],

      // Add notes if provided
      messages: notes ? [{
        id: new ObjectId().toString(),
        from: 'customer' as const,
        fromId: new ObjectId(session.user.id),
        message: notes,
        timestamp: new Date(),
        attachments: []
      }] : [],

      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days

      viewCount: 0,
      responseCount: 0
    }

    // Insert quotation
    const result = await db.collection('quotations').insertOne(quotation)

    // Update source service request status if linked
    if (sourceServiceRequestId) {
      try {
        await db.collection('servicerequests').updateOne(
          { _id: new ObjectId(sourceServiceRequestId) },
          {
            $set: {
              status: 'quoted',
              updatedAt: new Date()
            }
          }
        )
      } catch (serviceRequestUpdateError) {
        console.warn('Failed to update service request status:', serviceRequestUpdateError)
        // Don't fail the entire operation if service request update fails
      }
    }

    // If specific workshops are targeted, create pending quotes
    if (targetWorkshops && targetWorkshops.length > 0) {
      const workshops = await db.collection('workshops')
        .find({ _id: { $in: targetWorkshops.map((id: string) => new ObjectId(id)) } })
        .toArray()
      
      const pendingQuotes = workshops.map(workshop => ({
        id: new ObjectId().toString(),
        workshopId: workshop._id,
        workshopName: workshop.profile.businessName,
        workshopLogo: workshop.profile.logo,
        status: 'pending',
        services: [],
        totalLaborCost: 0,
        totalPartsCost: 0,
        subtotal: 0,
        tax: 0,
        totalAmount: 0,
        currency: 'AED',
        estimatedDuration: 0,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        warranty: '',
        paymentTerms: '',
        submittedAt: new Date(),
        updatedAt: new Date()
      }))
      
      await db.collection('quotations').updateOne(
        { _id: result.insertedId },
        { $set: { quotes: pendingQuotes } }
      )

      // Notify targeted workshops
      await notifyWorkshops(targetWorkshops, result.insertedId.toString(), db)
    }

    // Get the created quotation
    const createdQuotation = await db.collection('quotations').findOne({
      _id: result.insertedId
    })
    
    if (!createdQuotation) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve created quotation' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...createdQuotation,
        _id: createdQuotation._id.toString(),
        customerId: createdQuotation.customerId.toString(),
        targetWorkshops: createdQuotation.targetWorkshops?.map((id: ObjectId) => id.toString()) || [],
        carImages: enrichedData.carImages || [] // Add service request photos
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}
