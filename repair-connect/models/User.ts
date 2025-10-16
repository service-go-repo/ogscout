import { ObjectId } from 'mongodb'

export interface BaseUser {
  _id?: ObjectId
  email: string
  password: string
  role: 'customer' | 'workshop'
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface CustomerUser extends BaseUser {
  role: 'customer'
  profile: {
    firstName: string
    lastName: string
    phone: string
    avatar?: string
  }
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    preferredContactMethod: 'email' | 'phone' | 'sms'
  }
  vehicles: Array<{
    id: string
    make: string
    model: string
    year: number
    vin?: string
    licensePlate?: string
    color?: string
    mileage?: number
  }>
}

export interface WorkshopUser extends BaseUser {
  role: 'workshop'
  businessInfo: {
    businessName: string
    businessType: 'auto_repair' | 'body_shop' | 'tire_service' | 'oil_change' | 'specialty'
    businessPhone: string
    businessAddress: {
      street: string
      city: string
      state: string
      zipCode: string
      coordinates?: {
        lat: number
        lng: number
      }
    }
    businessHours: {
      monday: { open: string; close: string; closed: boolean }
      tuesday: { open: string; close: string; closed: boolean }
      wednesday: { open: string; close: string; closed: boolean }
      thursday: { open: string; close: string; closed: boolean }
      friday: { open: string; close: string; closed: boolean }
      saturday: { open: string; close: string; closed: boolean }
      sunday: { open: string; close: string; closed: boolean }
    }
    servicesOffered: string[]
    businessLicense: string
    insuranceInfo: string
    website?: string
    description?: string
    photos?: string[]
  }
  ownerInfo: {
    firstName: string
    lastName: string
    phone: string
    avatar?: string
  }
  verification: {
    isVerified: boolean
    verificationDate?: Date
    documents: {
      businessLicense: {
        uploaded: boolean
        url?: string
        verifiedAt?: Date
      }
      insurance: {
        uploaded: boolean
        url?: string
        verifiedAt?: Date
      }
    }
  }
  ratings: {
    averageRating: number
    totalReviews: number
    responseTime: number // in hours
  }
  subscription: {
    plan: 'free' | 'basic' | 'premium'
    startDate: Date
    endDate?: Date
    isActive: boolean
  }
}

export type User = CustomerUser | WorkshopUser

// Helper type guards
export function isCustomerUser(user: User): user is CustomerUser {
  return user.role === 'customer'
}

export function isWorkshopUser(user: User): user is WorkshopUser {
  return user.role === 'workshop'
}

// Database operations interface
export interface UserRepository {
  createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User>
  findUserByEmail(email: string): Promise<User | null>
  findUserById(id: string): Promise<User | null>
  updateUser(id: string, updates: Partial<User>): Promise<User | null>
  deleteUser(id: string): Promise<boolean>
  verifyUserEmail(id: string): Promise<boolean>
  updateUserPassword(id: string, hashedPassword: string): Promise<boolean>
}

// Default values for new users
export const defaultCustomerPreferences = {
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  preferredContactMethod: 'email' as const,
}

export const defaultWorkshopRatings = {
  averageRating: 0,
  totalReviews: 0,
  responseTime: 24,
}

export const defaultWorkshopSubscription = {
  plan: 'free' as const,
  startDate: new Date(),
  isActive: true,
}

export const defaultVerificationStatus = {
  isVerified: false,
  documents: {
    businessLicense: {
      uploaded: false,
    },
    insurance: {
      uploaded: false,
    },
  },
}
