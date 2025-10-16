'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  CheckCircle,
  Calendar,
  Clock,
  Car,
  Building2,
  Phone,
  Star,
  Search,
  Loader2,
  ArrowRight,
  Filter,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import { Appointment } from '@/models/Appointment'

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

export default function CustomerCompletedJobsComponent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState<string>('all')

  useEffect(() => {
    loadCompletedJobs()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [searchQuery, filterYear, appointments])

  const loadCompletedJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments?status=completed&limit=1000')
      const data = await response.json()

      if (data.success) {
        // Sort by completion date, most recent first
        const sorted = (data.data.appointments as Appointment[]).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        setAppointments(sorted)
        setFilteredAppointments(sorted)
      } else {
        toast.error('Failed to load completed jobs')
      }
    } catch (error) {
      console.error('Error loading completed jobs:', error)
      toast.error('Failed to load completed jobs')
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (apt) =>
          apt.workshopName.toLowerCase().includes(query) ||
          apt.vehicleInfo.make.toLowerCase().includes(query) ||
          apt.vehicleInfo.model.toLowerCase().includes(query) ||
          apt.services.some((s) => s.serviceType.toLowerCase().includes(query))
      )
    }

    // Year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter((apt) => {
        const year = new Date(apt.scheduledDate).getFullYear().toString()
        return year === filterYear
      })
    }

    setFilteredAppointments(filtered)
  }

  const getAvailableYears = (): string[] => {
    const years = new Set(
      appointments.map((apt) => new Date(apt.scheduledDate).getFullYear().toString())
    )
    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalCompleted = appointments.length
  const totalSpent = appointments.reduce((sum, apt) => sum + (apt.totalAmount || 0), 0)
  const averageRating = appointments.filter(a => a.customerRating).length > 0
    ? appointments.reduce((sum, apt) => sum + (apt.customerRating || 0), 0) / appointments.filter(a => a.customerRating).length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Completed Jobs</h1>
        <p className="text-muted-foreground mt-1">
          View your service history and completed jobs
        </p>
      </div>

      {/* Stats Cards - Smaller on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Completed</p>
                <p className="text-xl md:text-2xl font-bold">{totalCompleted}</p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-xl md:text-2xl font-bold">AED {totalSpent.toFixed(2)}</p>
              </div>
              <Star className="h-6 w-6 md:h-8 md:w-8 text-amber-500 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-xl md:text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-6 w-6 md:h-8 md:w-8 text-amber-500 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
              <Input
                placeholder="Search by workshop, car, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap"
            >
              <option value="all">All Years</option>
              {getAvailableYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Completed Jobs List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {appointments.length === 0 ? 'No completed jobs yet' : 'No jobs match your filters'}
            </h3>
            <p className="text-muted-foreground">
              {appointments.length === 0
                ? 'Your completed service jobs will appear here'
                : 'Try adjusting your search or filter criteria'}
            </p>
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
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{appointment.workshopName}</h3>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.workshopPhone}</span>
                      </div>
                    </div>
                    {appointment.customerRating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < appointment.customerRating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">VEHICLE</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">COMPLETED DATE</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(appointment.updatedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">TOTAL COST</div>
                      <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        AED {appointment.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="pt-3 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-2">SERVICES PERFORMED</div>
                    <div className="flex flex-wrap gap-1">
                      {appointment.services.slice(0, 4).map((service, idx) => (
                        <Badge key={idx} className="text-xs bg-black text-white dark:bg-white dark:text-black">
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      ))}
                      {appointment.services.length > 4 && (
                        <Badge className="text-xs bg-black text-white dark:bg-white dark:text-black">
                          +{appointment.services.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Review or Review Reminder */}
                  {appointment.customerReview ? (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-1">YOUR REVIEW</div>
                      <p className="text-sm text-foreground line-clamp-2">{appointment.customerReview}</p>
                    </div>
                  ) : (
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2 text-sm text-primary bg-primary/10 p-3 rounded-md">
                        <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Please leave a review to help other customers and support the workshop!</span>
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-3">
                    <Link href={`/appointments/${appointment._id.toString()}?from=completed-jobs`}>
                      <Button className="w-full" variant="outline">
                        {appointment.customerReview ? 'View Full Details' : 'View Details & Leave Review'}
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

      {/* Results Count */}
      {filteredAppointments.length > 0 && filteredAppointments.length !== appointments.length && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredAppointments.length} of {appointments.length} completed jobs
        </div>
      )}
    </div>
  )
}
