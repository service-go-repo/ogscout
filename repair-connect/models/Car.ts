import { ObjectId } from 'mongodb'

// Car basic information
export interface CarBasicInfo {
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
}

// Location information
export interface LocationInfo {
  address: string
  city: string
  state: string
  zipCode: string
  coordinates?: {
    lat: number
    lng: number
  }
  isCurrentLocation?: boolean
}

// Photo/Media information
export interface CarMedia {
  id: string
  url: string
  publicId: string // Cloudinary public ID
  type: 'photo' | 'video'
  category: 'exterior' | 'interior' | 'damage' | 'engine' | 'other'
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

// Damage assessment
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
  updatedAt: Date
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

// Service request status
export type ServiceRequestStatus = 
  | 'draft'
  | 'submitted'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

// Main Car interface
export interface Car {
  _id?: ObjectId
  ownerId: string // User ID
  basicInfo: CarBasicInfo
  location: LocationInfo
  media: CarMedia[]
  damageAssessments: DamageAssessment[]
  serviceRequests?: string[] // Service request IDs
  status: 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
  
  // Computed fields
  totalEstimatedCost?: number
  damageCount?: number
  lastServiceDate?: Date
}

// Car upload form data
export interface CarUploadData {
  basicInfo: CarBasicInfo
  location: LocationInfo
  initialDamages?: Partial<DamageAssessment>[]
  photos?: File[]
}

// Database operations interface
export interface CarRepository {
  createCar(carData: Omit<Car, '_id' | 'createdAt' | 'updatedAt'>): Promise<Car>
  findCarById(id: string): Promise<Car | null>
  findCarsByOwner(ownerId: string): Promise<Car[]>
  updateCar(id: string, updates: Partial<Car>): Promise<Car | null>
  deleteCar(id: string): Promise<boolean>
  addMedia(carId: string, media: CarMedia): Promise<boolean>
  removeMedia(carId: string, mediaId: string): Promise<boolean>
  addDamageAssessment(carId: string, damage: DamageAssessment): Promise<boolean>
  updateDamageAssessment(carId: string, damageId: string, updates: Partial<DamageAssessment>): Promise<boolean>
  removeDamageAssessment(carId: string, damageId: string): Promise<boolean>
}

// Helper functions
export function generateDamageId(): string {
  return `damage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateMediaId(): string {
  return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function calculateTotalEstimatedCost(damages: DamageAssessment[]): number {
  return damages.reduce((total, damage) => {
    return total + (damage.estimatedCost || 0)
  }, 0)
}

export function getDamagesByLocation(damages: DamageAssessment[], location: DamageLocation): DamageAssessment[] {
  return damages.filter(damage => damage.location === location)
}

export function getDamagesBySeverity(damages: DamageAssessment[], severity: DamageSeverity): DamageAssessment[] {
  return damages.filter(damage => damage.severity === severity)
}

// Default values
export const defaultCarBasicInfo: Partial<CarBasicInfo> = {
  transmission: 'automatic',
  fuelType: 'gasoline',
  color: '',
}

export const defaultLocationInfo: Partial<LocationInfo> = {
  isCurrentLocation: true,
}

// Car makes and models (common ones)
export const CAR_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda',
  'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Porsche', 'Ram',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Other'
] as const

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