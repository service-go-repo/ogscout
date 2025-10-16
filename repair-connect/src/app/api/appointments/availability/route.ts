import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { AppointmentService } from '@/lib/appointment-service'
import { addDays } from 'date-fns'

// GET /api/appointments/availability - Check workshop availability
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const workshopIdParam = searchParams.get('workshopId')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const durationParam = searchParams.get('duration')
    const quotationIdParam = searchParams.get('quotationId')


    if (!workshopIdParam) {
      return NextResponse.json(
        { success: false, error: 'workshopId is required' },
        { status: 400 }
      )
    }

    console.log('Validating workshop ID:', workshopIdParam)

    if (!ObjectId.isValid(workshopIdParam)) {
      console.error('Invalid workshop ID format:', workshopIdParam)
      return NextResponse.json(
        { success: false, error: `Invalid workshop ID format: ${workshopIdParam}` },
        { status: 400 }
      )
    }

    const workshopId = new ObjectId(workshopIdParam)

    // Default date range: next 14 days
    const startDate = startDateParam ? new Date(startDateParam) : new Date()
    const endDate = endDateParam ? new Date(endDateParam) : addDays(startDate, 14)

    // Default duration: estimate from quotation services or use 2 hours
    let duration = 2 // Default 2 hours

    if (durationParam) {
      duration = parseFloat(durationParam)
    } else if (quotationIdParam) {
      // Estimate duration from quotation services
      const { db } = await connectToDatabase()
      const quotation = await db.collection('quotations').findOne({
        _id: new ObjectId(quotationIdParam)
      })

      if (quotation?.requestedServices) {
        duration = AppointmentService.estimateServiceDuration(quotation.requestedServices)
      }
    }

    // Log duration for debugging
    console.log('Availability check - Duration:', duration, 'QuotationId:', quotationIdParam)

    // Validate duration (minimum 0.5 hours, maximum 24 hours)
    if (duration < 0.5 || duration > 24) {
      console.error('Invalid duration:', duration, 'Must be between 0.5 and 24 hours')
      return NextResponse.json(
        { success: false, error: `Duration must be between 0.5 and 24 hours. Received: ${duration}` },
        { status: 400 }
      )
    }

    // Get workshop availability
    const availability = await AppointmentService.getWorkshopAvailability(
      workshopId,
      startDate,
      endDate,
      duration
    )

    // Get next available slots for quick booking
    const nextAvailableSlots = await AppointmentService.getNextAvailableSlots(
      workshopId,
      duration,
      14, // Look ahead 14 days
      10  // Return up to 10 slots
    )

    // Get workshop current status
    const currentStatus = await AppointmentService.getWorkshopCurrentStatus(workshopId)

    return NextResponse.json({
      success: true,
      data: {
        workshopId: workshopId.toString(),
        requestedDuration: duration,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        availability,
        nextAvailableSlots,
        currentStatus: {
          isOpen: currentStatus.isOpen,
          nextAvailableSlot: currentStatus.nextAvailableSlot,
          todaySlots: currentStatus.todaySlots
        }
      }
    })

  } catch (error: any) {
    console.error('Error checking availability:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: request.url
    })
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

// POST /api/appointments/availability - Check specific time slot availability
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { workshopId, date, startTime, duration } = body

    // Validate required fields
    if (!workshopId || !date || !startTime || !duration) {
      return NextResponse.json(
        { success: false, error: 'workshopId, date, startTime, and duration are required' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(workshopId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workshop ID' },
        { status: 400 }
      )
    }

    // Validate duration
    if (duration < 0.5 || duration > 24) {
      return NextResponse.json(
        { success: false, error: 'Duration must be between 0.5 and 24 hours' },
        { status: 400 }
      )
    }

    // Check if the specific time slot is available
    const availabilityCheck = await AppointmentService.isTimeSlotAvailable(
      new ObjectId(workshopId),
      new Date(date),
      startTime,
      duration
    )

    // If not available and user wants alternatives, provide them
    const includeAlternatives = body.includeAlternatives !== false

    let alternativeSlots: any[] = []
    if (!availabilityCheck.available && includeAlternatives) {
      // Find alternatives on the same day
      const sameDayAlternatives = await AppointmentService.getWorkshopAvailability(
        new ObjectId(workshopId),
        new Date(date),
        new Date(date),
        duration
      )

      if (sameDayAlternatives.length > 0) {
        alternativeSlots = sameDayAlternatives[0].availableSlots
          .filter(slot => slot.isAvailable)
          .slice(0, 5) // Limit to 5 alternatives
      }

      // If no alternatives on same day, get next available slots
      if (alternativeSlots.length === 0) {
        const nextSlots = await AppointmentService.getNextAvailableSlots(
          new ObjectId(workshopId),
          duration,
          7, // Next 7 days
          5  // Up to 5 alternatives
        )
        alternativeSlots = nextSlots
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        available: availabilityCheck.available,
        reason: availabilityCheck.reason,
        conflictingAppointment: availabilityCheck.conflictingAppointment?.toString(),
        requestedSlot: {
          workshopId,
          date,
          startTime,
          duration
        },
        alternatives: alternativeSlots.length > 0 ? alternativeSlots : undefined
      }
    })

  } catch (error) {
    console.error('Error checking time slot availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check time slot availability' },
      { status: 500 }
    )
  }
}