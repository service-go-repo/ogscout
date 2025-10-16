import { ObjectId } from 'mongodb'

// Service types organized by category
export type ServiceType = 
  // Mechanical Issues
  | 'engine'
  | 'transmission'
  | 'brakes'
  | 'suspension'
  | 'clutch'
  // Electrical Issues
  | 'electrical'
  | 'battery'
  | 'alternator'
  | 'lights'
  | 'electronics'
  // Body & Exterior
  | 'bodywork'
  | 'paint'
  | 'glass'
  | 'bumper'
  | 'dents'
  // Maintenance & Service
  | 'maintenance'
  | 'oil_change'
  | 'inspection'
  | 'tune_up'
  | 'filters'
  // Tires & Wheels
  | 'tires'
  | 'wheel_alignment'
  | 'tire_rotation'
  | 'wheel_balancing'
  // Other Services
  | 'detailing'
  | 'diagnostic'
  | 'repair'
  | 'other'

// Service request - separate from car registration
export interface ServiceRequest {
  _id?: ObjectId
  customerId: string // User ID
  carId: string // Reference to CarProfile
  
  // Request Details
  title: string // Brief description of what's needed
  description: string // Detailed description
  requestedServices: ServiceType[]
  
  // Damage Assessment (if applicable)
  damageAssessments: DamageAssessment[]
  
  // Location for service
  serviceLocation: ServiceLocation
  
  // Preferences
  timeline: ServiceTimeline
  budget?: BudgetRange
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Communication
  preferredContactMethod: 'phone' | 'email' | 'sms'
  additionalNotes?: string
  
  // Media specific to this service request
  photos: ServiceRequestMedia[]
  videos: ServiceRequestMedia[]
  
  // Status and tracking
  status: ServiceRequestStatus
  
  // Workshop targeting
  targetWorkshops?: string[] // Workshop IDs
  maxDistance?: number // km radius for auto-matching
  
  // Linked quotation
  quotationId?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  
  // Analytics
  viewCount: number
  responseCount: number
}

// Service request status
export type ServiceRequestStatus = 
  | 'draft'
  | 'submitted'
  | 'quoted'
  | 'accepted'
  | 'in_progress' 
  | 'completed'
  | 'cancelled'
  | 'expired'

// Damage assessment for service requests
export interface DamageAssessment {
  id: string
  damageType: DamageType
  severity: DamageSeverity
  location: DamageLocation
  description: string
  estimatedCost?: number
  photos: string[] // Media IDs
  isVisible: boolean // Customer can hide certain damages
  reportedAt: Date
}

// Service request media (photos/videos with damage annotations)
export interface ServiceRequestMedia {
  id: string
  url: string
  publicId: string // Cloudinary public ID
  type: 'photo' | 'video'
  category: 'damage' | 'reference' | 'other'
  caption?: string
  uploadedAt: Date
  fileSize: number
  dimensions?: {
    width: number
    height: number
  }
  damageAnnotations?: DamageAnnotation[]
}

// Damage annotation on photos
export interface DamageAnnotation {
  id: string
  x: number // X coordinate percentage
  y: number // Y coordinate percentage
  damageType: DamageType
  severity: DamageSeverity
  description?: string
  estimatedCost?: number
}

// Service location
export interface ServiceLocation {
  type: 'customer_location' | 'workshop_location' | 'pickup_delivery'
  address?: string
  city: string
  state: string
  coordinates?: {
    lat: number
    lng: number
  }
  instructions?: string // Special instructions for location
}

// Timeline preferences
export interface ServiceTimeline {
  preferredStartDate?: Date
  preferredCompletionDate?: Date
  flexibility: 'rigid' | 'flexible' | 'very_flexible'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
}

// Budget range
export interface BudgetRange {
  min?: number
  max?: number
  currency: string
  isFlexible: boolean
}

// Damage types
export type DamageType = 
  | 'scratch'
  | 'dent'
  | 'crack'
  | 'broken_glass'
  | 'paint_damage'
  | 'rust'
  | 'collision_damage'
  | 'mechanical_issue'
  | 'electrical_issue'
  | 'interior_damage'
  | 'tire_damage'
  | 'engine_issue'
  | 'brake_issue'
  | 'air_conditioning'
  | 'battery_issue'
  | 'other'

// Damage severity levels
export type DamageSeverity = 'minor' | 'moderate' | 'major' | 'severe'

// Car damage locations
export type DamageLocation = 
  | 'front_bumper'
  | 'rear_bumper'
  | 'front_left_door'
  | 'front_right_door'
  | 'rear_left_door'
  | 'rear_right_door'
  | 'hood'
  | 'trunk'
  | 'roof'
  | 'front_left_fender'
  | 'front_right_fender'
  | 'rear_left_fender'
  | 'rear_right_fender'
  | 'front_windshield'
  | 'rear_windshield'
  | 'side_windows'
  | 'headlights'
  | 'taillights'
  | 'mirrors'
  | 'wheels'
  | 'interior'
  | 'engine'
  | 'undercarriage'
  | 'other'

