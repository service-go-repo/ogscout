import { ObjectId } from 'mongodb'

// Simplified Car Profile - just basic info and gallery
export interface CarProfile {
  _id?: ObjectId
  ownerId: string // User ID
  
  // Basic Information
  make: string
  model: string
  year: number
  vin?: string
  licensePlate?: string
  color: string
  mileage?: number
  engineSize?: string
  transmission: 'manual' | 'automatic' | 'cvt'
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric'
  
  // Gallery
  thumbnailUrl?: string // Main profile photo
  gallery: CarMedia[]
  
  // Metadata
  nickname?: string // Optional friendly name for the car
  notes?: string // Owner's private notes
  status: 'active' | 'archived' | 'sold'
  
  // Service History Summary (computed)
  totalServiceRequests?: number
  lastServiceDate?: Date
  estimatedValue?: number
  
  createdAt: Date
  updatedAt: Date
}

// Media/Photo information
export interface CarMedia {
  id: string
  url: string
  publicId: string // Cloudinary public ID
  type: 'photo' | 'video'
  category: 'exterior' | 'interior' | 'engine' | 'documents' | 'other'
  caption?: string
  isThumbnail?: boolean
  uploadedAt: Date
  fileSize: number
  dimensions?: {
    width: number
    height: number
  }
}

// Simplified car registration data
export interface CarRegistrationData {
  make: string
  model: string
  year: number
  color: string
  vin?: string
  licensePlate?: string
  mileage?: number
  engineSize?: string
  transmission: 'manual' | 'automatic' | 'cvt'
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric'
  nickname?: string
  notes?: string
  thumbnailFile?: File
  galleryFiles?: File[]
}

// Car update data
export interface CarUpdateData {
  basicInfo?: Partial<Pick<CarProfile, 'make' | 'model' | 'year' | 'color' | 'vin' | 'licensePlate' | 'mileage' | 'engineSize' | 'transmission' | 'fuelType'>>
  nickname?: string
  notes?: string
  status?: 'active' | 'archived' | 'sold'
  estimatedValue?: number
}

// Gallery management
export interface GalleryUpdateData {
  addPhotos?: File[]
  removePhotoIds?: string[]
  updateCaptions?: { id: string; caption: string }[]
  setThumbnail?: string // photo ID to set as thumbnail
}

// Car profile summary for listings
export interface CarProfileSummary {
  _id: string
  make: string
  model: string
  year: number
  color: string
  nickname?: string
  thumbnailUrl?: string
  totalServiceRequests: number
  lastServiceDate?: Date
  status: 'active' | 'archived' | 'sold'
}

// Helper functions
export function generateMediaId(): string {
  return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getCarDisplayName(car: CarProfile): string {
  if (car.nickname) {
    return `${car.nickname} (${car.year} ${car.make} ${car.model})`
  }
  return `${car.year} ${car.make} ${car.model}`
}

export function getCarShortName(car: CarProfile): string {
  return car.nickname || `${car.year} ${car.make} ${car.model}`
}

export function formatMileage(mileage: number | undefined): string {
  if (!mileage) return 'N/A'
  return `${mileage.toLocaleString()} km`
}

// Default values
export const defaultCarProfile: Partial<CarProfile> = {
  transmission: 'automatic',
  fuelType: 'gasoline',
  status: 'active',
  gallery: [],
  totalServiceRequests: 0
}

// Car makes and models
export const CAR_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda',
  'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Porsche', 'Ram',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Other'
] as const

export const CAR_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown',
  'Orange', 'Yellow', 'Purple', 'Gold', 'Beige', 'Maroon', 'Navy', 'Other'
] as const

export const TRANSMISSION_TYPES = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' }
] as const

export const FUEL_TYPES = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' }
] as const

export const MEDIA_CATEGORIES = [
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interior' },
  { value: 'engine', label: 'Engine Bay' },
  { value: 'documents', label: 'Documents' },
  { value: 'other', label: 'Other' }
] as const