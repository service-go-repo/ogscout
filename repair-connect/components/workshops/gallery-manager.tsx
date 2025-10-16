'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import ImageUpload from '@/components/common/image-upload'
import {
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Edit,
  Trash2,
  Save,
  Loader2,
  Star,
  Eye,
  Download,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react'

interface GalleryImage {
  id: string
  url: string
  title: string
  description?: string
  category: 'facility' | 'equipment' | 'team' | 'work' | 'other'
  featured: boolean
  uploadDate: Date
}

interface GalleryManagerProps {
  images: GalleryImage[]
  onSave: (images: GalleryImage[]) => Promise<void>
  isLoading?: boolean
}

const imageCategories = [
  { value: 'facility', label: 'Facility & Workshop', color: 'bg-blue-100 text-blue-800' },
  { value: 'equipment', label: 'Tools & Equipment', color: 'bg-green-100 text-green-800' },
  { value: 'team', label: 'Team & Staff', color: 'bg-purple-100 text-purple-800' },
  { value: 'work', label: 'Work in Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]

export default function GalleryManager({ 
  images, 
  onSave, 
  isLoading = false 
}: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryImage[]>(images)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<{ images: GalleryImage[], index: number } | null>(null)

  const filteredImages = items.filter(image => 
    filterCategory === 'all' || image.category === filterCategory
  )

  const handleImageUpload = (uploadedFiles: any[]) => {
    const newImages: GalleryImage[] = uploadedFiles.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: file.secure_url,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'other' as const,
      featured: false,
      uploadDate: new Date()
    }))
    
    const updatedImages = [...items, ...newImages]
    setItems(updatedImages)
    onSave(updatedImages)
  }

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image)
  }

  const handleSaveEdit = async (updatedImage: GalleryImage) => {
    setIsSaving(true)
    try {
      const updatedImages = items.map(img => 
        img.id === updatedImage.id ? updatedImage : img
      )
      setItems(updatedImages)
      await onSave(updatedImages)
      setEditingImage(null)
    } catch (error) {
      console.error('Error updating image:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteImages = async (imageIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${imageIds.length} image(s)?`)) return
    
    setIsSaving(true)
    try {
      const updatedImages = items.filter(img => !imageIds.includes(img.id))
      setItems(updatedImages)
      setSelectedImages([])
      await onSave(updatedImages)
    } catch (error) {
      console.error('Error deleting images:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleFeatured = async (imageId: string) => {
    setIsSaving(true)
    try {
      const updatedImages = items.map(img => 
        img.id === imageId ? { ...img, featured: !img.featured } : img
      )
      setItems(updatedImages)
      await onSave(updatedImages)
    } catch (error) {
      console.error('Error updating featured status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectImage = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map(img => img.id))
    }
  }

  const getCategoryInfo = (category: string) => {
    return imageCategories.find(cat => cat.value === category) || imageCategories[4]
  }

  const handleViewImage = (image: GalleryImage) => {
    const currentImages = filteredImages
    const currentIndex = currentImages.findIndex(img => img.id === image.id)
    setLightboxImage({ images: currentImages, index: currentIndex })
  }

  const handleNextImage = () => {
    if (!lightboxImage) return
    const nextIndex = (lightboxImage.index + 1) % lightboxImage.images.length
    setLightboxImage({ ...lightboxImage, index: nextIndex })
  }

  const handlePrevImage = () => {
    if (!lightboxImage) return
    const prevIndex = lightboxImage.index === 0 ? lightboxImage.images.length - 1 : lightboxImage.index - 1
    setLightboxImage({ ...lightboxImage, index: prevIndex })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNextImage()
    if (e.key === 'ArrowLeft') handlePrevImage()
    if (e.key === 'Escape') setLightboxImage(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gallery Management</h3>
          <p className="text-sm text-gray-600">
            Manage your workshop photos and showcase your facility
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowUpload(!showUpload)}
            disabled={isSaving}
          >
            <Upload className="w-4 h-4 mr-2" />
            {showUpload ? 'Hide Upload' : 'Upload Images'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {imageCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Selection Controls */}
          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedImages.length} selected
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteImages(selectedImages)}
                disabled={isSaving}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSelectAll}
            disabled={filteredImages.length === 0}
          >
            {selectedImages.length === filteredImages.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              uploadType="gallery"
              maxFiles={20}
              maxSizePerFile={10}
              onUploadComplete={handleImageUpload}
              onUploadError={(error) => {
                console.error('Gallery upload error:', error)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images</h3>
            <p className="text-gray-600 mb-4">
              Upload photos of your workshop to showcase your facility and capabilities
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Images
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => {
            const categoryInfo = getCategoryInfo(image.category)
            const isSelected = selectedImages.includes(image.id)
            
            return (
              <Card key={image.id} className={`overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="relative aspect-square cursor-pointer" onClick={() => handleViewImage(image)}>
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditImage(image)
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewImage(image)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectImage(image.id)}
                      className="bg-white"
                    />
                  </div>

                  {/* Featured Badge */}
                  {image.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      <Star className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{image.title}</h4>
                  <Badge className={`text-xs ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </Badge>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(image.uploadDate).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFeatured(image.id)
                      }}
                      disabled={isSaving}
                    >
                      <Star className={`w-3 h-3 ${image.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredImages.map((image) => {
            const categoryInfo = getCategoryInfo(image.category)
            const isSelected = selectedImages.includes(image.id)
            
            return (
              <Card key={image.id} className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectImage(image.id)}
                    />
                    
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{image.title}</h4>
                        {image.featured && (
                          <Badge className="bg-yellow-500">
                            <Star className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Badge className={categoryInfo.color}>
                          {categoryInfo.label}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(image.uploadDate).toLocaleDateString()}</span>
                      </div>
                      
                      {image.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {image.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFeatured(image.id)}
                        disabled={isSaving}
                      >
                        <Star className={`w-3 h-3 ${image.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditImage(image)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewImage(image)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({
                    ...editingImage,
                    title: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingImage.description || ''}
                  onChange={(e) => setEditingImage({
                    ...editingImage,
                    description: e.target.value
                  })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={editingImage.category}
                  onChange={(e) => setEditingImage({
                    ...editingImage,
                    category: e.target.value as any
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {imageCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  checked={editingImage.featured}
                  onCheckedChange={(checked) => setEditingImage({
                    ...editingImage,
                    featured: !!checked
                  })}
                />
                <Label htmlFor="edit-featured">Featured image</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveEdit(editingImage)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingImage(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
          <DialogContent
            className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-none"
            onKeyDown={handleKeyPress}
          >
            {/* Visually hidden title for accessibility */}
            <DialogTitle className="sr-only">
              Gallery Image {lightboxImage.index + 1} of {lightboxImage.images.length}
            </DialogTitle>

            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setLightboxImage(null)}
              >
                <XCircle className="w-6 h-6" />
              </Button>

              {/* Image Counter & Info */}
              <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-lg space-y-1">
                <div className="text-sm font-medium">
                  Image {lightboxImage.index + 1} / {lightboxImage.images.length}
                </div>
                {lightboxImage.images[lightboxImage.index].title && (
                  <div className="text-xs text-gray-300">
                    {lightboxImage.images[lightboxImage.index].title}
                  </div>
                )}
              </div>

              {/* Category Badge */}
              {lightboxImage.images[lightboxImage.index].category && (
                <div className="absolute top-20 left-4 z-50">
                  <Badge className={getCategoryInfo(lightboxImage.images[lightboxImage.index].category).color}>
                    {getCategoryInfo(lightboxImage.images[lightboxImage.index].category).label}
                  </Badge>
                </div>
              )}

              {/* Navigation Buttons */}
              {lightboxImage.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </>
              )}

              {/* Main Image */}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={lightboxImage.images[lightboxImage.index].url}
                  alt={lightboxImage.images[lightboxImage.index].title}
                  className="max-w-full max-h-[85vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Thumbnail Strip */}
              {lightboxImage.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 rounded-lg p-2 max-w-[90vw] overflow-x-auto">
                  <div className="flex gap-2">
                    {lightboxImage.images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setLightboxImage({ ...lightboxImage, index: idx })}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                          idx === lightboxImage.index
                            ? 'border-white scale-110'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
