import { ObjectId } from 'mongodb'
import { connectToDatabase } from './mongodb'
import {
  Appointment,
  AppointmentStatus,
  WorkshopAvailability,
  AvailabilitySlot,
  TimeSlot,
  computeAvailableSlots
} from '@/models/Appointment'
import { OperatingHours, isWorkshopOpen } from '@/models/Workshop'
import { addDays, startOfDay, format } from 'date-fns'

/**
 * Comprehensive appointment availability and scheduling service
 * Integrates with existing workshop operating hours system
 */
export class AppointmentService {
  /**
   * Get workshop availability for a specific date range
   */
  static async getWorkshopAvailability(
    workshopId: ObjectId,
    startDate: Date,
    endDate: Date,
    slotDuration: number = 1 // hours
  ): Promise<WorkshopAvailability[]> {
    const { db } = await connectToDatabase()

    // Get workshop operating hours (lookup by userId first, then _id as fallback)
    let workshop = await db.collection('workshops').findOne({
      userId: workshopId,
      isActive: true
    })

    // Fallback: try by _id if not found by userId
    if (!workshop) {
      workshop = await db.collection('workshops').findOne({
        _id: workshopId,
        isActive: true
      })
    }

    if (!workshop) {
      console.error('Workshop not found for ID:', workshopId.toString())
      throw new Error(`Workshop not found with ID: ${workshopId.toString()}`)
    }

    // Use workshop's operating hours or default if not set
    const operatingHours: OperatingHours = workshop.profile?.operatingHours || {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '08:00', close: '12:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    }

    // Get existing appointments for the date range
    const existingAppointments = await db.collection('appointments').find({
      workshopId,
      scheduledDate: {
        $gte: startOfDay(startDate),
        $lte: startOfDay(endDate)
      },
      status: {
        $in: ['confirmed', 'scheduled', 'in_progress'] as AppointmentStatus[]
      }
    }).toArray() as Appointment[]

    const availability: WorkshopAvailability[] = []

    // Generate availability for each day in range
    let currentDate = startOfDay(startDate)
    while (currentDate <= endDate) {
      const dayAppointments = existingAppointments.filter(
        apt => startOfDay(new Date(apt.scheduledDate)).getTime() === currentDate.getTime()
      )

      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours
      const dayHours = operatingHours[dayName]

      const availableSlots = computeAvailableSlots(
        operatingHours,
        currentDate,
        dayAppointments,
        slotDuration
      )

      const bookedSlots = dayAppointments.map(apt => ({
        startTime: apt.scheduledStartTime,
        endTime: apt.scheduledEndTime,
        appointmentId: apt._id
      }))

      availability.push({
        workshopId,
        date: currentDate,
        operatingHours: dayHours,
        availableSlots,
        bookedSlots,
        unavailableSlots: dayHours.closed ? [{
          startTime: '00:00',
          endTime: '23:59',
          reason: 'Workshop closed'
        }] : []
      })

      currentDate = addDays(currentDate, 1)
    }

    return availability
  }

  /**
   * Get next available appointment slots for a workshop
   */
  static async getNextAvailableSlots(
    workshopId: ObjectId,
    requiredDuration: number,
    daysToLookAhead: number = 14,
    slotsNeeded: number = 10
  ): Promise<TimeSlot[]> {
    const startDate = new Date()
    const endDate = addDays(startDate, daysToLookAhead)

    const availability = await this.getWorkshopAvailability(
      workshopId,
      startDate,
      endDate,
      requiredDuration
    )

    const availableSlots: TimeSlot[] = []

    for (const dayAvailability of availability) {
      for (const slot of dayAvailability.availableSlots) {
        if (slot.isAvailable) {
          availableSlots.push({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: requiredDuration
          })

          if (availableSlots.length >= slotsNeeded) {
            return availableSlots
          }
        }
      }
    }

    return availableSlots
  }

  /**
   * Check if a specific time slot is available for booking
   */
  static async isTimeSlotAvailable(
    workshopId: ObjectId,
    date: Date,
    startTime: string,
    duration: number
  ): Promise<{
    available: boolean
    reason?: string
    conflictingAppointment?: ObjectId
  }> {
    const { db } = await connectToDatabase()

    // Get workshop operating hours (lookup by userId first, then _id as fallback)
    let workshop = await db.collection('workshops').findOne({
      userId: workshopId,
      isActive: true
    })

    // Fallback: try by _id if not found by userId
    if (!workshop) {
      workshop = await db.collection('workshops').findOne({
        _id: workshopId,
        isActive: true
      })
    }

    if (!workshop) {
      return { available: false, reason: 'Workshop not found' }
    }

    // Use workshop's operating hours or default if not set
    const operatingHours: OperatingHours = workshop.profile?.operatingHours || {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '08:00', close: '12:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    }
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours
    const dayHours = operatingHours[dayName]

    // Check if workshop is closed on this day
    if (dayHours.closed) {
      return { available: false, reason: 'Workshop is closed on this day' }
    }

    // Check if requested START time is within operating hours
    const requestedStartMinutes = this.timeToMinutes(startTime)
    const openMinutes = this.timeToMinutes(dayHours.open)
    const closeMinutes = this.timeToMinutes(dayHours.close)
    const dailyHours = (closeMinutes - openMinutes) / 60

    // For multi-day services, only check if start time is within operating hours
    const isMultiDayService = duration > dailyHours

    if (requestedStartMinutes < openMinutes || requestedStartMinutes >= closeMinutes) {
      return {
        available: false,
        reason: `Workshop operates from ${dayHours.open} to ${dayHours.close}`
      }
    }

    // For same-day services, also check if end time fits
    if (!isMultiDayService) {
      const requestedEndMinutes = requestedStartMinutes + (duration * 60)
      if (requestedEndMinutes > closeMinutes) {
        return {
          available: false,
          reason: `Service duration (${duration}h) does not fit within operating hours`
        }
      }
    }

    // Check for conflicting appointments
    // For multi-day services, we only check if the start time conflicts
    // For same-day services, we check the full time range
    const endTime = isMultiDayService
      ? this.addMinutesToTime(startTime, 60) // Check 1-hour slot for multi-day
      : this.addMinutesToTime(startTime, duration * 60)

    const conflictingAppointment = await db.collection('appointments').findOne({
      workshopId,
      scheduledDate: startOfDay(date),
      status: {
        $in: ['confirmed', 'scheduled', 'in_progress'] as AppointmentStatus[]
      },
      $or: [
        // Existing appointment starts during requested time
        {
          scheduledStartTime: { $gte: startTime, $lt: endTime }
        },
        // Existing appointment ends during requested time
        {
          scheduledEndTime: { $gt: startTime, $lte: endTime }
        },
        // Existing appointment encompasses requested time
        {
          scheduledStartTime: { $lte: startTime },
          scheduledEndTime: { $gte: endTime }
        }
      ]
    })

    if (conflictingAppointment) {
      return {
        available: false,
        reason: 'Time slot is already booked',
        conflictingAppointment: conflictingAppointment._id
      }
    }

    return { available: true }
  }

  /**
   * Find optimal appointment slots based on customer preferences
   */
  static async findOptimalSlots(
    workshopId: ObjectId,
    requiredDuration: number,
    preferredDates: Date[],
    preferredTimeRanges: { start: string; end: string }[] = [
      { start: '09:00', end: '17:00' } // Default to business hours
    ],
    maxAlternatives: number = 5
  ): Promise<{
    preferredSlots: TimeSlot[]
    alternativeSlots: TimeSlot[]
  }> {
    const { db } = await connectToDatabase()

    // Get workshop (lookup by userId first, then _id as fallback)
    let workshop = await db.collection('workshops').findOne({
      userId: workshopId,
      isActive: true
    })

    // Fallback: try by _id if not found by userId
    if (!workshop) {
      workshop = await db.collection('workshops').findOne({
        _id: workshopId,
        isActive: true
      })
    }

    if (!workshop) {
      console.error('Workshop not found for ID:', workshopId.toString())
      throw new Error(`Workshop not found with ID: ${workshopId.toString()}`)
    }

    // Use workshop's operating hours or default if not set
    const operatingHours: OperatingHours = workshop.profile?.operatingHours || {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '08:00', close: '12:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    }
    const preferredSlots: TimeSlot[] = []
    const alternativeSlots: TimeSlot[] = []

    // Check preferred dates first
    for (const date of preferredDates) {
      const dayAppointments = await db.collection('appointments').find({
        workshopId,
        scheduledDate: startOfDay(date),
        status: {
          $in: ['confirmed', 'scheduled', 'in_progress'] as AppointmentStatus[]
        }
      }).toArray() as Appointment[]

      const availableSlots = computeAvailableSlots(
        operatingHours,
        date,
        dayAppointments,
        requiredDuration
      )

      // Filter slots within preferred time ranges
      for (const slot of availableSlots) {
        if (slot.isAvailable) {
          const slotStartMinutes = this.timeToMinutes(slot.startTime)

          const isInPreferredRange = preferredTimeRanges.some(range => {
            const rangeStartMinutes = this.timeToMinutes(range.start)
            const rangeEndMinutes = this.timeToMinutes(range.end)
            return slotStartMinutes >= rangeStartMinutes && slotStartMinutes <= rangeEndMinutes
          })

          if (isInPreferredRange) {
            preferredSlots.push({
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: requiredDuration
            })
          } else {
            alternativeSlots.push({
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: requiredDuration
            })
          }
        }
      }
    }

    // If we don't have enough preferred slots, look for alternatives in the next few days
    if (preferredSlots.length < 3) {
      const nextWeek = addDays(new Date(), 7)
      const additionalAvailability = await this.getWorkshopAvailability(
        workshopId,
        new Date(),
        nextWeek,
        requiredDuration
      )

      for (const dayAvailability of additionalAvailability) {
        // Skip dates we already checked
        if (preferredDates.some(d =>
          startOfDay(d).getTime() === startOfDay(dayAvailability.date).getTime()
        )) {
          continue
        }

        for (const slot of dayAvailability.availableSlots) {
          if (slot.isAvailable && alternativeSlots.length < maxAlternatives) {
            alternativeSlots.push({
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: requiredDuration
            })
          }
        }
      }
    }

    return {
      preferredSlots: preferredSlots.slice(0, maxAlternatives),
      alternativeSlots: alternativeSlots.slice(0, maxAlternatives)
    }
  }

  /**
   * Get workshop's current availability status
   */
  static async getWorkshopCurrentStatus(workshopId: ObjectId): Promise<{
    isOpen: boolean
    nextAvailableSlot?: TimeSlot
    currentAppointment?: Appointment
    todaySlots: {
      available: number
      booked: number
      total: number
    }
  }> {
    const { db } = await connectToDatabase()

    // Get workshop (lookup by userId first, then _id as fallback)
    let workshop = await db.collection('workshops').findOne({
      userId: workshopId,
      isActive: true
    })

    // Fallback: try by _id if not found by userId
    if (!workshop) {
      workshop = await db.collection('workshops').findOne({
        _id: workshopId,
        isActive: true
      })
    }

    if (!workshop) {
      console.error('Workshop not found for ID:', workshopId.toString())
      throw new Error(`Workshop not found with ID: ${workshopId.toString()}`)
    }

    // Use workshop's operating hours or default if not set
    const operatingHours: OperatingHours = workshop.profile?.operatingHours || {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '08:00', close: '12:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    }
    const isOpen = isWorkshopOpen(operatingHours)

    const today = startOfDay(new Date())
    const todayAppointments = await db.collection('appointments').find({
      workshopId,
      scheduledDate: today,
      status: {
        $in: ['confirmed', 'scheduled', 'in_progress'] as AppointmentStatus[]
      }
    }).toArray() as Appointment[]

    // Find current appointment
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const currentAppointment = todayAppointments.find(apt =>
      apt.scheduledStartTime <= currentTime && apt.scheduledEndTime >= currentTime
    )

    // Calculate today's slot statistics
    const todaySlots = computeAvailableSlots(operatingHours, today, todayAppointments, 1)
    const availableSlots = todaySlots.filter(slot => slot.isAvailable).length
    const bookedSlots = todaySlots.filter(slot => !slot.isAvailable).length

    // Find next available slot (today or in the future)
    let nextAvailableSlot: TimeSlot | undefined

    if (availableSlots > 0) {
      const nextSlot = todaySlots.find(slot =>
        slot.isAvailable && slot.startTime > currentTime
      )

      if (nextSlot) {
        nextAvailableSlot = {
          date: nextSlot.date,
          startTime: nextSlot.startTime,
          endTime: nextSlot.endTime,
          duration: 1
        }
      }
    }

    // If no slot available today, check tomorrow
    if (!nextAvailableSlot) {
      const nextSlots = await this.getNextAvailableSlots(workshopId, 1, 7, 1)
      if (nextSlots.length > 0) {
        nextAvailableSlot = nextSlots[0]
      }
    }

    return {
      isOpen,
      nextAvailableSlot,
      currentAppointment,
      todaySlots: {
        available: availableSlots,
        booked: bookedSlots,
        total: todaySlots.length
      }
    }
  }

  /**
   * Estimate optimal appointment duration based on services
   */
  static estimateServiceDuration(serviceTypes: string[]): number {
    // Service duration estimates in hours
    const serviceDurations: Record<string, number> = {
      // Mechanical Issues (longer duration)
      engine: 4,
      transmission: 6,
      brakes: 2,
      suspension: 3,
      clutch: 4,

      // Electrical Issues (medium duration)
      electrical: 2,
      battery: 0.5,
      alternator: 2,
      lights: 1,
      electronics: 2,

      // Body & Exterior (variable duration)
      bodywork: 8,
      paint: 6,
      glass: 2,
      bumper: 3,
      dents: 2,

      // Maintenance & Service (short duration)
      maintenance: 1,
      oil_change: 0.5,
      inspection: 1,
      tune_up: 2,
      filters: 0.5,

      // Tires & Wheels (short duration)
      tires: 1,
      wheel_alignment: 1,
      tire_rotation: 0.5,
      wheel_balancing: 1,

      // Other Services
      detailing: 3,
      diagnostic: 1,
      repair: 2,
      other: 2
    }

    const totalDuration = serviceTypes.reduce((total, service) => {
      return total + (serviceDurations[service] || 2) // Default 2 hours for unknown services
    }, 0)

    // Add 20% buffer time and round up to nearest 0.5 hour
    const withBuffer = totalDuration * 1.2
    const finalDuration = Math.ceil(withBuffer * 2) / 2

    // Return calculated duration without cap
    return finalDuration
  }

  /**
   * Utility: Convert time string (HH:MM) to minutes
   */
  private static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  /**
   * Utility: Add minutes to time string and return new time string
   */
  private static addMinutesToTime(timeStr: string, minutes: number): string {
    const totalMinutes = this.timeToMinutes(timeStr) + minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  /**
   * Get available time slots for multiple workshops (for comparison)
   */
  static async compareWorkshopAvailability(
    workshopIds: ObjectId[],
    requiredDuration: number,
    preferredDate?: Date,
    daysToCheck: number = 7
  ): Promise<{
    workshopId: ObjectId
    workshopName: string
    nextAvailableSlot?: TimeSlot
    availableSlotsCount: number
    averageWaitTime: number // days until next available slot
  }[]> {
    const { db } = await connectToDatabase()
    const results = []

    for (const workshopId of workshopIds) {
      const workshop = await db.collection('workshops').findOne({
        userId: workshopId,
        isActive: true
      })

      if (!workshop) continue

      const startDate = preferredDate || new Date()
      const endDate = addDays(startDate, daysToCheck)

      const availability = await this.getWorkshopAvailability(
        workshopId,
        startDate,
        endDate,
        requiredDuration
      )

      let nextAvailableSlot: TimeSlot | undefined
      let totalAvailableSlots = 0
      let firstAvailableDay = daysToCheck

      for (let dayIndex = 0; dayIndex < availability.length; dayIndex++) {
        const dayAvailability = availability[dayIndex]
        const availableSlots = dayAvailability.availableSlots.filter(slot => slot.isAvailable)
        totalAvailableSlots += availableSlots.length

        if (!nextAvailableSlot && availableSlots.length > 0) {
          const firstSlot = availableSlots[0]
          nextAvailableSlot = {
            date: firstSlot.date,
            startTime: firstSlot.startTime,
            endTime: firstSlot.endTime,
            duration: requiredDuration
          }
          firstAvailableDay = dayIndex
        }
      }

      results.push({
        workshopId,
        workshopName: workshop.profile.businessName,
        nextAvailableSlot,
        availableSlotsCount: totalAvailableSlots,
        averageWaitTime: firstAvailableDay
      })
    }

    // Sort by earliest availability
    return results.sort((a, b) => a.averageWaitTime - b.averageWaitTime)
  }
}

/**
 * Appointment validation helpers
 */
export class AppointmentValidation {
  /**
   * Validate appointment booking request
   */
  static validateBookingRequest(request: {
    quotationId: string
    acceptedQuoteId: string
    preferredDate: Date
    preferredStartTime: string
    duration: number
  }): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check if date is in the future
    const now = new Date()
    const appointmentDateTime = new Date(`${request.preferredDate.toISOString().split('T')[0]}T${request.preferredStartTime}:00`)

    if (appointmentDateTime <= now) {
      errors.push('Appointment must be scheduled for a future date and time')
    }

    // Check if it's not too far in the future (e.g., max 3 months)
    const threeMonthsFromNow = addDays(now, 90)
    if (appointmentDateTime > threeMonthsFromNow) {
      errors.push('Appointment cannot be scheduled more than 3 months in advance')
    }

    // Check if duration is reasonable (0.5 to 12 hours)
    if (request.duration < 0.5 || request.duration > 12) {
      errors.push('Appointment duration must be between 0.5 and 12 hours')
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(request.preferredStartTime)) {
      errors.push('Invalid time format. Use HH:MM format')
    }

    // Check if it's during reasonable business hours (6 AM to 10 PM)
    const [hours] = request.preferredStartTime.split(':').map(Number)
    if (hours < 6 || hours > 22) {
      errors.push('Appointment time must be between 6:00 AM and 10:00 PM')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate rescheduling request
   */
  static validateRescheduleRequest(
    appointment: Appointment,
    newDate: Date,
    newStartTime: string
  ): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check if appointment can be rescheduled
    if (!['requested', 'confirmed', 'scheduled'].includes(appointment.status)) {
      errors.push('This appointment cannot be rescheduled')
    }

    // Check if rescheduling with sufficient notice (e.g., 24 hours)
    const currentAppointmentTime = new Date(`${appointment.scheduledDate.toISOString().split('T')[0]}T${appointment.scheduledStartTime}:00`)
    const hoursUntilAppointment = (currentAppointmentTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)

    if (hoursUntilAppointment < 24) {
      errors.push('Appointments can only be rescheduled with at least 24 hours notice')
    }

    // Validate new time using the same rules as booking
    const validationResult = this.validateBookingRequest({
      quotationId: appointment.quotationId.toString(),
      acceptedQuoteId: appointment.acceptedQuoteId,
      preferredDate: newDate,
      preferredStartTime: newStartTime,
      duration: appointment.estimatedDuration
    })

    errors.push(...validationResult.errors)

    return {
      valid: errors.length === 0,
      errors
    }
  }
}