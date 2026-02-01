'use client'

import { Badge } from '@/components/ui/badge'
import { 
  ServiceType, 
  CarBrand, 
  getServiceTypeLabel, 
  getCarBrandLabel 
} from '@/models/Workshop'

interface SpecializationBadgesProps {
  serviceTypes?: ServiceType[]
  carBrands?: CarBrand[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}

export default function SpecializationBadges({
  serviceTypes = [],
  carBrands = [],
  maxDisplay = 6,
  size = 'md',
  variant = 'outline',
  className = ''
}: SpecializationBadgesProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const renderBadges = (items: string[], labels: Record<string, string>, type: 'service' | 'brand') => {
    if (items.length === 0) return null

    const displayItems = items.slice(0, maxDisplay)
    const remainingCount = items.length - maxDisplay

    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {displayItems.map((item) => (
          <Badge
            key={item}
            variant={variant}
            className={`${sizeClasses[size]} ${
              type === 'service' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' : 'bg-[var(--ns-green-light)] text-[var(--secondary)] border-[var(--ns-green)]'
            }`}
          >
            {labels[item] || item}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge
            variant="secondary"
            className={`${sizeClasses[size]} bg-background-3 dark:bg-background-7 text-secondary/60 dark:text-accent/60`}
          >
            +{remainingCount} more
          </Badge>
        )}
      </div>
    )
  }

  const serviceLabels = serviceTypes.reduce((acc, type) => {
    acc[type] = getServiceTypeLabel(type)
    return acc
  }, {} as Record<string, string>)

  const brandLabels = carBrands.reduce((acc, brand) => {
    acc[brand] = getCarBrandLabel(brand)
    return acc
  }, {} as Record<string, string>)

  return (
    <div className="space-y-2">
      {serviceTypes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-secondary dark:text-accent mb-1">Services</h4>
          {renderBadges(serviceTypes, serviceLabels, 'service')}
        </div>
      )}
      {carBrands.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-secondary dark:text-accent mb-1">Car Brands</h4>
          {renderBadges(carBrands, brandLabels, 'brand')}
        </div>
      )}
    </div>
  )
}

// Compact version for cards
export function CompactSpecializationBadges({
  serviceTypes = [],
  carBrands = [],
  maxDisplay = 4,
  className = ''
}: Omit<SpecializationBadgesProps, 'size' | 'variant'>) {
  const allSpecializations = [
    ...serviceTypes.map(type => ({ type: 'service', value: type, label: getServiceTypeLabel(type) })),
    ...carBrands.map(brand => ({ type: 'brand', value: brand, label: getCarBrandLabel(brand) }))
  ]

  const displayItems = allSpecializations.slice(0, maxDisplay)
  const remainingCount = allSpecializations.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayItems.map((item) => (
        <Badge
          key={`${item.type}-${item.value}`}
          variant="outline"
          className={`text-xs px-2 py-1 ${
            item.type === 'service' 
              ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' 
              : 'bg-[var(--ns-green-light)] text-[var(--secondary)] border-[var(--ns-green)]'
          }`}
        >
          {item.label}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className="text-xs px-2 py-1 bg-background-3 dark:bg-background-7 text-secondary/60 dark:text-accent/60"
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}
