'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CarUploadForm } from '@/components/cars/CarUploadForm'
import { FileWithPreview } from '@/components/common/FileUpload'

// Interface for uploaded file with metadata
interface UploadedFile {
  file: {
    public_id: string
    secure_url: string
    width: number
    height: number
    bytes: number
  }
  originalName: string
}

interface CarUploadData {
  make: string
  model: string
  year: number
  vin?: string
  licensePlate?: string
  color: string
  mileage?: number
  damageTypes: string[]
  damageSeverity: string
  damageLocations: string[]
  damageDescription: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  urgency: 'low' | 'medium' | 'high'
  preferredContactMethod: 'phone' | 'email' | 'sms'
  additionalNotes?: string
  photos: FileWithPreview[]
  videos: FileWithPreview[]
}

export default function CarUploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  const handleSubmit = async (data: CarUploadData) => {
    setIsLoading(true)
    
    try {
      // First, upload the files
      const uploadPromises = []
      
      if (data.photos.length > 0) {
        const photoFormData = new FormData()
        data.photos.forEach((photo) => {
          photoFormData.append('files', photo)
        })
        photoFormData.append('type', 'photo')
        photoFormData.append('folder', `cars/${session?.user?.id}`)
        
        uploadPromises.push(
          fetch('/api/upload-local', {
            method: 'POST',
            body: photoFormData,
          }).then(res => res.json())
        )
      }
      
      if (data.videos.length > 0) {
        const videoFormData = new FormData()
        data.videos.forEach((video) => {
          videoFormData.append('files', video)
        })
        videoFormData.append('type', 'video')
        videoFormData.append('folder', `cars/${session?.user?.id}`)
        
        uploadPromises.push(
          fetch('/api/upload-local', {
            method: 'POST',
            body: videoFormData,
          }).then(res => res.json())
        )
      }
      
      const uploadResults = await Promise.all(uploadPromises)
      
      // Extract uploaded file URLs
      const uploadedPhotos = uploadResults[0]?.data?.uploaded || []
      const uploadedVideos = uploadResults[1]?.data?.uploaded || []
      
      // Create car data object
      const carData = {
        ...data,
        ownerId: session?.user?.id,
        photos: uploadedPhotos.map((photo: any) => ({
          id: photo.file.public_id,
          url: photo.file.secure_url,
          publicId: photo.file.public_id,
          type: 'photo',
          category: 'damage',
          uploadedAt: new Date(),
          fileSize: photo.file.bytes,
          dimensions: {
            width: photo.file.width,
            height: photo.file.height,
          },
        })),
        videos: uploadedVideos.map((video: any) => ({
          id: video.file.public_id,
          url: video.file.secure_url,
          publicId: video.file.public_id,
          type: 'video',
          category: 'damage',
          uploadedAt: new Date(),
          fileSize: video.file.bytes,
        })),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Save car data to database
      
      // Save car data to database via API
      const carResponse = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      })
      
      if (!carResponse.ok) {
        const errorData = await carResponse.json()
        throw new Error(errorData.message || 'Failed to save car data')
      }
      
      const carResult = await carResponse.json()
      
      alert('Car uploaded successfully!')
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload car. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Your Car</h1>
          <p className="mt-2 text-gray-600">
            Provide details about your vehicle and damage for repair estimates
          </p>
        </div>
        
        <CarUploadForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
