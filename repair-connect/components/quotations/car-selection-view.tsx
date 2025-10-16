'use client'

import { useState, useEffect } from 'react'
import { DialogHeader, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car as CarIcon, Loader2, AlertCircle, CheckCircle2, ArrowRight, Plus } from 'lucide-react'
import { useQuoteRequestStore } from '@/stores/quoteRequestStore'
import { Car } from '@/models/Car'
import { toast } from 'sonner'

/**
 * Car Selection View - Step 1 of Enhanced Quote Request Flow
 *
 * Displays user's registered cars and allows selection
 * On selection, fetches services for that car and transitions to service selection
 */
export function CarSelectionView() {
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)

  const setSelectedCar = useQuoteRequestStore((state) => state.setSelectedCar)
  const openServiceSelection = useQuoteRequestStore((state) => state.openServiceSelection)
  const openCarRegistration = useQuoteRequestStore((state) => state.openCarRegistration)
  const closeModal = useQuoteRequestStore((state) => state.closeModal)

  /**
   * Fetch user's cars on mount
   */
  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all cars (set high limit to avoid pagination)
      const response = await fetch('/api/cars?limit=100')
      const data = await response.json()

      if (data.success && data.data?.cars) {
        const cars = Array.isArray(data.data.cars) ? data.data.cars : []
        setCars(cars)

        if (cars.length === 0) {
          setError('no_cars')
        }
      } else {
        setError('Failed to load cars')
      }
    } catch (err) {
      console.error('Error fetching cars:', err)
      setError('Failed to load cars. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle car selection and transition to service selection
   */
  const handleCarSelect = (car: Car) => {
    setSelectedCarId(car._id!.toString())

    // Small delay for visual feedback
    setTimeout(() => {
      setSelectedCar(car)
      openServiceSelection()
    }, 150)
  }

  /**
   * Get car display name
   */
  const getCarName = (car: Car) => {
    const year = (car as any).year || (car as any).basicInfo?.year
    const make = (car as any).make || (car as any).basicInfo?.make
    const model = (car as any).model || (car as any).basicInfo?.model
    return `${year} ${make} ${model}`.trim()
  }

  /**
   * Get car details
   */
  const getCarDetails = (car: Car) => {
    const licensePlate = (car as any).licensePlate || (car as any).basicInfo?.licensePlate
    const color = (car as any).color || (car as any).basicInfo?.color
    return { licensePlate, color }
  }

  /**
   * Get car thumbnail
   */
  const getCarThumbnail = (car: Car) => {
    return (car as any).thumbnailUrl || (car as any).gallery?.[0]?.url
  }

  return (
    <div className="flex flex-col overflow-y-auto h-full">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <h2 className="text-2xl font-bold">
          Select Your Car
        </h2>
        <DialogDescription className="text-base">
          Choose the car you need service for
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your cars...</p>
          </div>
        )}

        {/* Error State - No Cars */}
        {!isLoading && error === 'no_cars' && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CarIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Cars Registered</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You need to register at least one car before requesting quotes. Register your car now to get started!
              </p>
              <div className="flex gap-3">
                <Button onClick={openCarRegistration}>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your First Car
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State - Generic */}
        {!isLoading && error && error !== 'no_cars' && (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Cars</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchCars}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Cars Grid */}
        {!isLoading && !error && cars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cars.map((car) => {
              const carName = getCarName(car)
              const { licensePlate, color } = getCarDetails(car)
              const thumbnail = getCarThumbnail(car)
              const carId = car._id!.toString()
              const isSelected = selectedCarId === carId

              return (
                <Card
                  key={carId}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-2 bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleCarSelect(car)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-3">
                      {/* Car Thumbnail */}
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted relative">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={carName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CarIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Car Details */}
                      <div className="w-full">
                        <h3 className="font-semibold text-base mb-2 truncate">
                          {carName}
                        </h3>
                        <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                          {licensePlate && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {licensePlate}
                            </Badge>
                          )}
                          {color && (
                            <Badge variant="secondary" className="text-xs">
                              {color}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && !error && cars.length > 0 && (
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={openCarRegistration}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Car
            </Button>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
