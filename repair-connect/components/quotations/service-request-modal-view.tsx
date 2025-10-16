'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DialogHeader, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import { useQuoteRequestStore } from '@/stores/quoteRequestStore'
import { ServiceRequestForm } from '@/components/service-requests/ServiceRequestForm'
import { toast } from 'sonner'

/**
 * Service Request Modal View
 *
 * Allows users to create a service request directly within the quote request modal
 */
export function ServiceRequestModalView() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCar = useQuoteRequestStore((state) => state.selectedCar)
  const openServiceSelection = useQuoteRequestStore((state) => state.openServiceSelection)
  const closeModal = useQuoteRequestStore((state) => state.closeModal)

  const handleSubmit = async (data: any) => {
    if (!selectedCar) {
      toast.error('No car selected')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Basic service request data
      formData.append('carId', selectedCar._id!.toString())
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('requestedServices', JSON.stringify(data.requestedServices))
      formData.append('priority', data.priority)
      formData.append('preferredContactMethod', data.preferredContactMethod)

      // Service location
      formData.append('serviceLocationType', data.serviceLocationType)
      formData.append('city', data.city)
      formData.append('state', data.state)
      if (data.address) formData.append('address', data.address)
      if (data.locationInstructions) formData.append('locationInstructions', data.locationInstructions)
      if (data.maxDistance) formData.append('maxDistance', data.maxDistance.toString())
      if (data.additionalNotes) formData.append('additionalNotes', data.additionalNotes)

      // Damage assessments if any
      if (data.damageAssessments && data.damageAssessments.length > 0) {
        formData.append('damageAssessments', JSON.stringify(data.damageAssessments))
      }

      // Photos
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo: File) => {
          formData.append('photos', photo)
        })
      }

      // Videos
      if (data.videos && data.videos.length > 0) {
        data.videos.forEach((video: File) => {
          formData.append('videos', video)
        })
      }

      const response = await fetch('/api/service-requests', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Service request created successfully!')

        // Small delay to show success message
        setTimeout(() => {
          // Go back to service selection view to see the new service
          openServiceSelection()
        }, 500)
      } else {
        throw new Error(result.error || 'Failed to create service request')
      }
    } catch (error) {
      console.error('Error creating service request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create service request')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle case where no car is selected
  if (!selectedCar) {
    return (
      <div className="flex flex-col overflow-y-auto h-full">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-2xl font-bold">Create Service Request</h2>
          <DialogDescription className="text-base mt-1">
            Please select a car first
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Car Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a car before creating a service request
            </p>
            <Button onClick={closeModal}>Close</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto h-full">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={openServiceSelection}
            className="px-2"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              Create Service Request
            </h2>
            <DialogDescription className="text-base mt-1">
              For {(selectedCar as any).year} {(selectedCar as any).make} {(selectedCar as any).model}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Content - Scrollable Form */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <ServiceRequestForm
          car={selectedCar as any}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
