'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload, FileWithPreview } from '@/components/common/FileUpload'
import { DamageType, DamageSeverity, DamageLocation } from '../../models/Car'
import { ChevronLeft, ChevronRight, Car as CarIcon, Camera, MapPin, AlertTriangle } from 'lucide-react'

// Define arrays for the union types
const DAMAGE_TYPES: DamageType[] = [
  'scratch', 'dent', 'crack', 'broken_glass', 'paint_damage', 'rust',
  'collision_damage', 'mechanical_issue', 'electrical_issue', 'interior_damage',
  'tire_damage', 'other'
]

const DAMAGE_SEVERITIES: DamageSeverity[] = ['minor', 'moderate', 'major', 'severe']

const DAMAGE_LOCATIONS: DamageLocation[] = [
  'front_bumper', 'rear_bumper', 'front_left_door', 'front_right_door',
  'rear_left_door', 'rear_right_door', 'hood', 'trunk', 'roof',
  'front_left_fender', 'front_right_fender', 'rear_left_fender', 'rear_right_fender',
  'front_windshield', 'rear_windshield', 'side_windows', 'headlights', 'taillights',
  'mirrors', 'wheels', 'interior', 'engine', 'undercarriage', 'other'
]

// Form validation schema
const carUploadSchema = z.object({
  // Basic Car Information
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  mileage: z.number().min(0, 'Mileage must be positive').optional(),
  
  // Damage Assessment
  damageTypes: z.array(z.string()).min(1, 'Select at least one damage type'),
  damageSeverity: z.string(),
  damageLocations: z.array(z.string()).min(1, 'Select at least one damage location'),
  damageDescription: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  
  // Location
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  
  // Service Request
  urgency: z.enum(['low', 'medium', 'high']),
  preferredContactMethod: z.enum(['phone', 'email', 'sms']),
  additionalNotes: z.string().optional(),
})

type CarUploadFormData = z.infer<typeof carUploadSchema>

interface CarUploadFormProps {
  onSubmit: (data: CarUploadFormData & { photos: FileWithPreview[]; videos: FileWithPreview[] }) => Promise<void>
  isLoading?: boolean
}

const FORM_STEPS = [
  { id: 'basic', title: 'Car Information', icon: CarIcon },
  { id: 'damage', title: 'Damage Assessment', icon: AlertTriangle },
  { id: 'media', title: 'Photos & Videos', icon: Camera },
  { id: 'location', title: 'Location & Service', icon: MapPin },
]

const CAR_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
  'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
  'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Porsche',
  'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Other'
]

const CAR_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown',
  'Orange', 'Yellow', 'Purple', 'Gold', 'Beige', 'Maroon', 'Other'
]

