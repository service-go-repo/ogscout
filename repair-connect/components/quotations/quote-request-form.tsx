'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { MapPin, Car, Wrench, Clock, DollarSign, Upload, X, Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ServiceType, CarBrand, Priority, getServiceTypeLabel, getCarBrandLabel } from '@/models/Quotation'
import { Car as CarType } from '@/models/Car'
import Link from 'next/link'

const serviceTypes: ServiceType[] = [
  'repair', 'maintenance', 'inspection', 'bodywork', 'paint',
  'engine', 'transmission', 'brakes', 'electrical', 'tires',
  'glass', 'detailing', 'other'
]

const carBrands: CarBrand[] = [
  'audi', 'bmw', 'mercedes', 'volkswagen', 'toyota', 'honda',
  'nissan', 'ford', 'chevrolet', 'hyundai', 'kia', 'mazda',
  'subaru', 'lexus', 'acura', 'infiniti', 'tesla', 'other'
]

// UAE Emirates/States
const uaeStates = [
  'Abu Dhabi',
  'Dubai', 
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
]

// Major cities in UAE
const uaeCities = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah',
  'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Dibba', 'Kalba',
  'Madinat Zayed', 'Liwa', 'Ruwais', 'Mirfa', 'Sila'
]

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']

const damageSchema = z.object({
  area: z.string().min(1, 'Area is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
  images: z.array(z.string()).optional()
})

const quoteRequestSchema = z.object({
  // Car selection (either existing car ID or new car details)
  selectedCarId: z.string().optional(),
  
  // Vehicle information (only required if no car selected)
  vehicle: z.object({
    make: z.enum(carBrands as [CarBrand, ...CarBrand[]]),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    mileage: z.number().optional(),
    licensePlate: z.string().optional(),
    color: z.string().optional()
  }).optional(),
  
  // Service requirements
  requestedServices: z.array(z.enum(serviceTypes as [ServiceType, ...ServiceType[]])).min(1, 'Select at least one service'),
  damageDescription: z.array(damageSchema).min(1, 'Add at least one damage description'),
  
  // Timeline
  timeline: z.object({
    preferredStartDate: z.date().optional(),
    preferredCompletionDate: z.date().optional(),
    flexibility: z.enum(['rigid', 'flexible', 'very_flexible']),
    urgency: z.enum(priorities as [Priority, ...Priority[]])
  }),
  
  // Budget
  budget: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('AED'),
    isFlexible: z.boolean().default(true)
  }).optional(),
  
  // Location
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  
  // Workshop targeting
  maxDistance: z.number().default(50),
  
  // Additional notes
  notes: z.string().optional()
})

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>

interface QuoteRequestFormProps {
  onSubmit: (data: QuoteRequestFormData & { location: { coordinates: [number, number] } }) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<QuoteRequestFormData>
  userCars?: CarType[]
}

