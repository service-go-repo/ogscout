'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Car, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react'

interface ServiceRequest {
  _id: string
  carId: string
  carInfo: {
    make: string
    model: string
    year: number
  }
  status: 'draft' | 'submitted' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  description: string
  estimatedCost?: number
  workshopName?: string
  createdAt: string
  updatedAt: string
}

export default function ServiceRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'customer') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Fetch service requests (placeholder for now)
  useEffect(() => {
    async function fetchRequests() {
      if (!session?.user?.id) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // TODO: Replace with actual API call
        // const response = await fetch('/api/requests')
        // For now, return empty array
        setRequests([])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service requests')
        console.error('Error fetching requests:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchRequests()
    }
  }, [session?.user?.id])

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'outline'
      case 'submitted': return 'default'
      case 'quoted': return 'secondary'
      case 'accepted': return 'default'
      case 'in_progress': return 'default'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'submitted': return <FileText className="w-3 h-3" />
      case 'quoted': return <DollarSign className="w-3 h-3" />
      case 'accepted': return <CheckCircle className="w-3 h-3" />
      case 'in_progress': return <AlertCircle className="w-3 h-3" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'cancelled': return <AlertCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
            <p className="mt-2 text-gray-600">
              Track your repair requests and communicate with workshops
            </p>
          </div>
          <Button asChild>
            <Link href="/cars">
              <Plus className="w-4 h-4 mr-2" />
              Request Service
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
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
        {!isLoading && !error && requests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No service requests yet
              </h3>
              <p className="text-gray-600 mb-6">
                Register a car to start requesting repair services from workshops.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild variant="outline">
                  <Link href="/cars">
                    <Car className="w-4 h-4 mr-2" />
                    View My Cars
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/cars/register">
                    <Plus className="w-4 h-4 mr-2" />
                    Register New Car
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Requests List */}
        {!isLoading && !error && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {request.carInfo.year} {request.carInfo.make} {request.carInfo.model}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 text-sm mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </span>
                        {request.workshopName && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{request.workshopName}</span>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(request.status)} className="flex items-center space-x-1">
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 mb-4">{request.description}</p>
                  
                  {request.estimatedCost && (
                    <div className="flex items-center space-x-2 mb-4">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        Estimated Cost: ${request.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/requests/${request._id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    {request.status === 'quoted' && (
                      <Button size="sm">
                        Accept Quote
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!isLoading && !error && requests.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{requests.length}</div>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {requests.filter(req => req.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {requests.filter(req => req.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {requests.filter(req => req.status === 'quoted').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting Response</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}