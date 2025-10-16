'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload, FileWithPreview } from '@/components/common/FileUpload'
import {
  Car,
  Upload,
  Save,
  Camera,
  Image as ImageIcon,
  Loader2,
  Search
} from 'lucide-react'
import { 
  CarRegistrationData, 
  CAR_MAKES, 
  CAR_COLORS, 
  TRANSMISSION_TYPES, 
  FUEL_TYPES 
} from '@/models/CarProfile'

// Form validation schema - simplified for car registration only
const carRegistrationSchema = z.object({
  // Basic Car Information
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  color: z.string().min(1, 'Color is required'),
  
  // Optional details
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  mileage: z.number().min(0, 'Mileage must be positive').optional(),
  engineSize: z.string().optional(),
  transmission: z.enum(['manual', 'automatic', 'cvt']),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric']),
  
})

type CarRegistrationFormData = z.infer<typeof carRegistrationSchema>

interface SimpleCarRegistrationFormProps {
  onSubmit: (data: CarRegistrationFormData & { 
    thumbnailFile?: File; 
    galleryFiles: File[] 
  }) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<CarRegistrationFormData>
}

export function SimpleCarRegistrationForm({
  onSubmit,
  isLoading = false,
  initialData
}: SimpleCarRegistrationFormProps) {
  const [thumbnailFile, setThumbnailFile] = useState<FileWithPreview | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<FileWithPreview[]>([])
  const [makeFilter, setMakeFilter] = useState('')
  const [colorFilter, setColorFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<CarRegistrationFormData>({
    resolver: zodResolver(carRegistrationSchema),
    defaultValues: {
      transmission: 'automatic',
      fuelType: 'gasoline',
      ...initialData
    },
    mode: 'onChange'
  })

  const watchedTransmission = watch('transmission')
  const watchedFuelType = watch('fuelType')

  const handleFormSubmit = async (data: CarRegistrationFormData) => {
    await onSubmit({
      ...data,
      thumbnailFile: thumbnailFile || undefined,
      galleryFiles: galleryFiles || []
    })
  }

  const handleThumbnailChange = (files: FileWithPreview[]) => {
    setThumbnailFile(files[0] || null)
  }

  const handleGalleryChange = (files: FileWithPreview[]) => {
    setGalleryFiles(files)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

  // Filtered lists
  const filteredMakes = CAR_MAKES.filter(make =>
    make.toLowerCase().includes(makeFilter.toLowerCase())
  )

  const filteredColors = CAR_COLORS.filter(color =>
    color.toLowerCase().includes(colorFilter.toLowerCase())
  )

  const filteredYears = years.filter(year =>
    year.toString().includes(yearFilter)
  )

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Select
                  value={watch('make') || ''}
                  onValueChange={(value) => {
                    setValue('make', value)
                    setMakeFilter('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="flex items-center border-b px-3 pb-2 sticky top-0 bg-background z-10">
                      <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                      <Input
                        placeholder="Search makes..."
                        value={makeFilter}
                        onChange={(e) => setMakeFilter(e.target.value)}
                        className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredMakes.length > 0 ? (
                        filteredMakes.map(make => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No makes found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
                {errors.make && (
                  <p className="text-red-600 text-sm mt-1">{errors.make.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="e.g., Camry, Accord, Model 3"
                />
                {errors.model && (
                  <p className="text-red-600 text-sm mt-1">{errors.model.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="year">Year *</Label>
                <Select
                  value={watch('year')?.toString() || ''}
                  onValueChange={(value) => {
                    setValue('year', parseInt(value))
                    setYearFilter('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="flex items-center border-b px-3 pb-2 sticky top-0 bg-background z-10">
                      <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                      <Input
                        placeholder="Search year..."
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredYears.length > 0 ? (
                        filteredYears.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No years found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Color *</Label>
                <Select
                  value={watch('color') || ''}
                  onValueChange={(value) => {
                    setValue('color', value)
                    setColorFilter('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="flex items-center border-b px-3 pb-2 sticky top-0 bg-background z-10">
                      <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                      <Input
                        placeholder="Search colors..."
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                        className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredColors.length > 0 ? (
                        filteredColors.map(color => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No colors found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
                {errors.color && (
                  <p className="text-red-600 text-sm mt-1">{errors.color.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  {...register('mileage', { valueAsNumber: true })}
                  placeholder="e.g., 50000"
                />
                {errors.mileage && (
                  <p className="text-red-600 text-sm mt-1">{errors.mileage.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={watchedTransmission}
                  onValueChange={(value) => setValue('transmission', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={watchedFuelType}
                  onValueChange={(value) => setValue('fuelType', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">VIN (Optional)</Label>
                <Input
                  id="vin"
                  {...register('vin')}
                  placeholder="17-character VIN"
                  maxLength={17}
                />
              </div>

              <div>
                <Label htmlFor="licensePlate">License Plate (Optional)</Label>
                <Input
                  id="licensePlate"
                  {...register('licensePlate')}
                  placeholder="e.g., ABC123"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="engineSize">Engine Size (Optional)</Label>
              <Input
                id="engineSize"
                {...register('engineSize')}
                placeholder="e.g., 2.0L, V6, 1.8T"
              />
            </div>
          </CardContent>
        </Card>


        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Thumbnail Photo */}
            <div>
              <Label className="text-base font-semibold">Profile Photo</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose a main photo that represents your car best
              </p>
              <FileUpload
                maxFiles={1}
                acceptedFileTypes="photo"
                maxFileSize={5} // 5MB
                onFilesChange={handleThumbnailChange}
              />
            </div>

            {/* Gallery Photos */}
            <div>
              <Label className="text-base font-semibold">Gallery Photos (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add more photos to your car's gallery (exterior, interior, engine, etc.)
              </p>
              <FileUpload
                maxFiles={20}
                acceptedFileTypes="photo"
                maxFileSize={5} // 5MB
                onFilesChange={handleGalleryChange}
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Photo Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Take photos in good lighting for best quality</li>
                <li>• Include exterior shots from multiple angles</li>
                <li>• Interior photos showing dashboard and seats</li>
                <li>• Engine bay photo if accessible</li>
                <li>• Any unique features or modifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Ready to register your car?</h3>
                <p className="text-muted-foreground text-sm">
                  You can add service requests and more photos after registration
                </p>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                size="lg"
                className="min-w-[180px] w-full sm:w-auto"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Register Car
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default SimpleCarRegistrationForm