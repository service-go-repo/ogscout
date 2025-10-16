import { ObjectId } from 'mongodb'

export interface AppointmentSlotSettings {
  // Slot configuration
  defaultDuration: number // minutes (e.g., 60, 120)
  slotInterval: number // minutes between slots (e.g., 15, 30, 60)
  bufferTime: number // minutes buffer between appointments

  // Service-specific durations
  serviceDurations: {
    [serviceType: string]: number // minutes for specific services
  }

  // Concurrent appointments
  maxConcurrentAppointments: number
  allowOverlapping: boolean
}

export interface BookingSettings {
  // Advance booking limits
  minAdvanceBooking: number // hours (e.g., 2 hours minimum)
  maxAdvanceBooking: number // days (e.g., 90 days maximum)

  // Cancellation policy
  cancellationDeadline: number // hours before appointment
  rescheduleDeadline: number // hours before appointment

  // Confirmation settings
  requireConfirmation: boolean
  autoConfirmWithin: number // minutes (auto-confirm if workshop doesn't respond)

  // Reminder settings
  enableReminders: boolean
  reminderTimes: number[] // hours before appointment [24, 2, 0.5]
  reminderMethods: ('email' | 'sms' | 'push')[]
}

export interface AvailabilityException {
  id: string
  date: Date
  type: 'closed' | 'modified_hours' | 'holiday'
  reason?: string
  modifiedHours?: {
    start: string
    end: string
    breakStart?: string
    breakEnd?: string
  }
}

export interface AppointmentSettings {
  _id?: ObjectId
  workshopId: ObjectId

  // Basic settings
  enabled: boolean
  slotSettings: AppointmentSlotSettings
  bookingSettings: BookingSettings

  // Availability
  useOperatingHours: boolean // Use workshop's operating hours or custom
  customAvailability?: {
    [day: string]: { // 'monday', 'tuesday', etc.
      enabled: boolean
      start: string // '09:00'
      end: string // '17:00'
      breakStart?: string // '12:00'
      breakEnd?: string // '13:00'
    }
  }

  // Special dates and holidays
  availabilityExceptions: AvailabilityException[]

  // Service configuration
  enabledServices: string[] // Which services can be booked
  requireServiceSelection: boolean

  // Pricing and deposits
  requireDeposit: boolean
  depositAmount?: number // flat amount or percentage
  depositType?: 'flat' | 'percentage'

  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Helper functions
export function createDefaultAppointmentSettings(workshopId: ObjectId): AppointmentSettings {
  return {
    workshopId,
    enabled: false,
    slotSettings: {
      defaultDuration: 120, // 2 hours
      slotInterval: 60, // 1 hour intervals
      bufferTime: 15, // 15 minutes buffer
      serviceDurations: {
        'oil_change': 30,
        'brake_service': 60,
        'engine_repair': 240,
        'transmission_repair': 360,
        'diagnostic': 60,
        'maintenance': 90,
        'bodywork': 480,
        'paint': 720
      },
      maxConcurrentAppointments: 3,
      allowOverlapping: false
    },
    bookingSettings: {
      minAdvanceBooking: 2, // 2 hours minimum
      maxAdvanceBooking: 90, // 90 days maximum
      cancellationDeadline: 24, // 24 hours before
      rescheduleDeadline: 12, // 12 hours before
      requireConfirmation: true,
      autoConfirmWithin: 60, // 1 hour auto-confirm
      enableReminders: true,
      reminderTimes: [24, 2], // 24 hours and 2 hours before
      reminderMethods: ['email']
    },
    useOperatingHours: true,
    availabilityExceptions: [],
    enabledServices: [
      'oil_change',
      'brake_service',
      'engine_repair',
      'transmission_repair',
      'diagnostic',
      'maintenance'
    ],
    requireServiceSelection: true,
    requireDeposit: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function getServiceDuration(
  settings: AppointmentSettings,
  serviceTypes: string[]
): number {
  if (!serviceTypes.length) {
    return settings.slotSettings.defaultDuration
  }

  const totalDuration = serviceTypes.reduce((total, serviceType) => {
    const serviceDuration = settings.slotSettings.serviceDurations[serviceType]
    return total + (serviceDuration || settings.slotSettings.defaultDuration)
  }, 0)

  return Math.max(totalDuration, settings.slotSettings.defaultDuration)
}

export function isTimeSlotAvailable(
  settings: AppointmentSettings,
  date: Date,
  startTime: string,
  duration: number,
  existingAppointments: any[] = []
): { available: boolean; reason?: string } {
  if (!settings.enabled) {
    return { available: false, reason: 'Appointment booking is disabled' }
  }

  const dayName = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday'
  ][date.getDay()]

  // Check if day is available
  if (settings.useOperatingHours) {
    // Would need to check workshop's operating hours
    // This would integrate with existing Workshop.operatingHours
  } else if (settings.customAvailability) {
    const dayAvailability = settings.customAvailability[dayName]
    if (!dayAvailability?.enabled) {
      return { available: false, reason: 'Workshop is closed on this day' }
    }
  }

  // Check availability exceptions
  const dateStr = date.toISOString().split('T')[0]
  const exception = settings.availabilityExceptions.find(
    ex => ex.date.toISOString().split('T')[0] === dateStr
  )

  if (exception?.type === 'closed') {
    return {
      available: false,
      reason: exception.reason || 'Workshop is closed on this date'
    }
  }

  // Check advance booking limits
  const now = new Date()
  const appointmentTime = new Date(`${dateStr}T${startTime}:00`)
  const hoursAdvance = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursAdvance < settings.bookingSettings.minAdvanceBooking) {
    return {
      available: false,
      reason: `Minimum ${settings.bookingSettings.minAdvanceBooking} hours advance booking required`
    }
  }

  const daysAdvance = hoursAdvance / 24
  if (daysAdvance > settings.bookingSettings.maxAdvanceBooking) {
    return {
      available: false,
      reason: `Maximum ${settings.bookingSettings.maxAdvanceBooking} days advance booking allowed`
    }
  }

  // Check conflicts with existing appointments
  const endTime = addMinutesToTime(startTime, duration)
  const conflictingAppointments = existingAppointments.filter(apt => {
    const aptDate = new Date(apt.scheduledDate).toISOString().split('T')[0]
    if (aptDate !== dateStr) return false

    return timeRangesOverlap(
      startTime, endTime,
      apt.scheduledStartTime, apt.scheduledEndTime
    )
  })

  if (!settings.slotSettings.allowOverlapping && conflictingAppointments.length > 0) {
    return { available: false, reason: 'Time slot conflicts with existing appointment' }
  }

  if (conflictingAppointments.length >= settings.slotSettings.maxConcurrentAppointments) {
    return { available: false, reason: 'Maximum concurrent appointments reached' }
  }

  return { available: true }
}

// Helper functions
function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

function timeRangesOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  return start1 < end2 && end1 > start2
}