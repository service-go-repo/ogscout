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
  User,
  Phone,
  Star,
  Search,
  Loader2,
  ArrowRight,
  Filter,
  DollarSign,
  TrendingUp
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

export default function WorkshopCompletedJobsComponent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')

  useEffect(() => {
    loadCompletedJobs()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [searchQuery, filterYear, filterMonth, appointments])

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
          apt.customerName.toLowerCase().includes(query) ||
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

    // Month filter
    if (filterMonth !== 'all') {
      filtered = filtered.filter((apt) => {
        const month = new Date(apt.scheduledDate).getMonth().toString()
        return month === filterMonth
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

  const getAvailableMonths = (): { value: string; label: string }[] => {
    if (filterYear === 'all') return []

    const months = new Set(
      appointments
        .filter((apt) => new Date(apt.scheduledDate).getFullYear().toString() === filterYear)
        .map((apt) => new Date(apt.scheduledDate).getMonth())
    )

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return Array.from(months)
      .sort((a, b) => b - a)
      .map((m) => ({ value: m.toString(), label: monthNames[m] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalCompleted = appointments.length
  // Calculate revenue only from paid appointments
  const totalRevenue = appointments
    .filter(apt => apt.paymentStatus === 'paid')
    .reduce((sum, apt) => sum + (apt.totalAmount || 0), 0)
  const averageRating = appointments.filter(a => a.customerRating).length > 0
    ? appointments.reduce((sum, apt) => sum + (apt.customerRating || 0), 0) / appointments.filter(a => a.customerRating).length
    : 0
  const reviewsCount = appointments.filter(a => a.customerRating).length
  const paidCount = appointments.filter(apt => apt.paymentStatus === 'paid').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Completed Jobs</h1>
        <p className="text-gray-600 mt-2">
          View your completed jobs and service history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold">{totalCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">AED {totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{paidCount} of {totalCompleted} paid</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{reviewsCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            placeholder="Search by customer, car, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value)
              setFilterMonth('all') // Reset month when year changes
            }}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Years</option>
            {getAvailableYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {filterYear !== 'all' && getAvailableMonths().length > 0 && (
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Months</option>
              {getAvailableMonths().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Completed Jobs List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {appointments.length === 0 ? 'No completed jobs yet' : 'No jobs match your filters'}
            </h3>
            <p className="text-gray-500">
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
                        <h3 className="text-xl font-semibold">{appointment.customerName}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.customerPhone}</span>
                      </div>
                    </div>
                    {appointment.customerRating && (
                      <div className="flex flex-col items-end gap-1">
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
                        <span className="text-xs text-gray-600">{appointment.customerRating}.0</span>
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">VEHICLE</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">
                          {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">COMPLETED DATE</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span>{format(new Date(appointment.updatedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">REVENUE</div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-green-600">
                          AED {appointment.totalAmount?.toFixed(2) || '0.00'}
                        </div>
                        <Badge
                          variant={appointment.paymentStatus === 'paid' ? 'default' : 'secondary'}
                          className={`text-xs ${appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {appointment.paymentStatus?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="pt-3 border-t">
                    <div className="text-xs font-medium text-gray-500 mb-2">SERVICES PERFORMED</div>
                    <div className="flex flex-wrap gap-1">
                      {appointment.services.slice(0, 4).map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-black text-white border-black hover:bg-black/90">
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      ))}
                      {appointment.services.length > 4 && (
                        <Badge variant="outline" className="text-xs bg-black text-white border-black hover:bg-black/90">
                          +{appointment.services.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Customer Review */}
                  {appointment.customerReview && (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium text-gray-500 mb-1">CUSTOMER REVIEW</div>
                      <p className="text-sm text-gray-700 line-clamp-2">{appointment.customerReview}</p>
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-3">
                    <Link href={`/appointments/${appointment._id.toString()}?from=completed-jobs`}>
                      <Button className="w-full" variant="outline">
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
      )}

      {/* Results Count */}
      {filteredAppointments.length > 0 && filteredAppointments.length !== appointments.length && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length} completed jobs
        </div>
      )}
    </div>
  )
}
