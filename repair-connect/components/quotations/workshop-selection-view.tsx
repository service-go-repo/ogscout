'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MapPin,
  Filter,
  Grid,
  List,
  Loader2,
  ChevronDown,
  CheckCircle,
  ArrowRight,
  X,
  ArrowLeft,
} from 'lucide-react'
import { WorkshopSearchResult, WorkshopSearchFilters } from '@/models/Workshop'
import WorkshopCard from '@/components/workshops/workshop-card'
import SearchFilters from '@/components/workshops/search-filters'
import { useQuoteRequestStore } from '@/stores/quoteRequestStore'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

/**
 * Workshop Selection View - Step 3 of quote request flow
 *
 * Displays workshops in a modal for users to select and send bulk quote requests
 */
export function WorkshopSelectionView() {
  const router = useRouter()

  // Zustand store
  const selectedCar = useQuoteRequestStore((state) => state.selectedCar)
  const selectedService = useQuoteRequestStore((state) => state.selectedService)
  const openServiceSelection = useQuoteRequestStore((state) => state.openServiceSelection)
  const closeModal = useQuoteRequestStore((state) => state.closeModal)

  // Workshop search state
  const [workshops, setWorkshops] = useState<WorkshopSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<WorkshopSearchFilters>({
    sortBy: 'rating',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationReady, setLocationReady] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Multi-selection state
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([])

  // Sending state
  const [isSending, setIsSending] = useState(false)

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ]
          setUserLocation(coords)

          // Set default location filter if not already set
          setFilters(prev => ({
            ...prev,
            location: {
              coordinates: coords,
              radius: 25 // Default 25km radius
            }
          }))

          setLocationReady(true)
        },
        (error) => {
          console.warn('Geolocation error - Proceeding without location')
          setUserLocation(null)
          setLocationReady(true)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    } else {
      console.warn('Geolocation not supported by browser')
      setUserLocation(null)
      setLocationReady(true)
    }
  }, [])

  // Search workshops
  const searchWorkshops = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/workshops/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          filters,
          page,
          limit: pagination.limit
        })
      })

      if (!response.ok) {
        throw new Error('Failed to search workshops')
      }

      const data = await response.json()

      if (data.success) {
        setWorkshops(data.data)
        setPagination(data.pagination)
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Error searching workshops:', error)
      toast.error('Failed to load workshops')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial search - only run after location is determined or rejected
  useEffect(() => {
    if (locationReady) {
      searchWorkshops()
    }
  }, [filters, locationReady])

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchWorkshops(1)
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<WorkshopSearchFilters>, replace = false) => {
    if (replace) {
      setFilters(newFilters as WorkshopSearchFilters)
    } else {
      setFilters(prev => ({ ...prev, ...newFilters }))
    }
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    searchWorkshops(newPage)
  }

  // Handle workshop selection toggle
  const handleWorkshopToggle = (workshopId: string) => {
    setSelectedWorkshops((prev) =>
      prev.includes(workshopId)
        ? prev.filter((id) => id !== workshopId)
        : [...prev, workshopId]
    )
  }

  // Handle select all workshops on current page
  const handleSelectAll = () => {
    const allWorkshopIds = workshops.map(
      (result) => result.workshop.userId?.toString() || result.workshop._id!.toString()
    )
    setSelectedWorkshops(allWorkshopIds)
  }

  // Handle deselect all
  const handleDeselectAll = () => {
    setSelectedWorkshops([])
  }

  // Handle send quote requests
  const handleSendQuoteRequests = async () => {
    if (!selectedCar || !selectedService) {
      toast.error('Please select a car and service first')
      return
    }

    if (selectedWorkshops.length === 0) {
      toast.error('Please select at least one workshop')
      return
    }

    setIsSending(true)

    try {
      // Fetch workshop details to get names
      const workshopsResponse = await fetch('/api/workshops?limit=100')
      const workshopsData = await workshopsResponse.json()

      const workshopNames: Record<string, string> = {}
      if (workshopsData.success && workshopsData.data) {
        const allWorkshops = Array.isArray(workshopsData.data) ? workshopsData.data : []

        // Filter out workshops without valid IDs
        const validWorkshops = allWorkshops.filter((w: any) => w?.userId || w?._id)

        selectedWorkshops.forEach((workshopId) => {
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

      // Send bulk requests
      const { sendBulkQuoteRequests } = await import('@/lib/quoteRequestHelpers')

      const result = await sendBulkQuoteRequests(
        selectedWorkshops,
        workshopNames,
        selectedCar,
        {
          damageDescription: selectedService.description || `Quote request for service: ${selectedService.requestedServices?.join(', ')}`,
          requestedServices: selectedService.requestedServices || ['repair'],
          urgency: selectedService.priority === 'urgent' ? 'urgent' : 'medium',
          sourceServiceRequestId: selectedService._id,
        }
      )

      if (result.success > 0) {
        toast.success(`Successfully sent ${result.success} quote request${result.success > 1 ? 's' : ''}`)

        // Close modal and navigate to quotations page
        closeModal()
        router.push('/quotations')
      } else {
        toast.error('Failed to send quote requests')
      }
    } catch (error) {
      console.error('Error sending quote requests:', error)
      toast.error('Failed to send quote requests')
    } finally {
      setIsSending(false)
    }
  }

  // Handle back button
  const handleBack = () => {
    openServiceSelection()
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(90vh-2rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Select Workshops</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose one or more workshops to receive your quote request
            </p>
          </div>
        </div>

        {/* Selected Car & Service Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            <span className="font-medium">Car:</span>&nbsp;
            {selectedCar?.make} {selectedCar?.model} ({selectedCar?.year})
          </Badge>
          <Badge variant="outline" className="text-xs">
            <span className="font-medium">Service:</span>&nbsp;
            {selectedService?.requestedServices?.join(', ') || 'Repair'}
          </Badge>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search workshops, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              userLocation={userLocation}
            />
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex-shrink-0 border-b px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground font-medium">
              {pagination.total} workshop{pagination.total !== 1 ? 's' : ''} found
            </p>
            {filters.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Within {filters.location.radius}km
              </Badge>
            )}
            {selectedWorkshops.length > 0 && (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {selectedWorkshops.length} selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {workshops.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedWorkshops.length === workshops.length}
                  className="h-8 text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedWorkshops.length === 0}
                  className="h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </>
            )}
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-2"
            >
              <Grid className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-2"
            >
              <List className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : workshops.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No workshops found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or expanding your search radius
              </p>
              <Button onClick={() => {
                setSearchQuery('')
                setFilters({ sortBy: 'rating', sortOrder: 'desc' })
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1'
            }`}>
              {workshops.map((result, index) => {
                const workshopUserId = result.workshop.userId?.toString() || result.workshop._id!.toString()
                const workshopProfileId = result.workshop._id!.toString()
                const isSelected = selectedWorkshops.includes(workshopUserId)

                return (
                  <div
                    key={`workshop-${workshopProfileId}-${index}`}
                    className={`relative cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      const isClickingButton = target.closest('button') || target.closest('a')
                      if (!isClickingButton) {
                        handleWorkshopToggle(workshopUserId)
                      }
                    }}
                  >
                    <WorkshopCard
                      workshop={result.workshop}
                      distance={result.distance}
                      isOpen={result.isOpen}
                      viewMode={viewMode}
                    />

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1.5 pointer-events-none z-10">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with Send Button */}
      <div className="flex-shrink-0 border-t p-4 sm:p-6 bg-muted/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm sm:text-base">
              {selectedWorkshops.length} workshop{selectedWorkshops.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <Button
            onClick={handleSendQuoteRequests}
            disabled={selectedWorkshops.length === 0 || isSending}
            size="lg"
            className="flex items-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Quote Requests
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
