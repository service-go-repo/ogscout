'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ServiceRequestForm } from '@/components/service-requests/ServiceRequestForm'
import { CarProfile } from '@/models/CarProfile'
import { ServiceRequestData } from '@/models/ServiceRequest'
import { Button } from '@/components/ui/button'
import { Car, ArrowLeft, Loader2 } from 'lucide-react'

function NewServiceRequestPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const carId = searchParams.get('carId')
  
  const [car, setCar] = useState<CarProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user.role !== 'customer') {
      router.push('/')
      return
    }

    if (!carId) {
      toast.error('Car ID is required')
      router.push('/cars')
      return
    }

    fetchCar()
  }, [session, status, router, carId])

  const fetchCar = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cars/${carId}`)
      const data = await response.json()

      if (data.success) {
        setCar(data.data)
      } else {
        toast.error('Failed to load car information')
        router.push('/cars')
      }
    } catch (error) {
      console.error('Error fetching car:', error)
      toast.error('An error occurred while loading car information')
      router.push('/cars')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true)

      // Create FormData for file uploads
      const submitData = new FormData()

      // Add basic form data
      submitData.append('carId', formData.carId)
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('requestedServices', JSON.stringify(formData.requestedServices))

      // Add damage assessments
      if (formData.damageAssessments) {
        submitData.append('damageAssessments', JSON.stringify(formData.damageAssessments))
      }

      // Build service location from flat fields if needed
      const serviceLocation = formData.serviceLocation || {
        type: formData.serviceLocationType,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        instructions: formData.locationInstructions
      }
      submitData.append('serviceLocation', JSON.stringify(serviceLocation))

      // Build timeline from flat fields if needed
      const timeline = formData.timeline || {
        flexibility: formData.flexibility,
        urgency: formData.urgency,
        preferredStartDate: formData.preferredStartDate,
        preferredCompletionDate: formData.preferredCompletionDate
      }
      submitData.append('timeline', JSON.stringify(timeline))

      // Add other fields
      submitData.append('priority', formData.priority)
      submitData.append('preferredContactMethod', formData.preferredContactMethod)
      if (formData.additionalNotes) {
        submitData.append('additionalNotes', formData.additionalNotes)
      }
      if (formData.maxDistance) {
        submitData.append('maxDistance', formData.maxDistance.toString())
      }
      
      // Add photos
      if (formData.photos) {
        console.log('Raw photos array:', formData.photos)
        const validPhotos = formData.photos.filter((photo: any) => photo && photo.size > 0)
        console.log(`Adding ${validPhotos.length} valid photos out of ${formData.photos.length} total`)

        validPhotos.forEach((photo: any, index: number) => {
          console.log(`Photo ${index}:`, { name: photo.name, size: photo.size, type: photo.type })
          submitData.append(`photos`, photo)
        })
      }

      // Add videos
      if (formData.videos) {
        console.log('Raw videos array:', formData.videos)
        const validVideos = formData.videos.filter((video: any) => video && video.size > 0)
        console.log(`Adding ${validVideos.length} valid videos out of ${formData.videos.length} total`)

        validVideos.forEach((video: any, index: number) => {
          console.log(`Video ${index}:`, { name: video.name, size: video.size, type: video.type })
          submitData.append(`videos`, video)
        })
      }

      const response = await fetch('/api/service-requests', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          console.error('Server response:', errorData)
        } catch (e) {
          console.error('Failed to parse error response')
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Service request submitted successfully!')
        // Wait a moment to ensure UI updates are visible
        await new Promise(resolve => setTimeout(resolve, 500))
        // Use the returned ID from server response
        router.push(`/service-requests/${result.data._id}`)
      } else {
        throw new Error(result.message || 'Failed to submit service request')
      }
    } catch (error) {
      console.error('Error submitting service request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit service request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h1>
          <Button onClick={() => router.push('/cars')}>
            <Car className="h-4 w-4 mr-2" />
            Back to My Cars
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <ServiceRequestForm
        car={car}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  )
}

export default function NewServiceRequestPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    }>
      <NewServiceRequestPageContent />
    </Suspense>
  )
}