// Form data for creating service requests
export interface ServiceRequestData {
  carId: string
  title: string
  description: string
  requestedServices: ServiceType[]
  damageAssessments: Partial<DamageAssessment>[]
  serviceLocation: ServiceLocation
  timeline: ServiceTimeline
  budget?: BudgetRange
  priority: 'low' | 'medium' | 'high' | 'urgent'
  preferredContactMethod: 'phone' | 'email' | 'sms'
  additionalNotes?: string
  photos?: File[]
  videos?: File[]
  targetWorkshops?: string[]
  maxDistance?: number
}

// Service request summary for listings
export interface ServiceRequestSummary {
  _id: string
  title: string
  carId: string
  carInfo: {
    make: string
    model: string
    year: number
    thumbnailUrl?: string
  }
  status: ServiceRequestStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requestedServices: ServiceType[]
  estimatedCost?: number
  responseCount: number
  createdAt: Date
  expiresAt: Date
}

// Helper functions
export function generateDamageId(): string {
  return `damage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateServiceMediaId(): string {
  return `service_media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function calculateTotalEstimatedCost(damages: DamageAssessment[]): number {
  return damages.reduce((total, damage) => {
    return total + (damage.estimatedCost || 0)
  }, 0)
}

export function getServiceRequestDisplayTitle(request: ServiceRequest): string {
  return request.title || `Service Request - ${request.requestedServices.join(', ')}`
}

export function isServiceRequestExpired(request: ServiceRequest): boolean {
  return new Date() > new Date(request.expiresAt)
}

export function getServiceRequestStatusColor(status: ServiceRequestStatus): string {
  switch (status) {
    case 'draft': return 'text-gray-600 bg-gray-100'
    case 'submitted': return 'text-blue-600 bg-blue-100'
    case 'quoted': return 'text-purple-600 bg-purple-100'
    case 'accepted': return 'text-green-600 bg-green-100'
    case 'in_progress': return 'text-yellow-600 bg-yellow-100'
    case 'completed': return 'text-green-600 bg-green-100'
    case 'cancelled': return 'text-red-600 bg-red-100'
    case 'expired': return 'text-gray-600 bg-gray-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-100'
    case 'high': return 'text-orange-600 bg-orange-100'
    case 'medium': return 'text-yellow-600 bg-yellow-100'
    case 'low': return 'text-green-600 bg-green-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

// Labels and constants
export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  scratch: 'Scratch',
  dent: 'Dent',
  crack: 'Crack',
  broken_glass: 'Broken Glass',
  paint_damage: 'Paint Damage',
  rust: 'Rust',
  collision_damage: 'Collision Damage',
  mechanical_issue: 'Mechanical Issue',
  electrical_issue: 'Electrical Issue',
  interior_damage: 'Interior Damage',
  tire_damage: 'Tire Damage',
  engine_issue: 'Engine Issue',
  brake_issue: 'Brake Issue',
  air_conditioning: 'Air Conditioning',
  battery_issue: 'Battery Issue',
  other: 'Other',
}

export const DAMAGE_SEVERITY_LABELS: Record<DamageSeverity, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  major: 'Major',
  severe: 'Severe',
}

export const DAMAGE_LOCATION_LABELS: Record<DamageLocation, string> = {
  front_bumper: 'Front Bumper',
  rear_bumper: 'Rear Bumper',
  front_left_door: 'Front Left Door',
  front_right_door: 'Front Right Door',
  rear_left_door: 'Rear Left Door',
  rear_right_door: 'Rear Right Door',
  hood: 'Hood',
  trunk: 'Trunk',
  roof: 'Roof',
  front_left_fender: 'Front Left Fender',
  front_right_fender: 'Front Right Fender',
  rear_left_fender: 'Rear Left Fender',
  rear_right_fender: 'Rear Right Fender',
  front_windshield: 'Front Windshield',
  rear_windshield: 'Rear Windshield',
  side_windows: 'Side Windows',
  headlights: 'Headlights',
  taillights: 'Taillights',
  mirrors: 'Mirrors',
  wheels: 'Wheels',
  interior: 'Interior',
  engine: 'Engine',
  undercarriage: 'Undercarriage',
  other: 'Other',
}

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  quoted: 'Quoted',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
} as const

export const CONTACT_METHOD_LABELS = {
  phone: 'Phone',
  email: 'Email',
  sms: 'SMS'
} as const

export const SERVICE_LOCATION_TYPE_LABELS = {
  customer_location: 'At My Location',
  workshop_location: 'At Workshop',
  pickup_delivery: 'Pickup & Delivery'
} as const