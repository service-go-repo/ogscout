'use client'

import { useState, useEffect } from 'react'
import { Camera, Play, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  type: 'photo' | 'video'
  category?: string
  publicId?: string
  size?: number
  uploadedAt?: Date
}

interface CarImageGalleryProps {
  media: MediaItem[]
  carName: string
}

export function CarImageGallery({ media, carName }: CarImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)



  // Separate photos and videos
  const photos = media.filter(item => item.type === 'photo')
  const videos = media.filter(item => item.type === 'video')

  // Initialize PhotoSwipe
  useEffect(() => {
    if (typeof window !== 'undefined' && lightboxOpen) {
      import('photoswipe').then(({ default: PhotoSwipe }) => {
        const items = photos.map(photo => ({
          src: photo.url,
          width: 800,
          height: 600,
          alt: `${carName} - ${photo.category || 'Photo'}`
        }))

        const pswp = new PhotoSwipe({
          dataSource: items,
          index: selectedImageIndex,
          showHideAnimationType: 'zoom',
          bgOpacity: 0.9,
          closeOnVerticalDrag: true,
          wheelToZoom: true
        })

        pswp.on('close', () => {
          setLightboxOpen(false)
        })

        pswp.init()
      })
    }
  }, [lightboxOpen, selectedImageIndex, photos, carName])

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  // Calculate total file size
  const totalSize = media.reduce((acc, item) => acc + (item.size || 0), 0)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No media uploaded</h3>
        <p className="text-gray-500">Upload photos and videos to showcase your vehicle.</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No photos available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gallery Layout - Featured Image + Thumbnails */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Featured Image - Left Side */}
        <div className="lg:w-2/3">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
            <div className="aspect-[4/3] relative">
              <img
                src={photos[selectedImageIndex]?.url}
                alt={`${carName} - Featured Image`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ 
                  zIndex: 51,
                  position: 'relative'
                }}
                onClick={() => openLightbox(selectedImageIndex)}
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-car.svg'
                }}
              />
            </div>


            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  style={{ zIndex: 55 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  style={{ zIndex: 55 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div 
              className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm"
              style={{ zIndex: 55 }}
            >
              {selectedImageIndex + 1} / {photos.length}
            </div>

            {/* Category Badge */}
            {photos[selectedImageIndex]?.category && (
              <div 
                className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
                style={{ zIndex: 55 }}
              >
                {photos[selectedImageIndex].category}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Grid - Right Side */}
        <div className="lg:w-1/3">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 max-h-96 lg:max-h-[600px] overflow-y-auto">
            {photos.map((photo, index) => (
              <div
                key={`thumb-${index}-${photo.publicId || photo.id}`}
                className={`relative bg-gray-100 rounded overflow-hidden cursor-pointer group transition-all duration-200 ${
                  index === selectedImageIndex ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    style={{ 
                      zIndex: 51,
                      position: 'relative'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-car.svg'
                    }}
                  />
                </div>
                
                {/* Thumbnail Overlay */}
                <div 
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200"
                  style={{ zIndex: 50 }}
                />
                
                {/* Thumbnail Number */}
                <div 
                  className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white px-1 py-0.5 rounded text-xs"
                  style={{ zIndex: 55 }}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* Videos Section */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Play className="w-5 h-5 mr-2" />
            Videos ({videos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <div
                key={`video-${index}-${video.publicId || video.id}`}
                className="relative bg-gray-100 rounded-lg overflow-hidden"
              >
                <video
                  src={video.url}
                  className="w-full h-48 object-cover"
                  controls
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded flex items-center">
                  <Play className="w-3 h-3 mr-1" />
                  Video
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Media Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Items:</span>
            <span className="ml-2 font-medium">{media.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Photos:</span>
            <span className="ml-2 font-medium">{photos.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Videos:</span>
            <span className="ml-2 font-medium">{videos.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Size:</span>
            <span className="ml-2 font-medium">{formatFileSize(totalSize)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
