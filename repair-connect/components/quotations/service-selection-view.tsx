'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DialogHeader, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Wrench,
  Clock,
  AlertTriangle,
  Package,
  Plus,
} from 'lucide-react'
import { useQuoteRequestStore, ServiceRequest } from '@/stores/quoteRequestStore'
import { toast } from 'sonner'

/**
 * Service Selection View - Step 2 of Enhanced Quote Request Flow
 *
 * Displays services for the selected car (filtered by status)
 * Allows service selection and navigation to workshop selection
 */
export function ServiceSelectionView() {
  const router = useRouter()

  const selectedCar = useQuoteRequestStore((state) => state.selectedCar)
  const setSelectedService = useQuoteRequestStore((state) => state.setSelectedService)
  const openCarSelection = useQuoteRequestStore((state) => state.openCarSelection)
  const openServiceRequest = useQuoteRequestStore((state) => state.openServiceRequest)
  const openWorkshopSelection = useQuoteRequestStore((state) => state.openWorkshopSelection)
  const closeModal = useQuoteRequestStore((state) => state.closeModal)

  const [services, setServices] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [pendingWorkshopCount, setPendingWorkshopCount] = useState(0)

  /**
   * Check for pending workshop selections on mount
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pending = sessionStorage.getItem('pendingWorkshopSelections')
      if (pending) {
        try {
          const workshopIds = JSON.parse(pending) as string[]
          setPendingWorkshopCount(workshopIds.length)
        } catch (e) {
          console.error('Error parsing pending workshops:', e)
        }
      }
    }
  }, [])

  /**
   * Fetch services for selected car on mount
   */
  useEffect(() => {
    if (selectedCar) {
      fetchServices()
    }
  }, [selectedCar])

  const fetchServices = async () => {
    if (!selectedCar?._id) {
      setError('No car selected')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all services (set high limit to avoid pagination)
      const response = await fetch(`/api/cars/${selectedCar._id}/service-requests?limit=100`)
      const data = await response.json()

      if (data.success && data.data?.serviceRequests) {
        const serviceRequests = Array.isArray(data.data.serviceRequests)
          ? data.data.serviceRequests
          : []

        // Filter services by status: created, submitted, quoted
        const filteredServices = serviceRequests.filter((service: ServiceRequest) => {
          const status = service.status.toLowerCase()
          return status === 'created' || status === 'submitted' || status === 'quoted'
        })

        setServices(filteredServices)

        if (filteredServices.length === 0) {
          setError('no_services')
        }
      } else {
        setError('Failed to load services')
      }
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Failed to load services. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle service selection and navigate to workshop selection
   */
  const handleServiceSelect = (service: ServiceRequest) => {
    setSelectedServiceId(service._id)
  }

  /**
   * Handle continue to workshops
   */
  const handleContinueToWorkshops = async () => {
    if (!selectedServiceId) {
      toast.error('Please select a service')
      return
    }

    const service = services.find((s) => s._id === selectedServiceId)
    if (!service) {
      toast.error('Service not found')
      return
    }

    setIsNavigating(true)

    try {
      // Store selected service in Zustand
      setSelectedService(service)

      // Check if there are pre-selected workshops from discovery page or workshop details page
      const pendingWorkshops = typeof window !== 'undefined'
        ? sessionStorage.getItem('pendingWorkshopSelections')
        : null

      if (pendingWorkshops) {
        try {
          // User came from workshop discovery page or workshop details page with pre-selected workshops
          // Send quote requests directly instead of navigating to Step 3
          const workshopIds = JSON.parse(pendingWorkshops) as string[]

          if (workshopIds.length > 0) {
            // Fetch workshop details to build workshop names map
            const workshopsResponse = await fetch('/api/workshops?limit=100')
            const workshopsData = await workshopsResponse.json()

            const workshopNames: Record<string, string> = {}
            if (workshopsData.success && workshopsData.data) {
              const workshops = Array.isArray(workshopsData.data) ? workshopsData.data : []

              // Filter out workshops without valid IDs
              const validWorkshops = workshops.filter((w: any) => w?.userId || w?._id)

              workshopIds.forEach((workshopId) => {
                const workshop = validWorkshops.find((w: any) => {
                  const wUserId = w.userId?.toString()
                  const wId = w._id?.toString()
                  return (wUserId === workshopId) || (wId === workshopId)
                })

                if (workshop) {
                  workshopNames[workshopId] = workshop.profile?.businessName || 'Unknown Workshop'
                }
              })
            }

            // Import and use the bulk quote request helper
            const { sendBulkQuoteRequests } = await import('@/lib/quoteRequestHelpers')

            const result = await sendBulkQuoteRequests(
              workshopIds,
              workshopNames,
              selectedCar!,
              {
                damageDescription: service.description || `Quote request for service: ${service.requestedServices?.join(', ')}`,
                requestedServices: service.requestedServices || ['repair'],
                urgency: service.priority === 'urgent' ? 'high' : 'medium',
                sourceServiceRequestId: service._id,
              }
            )

            if (result.success > 0) {
              // Clear pending workshop selections
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('pendingWorkshopSelections')
                sessionStorage.removeItem('selectedWorkshopsDiscovery')
              }

              // Close modal and navigate to quotations page
              closeModal()
              router.push('/quotations')
            } else {
              // If sending failed, show error but don't navigate to Step 3
              toast.error('Failed to send quote requests. Please try again.')
            }
            return
          }
        } catch (error) {
          console.error('Error processing pre-selected workshops:', error)
          toast.error('Failed to process quote requests. Please try again.')
          return
        }
      }

      // No pre-selected workshops: Navigate to workshop selection view inside modal (Step 3)
      openWorkshopSelection()
    } catch (err) {
      console.error('Navigation error:', err)
      toast.error('Failed to process request. Please try again.')
    } finally {
      setIsNavigating(false)
    }
  }

  /**
   * Handle back to car selection
   */
  const handleBack = () => {
    openCarSelection()
  }

  /**
   * Get service display name
   */
  const getServiceName = (service: ServiceRequest) => {
    if (service.requestedServices && service.requestedServices.length > 0) {
      return service.requestedServices.join(', ')
    }
    return 'Service Request'
  }

  /**
   * Get service status badge
   */
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()

    const statusConfig = {
      created: { label: 'Request Created', variant: 'secondary' as const, icon: Package },
      submitted: { label: 'Request Submitted', variant: 'default' as const, icon: Clock },
      quoted: { label: 'Quotes Received', variant: 'default' as const, icon: CheckCircle2 },
    }

    const config = statusConfig[statusLower as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
      icon: AlertTriangle,
    }

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  /**
   * Get car display name
   */
  const getCarName = () => {
    if (!selectedCar) return ''
    const year = (selectedCar as any).year || (selectedCar as any).basicInfo?.year
    const make = (selectedCar as any).make || (selectedCar as any).basicInfo?.make
    const model = (selectedCar as any).model || (selectedCar as any).basicInfo?.model
    return `${year} ${make} ${model}`.trim()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="px-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              Select a Service
            </h2>
            <DialogDescription className="text-base mt-1">
              For {getCarName()}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        )}

        {/* Error State - No Services */}
        {!isLoading && error === 'no_services' && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Service Requests</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                This car doesn't have any service requests in progress. Create a new service
                request to get quotes from workshops!
              </p>
              <div className="flex gap-3">
                <Button onClick={openServiceRequest}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Service Request
                </Button>
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Cars
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State - Generic */}
        {!isLoading && error && error !== 'no_services' && (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Services</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex gap-3">
                <Button onClick={fetchServices}>Try Again</Button>
                <Button variant="outline" onClick={handleBack}>
                  Back to Cars
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services List */}
        {!isLoading && !error && services.length > 0 && (
          <div className="space-y-3">
            {services.map((service) => {
              const serviceName = getServiceName(service)
              const isSelected = selectedServiceId === service._id
              const createdDate = new Date(service.createdAt).toLocaleDateString()

              return (
                <Card
                  key={service._id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-2 bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Service Icon */}
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-6 h-6 text-primary" />
                      </div>

                      {/* Service Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-base line-clamp-1">
                            {serviceName}
                          </h3>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>

                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {service.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {getStatusBadge(service.status)}
                          {service.priority && (
                            <Badge variant="outline" className="capitalize">
                              {service.priority} Priority
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-xs">
                            Created {createdDate}
                          </span>
                        </div>
                      </div>

                      {/* Action Icon */}
                      <ArrowRight
                        className={`w-5 h-5 flex-shrink-0 transition-transform mt-1 ${
                          isSelected ? 'text-primary translate-x-1' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && !error && services.length > 0 && (
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={openServiceRequest}
                disabled={isNavigating}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </div>
            <Button
              onClick={handleContinueToWorkshops}
              disabled={!selectedServiceId || isNavigating}
              size="lg"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {pendingWorkshopCount > 0 ? 'Sending Requests...' : 'Loading...'}
                </>
              ) : pendingWorkshopCount > 0 ? (
                <>
                  Send Quote Requests ({pendingWorkshopCount})
                </>
              ) : (
                <>
                  Continue to Workshops
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
