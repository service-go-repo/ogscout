'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  fallbackSrc?: string
  localPath?: string // Path to local image if available
  onError?: () => void
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  fallbackSrc,
  localPath,
  onError
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Debug logging - only log when there are issues
  if (imageError || isLoading) {
    console.log('🖼️ ImageWithFallback Status:', {
      src,
      imageSrc,
      imageError,
      isLoading,
      dimensions: { width, height, fill }
    })
  }

  // Reset states when src changes
  useEffect(() => {
    setImageSrc(src)
    setImageError(false)
    setIsLoading(true)
  }, [src])

  const handleError = (event?: any) => {
    console.error(`❌ Image failed to load:`, {
      src: imageSrc,
      originalSrc: src,
      localPath,
      fallbackSrc,
      errorEvent: event?.type,
      errorTarget: event?.target?.src
    })
    setImageError(true)
    
    // Try local path first if available
    if (localPath && imageSrc !== localPath) {
      console.log(`🔄 Trying local fallback: ${localPath}`)
      setImageSrc(localPath)
      setImageError(false)
      return
    }
    
    // Try custom fallback if provided
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      console.log(`🔄 Trying custom fallback: ${fallbackSrc}`)
      setImageSrc(fallbackSrc)
      setImageError(false)
      return
    }
    
    console.error(`❌ All fallbacks exhausted for image: ${src}`)
    
    // Call custom error handler if provided
    if (onError) {
      onError()
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // If all fallbacks failed, show placeholder
  if (imageError && imageSrc === (fallbackSrc || localPath)) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    )
  }

  const imageProps = {
    src: imageSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
    priority,
    sizes
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 300}
    />
  )
}

// Helper function to generate local image path from Cloudinary URL
export function getLocalImagePath(cloudinaryUrl: string, carId: string): string {
  if (!cloudinaryUrl) return ''
  
  try {
    // Extract filename from Cloudinary URL
    const urlParts = cloudinaryUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    
    // Remove Cloudinary transformations and get clean filename
    const cleanFilename = filename.split('_')[0] + '.' + filename.split('.').pop()
    
    // Return local path
    return `/images/cars/${carId}/${cleanFilename}`
  } catch (error) {
    console.error('Error generating local image path:', error)
    return ''
  }
}

// Helper function to check if local image exists
export async function checkLocalImageExists(localPath: string): Promise<boolean> {
  try {
    const response = await fetch(localPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}
