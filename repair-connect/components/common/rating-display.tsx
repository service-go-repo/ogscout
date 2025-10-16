'use client'

import { Star } from 'lucide-react'
import { getRatingColor } from '@/models/Workshop'

interface RatingDisplayProps {
  rating: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function RatingDisplay({
  rating,
  totalReviews,
  size = 'md',
  showText = true,
  className = ''
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
        />
      )
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className={`${sizeClasses[size]} relative`}>
          <Star className={`${sizeClasses[size]} text-gray-300 absolute`} />
          <div className="overflow-hidden w-1/2">
            <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-gray-300`}
        />
      )
    }

    return stars
  }

  if (rating === 0 && totalReviews === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`${sizeClasses[size]} text-gray-300`}
            />
          ))}
        </div>
        {showText && (
          <span className={`text-gray-500 ${textSizeClasses[size]}`}>
            No reviews yet
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showText && (
        <span className={`${getRatingColor(rating)} font-medium ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {showText && totalReviews !== undefined && (
        <span className={`text-gray-500 ${textSizeClasses[size]}`}>
          ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  )
}
