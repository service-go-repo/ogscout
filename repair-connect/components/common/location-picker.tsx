'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface LocationPickerProps {
  initialLocation?: {
    coordinates: [number, number]
    address?: string
  }
  onLocationSelect: (location: {
    coordinates: [number, number]
    address: string
  }) => void
  disabled?: boolean
}

export default function LocationPicker({
  initialLocation,
  onLocationSelect,
  disabled = false
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)

  // Initialize map (placeholder for Google Maps)
  useEffect(() => {
    if (!mapRef.current) return

    // TODO: Initialize Google Maps here when API key is available
    // For now, we'll use a placeholder
    const initMap = () => {
      // Placeholder map initialization
      console.log('Map would be initialized here with Google Maps API')
    }

    initMap()
  }, [])

  // Geocoding function (placeholder)
  const geocodeAddress = async (address: string) => {
    setIsSearching(true)
    try {
      // TODO: Use Google Maps Geocoding API when available
      // For now, we'll use a mock response for Dubai locations
      
      const mockResults = [
        {
          address: 'Ras Al Khor Industrial Area 2, Dubai, UAE',
          coordinates: [55.3781, 25.1772] as [number, number],
          placeId: 'mock-1'
        },
        {
          address: 'International City, Dubai, UAE', 
          coordinates: [55.4167, 25.1667] as [number, number],
          placeId: 'mock-2'
        },
        {
          address: 'Dubai Marina, Dubai, UAE',
          coordinates: [55.1406, 25.0769] as [number, number],
          placeId: 'mock-3'
        }
      ].filter(result => 
        result.address.toLowerCase().includes(address.toLowerCase())
      )

      setSuggestions(mockResults)
    } catch (error) {
      console.error('Geocoding error:', error)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }


  // Handle location selection
  const handleLocationSelect = (location: {
    coordinates: [number, number]
    address: string
  }) => {
    setSelectedLocation(location)
    onLocationSelect(location)
    setSuggestions([])
    setSearchQuery('')
  }

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ]
          
          // TODO: Reverse geocode to get address
          const address = `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`
          
          handleLocationSelect({
            coordinates: coords,
            address: address
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Workshop Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <div className="space-y-2">
          <Label htmlFor="location-search">Search for your workshop location</Label>
          <div className="flex gap-2">
            <Input
              id="location-search"
              type="text"
              placeholder="Enter address, city, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (searchQuery.trim()) {
                    geocodeAddress(searchQuery)
                  }
                }
              }}
              disabled={disabled}
            />
            <Button 
              type="button" 
              onClick={() => {
                if (searchQuery.trim()) {
                  geocodeAddress(searchQuery)
                }
              }}
              disabled={disabled || isSearching}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Current Location Button */}
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={disabled}
          className="w-full"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Use Current Location
        </Button>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <Label>Search Results:</Label>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleLocationSelect({
                    coordinates: suggestion.coordinates,
                    address: suggestion.address
                  })}
                  disabled={disabled}
                >
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-left">{suggestion.address}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Location */}
        {selectedLocation && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Selected Location:</p>
                <p className="text-sm text-green-700">{selectedLocation.address}</p>
                <p className="text-xs text-green-600">
                  Coordinates: {selectedLocation.coordinates[1].toFixed(4)}, {selectedLocation.coordinates[0].toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map Placeholder */}
        <div className="space-y-2">
          <Label>Map Preview:</Label>
          <div 
            ref={mapRef}
            className="w-full h-64 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Map will appear here</p>
              <p className="text-xs">Google Maps integration ready</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Search for your workshop address or use current location</p>
          <p>• Click on search results to select a location</p>
          <p>• Google Maps integration can be added with API key</p>
        </div>
      </CardContent>
    </Card>
  )
}
