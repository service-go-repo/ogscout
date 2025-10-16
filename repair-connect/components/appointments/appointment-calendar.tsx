'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Building2,
  Car
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Appointment, getAppointmentStatusColor } from '@/models/Appointment'

interface AppointmentCalendarProps {
  userRole: 'customer' | 'workshop'
  onDateSelect?: (date: Date) => void
  onAppointmentClick?: (appointment: Appointment) => void
  selectedDate?: Date
  className?: string
}

interface CalendarDay {
  date: Date
  appointments: Appointment[]
  isCurrentMonth: boolean
  isToday: boolean
}

export default function AppointmentCalendar({
  userRole,
  onDateSelect,
  onAppointmentClick,
  selectedDate,
  className
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  useEffect(() => {
    loadMonthAppointments()
  }, [currentMonth])

  useEffect(() => {
    generateCalendarDays()
  }, [currentMonth, appointments])

  const loadMonthAppointments = async () => {
    try {
      setLoading(true)
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)

      const response = await fetch(`/api/appointments?dateFrom=${start.toISOString()}&dateTo=${end.toISOString()}&limit=100`)
      const data = await response.json()

      if (data.success) {
        setAppointments(data.data.appointments)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start, end })

    // Add days from previous month to fill the first week
    const firstDay = start.getDay()
    const prevMonthDays: Date[] = []
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(start)
      prevDate.setDate(start.getDate() - (firstDay - i))
      prevMonthDays.push(prevDate)
    }

    // Add days from next month to fill the last week
    const lastDay = end.getDay()
    const nextMonthDays: Date[] = []
    for (let i = 1; i <= (6 - lastDay); i++) {
      const nextDate = new Date(end)
      nextDate.setDate(end.getDate() + i)
      nextMonthDays.push(nextDate)
    }

    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays]

    const calendarDays: CalendarDay[] = allDays.map(date => {
      const dayAppointments = appointments.filter(apt =>
        isSameDay(new Date(apt.scheduledDate), date)
      )

      return {
        date,
        appointments: dayAppointments,
        isCurrentMonth: isSameMonth(date, currentMonth),
        isToday: isToday(date)
      }
    })

    setCalendarDays(calendarDays)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const handleDayClick = (day: CalendarDay) => {
    onDateSelect?.(day.date)
  }

  const getStatusCount = (appointments: Appointment[]) => {
    return appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const getDayContent = (day: CalendarDay) => {
    if (day.appointments.length === 0) {
      return null
    }

    if (day.appointments.length === 1) {
      const appointment = day.appointments[0]
      return (
        <div className="space-y-1">
          <div className="text-xs truncate">
            {appointment.scheduledStartTime} - {userRole === 'workshop' ? appointment.customerName : appointment.workshopName}
          </div>
          <Badge
            variant="secondary"
            className={cn("text-xs px-1 py-0", getAppointmentStatusColor(appointment.status))}
          >
            {appointment.status}
          </Badge>
        </div>
      )
    }

    const statusCount = getStatusCount(day.appointments)
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium">
          {day.appointments.length} appointments
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(statusCount).map(([status, count]) => (
            <Badge
              key={status}
              variant="secondary"
              className={cn("text-xs px-1 py-0", getAppointmentStatusColor(status as any))}
            >
              {count}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Appointment Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold min-w-40 text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Weekday Headers */}
          {weekdays.map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div key={index} className="relative">
              {day.appointments.length > 0 ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full h-24 bg-white p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                        !day.isCurrentMonth && "text-gray-400 bg-gray-50",
                        day.isToday && "bg-blue-50 border border-blue-200",
                        selectedDate && isSameDay(day.date, selectedDate) && "bg-blue-100 border border-blue-300"
                      )}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day.date, 'd')}
                      </div>
                      {getDayContent(day)}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b">
                      <h4 className="font-semibold">
                        {format(day.date, 'EEEE, MMMM dd, yyyy')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {day.appointments.length} appointment{day.appointments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {day.appointments.map((appointment) => (
                        <div
                          key={appointment._id.toString()}
                          className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => onAppointmentClick?.(appointment)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">
                                {appointment.scheduledStartTime} - {appointment.scheduledEndTime}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={getAppointmentStatusColor(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <Car className="h-3 w-3" />
                              <span>
                                {appointment.vehicleInfo.year} {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {userRole === 'workshop' ? (
                                <>
                                  <User className="h-3 w-3" />
                                  <span>{appointment.customerName}</span>
                                </>
                              ) : (
                                <>
                                  <Building2 className="h-3 w-3" />
                                  <span>{appointment.workshopName}</span>
                                </>
                              )}
                            </div>

                            <div className="text-gray-500 truncate">
                              Services: {appointment.services.map(s => s.serviceType).join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  className={cn(
                    "w-full h-24 bg-white p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                    !day.isCurrentMonth && "text-gray-400 bg-gray-50",
                    day.isToday && "bg-blue-50 border border-blue-200",
                    selectedDate && isSameDay(day.date, selectedDate) && "bg-blue-100 border border-blue-300"
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="text-sm font-medium">
                    {format(day.date, 'd')}
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading appointments...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}