'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Maximize,
  Grid3X3,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react'
import { CarMedia } from '@/models/CarProfile'

interface ImageGalleryProps {
  images: CarMedia[]
  className?: string
  columns?: number
  showCaptions?: boolean
  enableDownload?: boolean
}

export function ImageGallery({ 
  images, 
  className = "",
  columns = 4,
  showCaptions = true,
  enableDownload = true
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isGridView, setIsGridView] = useState(false)
  
  // Slideshow state
  const [isSlideshow, setIsSlideshow] = useState(false)
  const [slideshowInterval, setSlideshowInterval] = useState<NodeJS.Timeout | null>(null)

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null

  // Grid columns class mapping
  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }[columns] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  // Open lightbox
  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setIsOpen(true)
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // Close lightbox
  const closeLightbox = () => {
    setIsOpen(false)
    setSelectedIndex(null)
    stopSlideshow()
  }

  // Navigation
  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
      resetImageState()
    }
  }, [selectedIndex])

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1)
      resetImageState()
    }
  }, [selectedIndex, images.length])

  // Reset image transformations
  const resetImageState = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // Zoom functions
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25))
  }

  const resetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Rotation
  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Slideshow
  const startSlideshow = () => {
    setIsSlideshow(true)
    const interval = setInterval(() => {
      setSelectedIndex(prev => {
        if (prev === null) return 0
        return (prev + 1) % images.length
      })
      resetImageState()
    }, 3000)
    setSlideshowInterval(interval)
  }

  const stopSlideshow = () => {
    setIsSlideshow(false)
    if (slideshowInterval) {
      clearInterval(slideshowInterval)
      setSlideshowInterval(null)
    }
  }

  // Download image
  const downloadImage = async () => {
    if (!selectedImage) return
    
    try {
      const response = await fetch(selectedImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `car-image-${selectedIndex! + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case '0':
          resetZoom()
          break
        case 'r':
        case 'R':
          rotateImage()
          break
        case ' ':
          e.preventDefault()
          if (isSlideshow) {
            stopSlideshow()
          } else {
            startSlideshow()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, goToPrevious, goToNext, isSlideshow])

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3X3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No photos yet
        </h3>
        <p className="text-gray-600">
          Add photos to showcase your car
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid ${gridColsClass} gap-4 ${className}`}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group cursor-pointer aspect-square bg-gray-100 rounded-lg overflow-hidden"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={image.url}
              alt={image.caption || `Gallery image ${index + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              style={{ zIndex: 11 }}
              priority={index < 4} // Prioritize first 4 images
              onError={(e) => {
                console.error('Image failed to load:', image.url)
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', image.url)
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 z-10" />
            
            
            {/* Thumbnail indicator */}
            {image.isThumbnail && (
              <div className="absolute top-2 left-2 z-20">
                <Badge className="text-xs">Main</Badge>
              </div>
            )}
            
            {/* Video indicator */}
            {image.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Play className="h-12 w-12 text-white opacity-80" />
              </div>
            )}

            {/* Zoom icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black">
          <DialogTitle className="sr-only">
            Image Gallery - {selectedIndex !== null ? `Image ${selectedIndex + 1} of ${images.length}` : 'Gallery View'}
          </DialogTitle>
          <div className="relative w-full h-[95vh] flex flex-col">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-white bg-white/20">
                  {selectedIndex! + 1} of {images.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Slideshow Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isSlideshow ? stopSlideshow : startSlideshow}
                  className="text-white hover:bg-white/20"
                >
                  {isSlideshow ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                {/* Grid Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGridView(!isGridView)}
                  className="text-white hover:bg-white/20"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                
                {/* Download */}
                {enableDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadImage}
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeLightbox}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Image Container */}
            <div className="flex-1 relative overflow-hidden">
              {selectedImage && (
                <div
                  className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onWheel={handleWheel}
                >
                  {selectedImage.type === 'video' ? (
                    <video
                      src={selectedImage.url}
                      controls
                      className="max-w-full max-h-full object-contain"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`
                      }}
                    />
                  ) : (
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.caption || `Gallery image ${selectedIndex! + 1}`}
                      className="max-w-full max-h-full object-contain select-none"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                      }}
                      draggable={false}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {selectedIndex! > 0 && (
              <Button
                variant="ghost"
                size="lg"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 p-0"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            
            {selectedIndex! < images.length - 1 && (
              <Button
                variant="ghost"
                size="lg"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 p-0"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomOut}
                  disabled={zoom <= 0.25}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomIn}
                  disabled={zoom >= 3}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetZoom}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={rotateImage}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Caption */}
              {showCaptions && selectedImage?.caption && (
                <div className="text-white text-center max-w-md">
                  <p className="text-sm">{selectedImage.caption}</p>
                </div>
              )}

              {/* Image Info */}
              <div className="text-white text-xs opacity-70">
                {selectedImage?.dimensions && (
                  <span>
                    {selectedImage.dimensions.width} × {selectedImage.dimensions.height}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
                <div className="flex gap-2 bg-black/60 p-2 rounded-lg">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        setSelectedIndex(index)
                        resetImageState()
                      }}
                      className={`relative w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                        index === selectedIndex 
                          ? 'border-white scale-110' 
                          : 'border-transparent opacity-60 hover:opacity-80'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImageGallery