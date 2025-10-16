import { ObjectId } from 'mongodb'
import { connectToDatabase } from './mongodb'
import { Appointment, AppointmentStatus } from '@/models/Appointment'
import { format } from 'date-fns'

/**
 * Appointment notification service
 * Integrates with existing notification system
 */
export class AppointmentNotificationService {

  /**
   * Create notifications for appointment status changes
   */
  static async notifyStatusChange(
    appointment: Appointment,
    oldStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
    changedBy: ObjectId,
    reason?: string
  ): Promise<void> {
    try {
      const { db } = await connectToDatabase()
      const notifications = []

      const appointmentDateTime = format(new Date(appointment.scheduledDate), 'MMM dd, yyyy') +
                                 ` at ${appointment.scheduledStartTime}`

      // Notification for customer
      if (newStatus !== oldStatus) {
        const customerNotification = {
          _id: new ObjectId(),
          userId: appointment.customerId,
          type: `appointment_${newStatus}` as const,
          title: this.getNotificationTitle(newStatus, 'customer'),
          message: this.getNotificationMessage(newStatus, 'customer', {
            appointmentDateTime,
            workshopName: appointment.workshopName,
            vehicleInfo: `${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}`,
            reason
          }),
          data: {
            appointmentId: appointment._id,
            quotationId: appointment.quotationId,
            workshopId: appointment.workshopId,
            appointmentDateTime,
            status: newStatus,
            oldStatus,
            vehicleInfo: appointment.vehicleInfo,
            services: appointment.services.map(s => s.serviceType)
          },
          read: false,
          createdAt: new Date()
        }

        notifications.push(customerNotification)

        // Notification for workshop (if status change wasn't initiated by workshop)
        if (changedBy.toString() !== appointment.workshopId.toString()) {
          const workshopNotification = {
            _id: new ObjectId(),
            userId: appointment.workshopId,
            type: `appointment_${newStatus}` as const,
            title: this.getNotificationTitle(newStatus, 'workshop'),
            message: this.getNotificationMessage(newStatus, 'workshop', {
              appointmentDateTime,
              customerName: appointment.customerName,
              vehicleInfo: `${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}`,
              reason
            }),
            data: {
              appointmentId: appointment._id,
              quotationId: appointment.quotationId,
              customerId: appointment.customerId,
              appointmentDateTime,
              status: newStatus,
              oldStatus,
              customerInfo: {
                name: appointment.customerName,
                phone: appointment.customerPhone,
                email: appointment.customerEmail
              },
              vehicleInfo: appointment.vehicleInfo,
              services: appointment.services.map(s => s.serviceType)
            },
            read: false,
            createdAt: new Date()
          }

          notifications.push(workshopNotification)
        }
      }

      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications)
        console.log(`Created ${notifications.length} appointment status notifications`)
      }

    } catch (error) {
      console.error('Failed to create appointment status notifications:', error)
      // Don't fail the entire operation if notifications fail
    }
  }

  /**
   * Create notifications for appointment reminders
   */
  static async createAppointmentReminders(appointment: Appointment): Promise<void> {
    try {
      const { db } = await connectToDatabase()
      const notifications = []

      const appointmentDateTime = new Date(`${appointment.scheduledDate.toString().split('T')[0]}T${appointment.scheduledStartTime}:00`)
      const now = new Date()

      // Check if reminders are enabled
      if (!appointment.reminders?.enabled) {
        return
      }

      const formattedDateTime = format(new Date(appointment.scheduledDate), 'MMM dd, yyyy') +
                               ` at ${appointment.scheduledStartTime}`

      // Create reminder notifications for specified times
      for (const hoursBeforeAppointment of appointment.reminders.reminderTimes || []) {
        const reminderTime = new Date(appointmentDateTime.getTime() - (hoursBeforeAppointment * 60 * 60 * 1000))

        // Only create reminders for future times
        if (reminderTime > now) {
          // Customer reminder
          const customerReminder = {
            _id: new ObjectId(),
            userId: appointment.customerId,
            type: 'appointment_reminder' as const,
            title: `Appointment Reminder - ${hoursBeforeAppointment}h`,
            message: `Reminder: You have an appointment with ${appointment.workshopName} on ${formattedDateTime} for your ${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}.`,
            data: {
              appointmentId: appointment._id,
              quotationId: appointment.quotationId,
              workshopId: appointment.workshopId,
              appointmentDateTime: formattedDateTime,
              hoursBeforeAppointment,
              vehicleInfo: appointment.vehicleInfo,
              workshopInfo: {
                name: appointment.workshopName,
                phone: appointment.workshopPhone,
                address: appointment.workshopAddress
              },
              services: appointment.services.map(s => s.serviceType)
            },
            scheduledFor: reminderTime,
            read: false,
            createdAt: new Date()
          }

          // Workshop reminder
          const workshopReminder = {
            _id: new ObjectId(),
            userId: appointment.workshopId,
            type: 'appointment_reminder' as const,
            title: `Appointment Reminder - ${hoursBeforeAppointment}h`,
            message: `Reminder: You have an appointment with ${appointment.customerName} on ${formattedDateTime} for ${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}.`,
            data: {
              appointmentId: appointment._id,
              quotationId: appointment.quotationId,
              customerId: appointment.customerId,
              appointmentDateTime: formattedDateTime,
              hoursBeforeAppointment,
              customerInfo: {
                name: appointment.customerName,
                phone: appointment.customerPhone,
                email: appointment.customerEmail
              },
              vehicleInfo: appointment.vehicleInfo,
              services: appointment.services.map(s => s.serviceType)
            },
            scheduledFor: reminderTime,
            read: false,
            createdAt: new Date()
          }

          notifications.push(customerReminder, workshopReminder)
        }
      }

      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications)
        console.log(`Created ${notifications.length} appointment reminder notifications`)

        // Update appointment to track that reminders were created
        await db.collection('appointments').updateOne(
          { _id: appointment._id },
          {
            $push: {
              remindersSent: {
                $each: appointment.reminders.reminderTimes.map(hours => ({
                  type: 'notification' as const,
                  sentAt: new Date(),
                  hoursBeforeAppointment: hours
                }))
              }
            }
          } as any
        )
      }

    } catch (error) {
      console.error('Failed to create appointment reminder notifications:', error)
    }
  }

  /**
   * Notify about appointment creation
   */
  static async notifyAppointmentCreated(appointment: Appointment): Promise<void> {
    const appointmentDateTime = format(new Date(appointment.scheduledDate), 'MMM dd, yyyy') +
                               ` at ${appointment.scheduledStartTime}`

    // Notify workshop about new appointment request
    await this.createSingleNotification(
      appointment.workshopId,
      'appointment_requested',
      'New Appointment Request',
      `${appointment.customerName} has requested an appointment on ${appointmentDateTime} for their ${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}. Please confirm or reschedule.`,
      {
        appointmentId: appointment._id,
        quotationId: appointment.quotationId,
        customerId: appointment.customerId,
        appointmentDateTime,
        customerInfo: {
          name: appointment.customerName,
          phone: appointment.customerPhone,
          email: appointment.customerEmail
        },
        vehicleInfo: appointment.vehicleInfo,
        services: appointment.services.map(s => s.serviceType)
      }
    )

    // Create reminders if enabled
    if (appointment.reminders?.enabled) {
      await this.createAppointmentReminders(appointment)
    }
  }

  /**
   * Notify about appointment cancellation
   */
  static async notifyAppointmentCancelled(
    appointment: Appointment,
    cancelledBy: ObjectId,
    reason?: string
  ): Promise<void> {
    const appointmentDateTime = format(new Date(appointment.scheduledDate), 'MMM dd, yyyy') +
                               ` at ${appointment.scheduledStartTime}`

    const isCustomerCancellation = cancelledBy.toString() === appointment.customerId.toString()

    if (isCustomerCancellation) {
      // Notify workshop
      await this.createSingleNotification(
        appointment.workshopId,
        'appointment_cancelled',
        'Appointment Cancelled by Customer',
        `${appointment.customerName} has cancelled their appointment on ${appointmentDateTime} for ${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}. ${reason ? `Reason: ${reason}` : ''}`,
        {
          appointmentId: appointment._id,
          quotationId: appointment.quotationId,
          customerId: appointment.customerId,
          appointmentDateTime,
          reason,
          cancelledBy: 'customer'
        }
      )
    } else {
      // Notify customer
      await this.createSingleNotification(
        appointment.customerId,
        'appointment_cancelled',
        'Appointment Cancelled by Workshop',
        `${appointment.workshopName} has cancelled your appointment on ${appointmentDateTime} for your ${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}. ${reason ? `Reason: ${reason}` : ''} Please reschedule or contact the workshop.`,
        {
          appointmentId: appointment._id,
          quotationId: appointment.quotationId,
          workshopId: appointment.workshopId,
          appointmentDateTime,
          reason,
          cancelledBy: 'workshop'
        }
      )
    }
  }

  /**
   * Helper to create a single notification
   */
  private static async createSingleNotification(
    userId: ObjectId,
    type: string,
    title: string,
    message: string,
    data: any
  ): Promise<void> {
    try {
      const { db } = await connectToDatabase()

      const notification = {
        _id: new ObjectId(),
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date()
      }

      await db.collection('notifications').insertOne(notification)
      console.log(`Created notification for user ${userId}: ${title}`)
    } catch (error) {
      console.error('Failed to create single notification:', error)
    }
  }

  /**
   * Get notification title based on status and user role
   */
  private static getNotificationTitle(status: AppointmentStatus, userRole: 'customer' | 'workshop'): string {
    const titles: Record<AppointmentStatus, Record<'customer' | 'workshop', string>> = {
      requested: {
        customer: 'Appointment Requested',
        workshop: 'New Appointment Request'
      },
      confirmed: {
        customer: 'Appointment Confirmed',
        workshop: 'Appointment Confirmed'
      },
      scheduled: {
        customer: 'Appointment Scheduled',
        workshop: 'Appointment Scheduled'
      },
      in_progress: {
        customer: 'Service Started',
        workshop: 'Service In Progress'
      },
      completed: {
        customer: 'Service Completed',
        workshop: 'Service Completed'
      },
      cancelled: {
        customer: 'Appointment Cancelled',
        workshop: 'Appointment Cancelled'
      },
      no_show: {
        customer: 'Missed Appointment',
        workshop: 'Customer No Show'
      },
      rescheduled: {
        customer: 'Appointment Rescheduled',
        workshop: 'Appointment Rescheduled'
      }
    }

    return titles[status]?.[userRole] || 'Appointment Update'
  }

  /**
   * Get notification message based on status and context
   */
  private static getNotificationMessage(
    status: AppointmentStatus,
    userRole: 'customer' | 'workshop',
    context: {
      appointmentDateTime: string
      workshopName?: string
      customerName?: string
      vehicleInfo: string
      reason?: string
    }
  ): string {
    const { appointmentDateTime, workshopName, customerName, vehicleInfo, reason } = context

    const messages: Record<AppointmentStatus, Record<'customer' | 'workshop', string>> = {
      requested: {
        customer: `Your appointment request for ${appointmentDateTime} has been sent to ${workshopName}. You'll be notified when they confirm.`,
        workshop: `${customerName} has requested an appointment on ${appointmentDateTime} for their ${vehicleInfo}. Please confirm or suggest alternative times.`
      },
      confirmed: {
        customer: `Great news! ${workshopName} has confirmed your appointment on ${appointmentDateTime} for your ${vehicleInfo}.`,
        workshop: `You have confirmed the appointment with ${customerName} on ${appointmentDateTime} for their ${vehicleInfo}.`
      },
      scheduled: {
        customer: `Your appointment with ${workshopName} is scheduled for ${appointmentDateTime}. Please arrive on time.`,
        workshop: `Appointment with ${customerName} is confirmed for ${appointmentDateTime}. Vehicle: ${vehicleInfo}.`
      },
      in_progress: {
        customer: `Your service has started at ${workshopName}. You'll be notified when it's completed.`,
        workshop: `Service for ${customerName}'s ${vehicleInfo} is now in progress.`
      },
      completed: {
        customer: `Your service at ${workshopName} has been completed successfully! You can now pick up your ${vehicleInfo}.`,
        workshop: `Service completed for ${customerName}'s ${vehicleInfo}. Customer has been notified.`
      },
      cancelled: {
        customer: `Your appointment with ${workshopName} on ${appointmentDateTime} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
        workshop: `Appointment with ${customerName} on ${appointmentDateTime} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`
      },
      no_show: {
        customer: `You missed your appointment with ${workshopName} on ${appointmentDateTime}. Please contact them to reschedule.`,
        workshop: `${customerName} did not show up for their appointment on ${appointmentDateTime} for ${vehicleInfo}.`
      },
      rescheduled: {
        customer: `Your appointment with ${workshopName} has been rescheduled. New time: ${appointmentDateTime}. ${reason ? `Reason: ${reason}` : ''}`,
        workshop: `Appointment with ${customerName} has been rescheduled to ${appointmentDateTime}. ${reason ? `Reason: ${reason}` : ''}`
      }
    }

    return messages[status]?.[userRole] || `Your appointment status has been updated to ${status}.`
  }

  /**
   * Clean up old reminder notifications that are no longer relevant
   */
  static async cleanupOldReminders(): Promise<void> {
    try {
      const { db } = await connectToDatabase()
      const now = new Date()

      // Delete reminder notifications that are older than the appointment time
      await db.collection('notifications').deleteMany({
        type: 'appointment_reminder',
        scheduledFor: { $lt: now }
      })

      console.log('Cleaned up old appointment reminder notifications')
    } catch (error) {
      console.error('Failed to cleanup old reminder notifications:', error)
    }
  }
}