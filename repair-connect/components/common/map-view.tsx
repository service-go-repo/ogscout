'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Navigation, 
  Maximize2, 
  Minimize2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Workshop } from '@/models/Workshop'

interface MapViewProps {
  workshops: Workshop[]
  center?: [number, number] // [lng, lat]
  zoom?: number
  height?: string
  className?: string
  onWorkshopSelect?: (workshop: Workshop) => void
  selectedWorkshop?: Workshop
}

export default function MapView({
  workshops,
  center = [0, 0],
  zoom = 10,
  height = '400px',
  className = '',
  onWorkshopSelect,
  selectedWorkshop
}: MapViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Get user's current location
  const getUserLocation = () => {
    setIsLoadingLocation(true)
    setMapError(null)
    
    if (!navigator.geolocation) {
      setMapError('Geolocation is not supported by this browser')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ]
        setUserLocation(coords)
        setIsLoadingLocation(false)
      },
      (error) => {
        setMapError('Unable to get your location')
        setIsLoadingLocation(false)
      }
    )
  }

  useEffect(() => {
    getUserLocation()
  }, [])

  // For now, we'll create a placeholder map component
  // In a real implementation, you would integrate with Google Maps, Mapbox, or OpenStreetMap
  const renderPlaceholderMap = () => (
    <div 
      className="relative bg-gray-100 rounded-lg overflow-hidden"
      style={{ height }}
    >
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-gray-400">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white shadow-md"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={getUserLocation}
          disabled={isLoadingLocation}
          className="bg-white shadow-md"
        >
          {isLoadingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Workshop Markers */}
      <div className="absolute inset-0">
        {workshops.map((workshop, index) => {
          const isSelected = selectedWorkshop?._id === workshop._id
          // Calculate position based on coordinates (simplified)
          const left = `${20 + (index * 15) % 60}%`
          const top = `${30 + (index * 10) % 40}%`
          
          return (
            <div
              key={workshop._id?.toString()}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                isSelected ? 'scale-110 z-10' : 'hover:scale-105'
              }`}
              style={{ left, top }}
              onClick={() => onWorkshopSelect?.(workshop)}
            >
              <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                <MapPin 
                  className={`w-8 h-8 ${
                    isSelected 
                      ? 'text-blue-600 fill-blue-200' 
                      : 'text-red-600 fill-red-200'
                  } drop-shadow-lg`}
                />
                {workshop.isVerified && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              {/* Workshop Info Popup */}
              {isSelected && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-lg border p-3 z-20">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{workshop.profile.businessName}</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {workshop.contact.address.city}, {workshop.contact.address.state}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < Math.floor(workshop.stats.averageRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {workshop.stats.averageRating.toFixed(1)} ({workshop.stats.totalReviews})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {workshop.profile.specializations.serviceTypes.slice(0, 2).map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {workshop.profile.specializations.serviceTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{workshop.profile.specializations.serviceTypes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* User Location Marker */}
      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: '50%', top: '50%' }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full animate-ping opacity-75" />
          </div>
        </div>
      )}

      {/* Error Message */}
      {mapError && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{mapError}</span>
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
        Map placeholder - Integrate with real mapping service
      </div>
    </div>
  )

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {isFullscreen ? (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="h-full">
              {renderPlaceholderMap()}
            </div>
          </div>
        ) : (
          renderPlaceholderMap()
        )}
      </CardContent>
    </Card>
  )
}

// Compact map for cards
export function CompactMapView({
  workshop,
  height = '200px',
  className = ''
}: {
  workshop: Workshop
  height?: string
  className?: string
}) {
  return (
    <div 
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-gray-400">
            <defs>
              <pattern id="compact-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#compact-grid)" />
          </svg>
        </div>
      </div>

      {/* Workshop Marker */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <MapPin className="w-8 h-8 text-red-600 fill-red-200 drop-shadow-lg" />
          {workshop.isVerified && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
      </div>

      {/* Address */}
      <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1">
        <p className="text-xs text-gray-700 truncate">
          {workshop.contact.address.street}, {workshop.contact.address.city}
        </p>
      </div>
    </div>
  )
}
