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
  Award,
  Plus,
  X,
  Upload,
  Edit,
  Trash2,
  Save,
  Loader2,
  Calendar,
  ExternalLink,
  Shield,
  CheckCircle,
  Eye
} from 'lucide-react'
import { Certification, CertificationType } from '@/models/Workshop'

const certificationSchema = z.object({
  name: z.string().min(3, 'Certification name must be at least 3 characters'),
  issuedBy: z.string().min(2, 'Issuer must be at least 2 characters'),
  issuedDate: z.string(),
  expiryDate: z.string().optional(),
  certificateNumber: z.string().optional(),
  type: z.enum(['ase', 'manufacturer', 'i_car', 'natef', 'osha', 'epa', 'other']),
  verified: z.boolean()
})

type CertificationForm = z.infer<typeof certificationSchema>

interface CertificationManagerProps {
  certifications: (Certification & { id: string })[]
  onSave: (certifications: (Certification & { id: string })[]) => Promise<void>
  isLoading?: boolean
}

const certificationTypes = [
  { value: 'ase', label: 'ASE Certification', icon: Award },
  { value: 'manufacturer', label: 'Manufacturer Certification', icon: Shield },
  { value: 'i_car', label: 'I-CAR Certification', icon: CheckCircle },
  { value: 'natef', label: 'NATEF Certification', icon: Award },
  { value: 'osha', label: 'OSHA Certification', icon: Shield },
  { value: 'epa', label: 'EPA Certification', icon: CheckCircle },
  { value: 'other', label: 'Other Certification', icon: Award }
]

