import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Appointment, AppointmentStatus } from '@/models/Appointment'
import { AppointmentService, AppointmentValidation } from '@/lib/appointment-service'
import { AppointmentNotificationService } from '@/lib/appointment-notifications'

// GET /api/appointments/[id] - Get specific appointment
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
        { success: false, error: 'Invalid appointment ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const appointment = await db.collection('appointments').findOne({
      _id: new ObjectId(resolvedParams.id)
    }) as Appointment

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const hasAccess =
      (session.user.role === 'customer' && appointment.customerId.toString() === session.user.id) ||
      (session.user.role === 'workshop' && appointment.workshopId.toString() === session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Serialize appointment data
    const serializedAppointment = {
      ...appointment,
      _id: appointment._id.toString(),
      quotationId: appointment.quotationId.toString(),
      customerId: appointment.customerId.toString(),
      workshopId: appointment.workshopId.toString(),
      scheduledDate: appointment.scheduledDate.toISOString(),
      estimatedCompletionDate: appointment.estimatedCompletionDate?.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      completedAt: appointment.completedAt?.toISOString(),
      cancelledAt: appointment.cancelledAt?.toISOString(),
      confirmedAt: appointment.confirmedAt?.toISOString(),
      // Serialize statusHistory
      statusHistory: appointment.statusHistory?.map((history: any) => ({
        ...history,
        changedAt: history.changedAt instanceof Date ? history.changedAt.toISOString() : history.changedAt,
        changedBy: history.changedBy?.toString ? history.changedBy.toString() : history.changedBy
      })),
      // Serialize services array
      services: appointment.services?.map((service: any) => ({
        ...service,
        completedAt: service.completedAt instanceof Date ? service.completedAt.toISOString() : service.completedAt,
        startedAt: service.startedAt instanceof Date ? service.startedAt.toISOString() : service.startedAt,
        actualStartTime: service.actualStartTime instanceof Date ? service.actualStartTime.toISOString() : service.actualStartTime,
        actualEndTime: service.actualEndTime instanceof Date ? service.actualEndTime.toISOString() : service.actualEndTime
      })),
      // Serialize reschedule history
      rescheduleHistory: appointment.rescheduleHistory?.map((history: any) => ({
        ...history,
        originalDate: history.originalDate instanceof Date ? history.originalDate.toISOString() : history.originalDate,
        newDate: history.newDate instanceof Date ? history.newDate.toISOString() : history.newDate,
        requestedAt: history.requestedAt instanceof Date ? history.requestedAt.toISOString() : history.requestedAt
      }))
    }

    return NextResponse.json({
      success: true,
      appointment: serializedAppointment
    })

  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id] - Update appointment
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
        { success: false, error: 'Invalid appointment ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const body = await request.json()

    const appointment = await db.collection('appointments').findOne({
      _id: new ObjectId(resolvedParams.id)
    }) as Appointment

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isCustomer = session.user.role === 'customer' && appointment.customerId.toString() === session.user.id
    const isWorkshop = session.user.role === 'workshop' && appointment.workshopId.toString() === session.user.id

    if (!isCustomer && !isWorkshop) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    let updateData: Partial<Appointment> = {
      updatedAt: new Date()
    }

    // Handle different update types based on user role and request
    const updateType = body.updateType

    if (updateType === 'reschedule') {
      // Both customer and workshop can request rescheduling
      if (!body.newDate || !body.newStartTime) {
        return NextResponse.json(
          { success: false, error: 'New date and start time are required for rescheduling' },
          { status: 400 }
        )
      }

      const validation = AppointmentValidation.validateRescheduleRequest(
        appointment,
        new Date(body.newDate),
        body.newStartTime
      )

      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.errors.join(', ') },
          { status: 400 }
        )
      }

      // Check if new time slot is available
      const estimatedDuration = appointment.estimatedDuration
      const availabilityCheck = await AppointmentService.isTimeSlotAvailable(
        appointment.workshopId,
        new Date(body.newDate),
        body.newStartTime,
        estimatedDuration
      )

      if (!availabilityCheck.available) {
        return NextResponse.json(
          { success: false, error: availabilityCheck.reason || 'New time slot not available' },
          { status: 400 }
        )
      }

      // Add to reschedule history
      const rescheduleHistory = appointment.rescheduleHistory || []
      rescheduleHistory.push({
        originalDate: appointment.scheduledDate,
        originalStartTime: appointment.scheduledStartTime,
        originalEndTime: appointment.scheduledEndTime,
        newDate: new Date(body.newDate),
        newStartTime: body.newStartTime,
        newEndTime: body.newEndTime || appointment.scheduledEndTime, // Use existing if not provided
        reason: body.reason || 'Rescheduled by user request',
        requestedBy: session.user.role as 'customer' | 'workshop',
        requestedAt: new Date()
      })

      updateData = {
        ...updateData,
        scheduledDate: new Date(body.newDate),
        scheduledStartTime: body.newStartTime,
        scheduledEndTime: body.newEndTime || appointment.scheduledEndTime,
        status: 'rescheduled' as AppointmentStatus,
        rescheduleHistory
      }

      // Add status history entry
      const statusHistory = appointment.statusHistory || []
      statusHistory.push({
        status: 'rescheduled' as AppointmentStatus,
        changedAt: new Date(),
        changedBy: new ObjectId(session.user.id),
        reason: body.reason || 'Appointment rescheduled',
        notes: body.notes
      })
      updateData.statusHistory = statusHistory

    } else if (updateType === 'status' && isWorkshop) {
      // Only workshops can update appointment status
      const newStatus = body.status as AppointmentStatus

      if (!['confirmed', 'scheduled', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status update' },
          { status: 400 }
        )
      }

      // Validate status transitions
      const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
        'requested': ['confirmed', 'cancelled'],
        'confirmed': ['scheduled', 'cancelled'],
        'scheduled': ['in_progress', 'cancelled', 'no_show'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [], // Final state
        'cancelled': [], // Final state
        'no_show': [], // Final state
        'rescheduled': ['confirmed', 'cancelled']
      }

      if (!validTransitions[appointment.status]?.includes(newStatus)) {
        return NextResponse.json(
          { success: false, error: `Cannot change status from ${appointment.status} to ${newStatus}` },
          { status: 400 }
        )
      }

      updateData.status = newStatus

      // Set completion timestamp
      if (newStatus === 'completed') {
        updateData.completedAt = new Date()
        updateData.actualEndTime = new Date()
      } else if (newStatus === 'cancelled') {
        updateData.cancelledAt = new Date()
      } else if (newStatus === 'confirmed') {
        updateData.confirmedAt = new Date()
      }

      // Add status history entry
      const statusHistory = appointment.statusHistory || []
      statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: new ObjectId(session.user.id),
        reason: body.reason || `Status changed to ${newStatus}`,
        notes: body.notes
      })
      updateData.statusHistory = statusHistory

    } else if (updateType === 'notes') {
      // Update notes based on user role
      if (isCustomer) {
        updateData.customerNotes = body.notes
      } else if (isWorkshop) {
        updateData.workshopNotes = body.notes
      }

    } else if (updateType === 'service_times' && isWorkshop) {
      // Workshop can update actual start/end times during service
      if (body.actualStartTime) {
        updateData.actualStartTime = new Date(body.actualStartTime)
      }
      if (body.actualEndTime) {
        updateData.actualEndTime = new Date(body.actualEndTime)
      }

      // Update individual service times
      if (body.services && Array.isArray(body.services)) {
        const updatedServices = appointment.services.map((service) => {
          const serviceUpdate = body.services.find((s: any) => s.serviceType === service.serviceType)
          if (serviceUpdate) {
            return {
              ...service,
              actualStartTime: serviceUpdate.actualStartTime ? new Date(serviceUpdate.actualStartTime) : service.actualStartTime,
              actualEndTime: serviceUpdate.actualEndTime ? new Date(serviceUpdate.actualEndTime) : service.actualEndTime,
              status: serviceUpdate.status || service.status,
              notes: serviceUpdate.notes || service.notes
            }
          }
          return service
        })
        updateData.services = updatedServices
      }

    } else if (updateType === 'review' && isCustomer) {
      // Customer can add/update review for completed appointments
      if (appointment.status !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Can only review completed appointments' },
          { status: 400 }
        )
      }

      if (!body.rating || body.rating < 1 || body.rating > 5) {
        return NextResponse.json(
          { success: false, error: 'Rating must be between 1 and 5' },
          { status: 400 }
        )
      }

      if (!body.comment || body.comment.trim().length < 10) {
        return NextResponse.json(
          { success: false, error: 'Review comment must be at least 10 characters' },
          { status: 400 }
        )
      }

      updateData.customerRating = body.rating
      updateData.customerReview = body.comment.trim()

    } else if (updateType === 'payment' && isWorkshop) {
      // Workshop can update payment status
      if (appointment.status !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Can only confirm payment for completed appointments' },
          { status: 400 }
        )
      }

      if (!body.paymentStatus || !['pending', 'partial', 'paid', 'refunded'].includes(body.paymentStatus)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment status' },
          { status: 400 }
        )
      }

      updateData.paymentStatus = body.paymentStatus

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid update type or insufficient permissions' },
        { status: 400 }
      )
    }

    // Perform the update
    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Get updated appointment
    const updatedAppointment = await db.collection('appointments').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!updatedAppointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found after update' },
        { status: 404 }
      )
    }

    // Send notifications for status changes
    if (updateType === 'status' && updatedAppointment.status !== appointment.status) {
      try {
        await AppointmentNotificationService.notifyStatusChange(
          updatedAppointment as Appointment,
          appointment.status,
          updatedAppointment.status,
          new ObjectId(session.user.id),
          body.reason
        )
      } catch (notificationError) {
        console.error('Failed to send status change notifications:', notificationError)
        // Don't fail the entire request if notifications fail
      }
    }

    // Send notifications for reschedules
    if (updateType === 'reschedule') {
      try {
        await AppointmentNotificationService.notifyStatusChange(
          updatedAppointment as Appointment,
          appointment.status,
          'rescheduled' as AppointmentStatus,
          new ObjectId(session.user.id),
          body.reason || 'Appointment rescheduled'
        )
      } catch (notificationError) {
        console.error('Failed to send reschedule notifications:', notificationError)
        // Don't fail the entire request if notifications fail
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedAppointment,
        _id: updatedAppointment._id.toString(),
        quotationId: updatedAppointment.quotationId.toString(),
        customerId: updatedAppointment.customerId.toString(),
        workshopId: updatedAppointment.workshopId.toString()
      }
    })

  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Cancel appointment
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
        { success: false, error: 'Invalid appointment ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const appointment = await db.collection('appointments').findOne({
      _id: new ObjectId(resolvedParams.id)
    }) as Appointment

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const hasAccess =
      (session.user.role === 'customer' && appointment.customerId.toString() === session.user.id) ||
      (session.user.role === 'workshop' && appointment.workshopId.toString() === session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if appointment can be cancelled
    if (!['requested', 'confirmed', 'scheduled'].includes(appointment.status)) {
      return NextResponse.json(
        { success: false, error: 'This appointment cannot be cancelled' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const reason = body.reason || 'Cancelled by user request'

    // Update appointment status to cancelled
    const statusHistory = appointment.statusHistory || []
    statusHistory.push({
      status: 'cancelled' as AppointmentStatus,
      changedAt: new Date(),
      changedBy: new ObjectId(session.user.id),
      reason,
      notes: body.notes
    })

    await db.collection('appointments').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      {
        $set: {
          status: 'cancelled' as AppointmentStatus,
          cancelledAt: new Date(),
          updatedAt: new Date(),
          statusHistory
        }
      }
    )

    // Send cancellation notifications
    try {
      await AppointmentNotificationService.notifyAppointmentCancelled(
        appointment,
        new ObjectId(session.user.id),
        reason
      )
    } catch (notificationError) {
      console.error('Failed to send cancellation notifications:', notificationError)
      // Don't fail the entire request if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}