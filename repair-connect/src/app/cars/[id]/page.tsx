'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Car,
  Edit,
  Settings,
  History,
  Camera,
  Plus,
  Calendar,
  MapPin,
  Fuel,
  Gauge,
  Wrench,
  FileText,
  Eye,
  Archive,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react'
import ImageGallery from '@/components/common/ImageGallery'
import GalleryFeatureDemo from '@/components/common/GalleryFeatureDemo'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CarProfile, getCarDisplayName, formatMileage } from '@/models/CarProfile'
import { ServiceRequestSummary } from '@/models/ServiceRequest'

interface CarProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default function CarProfilePage({ params }: CarProfilePageProps) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [car, setCar] = useState<CarProfile | null>(null)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestSummary[]>([])
  const [serviceRequestPhotos, setServiceRequestPhotos] = useState<{[key: string]: any}>({})
  const [serviceRequestAppointments, setServiceRequestAppointments] = useState<{[key: string]: any}>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user.role !== 'customer') {
      router.push('/')
      return
    }
    
    fetchCarProfile()
  }, [session, status, router, resolvedParams.id])

  const fetchCarProfile = async () => {
    try {
      setLoading(true)
      
      // Fetch car profile and service requests in parallel
      const [carResponse, servicesResponse] = await Promise.all([
        fetch(`/api/cars/${resolvedParams.id}`),
        fetch(`/api/cars/${resolvedParams.id}/service-requests`)
      ])
      
      const [carData, servicesData] = await Promise.all([
        carResponse.json(),
        servicesResponse.json()
      ])
      
      if (carData.success) {
        setCar(carData.data)
      } else {
        toast.error('Failed to load car profile')
        router.push('/cars')
      }
      
      if (servicesData.success) {
        const requests = servicesData.data.serviceRequests || []
        setServiceRequests(requests)

        // Fetch photos and appointments for each service request
        const photoPromises = requests.map(async (request: ServiceRequestSummary) => {
          try {
            const response = await fetch(`/api/service-requests/${request._id}`)
            const data = await response.json()
            if (data.success && data.data.serviceRequest.photos?.length > 0) {
              return {
                requestId: request._id,
                title: request.title,
                photos: data.data.serviceRequest.photos,
                createdAt: request.createdAt
              }
            }
          } catch (error) {
            console.error(`Error fetching photos for service request ${request._id}:`, error)
          }
          return null
        })

        // Fetch appointments through quotations
        const appointmentPromises = requests.map(async (request: ServiceRequestSummary) => {
          try {
            // First, get quotations for this service request
            const quotationsResponse = await fetch(`/api/quotations?serviceRequestId=${request._id}`)
            const quotationsData = await quotationsResponse.json()

            if (quotationsData.success && quotationsData.data.quotations.length > 0) {
              // Find accepted quotation
              const acceptedQuotation = quotationsData.data.quotations.find((q: any) => q.status === 'accepted' || q.acceptedQuoteId)

              if (acceptedQuotation) {
                // Get appointment for this quotation
                const appointmentResponse = await fetch(`/api/appointments?quotationId=${acceptedQuotation._id}`)
                const appointmentData = await appointmentResponse.json()

                if (appointmentData.success && appointmentData.data.appointments.length > 0) {
                  return {
                    requestId: request._id,
                    appointment: appointmentData.data.appointments[0]
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching appointment for service request ${request._id}:`, error)
          }
          return null
        })

        const [photoResults, appointmentResults] = await Promise.all([
          Promise.all(photoPromises),
          Promise.all(appointmentPromises)
        ])

        const photosMap: {[key: string]: any} = {}
        photoResults.forEach(result => {
          if (result) {
            photosMap[result.requestId] = result
          }
        })
        setServiceRequestPhotos(photosMap)

        const appointmentsMap: {[key: string]: any} = {}
        appointmentResults.forEach(result => {
          if (result) {
            appointmentsMap[result.requestId] = result.appointment
          }
        })
        setServiceRequestAppointments(appointmentsMap)
      }
    } catch (error) {
      console.error('Error fetching car profile:', error)
      toast.error('An error occurred while loading the car profile')
      router.push('/cars')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateServiceRequest = () => {
    router.push(`/service-requests/new?carId=${resolvedParams.id}`)
  }

  const handleEditCar = () => {
    router.push(`/cars/${resolvedParams.id}/edit`)
  }

  const handleViewServiceRequest = (serviceId: string) => {
    router.push(`/service-requests/${serviceId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h1>
          <Button onClick={() => router.push('/cars')}>
            <Car className="h-4 w-4 mr-2" />
            Back to My Cars
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => router.push('/cars')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          My Garage
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getCarDisplayName(car)}
          </h1>
          <p className="text-gray-600 mt-1">
            Registered on {format(new Date(car.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleEditCar}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Car
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={car.status === 'active' ? 'default' : 'secondary'}
          className="flex items-center gap-1"
        >
          {car.status === 'active' ? <Car className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </Badge>
        
        {car.totalServiceRequests && car.totalServiceRequests > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <History className="h-3 w-3" />
            {car.totalServiceRequests} Service{car.totalServiceRequests !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Pill Tabs Navigation */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white text-foreground border border-border hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white text-foreground border border-border hover:bg-gray-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              Gallery ({car.gallery.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white text-foreground border border-border hover:bg-gray-50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Services ({serviceRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white text-foreground border border-border hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Details
            </button>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Car Image and Quick Stats */}
            <Card className="lg:col-span-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Main Image */}
                  <div className="flex-shrink-0">
                    <div className="w-full md:w-64 h-48 bg-gray-100 rounded-lg overflow-hidden">
                      {car.thumbnailUrl ? (
                        <img
                          src={car.thumbnailUrl}
                          alt={getCarDisplayName(car)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Year</div>
                          <div className="font-semibold">{car.year}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Gauge className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Mileage</div>
                          <div className="font-semibold">{formatMileage(car.mileage)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Fuel className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Fuel</div>
                          <div className="font-semibold capitalize">{car.fuelType}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Trans</div>
                          <div className="font-semibold capitalize">{car.transmission}</div>
                        </div>
                      </div>
                    </div>

                    {car.notes && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                        <p className="text-sm text-gray-700">{car.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Summary */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <span>Service Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center bg-gradient-to-br from-primary/10 to-primary/20 p-6 rounded-lg">
                  <div className="text-4xl font-bold text-primary">
                    {serviceRequests.length}
                  </div>
                  <div className="text-sm font-medium text-primary/80 mt-1">Total Service Requests</div>
                </div>
                
                {car.lastServiceDate && (
                  <div className="text-center pt-4 border-t">
                    <div className="text-sm text-gray-600">Last Service</div>
                    <div className="font-medium">
                      {format(new Date(car.lastServiceDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleCreateServiceRequest}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Service Request
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Service Requests */}
          {serviceRequests.length > 0 && (
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <span>Recent Service Requests</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('services')}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceRequests.slice(0, 3).map((request) => {
                    const appointment = serviceRequestAppointments[request._id]
                    const displayStatus = appointment ? getAppointmentStatusLabel(appointment.status) : request.status
                    const statusColor = appointment ? getAppointmentStatusColor(appointment.status) : getServiceRequestStatusColor(request.status)

                    return (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewServiceRequest(request._id)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-gray-600">
                            {request.requestedServices.join(', ')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`${statusColor} text-xs`}>
                            {displayStatus}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          {/* Grid Layout: Main Gallery + Side Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Car Gallery - Main Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Car Photo Gallery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Car Photo Gallery ({car.gallery.length})
                    </div>
                    {car.gallery.length === 0 && (
                      <Button onClick={handleEditCar} size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Add Photos
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery
                    images={car.gallery}
                    columns={4}
                    showCaptions={true}
                    enableDownload={true}
                  />
                </CardContent>
              </Card>

              {/* Service Request Photos */}
              {Object.keys(serviceRequestPhotos).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Service Request Photos ({Object.values(serviceRequestPhotos).reduce((total, request) => total + request.photos.length, 0)})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {Object.values(serviceRequestPhotos).map((requestData: any) => (
                      <div key={requestData.requestId} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{requestData.title}</h4>
                            <p className="text-sm text-gray-600">
                              {format(new Date(requestData.createdAt), 'MMM dd, yyyy')} • {requestData.photos.length} photo{requestData.photos.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewServiceRequest(requestData.requestId)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Request
                          </Button>
                        </div>

                        <ImageGallery
                          images={requestData.photos}
                          columns={4}
                          showCaptions={true}
                          enableDownload={true}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Gallery Features - Side Section (Hidden on mobile) */}
            {car.gallery.length > 0 && (
              <div className="hidden lg:block">
                <Card className="sticky top-6">
                  <CardContent className="pt-6">
                    <GalleryFeatureDemo />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Empty State */}
          {car.gallery.length === 0 && Object.keys(serviceRequestPhotos).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No photos yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add photos to your car gallery or create service requests with photos to see them here
                </p>
                <div className="space-x-4">
                  <Button onClick={handleEditCar}>
                    <Camera className="h-4 w-4 mr-2" />
                    Add Car Photos
                  </Button>
                  <Button variant="outline" onClick={handleCreateServiceRequest}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Service History ({serviceRequests.length})
                </div>
                <Button onClick={handleCreateServiceRequest}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serviceRequests.length > 0 ? (
                <div className="space-y-4">
                  {serviceRequests.map((request) => {
                    const appointment = serviceRequestAppointments[request._id]
                    const displayStatus = appointment ? getAppointmentStatusLabel(appointment.status) : request.status
                    const statusColor = appointment ? getAppointmentStatusColor(appointment.status) : getServiceRequestStatusColor(request.status)

                    return (
                      <div
                        key={request._id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewServiceRequest(request._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{request.title}</h3>
                              <Badge className={`${statusColor} text-xs`}>
                                {displayStatus}
                              </Badge>
                              <Badge variant="outline" className={`${getPriorityColor(request.priority)} text-xs`}>
                                {request.priority}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                              Services: {request.requestedServices.join(', ')}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div>Created: {format(new Date(request.createdAt), 'MMM dd, yyyy')}</div>
                              <div>Expires: {format(new Date(request.expiresAt), 'MMM dd, yyyy')}</div>
                              {request.responseCount > 0 && (
                                <div>{request.responseCount} response{request.responseCount !== 1 ? 's' : ''}</div>
                              )}
                            </div>
                          </div>

                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No service requests yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating your first service request for this car
                  </p>
                  <Button onClick={handleCreateServiceRequest}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="h-4 w-4 text-primary" />
                  </div>
                  <span>Vehicle Specifications</span>
                </CardTitle>
                <Button onClick={handleEditCar} size="sm" variant="outline">
                  <Edit className="h-3 w-3 mr-2" />
                  Edit Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Car className="h-3 w-3" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-600 mb-0.5">Make</Label>
                      <div className="text-base font-semibold text-gray-900">{car.make}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-600 mb-0.5">Model</Label>
                      <div className="text-base font-semibold text-gray-900">{car.model}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-600 mb-0.5">Year</Label>
                      <div className="text-base font-semibold text-gray-900">{car.year}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-4 w-4 rounded-full border-2 border-primary" style={{backgroundColor: car.color.toLowerCase()}}></div>
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-600 mb-0.5">Color</Label>
                      <div className="text-base font-semibold text-gray-900 capitalize">{car.color}</div>
                    </div>
                  </div>

                  {car.licensePlate && (
                    <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-gray-600 mb-0.5">License Plate</Label>
                        <div className="text-base font-semibold text-gray-900 font-mono">{car.licensePlate}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div>
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-600 mb-0.5">Transmission</Label>
                      <div className="text-base font-semibold text-gray-900 capitalize">{car.transmission}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Fuel className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-600 mb-0.5">Fuel Type</Label>
                      <div className="text-base font-semibold text-gray-900 capitalize">{car.fuelType}</div>
                    </div>
                  </div>

                  {car.mileage && (
                    <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Gauge className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-gray-600 mb-0.5">Mileage</Label>
                        <div className="text-base font-semibold text-gray-900">{formatMileage(car.mileage)}</div>
                      </div>
                    </div>
                  )}

                  {car.engineSize && (
                    <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-gray-600 mb-0.5">Engine Size</Label>
                        <div className="text-base font-semibold text-gray-900">{car.engineSize}</div>
                      </div>
                    </div>
                  )}

                  {car.vin && (
                    <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 md:col-span-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-gray-600 mb-0.5">Vehicle Identification Number (VIN)</Label>
                        <div className="text-base font-semibold text-gray-900 font-mono tracking-wider">{car.vin}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              {car.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Additional Notes
                  </h3>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{car.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-6 border-t">
                <Button onClick={handleEditCar} className="shadow-lg hover:shadow-xl transition-all">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Car Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

// Helper functions
function getAppointmentStatusLabel(status: string): string {
  switch (status) {
    case 'requested': return 'Appointment Requested'
    case 'confirmed': return 'Appointment Confirmed'
    case 'scheduled': return 'Scheduled'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    default: return status
  }
}

function getAppointmentStatusColor(status: string): string {
  switch (status) {
    case 'requested': return 'bg-blue-100 text-blue-800'
    case 'confirmed': return 'bg-cyan-100 text-cyan-800'
    case 'scheduled': return 'bg-purple-100 text-purple-800'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800'
    case 'completed': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getServiceRequestStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'submitted': return 'bg-blue-100 text-blue-800'
    case 'quoted': return 'bg-purple-100 text-purple-800'
    case 'accepted': return 'bg-green-100 text-green-800'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'expired': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'border-red-300 text-red-700'
    case 'high': return 'border-orange-300 text-orange-700'
    case 'medium': return 'border-yellow-300 text-yellow-700'
    case 'low': return 'border-green-300 text-green-700'
    default: return 'border-gray-300 text-gray-700'
  }
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium text-gray-700 ${className}`}>{children}</div>
}