export default function CertificationManager({ 
  certifications, 
  onSave, 
  isLoading = false 
}: CertificationManagerProps) {
  const [items, setItems] = useState<(Certification & { id: string })[]>(certifications)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [certificateImages, setCertificateImages] = useState<string[]>([])
  const [viewingCertificate, setViewingCertificate] = useState<(Certification & { id: string; imageUrl?: string }) | null>(null)

  const form = useForm<CertificationForm>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: '',
      issuedBy: '',
      issuedDate: new Date().toISOString().split('T')[0],
      type: 'ase',
      verified: false
    }
  })

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingItem(null)
    setCertificateImages([])
    form.reset({
      name: '',
      issuedBy: '',
      issuedDate: new Date().toISOString().split('T')[0],
      type: 'ase',
      verified: false
    })
  }

  const handleEdit = (item: Certification & { id: string; imageUrl?: string }) => {
    setEditingItem(item.id)
    setIsAddingNew(false)
    setCertificateImages(item.imageUrl ? [item.imageUrl] : [])
    form.reset({
      name: item.name,
      issuedBy: item.issuedBy,
      issuedDate: new Date(item.issuedDate).toISOString().split('T')[0],
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      certificateNumber: item.certificateNumber || '',
      type: item.type,
      verified: item.verified
    })
  }

  const handleSave = async (data: CertificationForm) => {
    setIsSaving(true)
    try {
      const certification: Certification & { id: string; imageUrl?: string } = {
        id: editingItem || `cert-${Date.now()}`,
        name: data.name,
        issuedBy: data.issuedBy,
        issuedDate: new Date(data.issuedDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        certificateNumber: data.certificateNumber,
        type: data.type,
        verified: data.verified,
        imageUrl: certificateImages[0] || undefined
      }

      let updatedItems: (Certification & { id: string })[]
      if (editingItem) {
        updatedItems = items.map(item => 
          item.id === editingItem ? certification : item
        )
      } else {
        updatedItems = [...items, certification]
      }

      setItems(updatedItems)
      await onSave(updatedItems)
      
      setIsAddingNew(false)
      setEditingItem(null)
      form.reset()
    } catch (error) {
      console.error('Error saving certification:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return
    
    setIsSaving(true)
    try {
      const updatedItems = items.filter(item => item.id !== itemId)
      setItems(updatedItems)
      await onSave(updatedItems)
    } catch (error) {
      console.error('Error deleting certification:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsAddingNew(false)
    setEditingItem(null)
    setCertificateImages([])
    form.reset()
  }

  const isExpired = (expiryDate?: Date) => {
    if (!expiryDate) return false
    return new Date() > expiryDate
  }

  const isExpiringSoon = (expiryDate?: Date) => {
    if (!expiryDate) return false
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return new Date() < expiryDate && expiryDate < thirtyDaysFromNow
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Certification Management</h3>
          <p className="text-sm text-gray-600">
            Manage your professional certifications and credentials
          </p>
        </div>
        <Button onClick={handleAddNew} disabled={isAddingNew || !!editingItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingItem) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Add New Certification' : 'Edit Certification'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Certification Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="ASE Master Technician"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="issuedBy">Issuing Organization *</Label>
                  <Input
                    id="issuedBy"
                    {...form.register('issuedBy')}
                    placeholder="National Institute for Automotive Service Excellence"
                  />
                  {form.formState.errors.issuedBy && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.issuedBy.message}
                    </p>
                  )}
                </div>
              </div>



              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Certification Type *</Label>
                  <Select 
                    value={form.watch('type')} 
                    onValueChange={(value) => form.setValue('type', value as CertificationType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {certificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issuedDate">Issue Date *</Label>
                  <Input
                    id="issuedDate"
                    type="date"
                    {...form.register('issuedDate')}
                  />
                  {form.formState.errors.issuedDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.issuedDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...form.register('expiryDate')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="certificateNumber">Certificate Number</Label>
                  <Input
                    id="certificateNumber"
                    {...form.register('certificateNumber')}
                    placeholder="ASE-MT-2024-001234"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={form.watch('verified') || false}
                    onCheckedChange={(checked: boolean) => form.setValue('verified', checked)}
                  />
                  <Label htmlFor="verified">Verified certification</Label>
                </div>
              </div>

              {/* Certificate Image Upload */}
              <div>
                <Label className="text-base font-medium">Certificate Image</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Upload a photo or scan of your certificate
                </p>
                <ImageUpload
                  uploadType="certification"
                  maxFiles={1}
                  maxSizePerFile={5}
                  existingImages={certificateImages}
                  onUploadComplete={(files) => {
                    const newUrls = files.map(f => f.secure_url)
                    setCertificateImages(newUrls)
                  }}
                  onUploadError={(error) => {
                    console.error('Certificate image upload error:', error)
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isAddingNew ? 'Add Certification' : 'Update Certification'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Certifications List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Certifications</h3>
              <p className="text-gray-600 mb-4">
                Add your professional certifications to build trust with customers
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Certification
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const TypeIcon = certificationTypes.find(t => t.value === item.type)?.icon || Award
              const expired = isExpired(item.expiryDate)
              const expiringSoon = isExpiringSoon(item.expiryDate)
              
              return (
                <Card key={item.id} className={`${expired ? 'border-red-200' : expiringSoon ? 'border-yellow-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${expired ? 'bg-red-100' : expiringSoon ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                          <TypeIcon className={`w-5 h-5 ${expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                          <p className="text-xs text-gray-600">{item.issuedBy}</p>
                        </div>
                      </div>
                      
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



                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Issued:</span>
                        <span>{new Date(item.issuedDate).toLocaleDateString()}</span>
                      </div>
                      
                      {item.expiryDate && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Expires:</span>
                          <span className={expired ? 'text-red-600 font-medium' : expiringSoon ? 'text-yellow-600 font-medium' : ''}>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {item.certificateNumber && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Number:</span>
                          <span className="font-mono">{item.certificateNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex gap-2">
                        <Badge
                          variant={expired ? 'destructive' : expiringSoon ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {expired ? 'Expired' : expiringSoon ? 'Expiring Soon' : 'Valid'}
                        </Badge>
                        {item.verified && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingCertificate(item)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Certificate Detail Modal */}
      <Dialog open={!!viewingCertificate} onOpenChange={(open) => !open && setViewingCertificate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificate Details
            </DialogTitle>
          </DialogHeader>

          {viewingCertificate && (
            <div className="space-y-6">
              {/* Certificate Image */}
              {viewingCertificate.imageUrl && (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={viewingCertificate.imageUrl}
                    alt={viewingCertificate.name}
                    className="w-full h-auto object-contain max-h-96"
                  />
                </div>
              )}

              {/* Certificate Information */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Certification Name</Label>
                  <p className="text-lg font-semibold">{viewingCertificate.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Issuing Organization</Label>
                    <p className="font-medium">{viewingCertificate.issuedBy}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Certification Type</Label>
                    <p className="font-medium">
                      {certificationTypes.find(t => t.value === viewingCertificate.type)?.label || viewingCertificate.type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Issue Date</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(viewingCertificate.issuedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {viewingCertificate.expiryDate && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Expiry Date</Label>
                      <p className={`font-medium flex items-center gap-2 ${
                        isExpired(viewingCertificate.expiryDate) ? 'text-red-600' :
                        isExpiringSoon(viewingCertificate.expiryDate) ? 'text-yellow-600' : ''
                      }`}>
                        <Calendar className="w-4 h-4" />
                        {new Date(viewingCertificate.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {viewingCertificate.certificateNumber && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Certificate Number</Label>
                    <p className="font-mono font-medium text-lg">{viewingCertificate.certificateNumber}</p>
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={
                      isExpired(viewingCertificate.expiryDate) ? 'destructive' :
                      isExpiringSoon(viewingCertificate.expiryDate) ? 'secondary' : 'default'
                    }
                  >
                    {isExpired(viewingCertificate.expiryDate) ? 'Expired' :
                     isExpiringSoon(viewingCertificate.expiryDate) ? 'Expiring Soon' : 'Valid'}
                  </Badge>
                  {viewingCertificate.verified && (
                    <Badge variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  if (viewingCertificate) {
                    handleEdit(viewingCertificate)
                    setViewingCertificate(null)
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
                  if (viewingCertificate) {
                    setViewingCertificate(null)
                    handleDelete(viewingCertificate.id)
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
              onClick={() => setViewingCertificate(null)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
