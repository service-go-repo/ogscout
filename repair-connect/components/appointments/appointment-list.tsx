'use client'

import { useState, useEffect } from 'react'
import { format, isAfter, isBefore, addHours } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Car,
  Wrench,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  MessageSquare,
  Bell,
  User,
  Building2,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Appointment, getAppointmentStatusLabel, getAppointmentStatusColor } from '@/models/Appointment'

// Helper function to get friendly service type labels
const getServiceTypeLabel = (serviceType: string): string => {
  const labels: Record<string, string> = {
    'maintenance': 'Maintenance & Servicing',
    'repair': 'Repair Work',
    'diagnostic': 'Diagnostic Service',
    'inspection': 'Inspection',
    'bodywork': 'Body Work',
    'body_work': 'Body Work',
    'painting': 'Painting',
    'paint': 'Paint Work',
    'paint_work': 'Paint Work',
    'bumper': 'Bumper Repair',
    'bumper_repair': 'Bumper Repair',
    'electrical': 'Electrical Work',
    'engine': 'Engine Service',
    'transmission': 'Transmission Service',
    'brakes': 'Brake Service',
    'suspension': 'Suspension Work',
    'tires': 'Tire Service',
    'ac': 'AC Service',
    'ac_service': 'AC Service',
    'glass': 'Glass Repair',
    'glass_repair': 'Glass Repair',
    'detailing': 'Detailing',
    'oil_change': 'Oil Change',
    'tuning': 'Performance Tuning',
    'other': 'Other Services'
  }
  return labels[serviceType.toLowerCase()] || serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

interface AppointmentListProps {
  userRole: 'customer' | 'workshop'
  onReschedule?: (appointment: Appointment) => void
  onCancel?: (appointment: Appointment) => void
  onViewDetails?: (appointment: Appointment) => void
  onUpdateStatus?: (appointment: Appointment, status: string) => void
  filterStatus?: string[]
  showPagination?: boolean
}

export default function AppointmentList({
  userRole,
  onReschedule,
  onCancel,
  onViewDetails,
  onUpdateStatus,
  filterStatus,
  showPagination = true
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [page, filterStatus])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })

      if (filterStatus && filterStatus.length > 0) {
        params.append('status', filterStatus.join(','))
      }

      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()

      if (data.success) {
        setAppointments(data.data.appointments)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        toast.error('Failed to load appointments')
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdating(appointmentId)

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateType: 'status',
          status: newStatus
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Appointment ${newStatus}`)
        loadAppointments() // Reload appointments

        // Call callback if provided
        const appointment = appointments.find(a => a._id.toString() === appointmentId)
        if (appointment && onUpdateStatus) {
          onUpdateStatus(appointment, newStatus)
        }
      } else {
        toast.error(data.error || 'Failed to update appointment')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    } finally {
      setUpdating(null)
    }
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      setUpdating(appointment._id.toString())

      const response = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Cancelled by user request'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment cancelled')
        loadAppointments()
        onCancel?.(appointment)
      } else {
        toast.error(data.error || 'Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'in_progress': return <Timer className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'no_show': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getAppointmentActions = (appointment: Appointment) => {
    const actions = []
    const appointmentDateTime = new Date(`${appointment.scheduledDate.toString().split('T')[0]}T${appointment.scheduledStartTime}:00`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (userRole === 'workshop') {
      // Workshop actions
      if (appointment.status === 'requested') {
        actions.push(
          <DropdownMenuItem
            key="confirm"
            onClick={() => handleStatusUpdate(appointment._id.toString(), 'confirmed')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm Appointment
          </DropdownMenuItem>
        )
      }

      if (appointment.status === 'confirmed') {
        actions.push(
          <DropdownMenuItem
            key="schedule"
            onClick={() => handleStatusUpdate(appointment._id.toString(), 'scheduled')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Mark as Scheduled
          </DropdownMenuItem>
        )
      }

      if (appointment.status === 'scheduled' && hoursUntilAppointment <= 1) {
        actions.push(
          <DropdownMenuItem
            key="start"
            onClick={() => handleStatusUpdate(appointment._id.toString(), 'in_progress')}
          >
            <Timer className="h-4 w-4 mr-2" />
            Start Service
          </DropdownMenuItem>
        )
      }

      if (appointment.status === 'in_progress') {
        actions.push(
          <DropdownMenuItem
            key="complete"
            onClick={() => handleStatusUpdate(appointment._id.toString(), 'completed')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Completed
          </DropdownMenuItem>
        )
      }

      if (['scheduled'].includes(appointment.status) && hoursUntilAppointment < 0) {
        actions.push(
          <DropdownMenuItem
            key="noshow"
            onClick={() => handleStatusUpdate(appointment._id.toString(), 'no_show')}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Mark as No Show
          </DropdownMenuItem>
        )
      }
    }

    // Common actions for both roles
    if (['requested', 'confirmed', 'scheduled'].includes(appointment.status)) {
      if (hoursUntilAppointment > 24) {
        actions.push(
          <DropdownMenuItem
            key="reschedule"
            onClick={() => onReschedule?.(appointment)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reschedule
          </DropdownMenuItem>
        )
      }

      actions.push(
        <DropdownMenuItem
          key="cancel"
          onClick={() => handleCancelAppointment(appointment)}
          className="text-red-600"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Appointment
        </DropdownMenuItem>
      )
    }

    if (actions.length > 0) {
      actions.push(<DropdownMenuSeparator key="separator" />)
    }

    actions.push(
      <Link href={`/appointments/${appointment._id.toString()}`} key="view">
        <DropdownMenuItem>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
      </Link>
    )

    return actions
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
          <p className="text-gray-500">
            {userRole === 'customer'
              ? "You don't have any appointments yet."
              : "No appointments to show."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const appointmentDateTime = new Date(`${appointment.scheduledDate.toString().split('T')[0]}T${appointment.scheduledStartTime}:00`)
        const now = new Date()
        const isUpcoming = isAfter(appointmentDateTime, now)
        const isPast = isBefore(appointmentDateTime, now)
        const isToday = format(appointmentDateTime, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
        const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
        // Only show overdue for scheduled/in_progress appointments that are past their time (not for confirmed)
        const isOverdue = isPast && ['scheduled', 'in_progress'].includes(appointment.status)

        return (
          <Card key={appointment._id.toString()} className={cn(
            "transition-colors",
            isOverdue && "border-red-200 bg-red-50/30",
            isToday && isUpcoming && "border-blue-200 bg-blue-50/30"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={getAppointmentStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{getAppointmentStatusLabel(appointment.status)}</span>
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {isToday && isUpcoming && (
                          <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Today
                          </Badge>
                        )}
                        {!isToday && isUpcoming && hoursUntilAppointment <= 48 && hoursUntilAppointment > 24 && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            Upcoming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Appointment #{appointment._id.toString().slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updating === appointment._id.toString()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {getAppointmentActions(appointment)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date & Time */}
                    <div>
                      <h4 className="font-medium mb-2">Date & Time</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(appointment.scheduledDate), 'EEEE, MMMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {appointment.scheduledStartTime.substring(0, 5)} - {appointment.scheduledEndTime.substring(0, 5)}
                          </span>
                          {appointment.isMultiDayService && (
                            <Badge variant="secondary" className="bg-amber-800 text-amber-100 dark:bg-amber-200 dark:text-amber-950 text-xs font-medium">
                              Multi-day Service
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle */}
                    <div>
                      <h4 className="font-medium mb-2">Vehicle</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <span>
                            {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                          </span>
                        </div>
                        {appointment.vehicleInfo.licensePlate && (
                          <div className="text-xs text-gray-500 ml-6">
                            License: {appointment.vehicleInfo.licensePlate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">REQUESTED SERVICES</div>
                    <div className="flex flex-wrap gap-2">
                      {appointment.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} className="bg-foreground text-background hover:bg-foreground/90 font-medium px-3 py-1">
                          <Wrench className="h-3 w-3 mr-1" />
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      ))}
                      {appointment.services.length > 3 && (
                        <Badge className="bg-foreground text-background hover:bg-foreground/90 font-medium px-3 py-1">
                          <Wrench className="h-3 w-3 mr-1" />
                          +{appointment.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    {userRole === 'workshop' ? (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{appointment.customerName}</div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{appointment.customerEmail}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Workshop
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{appointment.workshopName}</div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.workshopPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{appointment.workshopAddress}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Service Location
                      </h4>
                      <div className="text-sm text-gray-600">
                        {appointment.serviceLocation?.type === 'workshop' && 'At the workshop'}
                        {appointment.serviceLocation?.type === 'customer_location' && 'At customer location'}
                        {appointment.serviceLocation?.type === 'pickup_delivery' && 'Pickup & delivery'}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(appointment.customerNotes || appointment.workshopNotes) && (
                    <div className="pt-2 border-t border-gray-100">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Notes
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {appointment.customerNotes && (
                          <div>
                            <span className="font-medium">Customer: </span>
                            {appointment.customerNotes}
                          </div>
                        )}
                        {appointment.workshopNotes && (
                          <div>
                            <span className="font-medium">Workshop: </span>
                            {appointment.workshopNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {userRole === 'workshop' && (
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      {appointment.status === 'requested' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusUpdate(appointment._id.toString(), 'confirmed')}
                            disabled={updating === appointment._id.toString()}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                          <Button
                            onClick={() => handleCancelAppointment(appointment)}
                            disabled={updating === appointment._id.toString()}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusUpdate(appointment._id.toString(), 'scheduled')}
                            disabled={updating === appointment._id.toString()}
                            className="flex-1"
                            size="sm"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Mark as Scheduled
                          </Button>
                          <Button
                            onClick={() => handleCancelAppointment(appointment)}
                            disabled={updating === appointment._id.toString()}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      {appointment.status === 'scheduled' && hoursUntilAppointment <= 1 && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusUpdate(appointment._id.toString(), 'in_progress')}
                            disabled={updating === appointment._id.toString()}
                            className="flex-1"
                            size="sm"
                          >
                            <Timer className="h-4 w-4 mr-2" />
                            Start Service
                          </Button>
                        </div>
                      )}
                      {appointment.status === 'in_progress' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusUpdate(appointment._id.toString(), 'completed')}
                            disabled={updating === appointment._id.toString()}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Completed
                          </Button>
                        </div>
                      )}
                      <Link href={`/appointments/${appointment._id.toString()}`} className="block">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}