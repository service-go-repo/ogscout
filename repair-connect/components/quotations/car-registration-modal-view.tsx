'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DialogHeader, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useQuoteRequestStore } from '@/stores/quoteRequestStore'
import { SimpleCarRegistrationForm } from '@/components/cars/SimpleCarRegistrationForm'
import { toast } from 'sonner'

/**
 * Car Registration Modal View
 *
 * Allows users to register a car directly within the quote request modal
 */
export function CarRegistrationModalView() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCarSelection = useQuoteRequestStore((state) => state.openCarSelection)
  const closeModal = useQuoteRequestStore((state) => state.closeModal)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Append basic car data
      formData.append('make', data.make)
      formData.append('model', data.model)
      formData.append('year', data.year.toString())
      formData.append('color', data.color)
      formData.append('transmission', data.transmission)
      formData.append('fuelType', data.fuelType)

      // Append optional fields if provided
      if (data.vin) formData.append('vin', data.vin)
      if (data.licensePlate) formData.append('licensePlate', data.licensePlate)
      if (data.mileage) formData.append('mileage', data.mileage.toString())
      if (data.engineSize) formData.append('engineSize', data.engineSize)

      // Append thumbnail if provided
      if (data.thumbnailFile) {
        formData.append('thumbnailFile', data.thumbnailFile)
      }

      // Append gallery files if provided
      if (data.galleryFiles && data.galleryFiles.length > 0) {
        data.galleryFiles.forEach((file: File) => {
          formData.append('galleryFiles', file)
        })
      }

      const response = await fetch('/api/cars', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Car registered successfully!')

        // Small delay to show success message
        setTimeout(() => {
          // Go back to car selection view to see the new car
          openCarSelection()
        }, 500)
      } else {
        throw new Error(result.error || 'Failed to register car')
      }
    } catch (error) {
      console.error('Error registering car:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to register car')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col overflow-y-auto h-full">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={openCarSelection}
            className="px-2"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              Register Your Car
            </h2>
            <DialogDescription className="text-base mt-1">
              Add your car details to get quotes from workshops
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Content - Scrollable Form */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <SimpleCarRegistrationForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
