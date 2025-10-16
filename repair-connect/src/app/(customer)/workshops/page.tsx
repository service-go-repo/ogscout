'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MapPin,
  Star,
  Filter,
  Grid,
  List,
  Loader2,
  Clock,
  Phone,
  Globe,
  Award,
  Users,
  ChevronDown,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react'
import { WorkshopSearchResult, WorkshopSearchFilters, getServiceTypeLabel, getCarBrandLabel, getDistanceLabel, getRatingColor } from '@/models/Workshop'
import WorkshopCard from '@/components/workshops/workshop-card'
import SearchFilters from '@/components/workshops/search-filters'
import { useQuoteRequestStore } from '@/stores/quoteRequestStore'
import { EnhancedCarServiceModal } from '@/components/quotations/enhanced-car-service-modal'

function WorkshopsPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [workshops, setWorkshops] = useState<WorkshopSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<WorkshopSearchFilters>({
    sortBy: 'rating',
    sortOrder: 'desc'
  })
  const [sortOption, setSortOption] = useState<'rating' | 'distance'>('rating')
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
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>(() => {
    // Restore selections from sessionStorage on mount
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('selectedWorkshopsDiscovery')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  // Store for modal and quote request flow
  const openCarSelection = useQuoteRequestStore((state) => state.openCarSelection)

  // Persist selected workshops to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedWorkshopsDiscovery', JSON.stringify(selectedWorkshops))
    }
  }, [selectedWorkshops])

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
          // Handle geolocation errors gracefully
          const errorMessages: Record<number, string> = {
            1: 'Location access denied by user',
            2: 'Location unavailable',
            3: 'Location request timeout'
          }

          console.warn(
            'Geolocation error:',
            errorMessages[error.code] || 'Unknown error',
            '- Proceeding without location'
          )

          // If location access is denied, still allow search without location
          setUserLocation(null)
          setLocationReady(true)
        },
        {
          enableHighAccuracy: false, // Don't require GPS, use network location
          timeout: 10000, // 10 second timeout
          maximumAge: 300000 // Accept cached location up to 5 minutes old
        }
      )
    } else {
      // Geolocation not supported
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
      // Replace all filters
      setFilters(newFilters as WorkshopSearchFilters)
    } else {
      // Merge with existing filters
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

  // Handle send quote requests - opens the car/service selection modal
  const handleSendQuoteRequests = () => {
    // Store selected workshops in sessionStorage so they persist through the modal flow
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingWorkshopSelections', JSON.stringify(selectedWorkshops))
    }
    // Open the car selection modal to start the quote request flow
    openCarSelection()
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Auto Repair Workshops</h1>
        <p className="text-gray-600">
          Discover trusted workshops near you for all your automotive needs
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search workshops, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none h-11 min-w-[100px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      <span>Search</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 sm:flex-none h-11 min-w-[100px]"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              userLocation={userLocation}
            />
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
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
                className="h-9"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedWorkshops.length === 0}
                className="h-9"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </>
          )}
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-9 px-3"
          >
            <Grid className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-9 px-3"
          >
            <List className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">List</span>
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : workshops.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops found</h3>
            <p className="text-gray-600 mb-4">
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
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {workshops.map((result, index) => {
              // Use userId (the user account ID) for workshop identification
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
                    // Only toggle selection if not clicking on a button or link
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
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
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
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Floating Action Bar - Appears when workshops are selected */}
      {selectedWorkshops.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm sm:text-base">
                    {selectedWorkshops.length} workshop{selectedWorkshops.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <Button
                onClick={handleSendQuoteRequests}
                size="lg"
                className="flex items-center gap-2"
              >
                Send Quote Requests
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Car Service Modal for quote request flow */}
      <EnhancedCarServiceModal />
    </div>
  )
}

export default function WorkshopsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <WorkshopsPageContent />
    </Suspense>
  )
}
