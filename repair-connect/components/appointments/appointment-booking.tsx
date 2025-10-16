'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfDay, isAfter, isBefore } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  Car,
  Wrench,
  Bell,
  MessageSquare,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TimeSlot {
  date: Date
  startTime: string
  endTime: string
  duration: number
  isAvailable?: boolean
  reason?: string
}

interface WorkshopInfo {
  _id: string
  name: string
  address: string
  phone: string
  email: string
  logo?: string
  operatingHours: any
}

interface AppointmentBookingProps {
  quotationId: string
  acceptedQuoteId: string
  workshopInfo: WorkshopInfo
  quotationData: {
    vehicle: {
      make: string
      model: string
      year: number
      licensePlate?: string
    }
    requestedServices: string[]
    customerName: string
    customerEmail: string
    customerPhone: string
    timeline?: {
      preferredStartDate?: string
      preferredCompletionDate?: string
    }
  }
  onAppointmentCreated?: (appointment: any) => void
  onCancel?: () => void
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
]

export default function AppointmentBooking({
  quotationId,
  acceptedQuoteId,
  workshopInfo,
  quotationData,
  onAppointmentCreated,
  onCancel
}: AppointmentBookingProps) {
  const [step, setStep] = useState<'availability' | 'details' | 'confirmation'>('availability')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [alternativeSlots, setAlternativeSlots] = useState<TimeSlot[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [estimatedDuration, setEstimatedDuration] = useState<number>(2)

  // Appointment details
  const [serviceLocation, setServiceLocation] = useState<'workshop' | 'customer_location' | 'pickup_delivery'>('workshop')
  const [customerNotes, setCustomerNotes] = useState('')
  const [enableReminders, setEnableReminders] = useState(true)
  const [reminderMethods, setReminderMethods] = useState<('email' | 'sms' | 'push')[]>(['email'])
  const [reminderTimes, setReminderTimes] = useState<number[]>([24, 2])

  // Workshop availability state
  const [workshopStatus, setWorkshopStatus] = useState<{
    isOpen: boolean
    nextAvailableSlot?: TimeSlot
    todaySlots?: any
  } | null>(null)

  // Load initial data
  useEffect(() => {
    loadWorkshopAvailability()
    estimateServiceDuration()
  }, [quotationId, workshopInfo._id])

  const estimateServiceDuration = () => {
    // Simple duration estimation based on service types
    const serviceDurations: Record<string, number> = {
      engine: 4, transmission: 6, brakes: 2, suspension: 3,
      electrical: 2, battery: 0.5, bodywork: 8, paint: 6,
      maintenance: 1, oil_change: 0.5, inspection: 1,
      tires: 1, detailing: 3, diagnostic: 1, repair: 2
    }

    const total = quotationData.requestedServices.reduce((sum, service) => {
      return sum + (serviceDurations[service] || 2)
    }, 0)

    // Add 20% buffer and round to nearest 0.5 hour
    const withBuffer = total * 1.2
    setEstimatedDuration(Math.ceil(withBuffer * 2) / 2)
  }

  const loadWorkshopAvailability = async () => {
    try {
      setLoading(true)
      const startDate = new Date()
      const endDate = addDays(startDate, 14)

      const response = await fetch(`/api/appointments/availability?workshopId=${workshopInfo._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&quotationId=${quotationId}`)

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`)
        toast.error(`Failed to load workshop availability: ${response.status}`)
        return
      }

      const data = await response.json()

      if (data.success) {
        setAvailableSlots(data.data.nextAvailableSlots || [])
        setWorkshopStatus(data.data.currentStatus)

        // Auto-select preferred date if available
        if (quotationData.timeline?.preferredStartDate) {
          const preferredDate = new Date(quotationData.timeline.preferredStartDate)
          if (isAfter(preferredDate, new Date())) {
            setSelectedDate(preferredDate)
            await checkDateAvailability(preferredDate)
          }
        }
      } else {
        toast.error('Failed to load workshop availability')
      }
    } catch (error) {
      console.error('Error loading availability:', error)
      toast.error('Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  const checkDateAvailability = async (date: Date) => {
    if (!date) return

    try {
      setLoading(true)
      const apiUrl = `/api/appointments/availability?workshopId=${workshopInfo._id}&startDate=${date.toISOString()}&endDate=${date.toISOString()}&duration=${estimatedDuration}`
      console.log('Fetching availability from:', apiUrl)
      const response = await fetch(apiUrl)

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setAlternativeSlots([])
        return
      }

      const data = await response.json()
      console.log('Availability data received:', data)

      if (data.success && data.data.availability.length > 0) {
        const dayAvailability = data.data.availability[0]
        console.log('Day availability:', dayAvailability)
        const slots = dayAvailability.availableSlots.filter((slot: any) => slot.isAvailable)
        console.log('Available slots:', slots)
        setAlternativeSlots(slots.map((slot: any) => ({
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: estimatedDuration,
          isAvailable: true
        })))
      } else {
        console.log('No availability found')
        setAlternativeSlots([])
      }
    } catch (error) {
      console.error('Error checking date availability:', error)
      setAlternativeSlots([])
    } finally {
      setLoading(false)
    }
  }

  const checkTimeSlotAvailability = async (date: Date, time: string) => {
    try {
      const response = await fetch('/api/appointments/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: workshopInfo._id,
          date: date.toISOString(),
          startTime: time,
          duration: estimatedDuration,
          includeAlternatives: true
        })
      })

      const data = await response.json()

      if (!data.success || !data.data.available) {
        toast.error(data.data?.reason || 'Selected time slot is not available')
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking time slot availability:', error)
      toast.error('Failed to check availability')
      return false
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    console.log('Date selected:', date)
    setSelectedDate(date)
    setSelectedTime('')
    if (date) {
      console.log('Checking availability for date:', date)
      checkDateAvailability(date)
    } else {
      setAlternativeSlots([])
    }
  }

  const handleTimeSelect = async (time: string) => {
    if (!selectedDate) return

    setSelectedTime(time)

    // Check if this specific time slot is still available
    const isAvailable = await checkTimeSlotAvailability(selectedDate, time)
    if (isAvailable) {
      toast.success('Time slot confirmed!')
    } else {
      setSelectedTime('')
    }
  }

  const proceedToDetails = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    setStep('details')
  }

  const proceedToConfirmation = () => {
    setStep('confirmation')
  }

  const createAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    try {
      setCreating(true)

      const appointmentData = {
        quotationId,
        acceptedQuoteId,
        preferredDate: selectedDate.toISOString(),
        preferredStartTime: selectedTime,
        customerNotes,
        serviceLocation: serviceLocation === 'workshop' ? {
          type: 'workshop',
          address: workshopInfo.address,
          coordinates: null
        } : {
          type: serviceLocation,
          address: serviceLocation === 'customer_location' ? 'Customer location' : 'Pickup & delivery',
          notes: customerNotes
        },
        reminders: {
          enabled: enableReminders,
          reminderTimes,
          methods: reminderMethods
        }
      }

      console.log('Sending appointment data:', appointmentData)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        toast.success('Appointment booked successfully!')
        onAppointmentCreated?.(data.data)
      } else {
        console.error('Appointment creation failed:', data.error)
        toast.error(data.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Failed to book appointment')
    } finally {
      setCreating(false)
    }
  }

  const addHoursToTime = (time: string, hours: number): string => {
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = h * 60 + m + hours * 60
    const newH = Math.floor(totalMinutes / 60) % 24
    const newM = totalMinutes % 60
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`
  }

  if (loading && !workshopStatus) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading workshop availability...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Your Appointment
          </CardTitle>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {quotationData.vehicle.year} {quotationData.vehicle.make} {quotationData.vehicle.model}
              </p>
              <p className="text-xs text-gray-500">
                Estimated duration: {estimatedDuration} hours
              </p>
            </div>
            <Badge variant={workshopStatus?.isOpen ? 'default' : 'secondary'}>
              <Clock className="h-3 w-3 mr-1" />
              {workshopStatus?.isOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Workshop Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
              {workshopInfo.logo ? (
                <img src={workshopInfo.logo} alt={workshopInfo.name} className="h-full w-full object-cover rounded-lg" />
              ) : (
                <Wrench className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{workshopInfo.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {workshopInfo.address}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {workshopInfo.phone}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {step === 'availability' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  isBefore(date, startOfDay(new Date())) ||
                  isAfter(date, addDays(new Date(), 90))
                }
                className="w-full"
              />
              {workshopStatus?.nextAvailableSlot && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Next available: {format(new Date(workshopStatus.nextAvailableSlot.date), 'MMM dd')} at {workshopStatus.nextAvailableSlot.startTime}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Time</CardTitle>
              {selectedDate && (
                <p className="text-sm text-gray-600">
                  {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-gray-500 text-center py-8">Please select a date first</p>
              ) : loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading time slots...</p>
                </div>
              ) : alternativeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No available time slots for this date</p>
                  <p className="text-xs text-gray-400">Please select another date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {alternativeSlots.map((slot) => (
                    <Button
                      key={slot.startTime}
                      variant={selectedTime === slot.startTime ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                      onClick={() => handleTimeSelect(slot.startTime)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {slot.startTime} - {addHoursToTime(slot.startTime, estimatedDuration)}
                    </Button>
                  ))}
                </div>
              )}

              {selectedTime && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {selectedTime} - {addHoursToTime(selectedTime, estimatedDuration)} ({estimatedDuration}h)
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Quick Booking Options */}
          {availableSlots.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Quick Booking Options</CardTitle>
                <p className="text-sm text-gray-600">Next available time slots</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableSlots.slice(0, 6).map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto justify-start"
                      onClick={() => {
                        setSelectedDate(new Date(slot.date))
                        handleTimeSelect(slot.startTime)
                      }}
                    >
                      <div className="text-left">
                        <div className="font-semibold">
                          {format(new Date(slot.date), 'MMM dd')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {slot.startTime} - {addHoursToTime(slot.startTime, estimatedDuration)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(slot.date), 'EEEE')}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="lg:col-span-2 flex justify-end">
            <Button
              onClick={proceedToDetails}
              disabled={!selectedDate || !selectedTime}
              className="min-w-32"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate && format(selectedDate, 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedTime} - {addHoursToTime(selectedTime, estimatedDuration)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Location */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Service Location</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="workshop"
                      checked={serviceLocation === 'workshop'}
                      onCheckedChange={() => setServiceLocation('workshop')}
                    />
                    <Label htmlFor="workshop">At the workshop</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customer"
                      checked={serviceLocation === 'customer_location'}
                      onCheckedChange={() => setServiceLocation('customer_location')}
                    />
                    <Label htmlFor="customer">At my location (mobile service)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pickup"
                      checked={serviceLocation === 'pickup_delivery'}
                      onCheckedChange={() => setServiceLocation('pickup_delivery')}
                    />
                    <Label htmlFor="pickup">Pickup & delivery service</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reminders */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Appointment Reminders</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableReminders"
                      checked={enableReminders}
                      onCheckedChange={(checked) => setEnableReminders(checked === true)}
                    />
                    <Label htmlFor="enableReminders">Enable appointment reminders</Label>
                  </div>

                  {enableReminders && (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Reminder times</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 6, 12, 24, 48].map((hours) => (
                            <div key={hours} className="flex items-center space-x-2">
                              <Checkbox
                                id={`remind-${hours}`}
                                checked={reminderTimes.includes(hours)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setReminderTimes([...reminderTimes, hours])
                                  } else {
                                    setReminderTimes(reminderTimes.filter(t => t !== hours))
                                  }
                                }}
                              />
                              <Label htmlFor={`remind-${hours}`} className="text-sm">
                                {hours === 1 ? '1 hour before' : `${hours} hours before`}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Reminder methods</Label>
                        <div className="flex gap-4">
                          {[
                            { id: 'email', label: 'Email', icon: Mail },
                            { id: 'push', label: 'Push notifications', icon: Bell }
                          ].map(({ id, label, icon: Icon }) => (
                            <div key={id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`method-${id}`}
                                checked={reminderMethods.includes(id as any)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setReminderMethods([...reminderMethods, id as any])
                                  } else {
                                    setReminderMethods(reminderMethods.filter(m => m !== id))
                                  }
                                }}
                              />
                              <Label htmlFor={`method-${id}`} className="text-sm flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                {label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Customer Notes */}
              <div>
                <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or requirements for your appointment..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('availability')}>
              Back
            </Button>
            <Button onClick={proceedToConfirmation}>
              Review Booking
            </Button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirm Your Appointment</CardTitle>
              <p className="text-sm text-gray-600">
                Please review your appointment details before confirming
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appointment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Appointment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedDate && format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{selectedTime} - {addHoursToTime(selectedTime, estimatedDuration)} ({estimatedDuration}h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {serviceLocation === 'workshop' && 'At the workshop'}
                        {serviceLocation === 'customer_location' && 'At your location'}
                        {serviceLocation === 'pickup_delivery' && 'Pickup & delivery'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Vehicle & Services</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span>{quotationData.vehicle.year} {quotationData.vehicle.make} {quotationData.vehicle.model}</span>
                    </div>
                    {quotationData.vehicle.licensePlate && (
                      <div className="text-xs text-gray-500 ml-6">
                        License: {quotationData.vehicle.licensePlate}
                      </div>
                    )}
                    <div className="flex items-start gap-2 mt-3">
                      <Wrench className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Requested Services:</div>
                        <div className="text-gray-600">
                          {quotationData.requestedServices.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reminders */}
              {enableReminders && (
                <div>
                  <h4 className="font-semibold mb-3">Reminders</h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <Bell className="h-3 w-3" />
                      You'll receive reminders {reminderTimes.sort((a, b) => b - a).map(t =>
                        t === 1 ? '1 hour' : `${t} hours`
                      ).join(', ')} before your appointment
                    </div>
                    <div className="text-xs text-gray-500">
                      Via: {reminderMethods.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              {customerNotes && (
                <div>
                  <h4 className="font-semibold mb-3">Your Notes</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {customerNotes}
                  </div>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your appointment request will be sent to the workshop for confirmation.
                  You'll receive an email notification once it's confirmed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('details')}>
              Back to Details
            </Button>
            <div className="flex gap-3">
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={createAppointment}
                disabled={creating}
                className="min-w-32"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}