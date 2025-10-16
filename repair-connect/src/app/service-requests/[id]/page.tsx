'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Settings,
  Search,
  Image as ImageIcon,
  Play
} from 'lucide-react'
import { ServiceRequest } from '@/models/ServiceRequest'
import { CarProfile, getCarDisplayName } from '@/models/CarProfile'
import { format } from 'date-fns'
import { toast } from 'sonner'
import ImageViewer from '@/components/quotations/image-viewer'

interface ServiceRequestDetailPageProps {
  params: Promise<{
    id: string
  }>
}

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

function getStatusColor(status: string): string {
  // Handle appointment statuses
  switch (status) {
    case 'requested': return 'bg-blue-100 text-blue-800'
    case 'confirmed': return 'bg-cyan-100 text-cyan-800'
    case 'scheduled': return 'bg-purple-100 text-purple-800'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800'
    case 'completed': return 'bg-green-100 text-green-800'
    // Service request statuses
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'submitted': return 'bg-blue-100 text-blue-800'
    case 'quoted': return 'bg-purple-100 text-purple-800'
    case 'accepted': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'expired': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800'
    case 'high': return 'bg-orange-100 text-orange-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

interface TimelineItemProps {
  completed: boolean
  pending?: boolean
  title: string
  description: string
  date?: string
  disabled?: boolean
}

function TimelineItem({ completed, pending, title, description, date, disabled }: TimelineItemProps) {
  const isDisabled = !completed && !pending
  const showDate = (completed || pending) && date

  return (
    <div className={`relative flex items-start gap-3 pl-1 ${isDisabled ? 'opacity-40' : 'opacity-100'}`}>
      <div
        className={`relative z-10 w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border-2 ${
          completed
            ? 'bg-green-600 border-green-600'
            : pending
            ? 'bg-yellow-500 border-yellow-500 animate-pulse'
            : 'bg-gray-200 border-gray-300'
        }`}
      >
        {completed && (
          <CheckCircle className="h-4 w-4 text-white" />
        )}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${completed ? 'text-gray-900' : pending ? 'text-yellow-700' : 'text-gray-400'}`}>
          {title}
        </p>
        {showDate && (
          <p className={`text-xs mt-0.5 ${completed ? 'text-gray-600' : 'text-gray-400'}`}>
            {format(new Date(date), 'MMM dd, yyyy \'at\' hh:mm a')}
          </p>
        )}
        <p className={`text-sm mt-0.5 ${completed ? 'text-gray-600' : 'text-gray-400'}`}>
          {description}
        </p>
      </div>
    </div>
  )
}

export default function ServiceRequestDetailPage({ params }: ServiceRequestDetailPageProps) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)
  const [car, setCar] = useState<CarProfile | null>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user.role !== 'customer') {
      router.push('/')
      return
    }

    fetchServiceRequest()
  }, [session, status, router, resolvedParams.id])

  const fetchServiceRequest = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/service-requests/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setServiceRequest(data.data.serviceRequest)
        setCar(data.data.car)

        // Fetch appointment through quotations
        try {
          const quotationsResponse = await fetch(`/api/quotations?serviceRequestId=${resolvedParams.id}`)
          const quotationsData = await quotationsResponse.json()

          if (quotationsData.success && quotationsData.data.quotations.length > 0) {
            // Find accepted quotation
            const acceptedQuotation = quotationsData.data.quotations.find(
              (q: any) => q.status === 'accepted' || q.acceptedQuoteId
            )

            if (acceptedQuotation) {
              // Get appointment for this quotation
              const appointmentResponse = await fetch(`/api/appointments?quotationId=${acceptedQuotation._id}`)
              const appointmentData = await appointmentResponse.json()

              if (appointmentData.success && appointmentData.data.appointments.length > 0) {
                setAppointment(appointmentData.data.appointments[0])
              }
            }
          }
        } catch (error) {
          console.error('Error fetching appointment:', error)
        }
      } else {
        toast.error('Failed to load service request')
        router.push('/cars')
      }
    } catch (error) {
      console.error('Error fetching service request:', error)
      toast.error('An error occurred while loading the service request')
      router.push('/cars')
    } finally {
      setLoading(false)
    }
  }

  const handleGetQuotes = () => {
    if (serviceRequest && car) {
      // Redirect to quotation/workshop selection
      router.push(`/quotations/workshops?carId=${car._id}&serviceRequestId=${serviceRequest._id}`)
    }
  }

  const handleEditRequest = () => {
    if (serviceRequest) {
      router.push(`/service-requests/${serviceRequest._id}/edit`)
    }
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

  if (!serviceRequest || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Request Not Found</h1>
          <Button onClick={() => router.push('/cars')}>
            <Car className="h-4 w-4 mr-2" />
            Back to My Cars
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {serviceRequest.title}
            </h1>
            <Badge className={getStatusColor(appointment ? appointment.status : serviceRequest.status)}>
              {appointment ? getAppointmentStatusLabel(appointment.status) : serviceRequest.status}
            </Badge>
            <Badge className={getPriorityColor(serviceRequest.priority)}>
              {serviceRequest.priority} priority
            </Badge>
          </div>
          
          <p className="text-gray-600 mt-2">
            Service request for {getCarDisplayName(car)}
          </p>
        </div>
        
        <div className="flex gap-3">
          {serviceRequest.status === 'draft' && (
            <Button variant="outline" onClick={handleEditRequest}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Request
            </Button>
          )}
          
          {serviceRequest.status === 'submitted' && (
            <Button onClick={handleGetQuotes}>
              <Search className="h-4 w-4 mr-2" />
              Get Quotes from Workshops
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{serviceRequest.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requested Services</h4>
                <div className="flex flex-wrap gap-2">
                  {serviceRequest.requestedServices.map((service) => (
                    <Badge key={service} className="capitalize bg-black text-white hover:bg-black/90">
                      {service.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {serviceRequest.additionalNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-gray-700">{serviceRequest.additionalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Car Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {car.thumbnailUrl ? (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={car.thumbnailUrl}
                      alt={getCarDisplayName(car)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Car className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-lg">{getCarDisplayName(car)}</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Color: {car.color}</p>
                    {car.mileage && <p>Mileage: {car.mileage.toLocaleString()} km</p>}
                    {car.licensePlate && <p>License Plate: {car.licensePlate}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos & Videos */}
          {serviceRequest.photos && serviceRequest.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Photos & Videos ({serviceRequest.photos.length + (serviceRequest.videos?.length || 0)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Photos */}
                  {serviceRequest.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity group"
                      onClick={() => {
                        setSelectedImages(serviceRequest.photos.map(p => p.url))
                        setImageViewerOpen(true)
                      }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                          <p className="text-xs truncate">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Videos */}
                  {serviceRequest.videos?.map((video, index) => (
                    <div
                      key={video.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity group"
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      {video.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                          <p className="text-xs truncate">{video.caption}</p>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        VIDEO
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImages(serviceRequest.photos.map(p => p.url))
                      setImageViewerOpen(true)
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    View All Photos ({serviceRequest.photos.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline and Status Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6">
                {/* Connecting Line */}
                <div className="absolute left-[14px] top-3 bottom-3 w-0.5 bg-gray-200"></div>

                {/* Request Created */}
                <TimelineItem
                  completed={true}
                  title="Request Created"
                  date={new Date(serviceRequest.createdAt).toISOString()}
                  description="Service request was created"
                />

                {/* Request Submitted */}
                <TimelineItem
                  completed={serviceRequest.status !== 'draft'}
                  title="Request Submitted"
                  date={serviceRequest.status !== 'draft' ? new Date(serviceRequest.updatedAt).toISOString() : new Date(serviceRequest.createdAt).toISOString()}
                  description="Request sent to workshops for quotes"
                  pending={serviceRequest.status === 'draft'}
                />

                {/* Quotes Received */}
                <TimelineItem
                  completed={['quoted', 'accepted', 'in_progress', 'completed'].includes(serviceRequest.status)}
                  title="Quotes Received"
                  date={['quoted', 'accepted', 'in_progress', 'completed'].includes(serviceRequest.status) ? new Date(serviceRequest.updatedAt).toISOString() : new Date(serviceRequest.createdAt).toISOString()}
                  description="Workshops have submitted quotes"
                  pending={serviceRequest.status === 'submitted'}
                />

                {/* Quote Accepted */}
                <TimelineItem
                  completed={['accepted', 'in_progress', 'completed'].includes(serviceRequest.status)}
                  title="Quote Accepted"
                  date={['accepted', 'in_progress', 'completed'].includes(serviceRequest.status) ? new Date(serviceRequest.updatedAt).toISOString() : new Date(serviceRequest.createdAt).toISOString()}
                  description="You accepted a workshop quote"
                  pending={serviceRequest.status === 'quoted'}
                />

                {/* Appointment Scheduled */}
                <TimelineItem
                  completed={appointment !== null && ['scheduled', 'confirmed', 'in_progress', 'completed'].includes(appointment?.status)}
                  title="Appointment Scheduled"
                  date={appointment ? new Date(appointment.createdAt).toISOString() : new Date(serviceRequest.createdAt).toISOString()}
                  description="Service appointment confirmed"
                  pending={serviceRequest.status === 'accepted'}
                />

                {/* Service In Progress */}
                <TimelineItem
                  completed={serviceRequest.status === 'in_progress' || serviceRequest.status === 'completed'}
                  title="Service In Progress"
                  date={serviceRequest.status === 'in_progress' || serviceRequest.status === 'completed' ? new Date(serviceRequest.updatedAt).toISOString() : new Date(serviceRequest.createdAt).toISOString()}
                  description="Workshop is working on your vehicle"
                  pending={serviceRequest.status === 'accepted' && appointment !== null}
                />

                {/* Service Completed */}
                <TimelineItem
                  completed={serviceRequest.status === 'completed'}
                  title="Service Completed"
                  date={serviceRequest.status === 'completed' ? new Date(serviceRequest.updatedAt).toISOString() : new Date(serviceRequest.createdAt).toISOString()}
                  description="All services have been completed"
                  pending={serviceRequest.status === 'in_progress'}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Request Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {(appointment?.status === 'completed' || serviceRequest.status === 'completed') ? (
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                ) : (appointment?.status === 'in_progress' || serviceRequest.status === 'in_progress') ? (
                  <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                ) : serviceRequest.status === 'submitted' ? (
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                )}
                <p className="font-medium capitalize">
                  {appointment ? getAppointmentStatusLabel(appointment.status) : serviceRequest.status}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <Badge className={getPriorityColor(serviceRequest.priority)}>
                    {serviceRequest.priority}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact:</span>
                  <span className="capitalize">{serviceRequest.preferredContactMethod}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="text-sm">
                    {format(new Date(serviceRequest.expiresAt), 'MMM dd')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {serviceRequest.status === 'submitted' && (
                <Button onClick={handleGetQuotes} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Get Quotes from Workshops
                </Button>
              )}
              
              <Button onClick={() => router.push(`/cars/${car._id}`)} className="w-full bg-primary hover:bg-primary/90">
                <Car className="h-4 w-4 mr-2" />
                View Car Details
              </Button>

              <Button onClick={() => router.push('/quotations')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                <DollarSign className="h-4 w-4 mr-2" />
                My Quotations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Viewer */}
      <ImageViewer
        images={selectedImages}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        title="Service Request Photos"
      />
    </div>
  )
}