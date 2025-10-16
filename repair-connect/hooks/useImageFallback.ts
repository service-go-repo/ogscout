'use client'

import { useState, useEffect } from 'react'
import { getImageWithFallback, checkLocalImageExists, DEFAULT_PLACEHOLDERS } from '@/lib/imageStorage'

interface UseImageFallbackOptions {
  cloudinaryUrl: string
  carId: string
  filename?: string
  fallbackType?: 'car' | 'damage' | 'profile'
}

interface UseImageFallbackReturn {
  src: string
  isLoading: boolean
  hasError: boolean
  isUsingFallback: boolean
  retry: () => void
}

export function useImageFallback({
  cloudinaryUrl,
  carId,
  filename,
  fallbackType = 'car'
}: UseImageFallbackOptions): UseImageFallbackReturn {
  const [src, setSrc] = useState(cloudinaryUrl)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [attemptedSources, setAttemptedSources] = useState<Set<string>>(new Set())

  const imageData = getImageWithFallback(cloudinaryUrl, carId, filename || '')
  const finalFallback = DEFAULT_PLACEHOLDERS[fallbackType]

  const tryNextSource = async () => {
    // If we haven't tried the original Cloudinary URL yet
    if (!attemptedSources.has(cloudinaryUrl) && cloudinaryUrl) {
      setAttemptedSources(prev => new Set(prev).add(cloudinaryUrl))
      setSrc(cloudinaryUrl)
      setIsUsingFallback(false)
      return
    }

    // If we haven't tried the local path yet
    if (!attemptedSources.has(imageData.localPath) && imageData.localPath) {
      const localExists = await checkLocalImageExists(imageData.localPath)
      if (localExists) {
        setAttemptedSources(prev => new Set(prev).add(imageData.localPath))
        setSrc(imageData.localPath)
        setIsUsingFallback(true)
        return
      }
    }

    // Use final fallback
    if (!attemptedSources.has(finalFallback)) {
      setAttemptedSources(prev => new Set(prev).add(finalFallback))
      setSrc(finalFallback)
      setIsUsingFallback(true)
      setHasError(true)
      return
    }

    // All sources failed
    setHasError(true)
    setIsUsingFallback(true)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    console.warn(`Failed to load image: ${src}`)
    setIsLoading(false)
    tryNextSource()
  }

  const retry = () => {
    setAttemptedSources(new Set())
    setHasError(false)
    setIsLoading(true)
    setIsUsingFallback(false)
    tryNextSource()
  }

  // Initialize on mount or when dependencies change
  useEffect(() => {
    setAttemptedSources(new Set())
    setHasError(false)
    setIsLoading(true)
    setIsUsingFallback(false)
    tryNextSource()
  }, [cloudinaryUrl, carId, filename])

  return {
    src,
    isLoading,
    hasError,
    isUsingFallback,
    retry
  }
}

// Simplified hook for basic image fallback
export function useSimpleImageFallback(cloudinaryUrl: string, localPath?: string): string {
  const [src, setSrc] = useState(cloudinaryUrl)
  const [hasTriedLocal, setHasTriedLocal] = useState(false)

  useEffect(() => {
    setSrc(cloudinaryUrl)
    setHasTriedLocal(false)
  }, [cloudinaryUrl])

  const handleError = async () => {
    if (!hasTriedLocal && localPath) {
      const localExists = await checkLocalImageExists(localPath)
      if (localExists) {
        setSrc(localPath)
        setHasTriedLocal(true)
        return
      }
    }
    
    // Use default car placeholder
    setSrc(DEFAULT_PLACEHOLDERS.car)
  }

  return src
}
