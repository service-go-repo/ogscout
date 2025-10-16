'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfDay, endOfDay, isToday, isTomorrow, isPast, isAfter } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Timer,
  Car,
  Phone,
  Mail,
  MapPin,
  Filter,
  Bell,
  Settings,
  BarChart3,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Appointment, getAppointmentStatusLabel, getAppointmentStatusColor } from '@/models/Appointment'
import AppointmentList from './appointment-list'
import PendingAppointments from './pending-appointments'

interface AppointmentStats {
  today: {
    total: number
    confirmed: number
    inProgress: number
    completed: number
    noShow: number
  }
  thisWeek: {
    total: number
    confirmed: number
    completed: number
    cancelled: number
  }
  upcoming: {
    next7Days: number
    next30Days: number
    pendingConfirmation: number
  }
}

interface DailySchedule {
  date: Date
  appointments: Appointment[]
  availableSlots: number
  bookedSlots: number
}

export default function AppointmentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'analytics'>('overview')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [dailySchedule, setDailySchedule] = useState<DailySchedule | null>(null)
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadDailySchedule(selectedDate)
    }
  }, [selectedDate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load ALL appointments for stats calculation (not just today's)
      const response = await fetch(`/api/appointments?limit=200`)
      const data = await response.json()

      if (data.success) {
        const allAppointments = data.data.appointments

        // Filter today's appointments for display
        const today = format(new Date(), 'yyyy-MM-dd')
        const todayAppts = allAppointments.filter((apt: Appointment) => {
          const aptDate = format(new Date(apt.scheduledDate), 'yyyy-MM-dd')
          return aptDate === today
        })

        setTodayAppointments(todayAppts)
        calculateStats(allAppointments) // Calculate stats from ALL appointments
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (appointments: Appointment[]) => {
    const now = new Date()
    const startOfToday = startOfDay(now)
    const endOfToday = endOfDay(now)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    // Today's stats
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.scheduledDate)
      return aptDate >= startOfToday && aptDate <= endOfToday
    })

    // This week's stats (including past appointments)
    // Note: In a real app, you'd fetch week's data from API
    const weekStats = {
      total: todayAppointments.length, // Simplified for demo
      confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: todayAppointments.filter(apt => apt.status === 'cancelled').length
    }

    const stats: AppointmentStats = {
      today: {
        total: todayAppointments.length,
        confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
        inProgress: todayAppointments.filter(apt => apt.status === 'in_progress').length,
        completed: todayAppointments.filter(apt => apt.status === 'completed').length,
        noShow: todayAppointments.filter(apt => apt.status === 'no_show').length
      },
      thisWeek: weekStats,
      upcoming: {
        next7Days: appointments.filter(apt => {
          const aptDate = new Date(apt.scheduledDate)
          return isAfter(aptDate, now) && aptDate <= addDays(now, 7)
        }).length,
        next30Days: appointments.filter(apt => {
          const aptDate = new Date(apt.scheduledDate)
          return isAfter(aptDate, now) && aptDate <= addDays(now, 30)
        }).length,
        pendingConfirmation: appointments.filter(apt => apt.status === 'requested').length
      }
    }

    setStats(stats)
  }

  const loadDailySchedule = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')

      // Get the current workshop's profile to retrieve workshopId
      const profileResponse = await fetch('/api/workshops/profile')
      const profileData = await profileResponse.json()

      if (!profileData.success || !profileData.data?._id) {
        console.error('Failed to get workshop profile')
        return
      }

      const workshopId = profileData.data._id

      // Fetch appointments for the selected date
      const response = await fetch(`/api/appointments?dateFrom=${dateStr}&dateTo=${dateStr}&limit=50`)
      const data = await response.json()

      if (data.success) {
        let availableSlots = 0
        let bookedSlots = data.data.appointments.length

        // Only fetch availability for future dates
        if (isAfter(startOfDay(date), startOfDay(new Date())) || isToday(date)) {
          try {
            const availabilityResponse = await fetch(`/api/appointments/availability?workshopId=${workshopId}&startDate=${date.toISOString()}&endDate=${date.toISOString()}`)

            if (!availabilityResponse.ok) {
              console.error(`Availability API error: ${availabilityResponse.status}`)
            } else {
              const availabilityData = await availabilityResponse.json()

              if (availabilityData.success && availabilityData.data.availability.length > 0) {
                const dayAvailability = availabilityData.data.availability[0]
                availableSlots = dayAvailability.availableSlots.filter((slot: any) => slot.isAvailable).length
              }
            }
          } catch (error) {
            console.error('Error fetching availability:', error)
          }
        }

        setDailySchedule({
          date,
          appointments: data.data.appointments,
          availableSlots,
          bookedSlots
        })
      }
    } catch (error) {
      console.error('Error loading daily schedule:', error)
    }
  }

  const getTimeSlotStatus = (appointments: Appointment[], hour: number) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`
    const appointment = appointments.find(apt =>
      apt.scheduledStartTime <= timeStr &&
      apt.scheduledEndTime > timeStr
    )

    if (appointment) {
      return {
        hasAppointment: true,
        appointment,
        status: appointment.status
      }
    }

    return { hasAppointment: false }
  }

  const renderTimeSlot = (hour: number, appointments: Appointment[]) => {
    const slotStatus = getTimeSlotStatus(appointments, hour)
    const timeStr = `${hour.toString().padStart(2, '0')}:00`

    if (!slotStatus.hasAppointment) {
      return (
        <div key={hour} className="p-2 border-b border-gray-100 text-gray-400 text-sm">
          {timeStr} - Available
        </div>
      )
    }

    const apt = slotStatus.appointment!
    return (
      <div key={hour} className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">
            {apt.scheduledStartTime} - {apt.scheduledEndTime}
          </div>
          <Badge className={getAppointmentStatusColor(apt.status)} variant="secondary">
            {getAppointmentStatusLabel(apt.status)}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-3 w-3" />
            <span>{apt.vehicleInfo.year} {apt.vehicleInfo.make} {apt.vehicleInfo.model}</span>
          </div>
          <div className="text-xs text-gray-600">{apt.customerName}</div>
          <div className="text-xs text-gray-500">
            Services: {apt.services.map(s => s.serviceType).join(', ')}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appointment Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your workshop appointments</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.location.href = '/profile?tab=appointments'}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Today's Appts</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.today.total}</p>
                </div>
                <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary self-start sm:self-auto" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.today.completed} done, {stats.today.inProgress} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.upcoming.pendingConfirmation}</p>
                </div>
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400 self-start sm:self-auto" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground truncate">
                Need confirmation
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Next 7 Days</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.upcoming.next7Days}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-400 self-start sm:self-auto" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground truncate">
                Upcoming soon
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">This Week</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.thisWeek.completed}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-400 self-start sm:self-auto" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground truncate">
                Completed
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-auto bg-transparent py-2 gap-2">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Pending Appointments Section */}
          <PendingAppointments onUpdate={loadDashboardData} />

          {/* Today's Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                </p>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                    <p>No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour =>
                      renderTimeSlot(hour, todayAppointments)
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/profile?tab=appointments'}>
                  <Settings className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab('analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Appointments</h3>

            {/* Status Filter Pills */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="inline-flex gap-2 py-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === 'all'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('requested')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === 'requested'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Requested
                </button>
                <button
                  onClick={() => setStatusFilter('confirmed')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === 'confirmed'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setStatusFilter('scheduled')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === 'scheduled'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Scheduled
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === 'in_progress'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === 'completed'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === 'cancelled'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          <AppointmentList
            key={refreshKey}
            userRole="workshop"
            filterStatus={statusFilter === 'all' ? [] : [statusFilter]}
            onViewDetails={(appointment) => {
              console.log('View details:', appointment)
              // Handle view details
            }}
            onReschedule={(appointment) => {
              console.log('Reschedule:', appointment)
              // Handle reschedule
            }}
            onCancel={(appointment) => {
              console.log('Cancel:', appointment)
              // Handle cancel
            }}
            onUpdateStatus={(appointment, status) => {
              console.log('Update status:', appointment, status)
              // Handle status update
              loadDashboardData() // Refresh data
              setRefreshKey(prev => prev + 1) // Force AppointmentList to re-render
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <p className="text-sm text-gray-600">Coming soon</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Analytics features coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <p className="text-sm text-gray-600">Track your workshop performance</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Metrics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}