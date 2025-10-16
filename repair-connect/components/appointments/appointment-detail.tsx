'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Clock,
  Car,
  Phone,
  Mail,
  MapPin,
  User,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Wrench,
  DollarSign,
  MessageSquare,
  ArrowRight,
  PlayCircle,
  StopCircle,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import { Appointment, AppointmentStatus, getAppointmentStatusLabel, getAppointmentStatusColor } from '@/models/Appointment'
import AppointmentReview from './appointment-review'

interface AppointmentDetailProps {
  appointment: Appointment
  userRole: 'customer' | 'workshop'
  onStatusUpdate?: () => void
}

// Helper function to get friendly service type labels
const getServiceTypeLabel = (serviceType: string): string => {
  const labels: Record<string, string> = {
    'bodywork': 'Body Work',
    'paint': 'Paint Work',
    'bumper': 'Bumper Repair',
    'maintenance': 'Maintenance & Servicing',
    'repair': 'Repair Work',
    'diagnostic': 'Diagnostic Service',
    'inspection': 'Inspection',
    'electrical': 'Electrical Work',
    'engine': 'Engine Service',
    'transmission': 'Transmission Service',
    'brakes': 'Brake Service',
    'suspension': 'Suspension Work',
    'tires': 'Tire Service',
    'other': 'Other Services'
  }
  return labels[serviceType.toLowerCase()] || serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function AppointmentDetail({ appointment, userRole, onStatusUpdate }: AppointmentDetailProps) {
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)

  const isWorkshop = userRole === 'workshop'
  const isCustomer = userRole === 'customer'

  // Status progression
  const statusSteps: { status: AppointmentStatus; label: string; icon: any }[] = [
    { status: 'requested', label: 'Requested', icon: Clock },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { status: 'scheduled', label: 'Scheduled', icon: Calendar },
    { status: 'in_progress', label: 'In Progress', icon: PlayCircle },
    { status: 'completed', label: 'Completed', icon: CheckCircle }
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.status === appointment.status)

  const handleStatusUpdate = async (newStatus: AppointmentStatus, reason?: string) => {
    try {
      setUpdating(true)

      const response = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateType: 'status',
          status: newStatus,
          reason: reason || `Status updated to ${newStatus}`,
          notes: notes || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Appointment ${newStatus}`)
        setNotes('')
        setShowNotesInput(false)
        onStatusUpdate?.()
      } else {
        toast.error(data.error || 'Failed to update appointment')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddNotes = async () => {
    if (!notes.trim()) return

    try {
      setUpdating(true)

      const response = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateType: 'notes',
          notes: notes
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Notes added successfully')
        setNotes('')
        setShowNotesInput(false)
        onStatusUpdate?.()
      } else {
        toast.error(data.error || 'Failed to add notes')
      }
    } catch (error) {
      console.error('Error adding notes:', error)
      toast.error('Failed to add notes')
    } finally {
      setUpdating(false)
    }
  }

  const handleConfirmPayment = async () => {
    try {
      setConfirmingPayment(true)

      const response = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateType: 'payment',
          paymentStatus: 'paid'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Payment confirmed successfully')
        onStatusUpdate?.()
      } else {
        toast.error(data.error || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast.error('Failed to confirm payment')
    } finally {
      setConfirmingPayment(false)
    }
  }

  const handleDeclineAppointment = async () => {
    try {
      setUpdating(true)

      const response = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Workshop declined the appointment request'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment declined. Customer will be notified.')
        window.location.href = '/appointments'
      } else {
        toast.error(data.error || 'Failed to decline appointment')
      }
    } catch (error) {
      console.error('Error declining appointment:', error)
      toast.error('Failed to decline appointment')
    } finally {
      setUpdating(false)
    }
  }

  const getAvailableActions = () => {
    const actions: Array<{
      label: string;
      status: AppointmentStatus;
      icon: any;
      variant: 'default' | 'destructive';
      description?: string;
    }> = []

    if (!isWorkshop) return actions

    const appointmentDateTime = new Date(`${appointment.scheduledDate.toString().split('T')[0]}T${appointment.scheduledStartTime}:00`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (appointment.status === 'requested') {
      actions.push({
        label: 'Confirm Appointment',
        status: 'confirmed' as AppointmentStatus,
        icon: CheckCircle,
        variant: 'default' as const,
        description: 'Accept this appointment request'
      })
    }

    if (appointment.status === 'confirmed') {
      actions.push({
        label: 'Mark as Scheduled',
        status: 'scheduled' as AppointmentStatus,
        icon: Calendar,
        variant: 'default' as const
      })
    }

    if (appointment.status === 'scheduled' && hoursUntilAppointment <= 1) {
      actions.push({
        label: 'Start Service',
        status: 'in_progress' as AppointmentStatus,
        icon: PlayCircle,
        variant: 'default' as const
      })
    }

    if (appointment.status === 'in_progress') {
      actions.push({
        label: 'Mark Completed',
        status: 'completed' as AppointmentStatus,
        icon: CheckCircle,
        variant: 'default' as const
      })
    }

    if (appointment.status === 'scheduled' && hoursUntilAppointment < -2) {
      actions.push({
        label: 'Mark No Show',
        status: 'no_show' as AppointmentStatus,
        icon: XCircle,
        variant: 'destructive' as const
      })
    }

    return actions
  }

  const availableActions = getAvailableActions()

  return (
    <div className="space-y-6">
      {/* Status Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`
                }}
              />
            </div>

            {/* Status Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                const Icon = step.icon

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 z-10
                        ${isCompleted ? 'border-blue-600 bg-blue-600' : ''}
                        ${isCurrent ? 'border-blue-600 bg-blue-50' : ''}
                        ${!isCompleted && !isCurrent ? 'border-gray-300 bg-white' : ''}
                      `}
                    >
                      <Icon
                        className={`
                          w-6 h-6
                          ${isCompleted ? 'text-white' : ''}
                          ${isCurrent ? 'text-blue-600' : ''}
                          ${!isCompleted && !isCurrent ? 'text-gray-400' : ''}
                        `}
                      />
                    </div>
                    <span
                      className={`
                        mt-2 text-xs font-medium
                        ${isCurrent ? 'text-blue-600' : 'text-gray-600'}
                      `}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="mt-6 flex items-center justify-center">
            <Badge className={getAppointmentStatusColor(appointment.status)} variant="secondary">
              <span className="text-lg font-semibold">{getAppointmentStatusLabel(appointment.status)}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date & Time */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
              <div>
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="font-medium">{format(new Date(appointment.scheduledDate), 'EEEE, MMMM dd, yyyy')}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Time</div>
                <div className="font-medium">
                  {appointment.scheduledStartTime?.substring(0, 5)} - {appointment.scheduledEndTime?.substring(0, 5)}
                </div>
              </div>
              {appointment.isMultiDayService && (
                <div className="col-span-2">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-base mb-1">
                          Multi-Day Service
                        </h4>
                        <p className="text-sm text-foreground/80">
                          Estimated completion: {format(new Date(appointment.estimatedCompletionDate!), 'MMMM dd, yyyy')} ({appointment.estimatedWorkDays} work days)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Requested Services
            </h4>
            <div className="flex flex-wrap gap-2 pl-6">
              {appointment.services.map((service, index) => (
                <Badge key={index} className="bg-foreground text-background hover:bg-foreground/90 font-medium px-3 py-1">
                  {getServiceTypeLabel(service.serviceType)}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Vehicle */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicle
            </h4>
            <div className="pl-6 space-y-1">
              <div className="font-medium">
                {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
              </div>
              {appointment.vehicleInfo.color && (
                <div className="text-sm text-gray-600">Color: {appointment.vehicleInfo.color}</div>
              )}
              {appointment.vehicleInfo.licensePlate && (
                <div className="text-sm text-gray-600">License: {appointment.vehicleInfo.licensePlate}</div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              {isCustomer ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {isCustomer ? 'Workshop Information' : 'Customer Information'}
            </h4>
            <div className="pl-6 space-y-2">
              <div className="font-medium">
                {isCustomer ? appointment.workshopName : appointment.customerName}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{isCustomer ? appointment.workshopPhone : appointment.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{isCustomer ? appointment.workshopEmail : appointment.customerEmail}</span>
              </div>
              {isCustomer && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.workshopAddress}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment
            </h4>
            <div className="pl-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-xl font-bold">
                  {appointment.currency} {appointment.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge
                  className={
                    appointment.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                  }
                >
                  {appointment.paymentStatus.toUpperCase()}
                </Badge>
              </div>

              {/* Confirm Payment Button (for workshops) */}
              {isWorkshop && appointment.status === 'completed' && appointment.paymentStatus !== 'paid' && (
                <div className="pt-2">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {confirmingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Payment Received
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(appointment.customerNotes || appointment.workshopNotes) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes
                </h4>
                <div className="pl-6 space-y-3">
                  {appointment.customerNotes && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Customer Notes</div>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                        {appointment.customerNotes}
                      </div>
                    </div>
                  )}
                  {appointment.workshopNotes && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Workshop Notes</div>
                      <div className="mt-1 p-3 bg-blue-50 rounded-md text-sm">
                        {appointment.workshopNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Workshop Actions */}
      {isWorkshop && availableActions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Confirm and Decline buttons side by side for requested appointments */}
              {appointment.status === 'requested' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={updating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Confirm
                  </Button>
                  <Button
                    onClick={handleDeclineAppointment}
                    disabled={updating}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Decline
                  </Button>
                </div>
              )}

              {/* Other status action buttons */}
              {appointment.status === 'confirmed' && availableActions.find(a => a.status === 'scheduled') && (
                <Button
                  onClick={() => handleStatusUpdate('scheduled')}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Mark as Scheduled
                </Button>
              )}

              {/* Start Service and Mark No Show side by side for scheduled appointments */}
              {appointment.status === 'scheduled' && (
                <>
                  {availableActions.find(a => a.status === 'in_progress') && availableActions.find(a => a.status === 'no_show') ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updating}
                        className="flex-1"
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <PlayCircle className="h-4 w-4 mr-2" />
                        )}
                        Start Service
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate('no_show')}
                        disabled={updating}
                        variant="destructive"
                        className="flex-1"
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark No Show
                      </Button>
                    </div>
                  ) : (
                    <>
                      {availableActions.find(a => a.status === 'in_progress') && (
                        <Button
                          onClick={() => handleStatusUpdate('in_progress')}
                          disabled={updating}
                          className="w-full"
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <PlayCircle className="h-4 w-4 mr-2" />
                          )}
                          Start Service
                        </Button>
                      )}
                      {availableActions.find(a => a.status === 'no_show') && (
                        <Button
                          onClick={() => handleStatusUpdate('no_show')}
                          disabled={updating}
                          variant="destructive"
                          className="w-full"
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Mark No Show
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Mark Completed button for in_progress status */}
              {appointment.status === 'in_progress' && availableActions.find(a => a.status === 'completed') && (
                <Button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark Completed
                </Button>
              )}

              <Separator />

              <Button
                onClick={() => setShowNotesInput(!showNotesInput)}
                variant="outline"
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Service Notes
              </Button>

              {showNotesInput && (
                <div className="space-y-2 pt-2">
                  <Textarea
                    placeholder="Add notes about the service, findings, or recommendations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddNotes} disabled={updating || !notes.trim()}>
                      {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Save Notes
                    </Button>
                    <Button onClick={() => {
                      setShowNotesInput(false)
                      setNotes('')
                    }} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Review (if completed) */}
      {appointment.status === 'completed' && (
        <AppointmentReview
          appointmentId={appointment._id.toString()}
          userRole={userRole}
          existingReview={
            appointment.customerReview
              ? {
                  rating: appointment.customerRating || 0,
                  comment: appointment.customerReview,
                  createdAt: appointment.updatedAt.toISOString(),
                  customerName: appointment.customerName
                }
              : undefined
          }
          workshopName={appointment.workshopName}
          onReviewSubmitted={onStatusUpdate}
        />
      )}
    </div>
  )
}
