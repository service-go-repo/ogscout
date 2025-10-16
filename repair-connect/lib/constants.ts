export const APP_NAME = 'Repair Connect'
export const APP_DESCRIPTION = 'Connect with trusted car repair professionals in your area'

export const DAMAGE_TYPES = {
  DENT: 'dent',
  SCRATCH: 'scratch',
  CRACK: 'crack',
  PAINT: 'paint',
  ELECTRICAL: 'electrical',
  MECHANICAL: 'mechanical',
} as const

export const REPAIR_CATEGORIES = {
  BODY_WORK: 'Body Work',
  PAINT: 'Paint & Refinishing',
  MECHANICAL: 'Mechanical Repair',
  ELECTRICAL: 'Electrical Systems',
  GLASS: 'Glass Repair',
  INTERIOR: 'Interior Repair',
} as const

export const QUOTE_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const

export const NAVIGATION_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'Find Shops', href: '/shops' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'About', href: '/about' },
] as const

export const FEATURE_CARDS = [
  {
    title: 'Upload Damage',
    description: 'Take photos of your car damage and get instant estimates',
    icon: 'camera',
    color: 'primary',
  },
  {
    title: 'Get Quotes',
    description: 'Receive competitive quotes from verified repair shops',
    icon: 'calculator',
    color: 'secondary',
  },
  {
    title: 'Book Repair',
    description: 'Schedule your repair with trusted professionals',
    icon: 'calendar',
    color: 'success',
  },
] as const

export const TRUST_INDICATORS = [
  '10,000+ Happy Customers',
  'Verified Repair Shops',
  'Instant Quotes',
  '24/7 Support',
] as const