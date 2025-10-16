import { ObjectId } from 'mongodb'
import { OperatingHours } from './Workshop'
import { ServiceType, Priority } from './Quotation'

// Appointment Status
export type AppointmentStatus =
  | 'requested'     // Customer requested appointment after accepting quote
  | 'confirmed'     // Workshop confirmed the appointment
  | 'scheduled'     // Appointment is scheduled and confirmed by both parties
  | 'in_progress'   // Service is currently being performed
  | 'completed'     // Service completed successfully
  | 'cancelled'     // Cancelled by either party
  | 'no_show'       // Customer didn't show up
  | 'rescheduled'   // Appointment was rescheduled

// Appointment Time Slot
export interface TimeSlot {
  date: Date
  startTime: string // HH:MM format (e.g., "09:00")
  endTime: string   // HH:MM format (e.g., "11:00")
  duration: number  // Duration in hours
}

// Service details for the appointment
export interface AppointmentService {
  serviceType: ServiceType
  description: string
  estimatedDuration: number // in hours
  scheduledStartTime?: string // HH:MM format
  scheduledEndTime?: string   // HH:MM format
  actualStartTime?: Date
  actualEndTime?: Date
  notes?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

// Customer preferences for scheduling
export interface SchedulingPreferences {
  preferredTimeSlots: TimeSlot[]
  alternativeTimeSlots?: TimeSlot[]
  flexibleTiming: boolean
  notes?: string
}

// Workshop availability slot
export interface AvailabilitySlot {
  date: Date
  startTime: string
  endTime: string
  isAvailable: boolean
  reason?: string // If not available, reason (e.g., "Booked", "Closed")
}

// Reminder settings
export interface ReminderSettings {
  enabled: boolean
  reminderTimes: number[] // Hours before appointment (e.g., [24, 2])
  methods: ('email' | 'sms' | 'push')[]
}

// Main appointment interface
export interface Appointment {
  _id: ObjectId

  // Related entities
  quotationId: ObjectId        // Links to the original quotation
  acceptedQuoteId: string      // Links to the specific accepted quote
  customerId: ObjectId         // Customer who made the appointment
  workshopId: ObjectId         // Workshop providing the service

  // Basic appointment details
  status: AppointmentStatus
  priority: Priority
  appointmentType: 'service' | 'inspection' | 'estimate' | 'consultation'

  // Scheduling information
  scheduledDate: Date
  scheduledStartTime: string   // HH:MM format
  scheduledEndTime: string     // HH:MM format (same day for UI purposes)
  estimatedDuration: number    // in hours
  actualStartTime?: Date
  actualEndTime?: Date

  // Multi-day service tracking
  isMultiDayService?: boolean  // True if service spans multiple days
  estimatedCompletionDate?: Date // Calculated based on workshop hours
  estimatedWorkDays?: number   // Number of work days needed

  // Services to be performed
  services: AppointmentService[]
  totalEstimatedDuration: number // sum of all service durations

  // Customer information (cached from quotation)
  customerName: string
  customerEmail: string
  customerPhone: string

  // Vehicle information (cached from quotation)
  vehicleInfo: {
    make: string
    model: string
    year: number
    licensePlate?: string
    color?: string
  }

  // Workshop information (cached from workshop profile)
  workshopName: string
  workshopAddress: string
  workshopPhone: string
  workshopEmail: string

  // Location (for mobile services)
  serviceLocation?: {
    type: 'workshop' | 'customer_location' | 'pickup_delivery'
    address?: string
    coordinates?: [number, number] // [longitude, latitude]
    notes?: string
  }

  // Financial information (from accepted quote)
  totalAmount: number
  currency: string
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  paymentMethod?: string

  // Communication and notes
  customerNotes?: string
  workshopNotes?: string
  internalNotes?: string

  // Reminders
  reminders: ReminderSettings
  remindersSent: {
    type: 'email' | 'sms' | 'push'
    sentAt: Date
    hoursBeforeAppointment: number
  }[]

  // History and tracking
  statusHistory: {
    status: AppointmentStatus
    changedAt: Date
    changedBy: ObjectId
    reason?: string
    notes?: string
  }[]

