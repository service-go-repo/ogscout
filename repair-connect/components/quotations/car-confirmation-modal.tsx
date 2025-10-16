'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Car as CarIcon, CheckCircle, ArrowRight } from 'lucide-react'
import { Car } from '@/models/Car'

interface CarConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCar: Car
  onContinue: () => void
  onSelectDifferent: () => void
  isLoading?: boolean
}

/**
 * Modal that appears when user clicks "Request Quote" with a car already selected
 * Offers to continue with selected car or choose a different one
 */
export function CarConfirmationModal({
  open,
  onOpenChange,
  selectedCar,
  onContinue,
  onSelectDifferent,
  isLoading = false
}: CarConfirmationModalProps) {
  // Extract car details - handle both flat and nested structures
  const carYear = (selectedCar as any).year || (selectedCar as any).basicInfo?.year
  const carMake = (selectedCar as any).make || (selectedCar as any).basicInfo?.make
  const carModel = (selectedCar as any).model || (selectedCar as any).basicInfo?.model
  const carLicensePlate = (selectedCar as any).licensePlate || (selectedCar as any).basicInfo?.licensePlate
  const carColor = (selectedCar as any).color || (selectedCar as any).basicInfo?.color
  const carThumbnail = (selectedCar as any).thumbnailUrl || (selectedCar as any).gallery?.[0]?.url

  const carName = `${carYear} ${carMake} ${carModel}`.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Quote Request</DialogTitle>
          <DialogDescription>
            You have a car selected. How would you like to proceed?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Car Display */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Car Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {carThumbnail ? (
                    <img
                      src={carThumbnail}
                      alt={carName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CarIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Car Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {carName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {carLicensePlate && (
                      <>
                        {carLicensePlate}
                        {carColor && " • "}
                      </>
                    )}
                    {carColor || ""}
                  </div>
                </div>

                {/* Selected Badge */}
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Continue with selected car */}
            <Button
              onClick={onContinue}
              disabled={isLoading}
              className="w-full h-auto py-4 justify-start"
              size="lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold">Continue with {carMake} {carModel}</span>
                  <span className="text-xs font-normal opacity-80">
                    Send quote request for this car
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
              </div>
            </Button>

            {/* Select different car */}
            <Button
              onClick={onSelectDifferent}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Select Different Car
            </Button>

            {/* Cancel */}
            <Button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
