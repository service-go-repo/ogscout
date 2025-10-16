'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  Phone,
  Mail,
  Car,
  Calendar,
  CheckCircle,
  Timer,
  Search,
  Loader2,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { Appointment } from '@/models/Appointment'

interface CustomerData {
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  totalAppointments: number
  completedAppointments: number
  inProgressAppointments: number
  upcomingAppointments: number
  lastAppointmentDate?: Date
  totalRevenue: number
  vehicles: Array<{
    year: number
    make: string
    model: string
  }>
  recentAppointments: Appointment[]
}

export default function CustomerManagementComponent() {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(query) ||
        customer.customerEmail.toLowerCase().includes(query) ||
        customer.customerPhone.toLowerCase().includes(query)
      )
      setFilteredCustomers(filtered)
    }
  }, [searchQuery, customers])

  const loadCustomers = async () => {
    try {
      setLoading(true)

      // Load all appointments for the workshop
      const response = await fetch('/api/appointments?limit=1000')
      const data = await response.json()

      if (data.success) {
        const appointments = data.data.appointments as Appointment[]

        // Group appointments by customer
        const customerMap = new Map<string, CustomerData>()

        appointments.forEach((appointment) => {
          const customerId = appointment.customerId.toString()

          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              customerId,
              customerName: appointment.customerName,
              customerEmail: appointment.customerEmail,
              customerPhone: appointment.customerPhone,
              totalAppointments: 0,
              completedAppointments: 0,
              inProgressAppointments: 0,
              upcomingAppointments: 0,
              totalRevenue: 0,
              vehicles: [],
              recentAppointments: []
            })
          }

          const customer = customerMap.get(customerId)!

          // Update stats
          customer.totalAppointments++

          if (appointment.status === 'completed') {
            customer.completedAppointments++
            customer.totalRevenue += appointment.totalAmount || 0
          } else if (appointment.status === 'in_progress') {
            customer.inProgressAppointments++
          } else if (['requested', 'confirmed', 'scheduled'].includes(appointment.status)) {
            customer.upcomingAppointments++
          }

          // Update last appointment date
          const appointmentDate = new Date(appointment.scheduledDate)
          if (!customer.lastAppointmentDate || appointmentDate > customer.lastAppointmentDate) {
            customer.lastAppointmentDate = appointmentDate
          }

          // Add vehicle if not already in list
          const vehicleKey = `${appointment.vehicleInfo.year}-${appointment.vehicleInfo.make}-${appointment.vehicleInfo.model}`
          const hasVehicle = customer.vehicles.some(v =>
            v.year === appointment.vehicleInfo.year &&
            v.make === appointment.vehicleInfo.make &&
            v.model === appointment.vehicleInfo.model
          )
          if (!hasVehicle) {
            customer.vehicles.push({
              year: appointment.vehicleInfo.year,
              make: appointment.vehicleInfo.make,
              model: appointment.vehicleInfo.model
            })
          }

          // Add to recent appointments (we'll slice later)
          customer.recentAppointments.push(appointment)
        })

        // Sort recent appointments and limit to 5
        customerMap.forEach(customer => {
          customer.recentAppointments = customer.recentAppointments
            .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
            .slice(0, 5)
        })

        const customersArray = Array.from(customerMap.values())
          .sort((a, b) => {
            if (a.lastAppointmentDate && b.lastAppointmentDate) {
              return b.lastAppointmentDate.getTime() - a.lastAppointmentDate.getTime()
            }
            return 0
          })

        setCustomers(customersArray)
        setFilteredCustomers(customersArray)
      } else {
        toast.error('Failed to load customers')
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string): string => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.inProgressAppointments > 0 || c.upcomingAppointments > 0).length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <p className="text-gray-600 mt-2">
          View and manage your customer relationships
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Start accepting appointments to build your customer base'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.customerId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Customer Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(customer.customerName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{customer.customerName}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{customer.customerEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{customer.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">Customer ID</div>
                      <div className="text-xs font-mono">
                        #{customer.customerId.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">TOTAL VISITS</div>
                      <div className="text-lg font-bold">{customer.totalAppointments}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">COMPLETED</div>
                      <div className="text-lg font-bold text-green-600">{customer.completedAppointments}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">IN PROGRESS</div>
                      <div className="text-lg font-bold text-blue-600">{customer.inProgressAppointments}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">UPCOMING</div>
                      <div className="text-lg font-bold text-orange-600">{customer.upcomingAppointments}</div>
                    </div>
                  </div>

                  {/* Vehicles */}
                  <div className="pt-3 border-t">
                    <div className="text-xs font-medium text-gray-500 mb-2">VEHICLES</div>
                    <div className="flex flex-wrap gap-2">
                      {customer.vehicles.map((vehicle, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Car className="h-3 w-3 mr-1" />
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Last Appointment & Revenue */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">LAST VISIT</div>
                      <div className="text-sm">
                        {customer.lastAppointmentDate
                          ? format(customer.lastAppointmentDate, 'MMM dd, yyyy')
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">TOTAL REVENUE</div>
                      <div className="text-sm font-semibold text-green-600">
                        ${customer.totalRevenue.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Recent Appointments */}
                  {expandedCustomer === customer.customerId && (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium text-gray-500 mb-3">RECENT APPOINTMENTS</div>
                      <div className="space-y-2">
                        {customer.recentAppointments.map((appointment) => (
                          <Link
                            key={appointment._id.toString()}
                            href={`/appointments/${appointment._id.toString()}`}
                          >
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium">
                                    {format(new Date(appointment.scheduledDate), 'MMM dd, yyyy')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {appointment.services.length} service{appointment.services.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {appointment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle Button */}
                  <div className="pt-3">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setExpandedCustomer(
                        expandedCustomer === customer.customerId ? null : customer.customerId
                      )}
                    >
                      {expandedCustomer === customer.customerId
                        ? 'Hide Appointment History'
                        : 'View Appointment History'}
                      <ArrowRight className={`h-4 w-4 ml-2 transition-transform ${
                        expandedCustomer === customer.customerId ? 'rotate-90' : ''
                      }`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