export default function QuoteRequestForm({ onSubmit, isLoading, initialData, userCars = [] }: QuoteRequestFormProps) {
  const [damageImages, setDamageImages] = useState<{ [key: number]: string[] }>({})
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null)
  const [showNewCarForm, setShowNewCarForm] = useState(userCars.length === 0)
  
  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema) as any,
    defaultValues: {
      selectedCarId: initialData?.selectedCarId || '',
      vehicle: showNewCarForm ? {
        make: 'toyota',
        model: '',
        year: new Date().getFullYear(),
        ...initialData?.vehicle
      } : undefined,
      requestedServices: initialData?.requestedServices || [],
      damageDescription: initialData?.damageDescription || [
        { area: '', description: '', severity: 'moderate' }
      ],
      timeline: {
        flexibility: 'flexible',
        urgency: 'medium',
        ...initialData?.timeline
      },
      budget: {
        currency: 'AED',
        isFlexible: true,
        ...initialData?.budget
      },
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      maxDistance: initialData?.maxDistance || 50,
      notes: initialData?.notes || ''
    }
  })
  
  const { fields: damageFields, append: appendDamage, remove: removeDamage } = useFieldArray({
    control: form.control,
    name: 'damageDescription'
  })
  
  const handleServiceToggle = (service: ServiceType) => {
    const current = form.getValues('requestedServices')
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service]
    form.setValue('requestedServices', updated)
  }
  
  const handleImageUpload = async (damageIndex: number, files: FileList) => {
    if (!files.length) return
    
    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'repair-connect')
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        
        const data = await response.json()
        return data.secure_url
      })
      
      const urls = await Promise.all(uploadPromises)
      const currentImages = damageImages[damageIndex] || []
      const updatedImages = [...currentImages, ...urls]
      
      setDamageImages(prev => ({
        ...prev,
        [damageIndex]: updatedImages
      }))
      
      // Update form data
      const currentDamage = form.getValues('damageDescription')
      currentDamage[damageIndex].images = updatedImages
      form.setValue('damageDescription', currentDamage)
      
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setIsUploading(false)
    }
  }
  
  const removeImage = (damageIndex: number, imageIndex: number) => {
    const currentImages = damageImages[damageIndex] || []
    const updatedImages = currentImages.filter((_, i) => i !== imageIndex)
    
    setDamageImages(prev => ({
      ...prev,
      [damageIndex]: updatedImages
    }))
    
    const currentDamage = form.getValues('damageDescription')
    currentDamage[damageIndex].images = updatedImages
    form.setValue('damageDescription', currentDamage)
  }
  
  const handleSubmit = async (data: QuoteRequestFormData) => {
    // Get user's location (simplified - in real app, use geolocation API)
    const location = { coordinates: [55.2708, 25.2048] as [number, number] } // Dubai coordinates
    
    await onSubmit({ ...data, location })
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vehicle.make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carBrands.map(brand => (
                          <SelectItem key={brand} value={brand}>
                            {getCarBrandLabel(brand)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicle.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicle.year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2023"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vehicle.mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage (km)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="50000"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicle.licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicle.color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="White" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Service Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Required Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="requestedServices"
              render={() => (
                <FormItem>
                  <FormLabel>Select services needed</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {serviceTypes.map(service => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={form.watch('requestedServices').includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label
                          htmlFor={service}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getServiceTypeLabel(service)}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Damage Description */}
        <Card>
          <CardHeader>
            <CardTitle>Damage/Issue Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.watch('damageDescription').map((damage, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Issue #{index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDamage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`damageDescription.${index}.area`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area/Component</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Front bumper, Engine" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`damageDescription.${index}.severity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name={`damageDescription.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the issue in detail..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Image Upload */}
                <div>
                  <FormLabel>Photos (optional)</FormLabel>
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(index, e.target.files)}
                      className="hidden"
                      id={`images-${index}`}
                    />
                    <label
                      htmlFor={`images-${index}`}
                      className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Images
                    </label>
                  </div>
                  
                  {damageImages[index] && damageImages[index].length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {damageImages[index].map((url, imgIndex) => (
                        <div key={imgIndex} className="relative">
                          <img
                            src={url}
                            alt={`Damage ${index + 1} - ${imgIndex + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index, imgIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendDamage({ area: '', description: '', severity: 'moderate' })}
            >
              Add Another Issue
            </Button>
          </CardContent>
        </Card>
        
        {/* Timeline & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="timeline.urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeline.flexibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flexibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rigid">Rigid - Specific dates required</SelectItem>
                        <SelectItem value="flexible">Flexible - Some flexibility</SelectItem>
                        <SelectItem value="very_flexible">Very Flexible - Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Budget (AED)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="budget.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Budget (AED)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="budget.isFlexible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Budget is flexible</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {uaeCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Emirate</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select emirate" />
                        </SelectTrigger>
                        <SelectContent>
                          {uaeStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Distance (km)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="50"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information or special requirements..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || isUploading}
        >
          {isLoading ? 'Submitting Request...' : 'Submit Quote Request'}
        </Button>
      </form>
    </Form>
  )
}
