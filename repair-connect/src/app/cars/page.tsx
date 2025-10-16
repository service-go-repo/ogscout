'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageWithFallback from '@/components/common/ImageWithFallback'
import { getImageWithFallback, DEFAULT_PLACEHOLDERS } from '@/lib/imageStorage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Car,
  Upload,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Activity,
  Search
} from 'lucide-react'
import { CarProfileSummary } from '@/models/CarProfile'

interface CarsResponse {
  success: boolean
  data: {
    cars: CarProfileSummary[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

// Component to display car image with fallback
function CarImageDisplay({ car }: { car: CarProfileSummary }) {
  // If no thumbnail URL, show "No Image" text
  if (!car.thumbnailUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-gray-500 text-sm">No Image</span>
      </div>
    )
  }
  
  // Use thumbnailUrl for the new CarProfileSummary structure
  const imageData = getImageWithFallback(
    car.thumbnailUrl, 
    car._id?.toString() || '', 
    '', // No publicId in summary
    'car'
  )
  
  return (
    <ImageWithFallback
      src={imageData.cloudinaryUrl || imageData.fallbackUrl}
      localPath={imageData.localPath}
      fallbackSrc={imageData.fallbackUrl}
      alt={`${car.make} ${car.model}`}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

export default function MyCarsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cars, setCars] = useState<CarProfileSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'customer') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Fetch user's cars
  useEffect(() => {
    async function fetchCars() {
      if (!session?.user?.id) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/cars')
        if (!response.ok) {
          throw new Error('Failed to fetch cars')
        }
        
        const data: CarsResponse = await response.json()
        setCars(data.data.cars || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cars')
        console.error('Error fetching cars:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchCars()
    }
  }, [session?.user?.id])

  // Handle car deletion
  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete car')
      }

      // Remove car from local state
      setCars(cars.filter(car => car._id?.toString() !== carId))
    } catch (err) {
      alert('Failed to delete car. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  // Get status badge variant
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active': return 'default'
      case 'archived': return 'outline'
      default: return 'default'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-3 h-3" />
      case 'archived': return <CheckCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  // Filter cars based on search query
  const filteredCars = cars.filter((car) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      car.make?.toLowerCase().includes(query) ||
      car.model?.toLowerCase().includes(query) ||
      car.year?.toString().includes(query) ||
      car.color?.toLowerCase().includes(query) ||
      car.nickname?.toLowerCase().includes(query)
    )
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'customer') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Cars</h1>
            <p className="mt-2 text-gray-600">
              Manage your vehicles and track repair requests
            </p>
          </div>
          <Button asChild>
            <Link href="/cars/register">
              <Plus className="w-4 h-4 mr-2" />
              Register New Car
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        {!isLoading && !error && cars.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by make, model, year, color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && cars.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4">
                <ImageWithFallback
                  src={DEFAULT_PLACEHOLDERS.car}
                  alt="No cars"
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No cars yet
              </h3>
              <p className="text-gray-600 mb-6">
                Register your first car to get started with service requests and repair management.
              </p>
              <Button asChild>
                <Link href="/cars/register">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your First Car
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        {!isLoading && !error && cars.length > 0 && (
          <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Cars</p>
                    <div className="text-3xl font-bold">{cars.length}</div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 hover:border-green-300 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
                    <div className="text-3xl font-bold text-green-600">
                      {cars.filter(car => car.status === 'active').length}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Service Requests</p>
                    <div className="text-3xl font-bold text-primary">
                      {cars.reduce((total, car) => total + car.totalServiceRequests, 0)}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">With Service History</p>
                    <div className="text-3xl font-bold text-primary">
                      {cars.filter(car => car.totalServiceRequests > 0).length}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cars Grid */}
        {!isLoading && !error && cars.length > 0 && (
          <>
            {filteredCars.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No cars found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No cars match your search criteria. Try adjusting your search.
                  </p>
                  <Button onClick={() => setSearchQuery('')} variant="outline">
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
              <Card key={car._id?.toString()} className="hover:shadow-lg transition-shadow">
                {/* Car Image */}
                <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  <CarImageDisplay car={car} />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={getStatusVariant(car.status)} className="flex items-center space-x-1">
                      {getStatusIcon(car.status)}
                      <span className="capitalize">{car.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>

                {/* Car Details */}
                <CardHeader>
                  <CardTitle className="text-lg">
                    {car.year} {car.make} {car.model}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </span>
                    {car.color && (
                      <span className="flex items-center space-x-1">
                        <span className="w-3 h-3 rounded-full border" style={{backgroundColor: car.color.toLowerCase()}}></span>
                        <span>{car.color}</span>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Car Info */}
                  {car.nickname && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{car.nickname}</span>
                      </p>
                    </div>
                  )}

                  {/* Service Requests */}
                  {car.totalServiceRequests > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {car.totalServiceRequests} service request{car.totalServiceRequests !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button size="sm" asChild className="flex-1">
                      <Link href={`/cars/${car._id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/cars/${car._id}/edit`}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCar(car._id?.toString() || '')}
                      disabled={isDeleting === car._id?.toString()}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {isDeleting === car._id?.toString() ? (
                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}