'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  Building2,
  CheckCircle,
  Timer,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { Appointment, getAppointmentStatusLabel, getAppointmentStatusColor } from '@/models/Appointment'

const getServiceTypeLabel = (serviceType: string): string => {
  const labels: Record<string, string> = {
    'bodywork': 'Body Work',
    'paint': 'Paint Work',
    'bumper': 'Bumper Repair',
    'maintenance': 'Maintenance',
    'repair': 'Repair',
    'diagnostic': 'Diagnostic',
    'inspection': 'Inspection',
  }
  return labels[serviceType.toLowerCase()] || serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function CustomerAppointmentsComponent() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)

      // Load ALL appointments at once
      const params = new URLSearchParams({ limit: '100' })
      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()

      if (data.success) {
        setAllAppointments(data.data.appointments)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Calculate stats from ALL appointments
  const upcomingCount = allAppointments.filter(a =>
    ['requested', 'confirmed', 'scheduled', 'in_progress'].includes(a.status)
  ).length

  const completedCount = allAppointments.filter(a => a.status === 'completed').length
  const inProgressCount = allAppointments.filter(a => a.status === 'in_progress').length

  // Filter appointments based on active tab
  const filteredAppointments = allAppointments.filter(a => {
    if (activeTab === 'upcoming') {
      return ['requested', 'confirmed', 'scheduled', 'in_progress'].includes(a.status)
    } else if (activeTab === 'completed') {
      return a.status === 'completed'
    }
    return true // 'all' tab shows everything
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your service appointments
          </p>
        </div>
        {/* Desktop Button */}
        <Button asChild className="hidden sm:flex items-center gap-2">
          <Link href="/quotations/request">
            <Plus className="h-4 w-4" />
            Request Service
          </Link>
        </Button>
      </div>

      {/* Stats Cards - Smaller on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-xl md:text-2xl font-bold">{upcomingCount}</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-xl md:text-2xl font-bold">{inProgressCount}</p>
              </div>
              <Timer className="h-6 w-6 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-xl md:text-2xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pill-Style Tabs */}
      <div className="mb-6">
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground border border-border hover:bg-accent'
              }`}
            >
              Upcoming
              {upcomingCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {upcomingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'completed'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground border border-border hover:bg-accent'
              }`}
            >
              Completed
              {completedCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === 'completed'
                    ? 'bg-white text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground border border-border hover:bg-accent'
              }`}
            >
              All
              {allAppointments.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === 'all'
                    ? 'bg-white text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {allAppointments.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming appointments"
                : activeTab === 'completed'
                ? "You haven't completed any appointments yet"
                : "You don't have any appointments"}
            </p>
            <Button asChild>
              <Link href="/quotations/request">
                <Plus className="h-4 w-4 mr-2" />
                Request Service
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment._id.toString()} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getAppointmentStatusColor(appointment.status)}>
                          {getAppointmentStatusLabel(appointment.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{appointment._id.toString().slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold">{appointment.workshopName}</h3>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                    {/* Date & Time */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">DATE & TIME</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {format(new Date(appointment.scheduledDate), 'EEEE, MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>
                            {appointment.scheduledStartTime} - {appointment.scheduledEndTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">VEHICLE</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Workshop Location */}
                  <div className="pt-3 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-2">WORKSHOP LOCATION</div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{appointment.workshopAddress}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="pt-3 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-2">SERVICES</div>
                    <div className="flex flex-wrap gap-1">
                      {appointment.services.slice(0, 3).map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      ))}
                      {appointment.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{appointment.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Status-specific messages */}
                  {appointment.status === 'requested' && (
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-3 rounded-md">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Waiting for workshop confirmation</span>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'in_progress' && (
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2 text-sm text-primary bg-primary/10 p-3 rounded-md">
                        <Timer className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Your vehicle is currently being serviced</span>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'completed' && !appointment.customerReview && (
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 p-3 rounded-md">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Service completed! Please leave a review</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-3">
                    <Link href={`/appointments/${appointment._id.toString()}`}>
                      <Button className="w-full" variant="outline">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile Bottom Button */}
      <div className="sm:hidden mt-8">
        <Button asChild className="w-full flex items-center justify-center gap-2">
          <Link href="/quotations/request">
            <Plus className="h-4 w-4" />
            Request Service
          </Link>
        </Button>
      </div>
    </div>
  )
}
