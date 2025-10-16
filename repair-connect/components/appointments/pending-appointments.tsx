'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  Car,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Wrench,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Appointment } from '@/models/Appointment'

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

interface PendingAppointmentsProps {
  onUpdate?: () => void
}

export default function PendingAppointments({ onUpdate }: PendingAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadPendingAppointments()
  }, [])

  const loadPendingAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments?status=requested&limit=50')
      const data = await response.json()

      if (data.success) {
        setAppointments(data.data.appointments)
      } else {
        toast.error('Failed to load pending appointments')
      }
    } catch (error) {
      console.error('Error loading pending appointments:', error)
      toast.error('Failed to load pending appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (appointmentId: string) => {
    try {
      setProcessing(appointmentId)

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateType: 'status',
          status: 'confirmed',
          reason: 'Appointment confirmed by workshop'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment confirmed! Customer will be notified.')
        loadPendingAppointments()
        onUpdate?.()
      } else {
        toast.error(data.error || 'Failed to confirm appointment')
      }
    } catch (error) {
      console.error('Error confirming appointment:', error)
      toast.error('Failed to confirm appointment')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (appointmentId: string) => {
    try {
      setProcessing(appointmentId)

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Workshop cannot accommodate this appointment time'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment declined. Customer will be notified.')
        loadPendingAppointments()
        onUpdate?.()
      } else {
        toast.error(data.error || 'Failed to decline appointment')
      }
    } catch (error) {
      console.error('Error declining appointment:', error)
      toast.error('Failed to decline appointment')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Pending Appointment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Pending Appointment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              No pending requests. All appointments are confirmed!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50/30">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Pending Appointment Requests
          </CardTitle>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 self-start sm:self-auto">
            {appointments.length} {appointments.length === 1 ? 'request' : 'requests'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Review and respond to customer appointment requests
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment._id.toString()} className="bg-white">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{appointment.customerName}</h4>
                        <Badge variant="outline" className="text-xs">
                          #{appointment._id.toString().slice(-8).toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{appointment.customerPhone}</span>
                        <span className="mx-2">•</span>
                        <Mail className="h-3 w-3" />
                        <span>{appointment.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-t border-b">
                    {/* Date & Time */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">REQUESTED DATE & TIME</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>{format(new Date(appointment.scheduledDate), 'EEEE, MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>
                            {appointment.scheduledStartTime?.substring(0, 5)} - {appointment.scheduledEndTime?.substring(0, 5)}
                          </span>
                          {appointment.isMultiDayService && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-xs font-medium">
                              Multi-day Service
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">VEHICLE</div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Car className="h-4 w-4 text-gray-600" />
                        <span>
                          {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                        </span>
                      </div>
                      {appointment.vehicleInfo.licensePlate && (
                        <div className="text-xs text-gray-500 ml-6 mt-1">
                          License: {appointment.vehicleInfo.licensePlate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">REQUESTED SERVICES</div>
                    <div className="flex flex-wrap gap-2">
                      {appointment.services.map((service, index) => (
                        <Badge key={index} className="bg-foreground text-background hover:bg-foreground/90 font-medium px-3 py-1">
                          <Wrench className="h-3 w-3 mr-1" />
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {appointment.customerNotes && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">CUSTOMER NOTES</div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {appointment.customerNotes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleAccept(appointment._id.toString())}
                        disabled={processing === appointment._id.toString()}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing === appointment._id.toString() ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept Appointment
                      </Button>
                      <Button
                        onClick={() => handleReject(appointment._id.toString())}
                        disabled={processing === appointment._id.toString()}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                    <Link href={`/appointments/${appointment._id.toString()}`} className="block">
                      <Button variant="outline" className="w-full">
                        View Full Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
