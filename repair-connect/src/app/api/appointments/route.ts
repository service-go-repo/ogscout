import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Appointment, AppointmentSearchFilters, createAppointmentFromQuotation } from '@/models/Appointment'
import { AppointmentService } from '@/lib/appointment-service'
import { AppointmentNotificationService } from '@/lib/appointment-notifications'

// GET /api/appointments - Get appointments (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Build filter based on user role or query parameters
    let filter: any = {}

    // Check if workshopId is provided as query parameter (for public workshop pages)
    const workshopIdParam = searchParams.get('workshopId')
    if (workshopIdParam && ObjectId.isValid(workshopIdParam)) {
      // Public access to view workshop reviews/appointments
      // This allows unauthenticated users to see workshop reviews
      filter.workshopId = new ObjectId(workshopIdParam)
    } else {
      // Require authentication for user-specific queries
      const session = await getServerSession(authOptions)

      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      if (session.user.role === 'customer') {
        filter.customerId = new ObjectId(session.user.id)
      } else if (session.user.role === 'workshop') {
        filter.workshopId = new ObjectId(session.user.id)
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid user role for appointments' },
          { status: 403 }
        )
      }
    }

    // Apply additional filters
    const status = searchParams.get('status')
    if (status) {
      filter.status = { $in: status.split(',') }
    }

    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    if (dateFrom || dateTo) {
      filter.scheduledDate = {}
      if (dateFrom) filter.scheduledDate.$gte = new Date(dateFrom)
      if (dateTo) filter.scheduledDate.$lte = new Date(dateTo)
    }

    // Get appointments
    const appointments = await db.collection('appointments')
      .find(filter)
      .sort({ scheduledDate: -1, scheduledStartTime: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection('appointments').countDocuments(filter)

    // Convert ObjectIds to strings for JSON serialization
    const serializedAppointments = appointments.map(appointment => ({
      ...appointment,
      _id: appointment._id.toString(),
      quotationId: appointment.quotationId.toString(),
      customerId: appointment.customerId.toString(),
      workshopId: appointment.workshopId.toString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        appointments: serializedAppointments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      }
    })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only customers can create appointments
    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Only customers can create appointments' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log('POST /api/appointments - Request body:', JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = ['quotationId', 'acceptedQuoteId', 'preferredDate', 'preferredStartTime']
    for (const field of requiredFields) {
      if (!body[field]) {
        console.error(`Validation failed: ${field} is required`)
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate the quotation and accepted quote
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(body.quotationId),
      customerId: new ObjectId(session.user.id),
      status: 'accepted',
      acceptedQuoteId: body.acceptedQuoteId
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Invalid quotation or quote not accepted' },
        { status: 400 }
      )
    }

    // Get customer information from users collection
    const customer = await db.collection('users').findOne({
      _id: new ObjectId(session.user.id)
    })

    // Populate customer data in quotation if missing
    if (!quotation.customerName && customer) {
      if (customer.profile?.firstName && customer.profile?.lastName) {
        quotation.customerName = `${customer.profile.firstName} ${customer.profile.lastName}`
      } else if (customer.profile?.firstName) {
        quotation.customerName = customer.profile.firstName
      } else if (customer.name) {
        quotation.customerName = customer.name
      } else {
        quotation.customerName = customer.email?.split('@')[0] || 'Customer'
      }
    }
    if (!quotation.customerPhone && customer) {
      quotation.customerPhone = customer.profile?.phone || customer.phone || customer.businessInfo?.phone || ''
    }

    // Check if appointment already exists for this quotation
    const existingAppointment = await db.collection('appointments').findOne({
      quotationId: new ObjectId(body.quotationId),
      acceptedQuoteId: body.acceptedQuoteId
    })

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment already exists for this quotation' },
        { status: 400 }
      )
    }

    // Get workshop information
    const acceptedQuote = quotation.quotes.find((q: any) => q.id === body.acceptedQuoteId)

    console.log('Accepted quote:', JSON.stringify(acceptedQuote, null, 2))
    console.log('Workshop ID from quote:', acceptedQuote.workshopId)
    console.log('Workshop ID type:', typeof acceptedQuote.workshopId)

    // Ensure workshopId is an ObjectId
    const workshopId = typeof acceptedQuote.workshopId === 'string'
      ? new ObjectId(acceptedQuote.workshopId)
      : acceptedQuote.workshopId

    console.log('Looking up workshop with ID:', workshopId)

    // Workshop profile is stored in workshops collection with userId field
    let workshop = await db.collection('workshops').findOne({
      userId: workshopId
    })

    console.log('Workshop found in workshops collection:', workshop ? 'Yes' : 'No')

    // If not found, try by _id
    if (!workshop) {
      workshop = await db.collection('workshops').findOne({
        _id: workshopId
      })
      console.log('Workshop found by _id:', workshop ? 'Yes' : 'No')
    }

    if (!workshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 400 }
      )
    }

    // Convert operating hours array to object format if needed
    if (workshop.profile?.operatingHours && Array.isArray(workshop.profile.operatingHours)) {
      const operatingHoursObj: any = {}
      workshop.profile.operatingHours.forEach((dayHours: any) => {
        operatingHoursObj[dayHours.day] = {
          open: dayHours.openTime || '09:00',
          close: dayHours.closeTime || '17:00',
          closed: dayHours.isClosed || false
        }
      })
      workshop.profile.operatingHours = operatingHoursObj
    }

    const workshopData = workshop

    console.log('Workshop data structure:', {
      hasProfile: !!workshopData.profile,
      hasOperatingHours: !!workshopData.profile?.operatingHours,
      operatingHoursType: Array.isArray(workshopData.profile?.operatingHours) ? 'array' : 'object',
      workshopKeys: workshop ? Object.keys(workshop).slice(0, 10) : []
    })

    // Estimate service duration
    const requestedServices = quotation.requestedServices || []
    const estimatedDuration = AppointmentService.estimateServiceDuration(requestedServices)

    // Check time slot availability
    const preferredDate = new Date(body.preferredDate)
    const availabilityCheck = await AppointmentService.isTimeSlotAvailable(
      acceptedQuote.workshopId,
      preferredDate,
      body.preferredStartTime,
      estimatedDuration
    )

    if (!availabilityCheck.available) {
      return NextResponse.json(
        { success: false, error: availabilityCheck.reason || 'Time slot not available' },
        { status: 400 }
      )
    }

    // Create appointment booking request
    const bookingRequest = {
      quotationId: body.quotationId,
      acceptedQuoteId: body.acceptedQuoteId,
      preferredDate,
      preferredStartTime: body.preferredStartTime,
      alternativeDates: body.alternativeDates || [],
      customerNotes: body.customerNotes || '',
      serviceLocation: body.serviceLocation || {
        type: 'workshop' as const,
        address: workshopData.profile.contact?.address
          ? `${workshopData.profile.contact.address.street}, ${workshopData.profile.contact.address.emirate || workshopData.profile.contact.address.city}, ${workshopData.profile.contact.address.zipCode}`
          : 'Workshop location',
        coordinates: workshopData.profile.contact?.location?.coordinates || null
      },
      reminders: body.reminders || {
        enabled: true,
        reminderTimes: [24, 2], // 24 hours and 2 hours before
        methods: ['email'] as ('email' | 'sms' | 'push')[]
      }
    }

    // Create appointment document
    const appointmentData = createAppointmentFromQuotation(
      new ObjectId(body.quotationId),
      body.acceptedQuoteId,
      new ObjectId(session.user.id),
      acceptedQuote.workshopId,
      bookingRequest,
      quotation,
      workshopData
    )

    // Insert appointment
    const result = await db.collection('appointments').insertOne(appointmentData)

    // Update quotation status to indicate appointment was created
    await db.collection('quotations').updateOne(
      { _id: new ObjectId(body.quotationId) },
      {
        $set: {
          appointmentId: result.insertedId,
          updatedAt: new Date()
        }
      }
    )

    // Get the created appointment
    const createdAppointment = await db.collection('appointments').findOne({
      _id: result.insertedId
    })

    if (!createdAppointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment created but not found' },
        { status: 500 }
      )
    }

    // Send notifications for appointment creation
    try {
      await AppointmentNotificationService.notifyAppointmentCreated(createdAppointment as Appointment)
    } catch (notificationError) {
      console.error('Failed to send appointment creation notifications:', notificationError)
      // Don't fail the entire request if notifications fail
    }

    return NextResponse.json({
      success: true,
      data: {
        ...createdAppointment,
        _id: createdAppointment._id.toString(),
        quotationId: createdAppointment.quotationId.toString(),
        customerId: createdAppointment.customerId.toString(),
        workshopId: createdAppointment.workshopId.toString()
      }
    })

  } catch (error) {
    console.error('Error creating appointment:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: `Failed to create appointment: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}