import { ObjectId } from 'mongodb'

// Quotation Status
export type QuotationStatus = 
  | 'pending'      // Customer submitted request, waiting for workshop quotes
  | 'quoted'       // Workshop(s) have submitted quotes
  | 'accepted'     // Customer accepted a quote
  | 'declined'     // Customer declined all quotes
  | 'expired'      // Quote request expired
  | 'completed'    // Service completed
  | 'cancelled'    // Cancelled by either party

// Quote Status (individual workshop quotes)
export type QuoteStatus = 
  | 'pending'      // Workshop hasn't responded yet
  | 'submitted'    // Workshop submitted quote
  | 'accepted'     // Customer accepted this quote
  | 'declined'     // Customer declined this quote
  | 'expired'      // Quote expired

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// Service categories from Workshop model
export type ServiceType = 
  // Mechanical Issues
  | 'engine' | 'transmission' | 'brakes' | 'suspension' | 'clutch'
  // Electrical Issues
  | 'electrical' | 'battery' | 'alternator' | 'lights' | 'electronics'
  // Body & Exterior
  | 'bodywork' | 'paint' | 'glass' | 'bumper' | 'dents'
  // Maintenance & Service
  | 'maintenance' | 'oil_change' | 'inspection' | 'tune_up' | 'filters'
  // Tires & Wheels
  | 'tires' | 'wheel_alignment' | 'tire_rotation' | 'wheel_balancing'
  // Other Services
  | 'detailing' | 'diagnostic' | 'repair' | 'other'

// Car brands from Workshop model
export type CarBrand = 
  | 'audi' | 'bmw' | 'mercedes' | 'volkswagen' | 'toyota' | 'honda'
  | 'nissan' | 'ford' | 'chevrolet' | 'hyundai' | 'kia' | 'mazda'
  | 'subaru' | 'lexus' | 'acura' | 'infiniti' | 'tesla' | 'other'

// Vehicle information
export interface VehicleInfo {
  make: CarBrand
  model: string
  year: number
  mileage?: number
  vin?: string
  licensePlate?: string
  color?: string
  engineType?: string
  transmission?: 'manual' | 'automatic' | 'cvt'
}

// Service item in quote
export interface ServiceItem {
  id: string
  serviceType: ServiceType
  description: string
  laborHours: number
  laborRate: number
  laborCost: number
  parts: PartItem[]
  subtotal: number
  notes?: string
}

// Part item
export interface PartItem {
  id: string
  name: string
  partNumber?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  warranty?: string
  isOEM?: boolean
}

// Damage/issue description
export interface DamageDescription {
  area: string // e.g., "Front bumper", "Engine", "Brakes"
  description: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  images?: string[] // Cloudinary URLs
  estimatedCost?: number
}

// Timeline preferences
export interface Timeline {
  preferredStartDate?: Date
  preferredCompletionDate?: Date
  flexibility: 'rigid' | 'flexible' | 'very_flexible'
  urgency: Priority
}

// Budget range
export interface BudgetRange {
  min?: number
  max?: number
  currency: string
  isFlexible: boolean
}

// Individual workshop quote
export interface WorkshopQuote {
  id: string
  workshopId: ObjectId
  workshopName: string
  workshopLogo?: string
  status: QuoteStatus
  
  // Quote details
  services: ServiceItem[]
  totalLaborCost: number
  totalPartsCost: number
  subtotal: number
  tax: number
  discount?: number
  totalAmount: number
  currency: string
  
  // Timeline
  estimatedStartDate?: Date
  estimatedCompletionDate?: Date
  estimatedDuration: number // in days
  
  // Terms
  validUntil: Date
  warranty: string
  paymentTerms: string
  notes?: string
  
  // Attachments
  attachments?: string[] // Document URLs
  
  // Timestamps
  submittedAt: Date
  updatedAt: Date
  
  // Workshop contact
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
}

// Main quotation request
export interface Quotation {
  _id: ObjectId
  
  // Request details
  customerId: ObjectId
  customerName: string
  customerEmail: string
  customerPhone: string
  
  // Vehicle information
  carId?: ObjectId // Reference to the car if selected from registered cars
  vehicle: VehicleInfo
  
