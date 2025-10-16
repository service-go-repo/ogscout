'use client'

import { useState, useEffect } from 'react'
import dynamicImport from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CarRegistrationData } from '@/models/CarProfile'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

// Force dynamic rendering to avoid SSR issues with file upload
export const dynamic = 'force-dynamic'

// Dynamically import form to avoid SSR issues with file upload library
const SimpleCarRegistrationForm = dynamicImport(
  () => import('@/components/cars/SimpleCarRegistrationForm').then(mod => ({ default: mod.SimpleCarRegistrationForm })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
)

export default function CarRegistrationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect if not authenticated or not a customer
  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (session?.user.role !== 'customer') {
    router.push('/')
    return null
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  const handleSubmit = async (formData: CarRegistrationData & { 
    thumbnailFile?: File; 
    galleryFiles: File[] 
  }) => {
    try {
      setSubmitting(true)
      
      // Create FormData for file uploads
      const submitData = new FormData()
      
      // Add basic car data
      submitData.append('make', formData.make)
      submitData.append('model', formData.model)
      submitData.append('year', formData.year.toString())
      submitData.append('color', formData.color)
      submitData.append('transmission', formData.transmission)
      submitData.append('fuelType', formData.fuelType)
      
      // Add optional fields
      if (formData.vin) submitData.append('vin', formData.vin)
      if (formData.licensePlate) submitData.append('licensePlate', formData.licensePlate)
      if (formData.mileage) submitData.append('mileage', formData.mileage.toString())
      if (formData.engineSize) submitData.append('engineSize', formData.engineSize)
      if (formData.nickname) submitData.append('nickname', formData.nickname)
      if (formData.notes) submitData.append('notes', formData.notes)
      
      // Add files
      if (formData.thumbnailFile) {
        submitData.append('thumbnailFile', formData.thumbnailFile)
      }
      
      formData.galleryFiles.forEach((file, index) => {
        submitData.append('galleryFiles', file)
      })

      const response = await fetch('/api/cars', {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Car registered successfully!')
        router.push(`/cars/${result.data._id}`)
      } else {
        throw new Error(result.message || 'Failed to register car')
      }
    } catch (error) {
      console.error('Error registering car:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to register car')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
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

      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">
          Register Your Car
        </h1>
        <p className="text-muted-foreground text-lg">
          Add your car to create a profile with photos and service history
        </p>
      </div>

      <SimpleCarRegistrationForm
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  )
}