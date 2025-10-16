'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ImageUpload from '@/components/common/image-upload'
import {
  Camera,
  Plus,
  X,
  Upload,
  Edit,
  Trash2,
  Save,
  Loader2,
  Star,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react'
import { 
  PortfolioItem, 
  ServiceType, 
  CarBrand, 
  getServiceTypeLabel,
  getCarBrandLabel 
} from '@/models/Workshop'

const portfolioItemSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  serviceType: z.enum(['repair', 'maintenance', 'inspection', 'bodywork', 'paint', 'engine', 'transmission', 'brakes', 'electrical', 'tires', 'glass', 'detailing', 'other']),
  carBrand: z.enum(['audi', 'bmw', 'mercedes', 'volkswagen', 'toyota', 'honda', 'nissan', 'ford', 'chevrolet', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura', 'infiniti', 'cadillac', 'lincoln', 'buick', 'gmc', 'jeep', 'ram', 'chrysler', 'dodge', 'fiat', 'alfa_romeo', 'maserati', 'ferrari', 'lamborghini', 'porsche', 'tesla', 'volvo', 'saab', 'jaguar', 'land_rover', 'mini', 'smart', 'mitsubishi', 'suzuki', 'isuzu', 'other']).optional(),
  completedDate: z.string(),
  featured: z.boolean()
})

type PortfolioItemForm = z.infer<typeof portfolioItemSchema>

interface PortfolioManagerProps {
  portfolioItems: PortfolioItem[]
  onSave: (items: PortfolioItem[]) => Promise<void>
  isLoading?: boolean
}

export default function PortfolioManager({ 
  portfolioItems, 
  onSave, 
  isLoading = false 
}: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioItem[]>(portfolioItems)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [beforeImages, setBeforeImages] = useState<string[]>([])
  const [afterImages, setAfterImages] = useState<string[]>([])
  const [viewingPortfolio, setViewingPortfolio] = useState<PortfolioItem | null>(null)
  const [lightboxImage, setLightboxImage] = useState<{ images: string[], index: number, type: 'before' | 'after' } | null>(null)

  const form = useForm<PortfolioItemForm>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      title: '',
      description: '',
      serviceType: 'repair',
      completedDate: new Date().toISOString().split('T')[0],
      featured: false
    }
  })

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingItem(null)
    form.reset({
      title: '',
      description: '',
      serviceType: 'repair',
      completedDate: new Date().toISOString().split('T')[0],
      featured: false
    })
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item.id)
    setIsAddingNew(false)
    setBeforeImages(item.beforeImages || [])
    setAfterImages(item.afterImages || [])
    form.reset({
      title: item.title,
      description: item.description,
      serviceType: item.serviceType,
      carBrand: item.carBrand,
      completedDate: new Date(item.completedDate).toISOString().split('T')[0],
      featured: item.featured
    })
  }

  const handleSave = async (data: PortfolioItemForm) => {
    setIsSaving(true)
    try {
      const portfolioItem: PortfolioItem = {
        id: editingItem || `portfolio-${Date.now()}`,
        title: data.title,
        description: data.description,
        serviceType: data.serviceType,
        carBrand: data.carBrand,
        completedDate: new Date(data.completedDate),
        featured: data.featured,
        beforeImages: beforeImages,
        afterImages: afterImages
      }

      let updatedItems: PortfolioItem[]
      if (editingItem) {
        updatedItems = items.map(item => 
          item.id === editingItem ? portfolioItem : item
        )
      } else {
        updatedItems = [...items, portfolioItem]
      }

      setItems(updatedItems)
      await onSave(updatedItems)
      
      setIsAddingNew(false)
      setEditingItem(null)
      form.reset()
    } catch (error) {
      console.error('Error saving portfolio item:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return
    
    setIsSaving(true)
    try {
      const updatedItems = items.filter(item => item.id !== itemId)
      setItems(updatedItems)
      await onSave(updatedItems)
    } catch (error) {
      console.error('Error deleting portfolio item:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsAddingNew(false)
    setEditingItem(null)
    setBeforeImages([])
    setAfterImages([])
    form.reset()
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
          <h3 className="text-lg font-semibold">Portfolio Management</h3>
          <p className="text-sm text-gray-600">
            Showcase your best work with before and after photos
          </p>
        </div>
        <Button onClick={handleAddNew} disabled={isAddingNew || !!editingItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Portfolio Item
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingItem) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Add New Portfolio Item' : 'Edit Portfolio Item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Engine Rebuild - 2018 BMW M3"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select 
                    value={form.watch('serviceType')} 
                    onValueChange={(value) => form.setValue('serviceType', value as ServiceType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['repair', 'maintenance', 'inspection', 'bodywork', 'paint', 'engine', 'transmission', 'brakes', 'electrical', 'tires', 'glass', 'detailing', 'other'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {getServiceTypeLabel(type as ServiceType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Describe the work performed, challenges overcome, and results achieved..."
                  rows={3}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carBrand">Car Brand</Label>
                  <Select 
                    value={form.watch('carBrand') || ''} 
                    onValueChange={(value) => form.setValue('carBrand', value as CarBrand)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select car brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {['audi', 'bmw', 'mercedes', 'volkswagen', 'toyota', 'honda', 'nissan', 'ford', 'chevrolet', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura', 'infiniti', 'tesla', 'other'].map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {getCarBrandLabel(brand as CarBrand)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="completedDate">Completion Date *</Label>
                  <Input
                    id="completedDate"
                    type="date"
                    {...form.register('completedDate')}
                  />
                  {form.formState.errors.completedDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.completedDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={form.watch('featured')}
                  onCheckedChange={(checked) => form.setValue('featured', !!checked)}
                />
                <Label htmlFor="featured">Featured project (will be highlighted)</Label>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Before Photos</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload photos showing the condition before work began
                  </p>
                  <ImageUpload
                    uploadType="portfolio"
                    category="before"
                    maxFiles={5}
                    maxSizePerFile={10}
                    existingImages={beforeImages}
                    onUploadComplete={(files) => {
                      const newUrls = files.map(f => f.secure_url)
                      setBeforeImages(prev => [...prev, ...newUrls])
                    }}
                    onUploadError={(error) => {
                      console.error('Before photos upload error:', error)
                    }}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">After Photos</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload photos showing the completed work
                  </p>
                  <ImageUpload
                    uploadType="portfolio"
                    category="after"
                    maxFiles={5}
                    maxSizePerFile={10}
                    existingImages={afterImages}
                    onUploadComplete={(files) => {
                      const newUrls = files.map(f => f.secure_url)
                      setAfterImages(prev => [...prev, ...newUrls])
                    }}
                    onUploadError={(error) => {
                      console.error('After photos upload error:', error)
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isAddingNew ? 'Add Portfolio Item' : 'Update Portfolio Item'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Items List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items</h3>
              <p className="text-gray-600 mb-4">
                Start building your portfolio by adding your first project
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {item.afterImages.length > 0 ? (
                    <img
                      src={item.afterImages[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {item.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                        disabled={isAddingNew || !!editingItem}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        disabled={isSaving}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline">
                      {getServiceTypeLabel(item.serviceType)}
                    </Badge>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(item.completedDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {item.carBrand && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {getCarBrandLabel(item.carBrand)}
                      </Badge>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingPortfolio(item)}
                      className="w-full text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Detail Modal */}
      <Dialog open={!!viewingPortfolio} onOpenChange={(open) => !open && setViewingPortfolio(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Portfolio Project Details
            </DialogTitle>
          </DialogHeader>

          {viewingPortfolio && (
            <div className="space-y-6">
              {/* Title and Featured Badge */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{viewingPortfolio.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{viewingPortfolio.description}</p>
                </div>
                {viewingPortfolio.featured && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Before & After Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Images */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Before Photos</Label>
                  {viewingPortfolio.beforeImages && viewingPortfolio.beforeImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {viewingPortfolio.beforeImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-video rounded-lg overflow-hidden border bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightboxImage({ images: viewingPortfolio.beforeImages, index: idx, type: 'before' })}
                        >
                          <img
                            src={img}
                            alt={`Before ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border bg-gray-50 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* After Images */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">After Photos</Label>
                  {viewingPortfolio.afterImages && viewingPortfolio.afterImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {viewingPortfolio.afterImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-video rounded-lg overflow-hidden border bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightboxImage({ images: viewingPortfolio.afterImages, index: idx, type: 'after' })}
                        >
                          <img
                            src={img}
                            alt={`After ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border bg-gray-50 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-muted-foreground">Service Type</Label>
                  <div className="font-medium mt-1">
                    <Badge variant="outline">
                      {getServiceTypeLabel(viewingPortfolio.serviceType)}
                    </Badge>
                  </div>
                </div>

                {viewingPortfolio.carBrand && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Car Brand</Label>
                    <div className="font-medium mt-1">
                      <Badge variant="secondary">
                        {getCarBrandLabel(viewingPortfolio.carBrand)}
                      </Badge>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-muted-foreground">Completion Date</Label>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(viewingPortfolio.completedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  if (viewingPortfolio) {
                    handleEdit(viewingPortfolio)
                    setViewingPortfolio(null)
                  }
                }}
                className="flex-1 sm:flex-none"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (viewingPortfolio) {
                    setViewingPortfolio(null)
                    handleDelete(viewingPortfolio.id)
                  }
                }}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setViewingPortfolio(null)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
          <DialogContent
            className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-none"
            onKeyDown={handleKeyPress}
          >
            {/* Visually hidden title for accessibility */}
            <DialogTitle className="sr-only">
              {lightboxImage.type === 'before' ? 'Before' : 'After'} Photo {lightboxImage.index + 1} of {lightboxImage.images.length}
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

              {/* Image Counter */}
              <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-lg">
                <div className="text-sm font-medium">
                  {lightboxImage.type === 'before' ? 'Before' : 'After'} Photo {lightboxImage.index + 1} / {lightboxImage.images.length}
                </div>
              </div>

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
                  src={lightboxImage.images[lightboxImage.index]}
                  alt={`${lightboxImage.type} ${lightboxImage.index + 1}`}
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
                        key={idx}
                        onClick={() => setLightboxImage({ ...lightboxImage, index: idx })}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                          idx === lightboxImage.index
                            ? 'border-white scale-110'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
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
