'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'

interface ImageViewerProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
  title?: string
}

export default function ImageViewer({ images, isOpen, onClose, title = "Vehicle Images" }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(1)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setZoom(1)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setZoom(1)
  }

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = images[currentIndex]
    link.download = `vehicle-image-${currentIndex + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!images.length) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {images.length}
              </span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          {/* Main Image */}
          <div className="relative h-[60vh] bg-gray-100 flex items-center justify-center overflow-hidden">
            <div 
              className="relative transition-transform duration-200 ease-in-out"
              style={{ transform: `scale(${zoom})` }}
            >
              <Image
                src={images[currentIndex]}
                alt={`Vehicle image ${currentIndex + 1}`}
                width={800}
                height={600}
                className="max-h-full max-w-full object-contain"
                priority
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={zoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={zoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentIndex 
                        ? 'border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index)
                      setZoom(1)
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="p-4 border-t flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              {images.length > 1 && (
                <>
                  <Button variant="outline" size="sm" onClick={prevImage}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextImage}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </>
              )}
            </div>
            
            <Button variant="outline" size="sm" onClick={downloadImage}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
