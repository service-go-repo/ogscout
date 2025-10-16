import { ObjectId } from 'mongodb'

// Workshop specialization types
export type ServiceType = 
  | 'repair'
  | 'maintenance'
  | 'inspection'
  | 'bodywork'
  | 'paint'
  | 'engine'
  | 'transmission'
  | 'brakes'
  | 'electrical'
  | 'tires'
  | 'glass'
  | 'detailing'
  | 'other'

export type CarBrand = 
  | 'audi'
  | 'bmw'
  | 'mercedes'
  | 'volkswagen'
  | 'toyota'
  | 'honda'
  | 'nissan'
  | 'ford'
  | 'chevrolet'
  | 'hyundai'
  | 'kia'
  | 'mazda'
  | 'subaru'
  | 'lexus'
  | 'acura'
  | 'infiniti'
  | 'cadillac'
  | 'lincoln'
  | 'buick'
  | 'gmc'
  | 'jeep'
  | 'ram'
  | 'chrysler'
  | 'dodge'
  | 'fiat'
  | 'alfa_romeo'
  | 'maserati'
  | 'ferrari'
  | 'lamborghini'
  | 'porsche'
  | 'tesla'
  | 'volvo'
  | 'saab'
  | 'jaguar'
  | 'land_rover'
  | 'mini'
  | 'smart'
  | 'mitsubishi'
  | 'suzuki'
  | 'isuzu'
  | 'other'

export type CertificationType = 
  | 'ase'
  | 'manufacturer'
  | 'i_car'
  | 'natef'
  | 'osha'
  | 'epa'
  | 'other'

// Geospatial location structure for MongoDB
export interface GeoLocation {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

// Workshop operating hours
export interface OperatingHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

// Workshop certification
export interface Certification {
  type: CertificationType
  name: string
  issuedBy: string
  issuedDate: Date
  expiryDate?: Date
  certificateNumber?: string
  verified: boolean
}

// Workshop portfolio item
export interface PortfolioItem {
  id: string
  title: string
  description: string
  beforeImages: string[]
  afterImages: string[]
  serviceType: ServiceType
  carBrand?: CarBrand
  completedDate: Date
  featured: boolean
}

// Workshop review
export interface WorkshopReview {
  id: string
  customerId: ObjectId
  customerName: string
  rating: number // 1-5
  comment: string
  serviceType: ServiceType
  serviceDate: Date
  createdAt: Date
  verified: boolean
  response?: {
    message: string
    respondedAt: Date
  }
}

// Workshop contact information
export interface ContactInfo {
  phone: string
  email: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    emirate?: string  // For UAE context
    zipCode: string
    country: string
  }
  location: GeoLocation
}

// Workshop profile information
export interface WorkshopProfile {
  businessName: string
  description: string
  yearEstablished?: number
  employeeCount?: number
  logo?: string
  coverImage?: string
  gallery: string[]
  specializations: {
    serviceTypes: ServiceType[]
    carBrands: CarBrand[]
  }
  certifications: Certification[]
  operatingHours: OperatingHours
  portfolio: PortfolioItem[]
  features: string[] // e.g., "Free WiFi", "Waiting Area", "Shuttle Service"
}

// Workshop statistics
export interface WorkshopStats {
  totalReviews: number
  averageRating: number
  completedJobs: number
  responseTime: number // in hours
  repeatCustomers: number
}

// Main Workshop interface
export interface Workshop {
  _id?: ObjectId
  userId: ObjectId // Reference to User with role 'workshop'
  profile: WorkshopProfile
  contact: ContactInfo
  stats: WorkshopStats
  reviews: WorkshopReview[]
  isVerified: boolean
  isActive: boolean
  subscriptionTier: 'basic' | 'premium' | 'enterprise'
  createdAt: Date
  updatedAt: Date
}

// Workshop search filters
export interface WorkshopSearchFilters {
  location?: {
    coordinates: [number, number]
    radius: number // in kilometers
  }
  serviceTypes?: ServiceType[]
  carBrands?: CarBrand[]
  minRating?: number
  maxDistance?: number
  isVerified?: boolean
  isOpen?: boolean
  features?: string[]
  sortBy?: 'distance' | 'rating' | 'reviews' | 'name'
  sortOrder?: 'asc' | 'desc'
}

