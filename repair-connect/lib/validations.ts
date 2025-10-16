import { z } from 'zod'

// User roles
export const UserRole = z.enum(['customer', 'workshop'])

// Base user schema
export const BaseUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  role: UserRole,
})

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

// Customer registration schema
export const CustomerRegistrationSchema = BaseUserSchema.extend({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Simplified Workshop registration schema
export const WorkshopRegistrationSchema = BaseUserSchema.extend({
  // Essential Business Information Only
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessPhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  businessAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  }),
  
  // Owner Information
  ownerFirstName: z.string().min(2, 'First name must be at least 2 characters'),
  ownerLastName: z.string().min(2, 'Last name must be at least 2 characters'),
  
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Type exports
export type LoginFormData = z.infer<typeof LoginSchema>
export type CustomerRegistrationData = z.infer<typeof CustomerRegistrationSchema>
export type WorkshopRegistrationData = z.infer<typeof WorkshopRegistrationSchema>
export type UserRoleType = z.infer<typeof UserRole>

// Service types for workshops
export const WorkshopServices = [
  'Engine Repair',
  'Brake Service',
  'Oil Change',
  'Tire Service',
  'Body Work',
  'Paint Service',
  'Electrical Repair',
  'AC/Heating',
  'Transmission',
  'Suspension',
  'Exhaust System',
  'Diagnostic',
] as const

export const BusinessTypes = [
  { value: 'auto_repair', label: 'Auto Repair Shop' },
  { value: 'body_shop', label: 'Body Shop' },
  { value: 'tire_service', label: 'Tire Service' },
  { value: 'oil_change', label: 'Quick Lube' },
  { value: 'specialty', label: 'Specialty Shop' },
] as const

// Car validation schemas
export const carBasicInfoSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  color: z.string().min(1, 'Color is required'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters'),
  licensePlate: z.string().min(1, 'License plate is required'),
  mileage: z.number().min(0, 'Mileage must be positive').optional(),
})

export const locationInfoSchema = z.object({
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
})

// Type exports for car schemas
export type CarBasicInfo = z.infer<typeof carBasicInfoSchema>
export type LocationInfo = z.infer<typeof locationInfoSchema>
