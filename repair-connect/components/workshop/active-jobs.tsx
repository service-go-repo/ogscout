'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  CheckCircle,
  PlayCircle,
  Timer,
  AlertCircle,
  Loader2,
  ArrowRight
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

export default function ActiveJobsComponent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'in_progress' | 'scheduled' | 'upcoming'>('in_progress')

  useEffect(() => {
    loadAllAppointments()
  }, [])

  useEffect(() => {
    loadJobs()
  }, [activeTab])

  const loadAllAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?status=in_progress,scheduled,confirmed,requested&limit=1000')
      const data = await response.json()

      if (data.success) {
        setAllAppointments(data.data.appointments)
      }
    } catch (error) {
      console.error('Error loading all appointments:', error)
    }
  }

  const loadJobs = async () => {
    try {
      setLoading(true)

      let statusFilter = ''
      if (activeTab === 'in_progress') {
        statusFilter = 'in_progress'
      } else if (activeTab === 'scheduled') {
        statusFilter = 'scheduled,confirmed'
      } else {
        statusFilter = 'requested,confirmed,scheduled'
      }

      const response = await fetch(`/api/appointments?status=${statusFilter}&limit=100`)
      const data = await response.json()

      if (data.success) {
        setAppointments(data.data.appointments)
      } else {
        toast.error('Failed to load jobs')
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Active Jobs</h1>
        <p className="text-gray-600 mt-2">
          Manage your current and upcoming service jobs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {allAppointments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Today</p>
                <p className="text-2xl font-bold">
                  {allAppointments.filter(a => {
                    const today = format(new Date(), 'yyyy-MM-dd')
                    const aptDate = format(new Date(a.scheduledDate), 'yyyy-MM-dd')
                    return aptDate === today && ['scheduled', 'confirmed'].includes(a.status)
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">
                  {allAppointments.filter(a => {
                    const aptDate = new Date(a.scheduledDate)
                    return aptDate > new Date() && ['requested', 'confirmed', 'scheduled'].includes(a.status)
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pill-style Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('in_progress')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'in_progress'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white text-foreground border border-border hover:bg-gray-50'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'scheduled'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white text-foreground border border-border hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Scheduled
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white text-foreground border border-border hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Upcoming
          </button>
        </div>
      </div>

      {/* Jobs Content */}
      <div className="relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading jobs...</p>
            </div>
          </div>
        )}

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Timer className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500">
                {activeTab === 'in_progress'
                  ? "No jobs are currently in progress"
                  : activeTab === 'scheduled'
                  ? "No jobs scheduled for today"
                  : "No upcoming jobs"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment._id.toString()} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{appointment.customerName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getAppointmentStatusColor(appointment.status)}>
                          {getAppointmentStatusLabel(appointment.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          #{appointment._id.toString().slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Vehicle */}
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{format(new Date(appointment.scheduledDate), 'MMM dd, yyyy')}</span>
                    <Clock className="h-4 w-4 text-gray-400 ml-2" />
                    <span>{appointment.scheduledStartTime}</span>
                  </div>

                  {/* Customer Contact */}
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{appointment.customerPhone}</span>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1">
                    {appointment.services.slice(0, 3).map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {getServiceTypeLabel(service.serviceType)}
                      </Badge>
                    ))}
                    {appointment.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{appointment.services.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link href={`/appointments/${appointment._id.toString()}`}>
                      <Button className="w-full" variant="outline">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