export function CarUploadForm({ onSubmit, isLoading = false }: CarUploadFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [photos, setPhotos] = useState<FileWithPreview[]>([])
  const [videos, setVideos] = useState<FileWithPreview[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<CarUploadFormData>({
    resolver: zodResolver(carUploadSchema),
    defaultValues: {
      damageTypes: [],
      damageLocations: [],
      damageSeverity: 'minor',
      urgency: 'medium',
      preferredContactMethod: 'email',
    },
  })

  const watchedDamageTypes = watch('damageTypes')
  const watchedDamageLocations = watch('damageLocations')

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)
    
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const getFieldsForStep = (step: number): (keyof CarUploadFormData)[] => {
    switch (step) {
      case 0:
        return ['make', 'model', 'year', 'color']
      case 1:
        return ['damageTypes', 'damageSeverity', 'damageLocations', 'damageDescription']
      case 2:
        return [] // Media step doesn't have form fields to validate
      case 3:
        return ['location', 'urgency', 'preferredContactMethod']
      default:
        return []
    }
  }

  const handleFormSubmit = async (data: CarUploadFormData) => {
    await onSubmit({ ...data, photos, videos })
  }

  const handleDamageTypeChange = (damageType: string, checked: boolean) => {
    const currentTypes = watchedDamageTypes || []
    if (checked) {
      setValue('damageTypes', [...currentTypes, damageType])
    } else {
      setValue('damageTypes', currentTypes.filter((type: string) => type !== damageType))
    }
  }

  const handleDamageLocationChange = (location: string, checked: boolean) => {
    const currentLocations = watchedDamageLocations || []
    if (checked) {
      setValue('damageLocations', [...currentLocations, location])
    } else {
      setValue('damageLocations', currentLocations.filter((loc: string) => loc !== location))
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CarIcon className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Car Information</h2>
              <p className="text-gray-600">Tell us about your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Select onValueChange={(value: string) => setValue('make', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_MAKES.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.make && (
                  <p className="text-sm text-warning">{errors.make.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="Enter model"
                />
                {errors.model && (
                  <p className="text-sm text-warning">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  placeholder="Enter year"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && (
                  <p className="text-sm text-warning">{errors.year.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select onValueChange={(value: string) => setValue('color', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.color && (
                  <p className="text-sm text-warning">{errors.color.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Optional)</Label>
                <Input
                  id="vin"
                  {...register('vin')}
                  placeholder="Enter VIN"
                  maxLength={17}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate (Optional)</Label>
                <Input
                  id="licensePlate"
                  {...register('licensePlate')}
                  placeholder="Enter license plate"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mileage">Mileage (Optional)</Label>
                <Input
                  id="mileage"
                  type="number"
                  {...register('mileage', { valueAsNumber: true })}
                  placeholder="Enter current mileage"
                  min="0"
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-warning mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Damage Assessment</h2>
              <p className="text-gray-600">Help us understand the damage to your vehicle</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Types of Damage *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DAMAGE_TYPES.map((damageType) => (
                    <div key={damageType} className="flex items-center space-x-2">
                      <Checkbox
                        id={damageType}
                        checked={watchedDamageTypes?.includes(damageType) || false}
                        onCheckedChange={(checked: boolean) => 
                          handleDamageTypeChange(damageType, checked)
                        }
                      />
                      <Label htmlFor={damageType} className="text-sm capitalize">
                        {damageType.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.damageTypes && (
                  <p className="text-sm text-warning">{errors.damageTypes.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Damage Severity *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {DAMAGE_SEVERITIES.map((severity) => (
                    <label
                      key={severity}
                      className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        {...register('damageSeverity')}
                        value={severity}
                        className="text-primary"
                      />
                      <span className="capitalize">{severity}</span>
                    </label>
                  ))}
                </div>
                {errors.damageSeverity && (
                  <p className="text-sm text-warning">{errors.damageSeverity.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Damage Locations *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DAMAGE_LOCATIONS.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={watchedDamageLocations?.includes(location) || false}
                        onCheckedChange={(checked: boolean) => 
                          handleDamageLocationChange(location, checked)
                        }
                      />
                      <Label htmlFor={location} className="text-sm capitalize">
                        {location.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.damageLocations && (
                  <p className="text-sm text-warning">{errors.damageLocations.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="damageDescription">Damage Description *</Label>
                <Textarea
                  id="damageDescription"
                  {...register('damageDescription')}
                  placeholder="Please describe the damage in detail..."
                  rows={4}
                />
                {errors.damageDescription && (
                  <p className="text-sm text-warning">{errors.damageDescription.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Camera className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Photos & Videos</h2>
              <p className="text-gray-600">Upload images and videos of the damage</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Damage Photos</h3>
                <p className="text-sm text-gray-600">
                  Upload clear photos showing all damage. Multiple angles are helpful.
                </p>
                <FileUpload
                  onFilesChange={setPhotos}
                  acceptedFileTypes="photo"
                  maxFiles={10}
                  maxFileSize={10}
                  existingFiles={photos}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Damage Videos (Optional)</h3>
                <p className="text-sm text-gray-600">
                  Upload videos for a more comprehensive view of the damage.
                </p>
                <FileUpload
                  onFilesChange={setVideos}
                  acceptedFileTypes="video"
                  maxFiles={3}
                  maxFileSize={50}
                  existingFiles={videos}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Location & Service</h2>
              <p className="text-gray-600">Where is your vehicle and how can we reach you?</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vehicle Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      {...register('location.address')}
                      placeholder="Enter street address"
                    />
                    {errors.location?.address && (
                      <p className="text-sm text-warning">{errors.location.address.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('location.city')}
                      placeholder="Enter city"
                    />
                    {errors.location?.city && (
                      <p className="text-sm text-warning">{errors.location.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      {...register('location.state')}
                      placeholder="Enter state"
                    />
                    {errors.location?.state && (
                      <p className="text-sm text-warning">{errors.location.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      {...register('location.zipCode')}
                      placeholder="Enter ZIP code"
                    />
                    {errors.location?.zipCode && (
                      <p className="text-sm text-warning">{errors.location.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Service Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency *</Label>
                    <Select onValueChange={(value: string) => setValue('urgency', value as 'low' | 'medium' | 'high')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Within a week</SelectItem>
                        <SelectItem value="medium">Medium - Within 2-3 days</SelectItem>
                        <SelectItem value="high">High - ASAP</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.urgency && (
                      <p className="text-sm text-warning">{errors.urgency.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredContactMethod">Preferred Contact *</Label>
                    <Select onValueChange={(value: string) => setValue('preferredContactMethod', value as 'phone' | 'email' | 'sms')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="sms">Text Message</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.preferredContactMethod && (
                      <p className="text-sm text-warning">{errors.preferredContactMethod.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    {...register('additionalNotes')}
                    placeholder="Any additional information or special requests..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isActive
                      ? 'border-primary bg-primary text-white'
                      : isCompleted
                      ? 'border-success bg-success text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                
                {index < FORM_STEPS.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-4 transition-colors
                    ${isCompleted ? 'bg-success' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg border p-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < FORM_STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>{isLoading ? 'Submitting...' : 'Submit Request'}</span>
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}