// Workshop search result
export interface WorkshopSearchResult {
  workshop: Workshop
  distance?: number // in kilometers
  isOpen?: boolean
}

// Helper functions
export const getServiceTypeLabel = (type: ServiceType): string => {
  const labels: Record<ServiceType, string> = {
    repair: 'General Repair',
    maintenance: 'Maintenance',
    inspection: 'Inspection',
    bodywork: 'Body Work',
    paint: 'Paint & Refinishing',
    engine: 'Engine Service',
    transmission: 'Transmission',
    brakes: 'Brake Service',
    electrical: 'Electrical',
    tires: 'Tire Service',
    glass: 'Glass Repair',
    detailing: 'Detailing',
    other: 'Other Services'
  }
  return labels[type] || type
}

export const getCarBrandLabel = (brand: CarBrand): string => {
  const labels: Record<CarBrand, string> = {
    audi: 'Audi',
    bmw: 'BMW',
    mercedes: 'Mercedes-Benz',
    volkswagen: 'Volkswagen',
    toyota: 'Toyota',
    honda: 'Honda',
    nissan: 'Nissan',
    ford: 'Ford',
    chevrolet: 'Chevrolet',
    hyundai: 'Hyundai',
    kia: 'Kia',
    mazda: 'Mazda',
    subaru: 'Subaru',
    lexus: 'Lexus',
    acura: 'Acura',
    infiniti: 'Infiniti',
    cadillac: 'Cadillac',
    lincoln: 'Lincoln',
    buick: 'Buick',
    gmc: 'GMC',
    jeep: 'Jeep',
    ram: 'Ram',
    chrysler: 'Chrysler',
    dodge: 'Dodge',
    fiat: 'Fiat',
    alfa_romeo: 'Alfa Romeo',
    maserati: 'Maserati',
    ferrari: 'Ferrari',
    lamborghini: 'Lamborghini',
    porsche: 'Porsche',
    tesla: 'Tesla',
    volvo: 'Volvo',
    saab: 'Saab',
    jaguar: 'Jaguar',
    land_rover: 'Land Rover',
    mini: 'Mini',
    smart: 'Smart',
    mitsubishi: 'Mitsubishi',
    suzuki: 'Suzuki',
    isuzu: 'Isuzu',
    other: 'Other'
  }
  return labels[brand] || brand
}

export const getCertificationTypeLabel = (type: CertificationType): string => {
  const labels: Record<CertificationType, string> = {
    ase: 'ASE Certified',
    manufacturer: 'Manufacturer Certified',
    i_car: 'I-CAR Certified',
    natef: 'NATEF Certified',
    osha: 'OSHA Certified',
    epa: 'EPA Certified',
    other: 'Other Certification'
  }
  return labels[type] || type
}

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 4.0) return 'text-yellow-600'
  if (rating >= 3.0) return 'text-orange-600'
  return 'text-red-600'
}

export const getDistanceLabel = (distance: number): string => {
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}

export const isWorkshopOpen = (operatingHours: OperatingHours, date: Date = new Date()): boolean => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = days[date.getDay()] as keyof OperatingHours
  const todayHours = operatingHours[dayName]
  
  if (!todayHours || todayHours.closed) return false
  
  const now = date.getHours() * 60 + date.getMinutes()
  const [openHour, openMin] = todayHours.open.split(':').map(Number)
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number)
  
  const openTime = openHour * 60 + openMin
  const closeTime = closeHour * 60 + closeMin
  
  return now >= openTime && now <= closeTime
}

export const calculateDistance = (
  point1: [number, number],
  point2: [number, number]
): number => {
  const [lon1, lat1] = point1
  const [lon2, lat2] = point2
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Default operating hours
export const defaultOperatingHours: OperatingHours = {
  monday: { open: '08:00', close: '17:00', closed: false },
  tuesday: { open: '08:00', close: '17:00', closed: false },
  wednesday: { open: '08:00', close: '17:00', closed: false },
  thursday: { open: '08:00', close: '17:00', closed: false },
  friday: { open: '08:00', close: '17:00', closed: false },
  saturday: { open: '08:00', close: '15:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true }
}