  // Rescheduling history
  rescheduleHistory?: {
    originalDate: Date
    originalStartTime: string
    originalEndTime: string
    newDate: Date
    newStartTime: string
    newEndTime: string
    reason: string
    requestedBy: 'customer' | 'workshop'
    requestedAt: Date
  }[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  confirmedAt?: Date
  completedAt?: Date
  cancelledAt?: Date

  // Analytics
  viewCount?: number
  customerRating?: number
  customerReview?: string
  workshopFeedback?: string
}

// Appointment search and filter interfaces
export interface AppointmentSearchFilters {
  status?: AppointmentStatus[]
  workshopId?: ObjectId
  customerId?: ObjectId
  dateRange?: {
    start: Date
    end: Date
  }
  serviceTypes?: ServiceType[]
  appointmentType?: ('service' | 'inspection' | 'estimate' | 'consultation')[]
  paymentStatus?: ('pending' | 'partial' | 'paid' | 'refunded')[]
}

export interface AppointmentSearchResult {
  appointments: Appointment[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Availability computation interfaces
export interface WorkshopAvailability {
  workshopId: ObjectId
  date: Date
  operatingHours: {
    open: string
    close: string
    closed: boolean
  }
  availableSlots: AvailabilitySlot[]
  bookedSlots: {
    startTime: string
    endTime: string
    appointmentId: ObjectId
  }[]
  unavailableSlots: {
    startTime: string
    endTime: string
    reason: string
  }[]
}

// Booking request interface
export interface AppointmentBookingRequest {
  quotationId: string
  acceptedQuoteId: string
  preferredDate: Date
  preferredStartTime: string
  alternativeDates?: {
    date: Date
    startTime: string
  }[]
  customerNotes?: string
  serviceLocation?: {
    type: 'workshop' | 'customer_location' | 'pickup_delivery'
    address?: string
    coordinates?: [number, number]
    notes?: string
  }
  reminders: ReminderSettings
}

// Helper functions
export const getAppointmentStatusLabel = (status: AppointmentStatus): string => {
  const labels: Record<AppointmentStatus, string> = {
    requested: 'Appointment Requested',
    confirmed: 'Confirmed',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    rescheduled: 'Rescheduled'
  }
  return labels[status] || status
}

export const getAppointmentStatusColor = (status: AppointmentStatus): string => {
  const colors: Record<AppointmentStatus, string> = {
    requested: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-green-100 text-green-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
    rescheduled: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const calculateAppointmentDuration = (services: AppointmentService[]): number => {
  return services.reduce((total, service) => total + service.estimatedDuration, 0)
}

export const isAppointmentUpcoming = (appointment: Appointment): boolean => {
  const appointmentDateTime = new Date(`${appointment.scheduledDate.toISOString().split('T')[0]}T${appointment.scheduledStartTime}:00`)
  return appointmentDateTime > new Date() && ['confirmed', 'scheduled'].includes(appointment.status)
}

export const isAppointmentOverdue = (appointment: Appointment): boolean => {
  const appointmentDateTime = new Date(`${appointment.scheduledDate.toISOString().split('T')[0]}T${appointment.scheduledEndTime}:00`)
  return appointmentDateTime < new Date() && ['requested', 'confirmed', 'scheduled', 'in_progress'].includes(appointment.status)
}

export const canRescheduleAppointment = (appointment: Appointment): boolean => {
  const appointmentDateTime = new Date(`${appointment.scheduledDate.toISOString().split('T')[0]}T${appointment.scheduledStartTime}:00`)
  const hoursUntilAppointment = (appointmentDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  return hoursUntilAppointment > 24 && ['requested', 'confirmed', 'scheduled'].includes(appointment.status)
}

export const canCancelAppointment = (appointment: Appointment): boolean => {
  return ['requested', 'confirmed', 'scheduled'].includes(appointment.status)
}

export const formatAppointmentTime = (date: Date, startTime: string, endTime: string): string => {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  return `${dateStr} from ${startTime} to ${endTime}`
}

// Availability computation helper
export const computeAvailableSlots = (
  operatingHours: OperatingHours,
  date: Date,
  bookedAppointments: Appointment[],
  slotDuration: number = 1 // hours
): AvailabilitySlot[] => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours
  const dayHours = operatingHours[dayName]

  if (dayHours.closed) {
    return []
  }

  const availableSlots: AvailabilitySlot[] = []
  const openTime = dayHours.open
  const closeTime = dayHours.close

  // Parse time strings to minutes
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const openMinutes = parseTime(openTime)
  const closeMinutes = parseTime(closeTime)
  const slotDurationMinutes = slotDuration * 60
  const dailyHours = (closeMinutes - openMinutes) / 60

  // For multi-day services (duration > daily hours), generate hourly start time slots
  // For same-day services, use requested duration for slots
  const isMultiDayService = slotDuration > dailyHours
  const slotIncrement = isMultiDayService ? 60 : slotDurationMinutes // 1 hour for multi-day

  // Generate time slots - for multi-day, we only show possible START times
  for (let time = openMinutes; time < closeMinutes; time += slotIncrement) {
    const startHours = Math.floor(time / 60)
    const startMins = time % 60

    // For display purposes, calculate end time within the same day
    // For multi-day services, this represents the slot duration, not total service duration
    const displayEndTime = isMultiDayService
      ? Math.min(time + 60, closeMinutes) // Show 1-hour slot
      : Math.min(time + slotDurationMinutes, closeMinutes) // Show full duration

    const endHours = Math.floor(displayEndTime / 60)
    const endMins = displayEndTime % 60

    const startTime = `${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')}`
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

    // Check if START TIME conflicts with existing appointments
    // For multi-day services, we only check if we can start at this time
    const isBooked = bookedAppointments.some(appointment => {
      if (appointment.scheduledDate.toDateString() !== date.toDateString()) {
        return false
      }

      const appointmentStart = parseTime(appointment.scheduledStartTime)
      const appointmentEnd = parseTime(appointment.scheduledEndTime)

      // Check if this start time conflicts with existing bookings
      return (time >= appointmentStart && time < appointmentEnd)
    })

    availableSlots.push({
      date,
      startTime,
      endTime,
      isAvailable: !isBooked,
      reason: isBooked ? 'Booked' : undefined
    })
  }

  return availableSlots
}

// Appointment creation helper from accepted quotation
export const createAppointmentFromQuotation = (
  quotationId: ObjectId,
  acceptedQuoteId: string,
  customerId: ObjectId,
  workshopId: ObjectId,
  bookingRequest: AppointmentBookingRequest,
  quotationData: any, // Full quotation data
  workshopData: any   // Full workshop data
): Omit<Appointment, '_id'> => {
  const acceptedQuote = quotationData.quotes.find((q: any) => q.id === acceptedQuoteId)

  if (!acceptedQuote) {
    throw new Error('Accepted quote not found')
  }

  // Use the ORIGINAL requested services from the quotation, not the quote's services
  // This ensures we show what the customer actually requested (e.g., "bodywork", "paint", "bumper")
  // instead of the workshop's generic categorization (e.g., "maintenance")
  const requestedServices = quotationData.requestedServices || []

  // Calculate total labor hours from accepted quote for duration estimation
  const totalLaborHours = acceptedQuote.services.reduce((sum: number, service: any) =>
    sum + (service.laborHours || 0), 0
  )

  // Create appointment services based on original requested services
  const services: AppointmentService[] = requestedServices.map((serviceType: string) => {
    // Find matching service in quote for description and duration
    const quoteService = acceptedQuote.services.find((s: any) =>
      s.serviceType?.toLowerCase() === serviceType.toLowerCase()
    )

    return {
      serviceType: serviceType,
      description: quoteService?.description || `${serviceType} service`,
      estimatedDuration: quoteService?.laborHours || (totalLaborHours / requestedServices.length),
      status: 'pending' as const,
      notes: quoteService?.notes || ''
    }
  })

  // If no requested services, fallback to quote services
  if (services.length === 0) {
    services.push(...acceptedQuote.services.map((service: any) => ({
      serviceType: service.serviceType,
      description: service.description,
      estimatedDuration: service.laborHours,
      status: 'pending' as const,
      notes: service.notes
    })))
  }

  const totalEstimatedDuration = calculateAppointmentDuration(services)

  // Calculate completion info for multi-day services
  const completion = calculateServiceCompletion(
    bookingRequest.preferredDate,
    bookingRequest.preferredStartTime,
    totalEstimatedDuration,
    workshopData.profile.operatingHours
  )

  return {
    quotationId,
    acceptedQuoteId,
    customerId,
    workshopId,
    status: 'requested',
    priority: quotationData.priority,
    appointmentType: 'service',
    scheduledDate: bookingRequest.preferredDate,
    scheduledStartTime: bookingRequest.preferredStartTime,
    scheduledEndTime: completion.endTime, // Actual end time (may span days)
    estimatedDuration: totalEstimatedDuration,
    isMultiDayService: completion.isMultiDay,
    estimatedCompletionDate: completion.completionDate,
    estimatedWorkDays: completion.workDays,
    services,
    totalEstimatedDuration,
    customerName: quotationData.customerName,
    customerEmail: quotationData.customerEmail,
    customerPhone: quotationData.customerPhone,
    vehicleInfo: {
      make: quotationData.vehicle.make,
      model: quotationData.vehicle.model,
      year: quotationData.vehicle.year,
      licensePlate: quotationData.vehicle.licensePlate,
      color: quotationData.vehicle.color
    },
    workshopName: workshopData.profile.businessName,
    workshopAddress: `${workshopData.contact.address.street}, ${workshopData.contact.address.emirate || workshopData.contact.address.city}, ${workshopData.contact.address.zipCode}`,
    workshopPhone: workshopData.contact.phone,
    workshopEmail: workshopData.contact.email,
    serviceLocation: bookingRequest.serviceLocation || {
      type: 'workshop',
      address: `${workshopData.contact.address.street}, ${workshopData.contact.address.emirate || workshopData.contact.address.city}, ${workshopData.contact.address.zipCode}`,
      coordinates: workshopData.contact.location.coordinates
    },
    totalAmount: acceptedQuote.totalAmount,
    currency: acceptedQuote.currency,
    paymentStatus: 'pending',
    customerNotes: bookingRequest.customerNotes,
    reminders: bookingRequest.reminders,
    remindersSent: [],
    statusHistory: [{
      status: 'requested',
      changedAt: new Date(),
      changedBy: customerId,
      reason: 'Initial appointment request'
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Time manipulation helper
const addHoursToTime = (timeStr: string, hours: number): string => {
  const [currentHours, currentMinutes] = timeStr.split(':').map(Number)
  const totalMinutes = currentHours * 60 + currentMinutes + hours * 60

  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60

  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
}

// Calculate estimated completion date for multi-day services
export const calculateServiceCompletion = (
  startDate: Date,
  startTime: string,
  serviceDurationHours: number,
  operatingHours: OperatingHours
): {
  completionDate: Date
  workDays: number
  isMultiDay: boolean
  endTime: string
} => {
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  let currentDate = new Date(startDate)
  let remainingHours = serviceDurationHours
  let workDays = 0
  let currentDayStartMinutes = parseTime(startTime)

  while (remainingHours > 0) {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours
    const dayHours = operatingHours[dayName]

    if (dayHours.closed) {
      // Skip closed days
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() + 1)
      currentDayStartMinutes = parseTime(dayHours.open)
      continue
    }

    const openMinutes = parseTime(dayHours.open)
    const closeMinutes = parseTime(dayHours.close)

    // First day uses the start time, subsequent days start at opening time
    const effectiveStartMinutes = workDays === 0 ? currentDayStartMinutes : openMinutes
    const availableMinutes = closeMinutes - effectiveStartMinutes
    const availableHours = availableMinutes / 60

    if (remainingHours <= availableHours) {
      // Service completes on this day
      const endMinutes = effectiveStartMinutes + (remainingHours * 60)
      workDays++
      return {
        completionDate: currentDate,
        workDays,
        isMultiDay: workDays > 1,
        endTime: formatTime(endMinutes)
      }
    } else {
      // Use up this day's hours and continue to next day
      remainingHours -= availableHours
      workDays++
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() + 1)
      currentDayStartMinutes = openMinutes
    }
  }

  // Fallback (should not reach here)
  return {
    completionDate: currentDate,
    workDays,
    isMultiDay: workDays > 1,
    endTime: startTime
  }
}