  // Service requirements
  requestedServices: ServiceType[]
  damageDescription: DamageDescription[]
  timeline: Timeline
  budget?: BudgetRange
  
  // Location
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  address: string
  city: string
  state: string
  
  // Workshop targeting
  targetWorkshops?: ObjectId[] // Specific workshops to request from
  maxDistance?: number // km radius for auto-matching
  
  // Status and tracking
  status: QuotationStatus
  priority: Priority
  
  // Quotes from workshops
  quotes: WorkshopQuote[]
  acceptedQuoteId?: string
  
  // Communication
  messages?: {
    id: string
    from: 'customer' | 'workshop'
    fromId: ObjectId
    message: string
    timestamp: Date
    attachments?: string[]
  }[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  
  // Analytics
  viewCount: number
  responseCount: number
}

// Search and filter interfaces
export interface QuotationSearchFilters {
  status?: QuotationStatus[]
  serviceTypes?: ServiceType[]
  carBrands?: CarBrand[]
  priority?: Priority[]
  budgetMin?: number
  budgetMax?: number
  location?: {
    coordinates: [number, number]
    radius: number
  }
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface QuotationSearchResult {
  quotations: Quotation[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Helper functions
export const getServiceTypeLabel = (serviceType: ServiceType): string => {
  const labels: Record<ServiceType, string> = {
    // Mechanical Issues
    engine: 'Engine Service',
    transmission: 'Transmission',
    brakes: 'Brakes',
    suspension: 'Suspension',
    clutch: 'Clutch',
    // Electrical Issues
    electrical: 'Electrical System',
    battery: 'Battery',
    alternator: 'Alternator',
    lights: 'Lights & Bulbs',
    electronics: 'Electronics',
    // Body & Exterior
    bodywork: 'Body Work',
    paint: 'Paint Work',
    glass: 'Glass Repair',
    bumper: 'Bumper Repair',
    dents: 'Dent Repair',
    // Maintenance & Service
    maintenance: 'Regular Maintenance',
    oil_change: 'Oil Change',
    inspection: 'Inspection',
    tune_up: 'Tune-up',
    filters: 'Filter Replacement',
    // Tires & Wheels
    tires: 'Tire Service',
    wheel_alignment: 'Wheel Alignment',
    tire_rotation: 'Tire Rotation',
    wheel_balancing: 'Wheel Balancing',
    // Other Services
    detailing: 'Car Detailing',
    diagnostic: 'Diagnostic',
    repair: 'General Repair',
    other: 'Other'
  }
  return labels[serviceType] || serviceType
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
    tesla: 'Tesla',
    other: 'Other'
  }
  return labels[brand] || brand
}

export const getStatusColor = (status: QuotationStatus): string => {
  const colors: Record<QuotationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getQuoteStatusColor = (status: QuoteStatus): string => {
  const colors: Record<QuoteStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

export const calculateQuoteTotal = (quote: WorkshopQuote): number => {
  const subtotal = quote.totalLaborCost + quote.totalPartsCost
  const afterDiscount = quote.discount ? subtotal - quote.discount : subtotal
  return afterDiscount + quote.tax
}

export const formatCurrency = (amount: number, currency: string = 'AED'): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const isQuoteExpired = (quote: WorkshopQuote): boolean => {
  return new Date() > new Date(quote.validUntil)
}

export const isQuotationExpired = (quotation: Quotation): boolean => {
  return new Date() > new Date(quotation.expiresAt)
}

export const getQuotationSummary = (quotation: Quotation) => {
  const totalQuotes = quotation.quotes.length
  const submittedQuotes = quotation.quotes.filter(q => q.status === 'submitted').length
  const pendingQuotes = quotation.quotes.filter(q => q.status === 'pending').length
  const acceptedQuote = quotation.quotes.find(q => q.status === 'accepted')
  
  const priceRange = quotation.quotes.length > 0 ? {
    min: Math.min(...quotation.quotes.map(q => q.totalAmount)),
    max: Math.max(...quotation.quotes.map(q => q.totalAmount))
  } : null
  
  return {
    totalQuotes,
    submittedQuotes,
    pendingQuotes,
    acceptedQuote,
    priceRange,
    hasQuotes: totalQuotes > 0,
    hasSubmittedQuotes: submittedQuotes > 0
  }
}
