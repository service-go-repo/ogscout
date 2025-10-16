'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  Search,
  Phone,
  Mail,
  Car,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  ChevronRight,
  User as UserIcon
} from 'lucide-react'
import { toast } from 'sonner'

interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
  totalQuotations: number
  totalSpent: number
  lastInteraction?: string
  cars: {
    make: string
    model: string
    year: number
    licensePlate?: string
  }[]
  quotations: {
    _id: string
    createdAt: string
    status: string
    quoteStatus: string
    services: string[]
    totalAmount?: number
    vehicle?: {
      make: string
      model: string
      year: number
      licensePlate?: string
    }
  }[]
}

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

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Quotation statuses
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'quoted': 'bg-blue-100 text-blue-800 border-blue-200',
    'accepted': 'bg-green-100 text-green-800 border-green-200',
    'declined': 'bg-red-100 text-red-800 border-red-200',
    'completed': 'bg-purple-100 text-purple-800 border-purple-200',
    'expired': 'bg-gray-100 text-gray-800 border-gray-200',
    // Appointment statuses
    'requested': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'scheduled': 'bg-purple-100 text-purple-800 border-purple-200',
    'in_progress': 'bg-orange-100 text-orange-800 border-orange-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const getUniqueVehicles = (customer: Customer) => {
  const vehicleMap = new Map()

  // Collect vehicles from quotations
  customer.quotations.forEach(quotation => {
    if (quotation.vehicle) {
      const key = `${quotation.vehicle.year}-${quotation.vehicle.make}-${quotation.vehicle.model}-${quotation.vehicle.licensePlate || ''}`
      if (!vehicleMap.has(key)) {
        vehicleMap.set(key, quotation.vehicle)
      }
    }
  })

  // Add vehicles from customer's cars if they exist
  customer.cars.forEach(car => {
    const key = `${car.year}-${car.make}-${car.model}-${car.licensePlate || ''}`
    if (!vehicleMap.has(key)) {
      vehicleMap.set(key, car)
    }
  })

  return Array.from(vehicleMap.values())
}

export default function CustomersComponent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [searchQuery, customers])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workshops/customers')
      const data = await response.json()

      if (data.success) {
        setCustomers(data.data)
        setFilteredCustomers(data.data)
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

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.cars.some(
          (car) =>
            car.make.toLowerCase().includes(query) ||
            car.model.toLowerCase().includes(query) ||
            car.licensePlate?.toLowerCase().includes(query)
        )
    )
    setFilteredCustomers(filtered)
  }

  const openCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-gray-600 mt-2">
          Manage your customer relationships and service history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, c) => sum + c.totalQuotations, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  AED {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          placeholder="Search by name, email, phone, or car..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
            </h3>
            <p className="text-gray-500">
              {customers.length === 0
                ? 'Your customers will appear here once they request quotes from your workshop'
                : 'Try adjusting your search criteria'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Interaction
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openCustomerDetails(customer)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {customer.phone && (
                              <div className="text-xs text-gray-500">{customer.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {(() => {
                            const vehicles = getUniqueVehicles(customer)
                            return vehicles.length > 0 ? (
                              <>
                                {vehicles[0].year} {vehicles[0].make} {vehicles[0].model}
                                {vehicles.length > 1 && (
                                  <span className="text-gray-500 ml-2">
                                    +{vehicles.length - 1} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">No vehicles</span>
                            )
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.totalQuotations}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          AED {customer.totalSpent.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.lastInteraction
                            ? format(new Date(customer.lastInteraction), 'MMM dd, yyyy')
                            : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Customer Details</DialogTitle>
            <DialogDescription>
              View customer information and service history
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedCustomer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vehicles</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const vehicles = getUniqueVehicles(selectedCustomer)
                    return vehicles.length > 0 ? (
                      <div className="space-y-3">
                        {vehicles.map((car, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <Car className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium">
                                {car.year} {car.make} {car.model}
                              </p>
                              {car.licensePlate && (
                                <p className="text-sm text-gray-500">{car.licensePlate}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No vehicles</p>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Quotation History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quotation History</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.quotations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.quotations
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((quotation) => (
                          <div
                            key={quotation._id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {format(new Date(quotation.createdAt), 'MMM dd, yyyy')}
                                </span>
                                <Badge className={`border ${getStatusColor(quotation.quoteStatus)}`}>
                                  {quotation.quoteStatus.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              {quotation.totalAmount && quotation.totalAmount > 0 && (
                                <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                                  AED {quotation.totalAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {quotation.vehicle && (
                              <div className="text-sm text-gray-600 mb-2">
                                {quotation.vehicle.year} {quotation.vehicle.make} {quotation.vehicle.model}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {quotation.services.map((service, idx) => (
                                <Badge key={idx} className="text-xs bg-black text-white hover:bg-black/90">
                                  {getServiceTypeLabel(service)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No quotation history</p>
                  )}
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Total Quotations</p>
                    <p className="text-2xl font-bold">{selectedCustomer.totalQuotations}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">
                      AED {selectedCustomer.totalSpent.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Vehicles</p>
                    <p className="text-2xl font-bold">{getUniqueVehicles(selectedCustomer).length}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
