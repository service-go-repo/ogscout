// Google Maps integration utilities
// Add your Google Maps API key to .env.local as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

interface GoogleMapsConfig {
  apiKey: string
  libraries: string[]
}

interface GeocodeResult {
  address: string
  coordinates: [number, number]
  placeId: string
  components: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
}

interface PlaceAutocompleteResult {
  description: string
  placeId: string
  types: string[]
}

class GoogleMapsService {
  private apiKey: string
  private isLoaded: boolean = false

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  }

  // Load Google Maps JavaScript API
  async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded || !this.apiKey) {
      return
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Maps can only be loaded in browser'))
        return
      }

      // Check if already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true
        resolve()
        return
      }

      // Create script tag
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry`
      script.async = true
      script.defer = true

      script.onload = () => {
        this.isLoaded = true
        resolve()
      }

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps'))
      }

      document.head.appendChild(script)
    })
  }

  // Geocode address to coordinates
  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    await this.loadGoogleMaps()

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder()
      
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results) {
          const geocodeResults: GeocodeResult[] = results.map((result: any) => ({
            address: result.formatted_address,
            coordinates: [
              result.geometry.location.lng(),
              result.geometry.location.lat()
            ] as [number, number],
            placeId: result.place_id,
            components: this.parseAddressComponents(result.address_components)
          }))
          resolve(geocodeResults)
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(coordinates: [number, number]): Promise<GeocodeResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    await this.loadGoogleMaps()

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder()
      const latlng = new window.google.maps.LatLng(coordinates[1], coordinates[0])
      
      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === 'OK' && results) {
          const geocodeResults: GeocodeResult[] = results.map((result: any) => ({
            address: result.formatted_address,
            coordinates: [
              result.geometry.location.lng(),
              result.geometry.location.lat()
            ] as [number, number],
            placeId: result.place_id,
            components: this.parseAddressComponents(result.address_components)
          }))
          resolve(geocodeResults)
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`))
        }
      })
    })
  }

  // Get place autocomplete suggestions
  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    await this.loadGoogleMaps()

    return new Promise((resolve, reject) => {
      const service = new window.google.maps.places.AutocompleteService()
      
      service.getPlacePredictions(
        {
          input,
          types: ['establishment', 'geocode']
        },
        (predictions: any, status: any) => {
          if (status === 'OK' && predictions) {
            const results: PlaceAutocompleteResult[] = predictions.map((prediction: any) => ({
              description: prediction.description,
              placeId: prediction.place_id,
              types: prediction.types
            }))
            resolve(results)
          } else {
            reject(new Error(`Autocomplete failed: ${status}`))
          }
        }
      )
    })
  }

  // Get place details by place ID
  async getPlaceDetails(placeId: string): Promise<GeocodeResult> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    await this.loadGoogleMaps()

    return new Promise((resolve, reject) => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )
      
      service.getDetails(
        {
          placeId,
          fields: ['formatted_address', 'geometry', 'address_components']
        },
        (place: any, status: any) => {
          if (status === 'OK' && place && place.geometry) {
            const result: GeocodeResult = {
              address: place.formatted_address || '',
              coordinates: [
                place.geometry.location!.lng(),
                place.geometry.location!.lat()
              ] as [number, number],
              placeId,
              components: this.parseAddressComponents(place.address_components || [])
            }
            resolve(result)
          } else {
            reject(new Error(`Place details failed: ${status}`))
          }
        }
      )
    })
  }

  // Parse address components
  private parseAddressComponents(components: any[]) {
    const parsed: any = {}
    
    components.forEach(component => {
      const types = component.types
      
      if (types.includes('street_number') || types.includes('route')) {
        parsed.street = (parsed.street || '') + ' ' + component.long_name
      } else if (types.includes('locality')) {
        parsed.city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        parsed.state = component.long_name
      } else if (types.includes('country')) {
        parsed.country = component.long_name
      } else if (types.includes('postal_code')) {
        parsed.postalCode = component.long_name
      }
    })
    
    if (parsed.street) {
      parsed.street = parsed.street.trim()
    }
    
    return parsed
  }

  // Initialize map
  async initializeMap(
    container: HTMLElement,
    center: [number, number],
    zoom: number = 15
  ): Promise<any> {
    await this.loadGoogleMaps()

    const map = new window.google.maps.Map(container, {
      center: { lat: center[1], lng: center[0] },
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    })

    return map
  }

  // Add marker to map
  addMarker(
    map: any,
    position: [number, number],
    title?: string,
    draggable: boolean = false
  ): any {
    const marker = new window.google.maps.Marker({
      position: { lat: position[1], lng: position[0] },
      map,
      title,
      draggable
    })

    return marker
  }

  // Calculate distance between two points
  calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(point2[1] - point1[1])
    const dLon = this.toRadians(point2[0] - point1[0])
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(point1[1])) * Math.cos(this.toRadians(point2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService()

// Export types
export type {
  GeocodeResult,
  PlaceAutocompleteResult,
  GoogleMapsConfig
}

// Extend window object for TypeScript
declare global {
  interface Window {
    google: any
  }
}
