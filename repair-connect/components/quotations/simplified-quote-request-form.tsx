'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { MapPin, Car, Wrench, Clock, DollarSign, AlertCircle } from 'lucide-react'
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

// Simplified schema
const quoteRequestSchema = z.object({
  // Car selection (either existing car ID or new car details)
  selectedCarId: z.string().optional(),
  
  // Vehicle information (only required if no car selected)
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  licensePlate: z.string().optional(),
  
  // Service requirements
  requestedServices: z.array(z.string()).min(1, 'Select at least one service'),
  damageDescription: z.string().min(10, 'Please describe the damage or issue'),
  urgency: z.string().default('medium'),
  
  // Budget
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  budgetFlexible: z.boolean().default(true),
  
  // Location
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
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

export default function SimplifiedQuoteRequestForm({ onSubmit, isLoading, initialData, userCars = [] }: QuoteRequestFormProps) {
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null)
  const [showNewCarForm, setShowNewCarForm] = useState(userCars.length === 0)
  
  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema) as any,
    defaultValues: {
      selectedCarId: initialData?.selectedCarId || '',
      make: initialData?.make || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      licensePlate: initialData?.licensePlate || '',
      requestedServices: initialData?.requestedServices || [],
      damageDescription: initialData?.damageDescription || '',
      urgency: initialData?.urgency || 'medium',
      budgetMin: initialData?.budgetMin,
      budgetMax: initialData?.budgetMax,
      budgetFlexible: initialData?.budgetFlexible ?? true,
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      maxDistance: initialData?.maxDistance || 50,
      notes: initialData?.notes || ''
    }
  })

  const handleServiceToggle = (service: ServiceType) => {
    const currentServices = form.getValues('requestedServices')
    const updatedServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service]
    form.setValue('requestedServices', updatedServices)
  }

  const handleSubmit = async (data: QuoteRequestFormData) => {
    // Mock coordinates for now
    await onSubmit({
      ...data,
      location: { coordinates: [25.2048, 55.2708] } // Dubai coordinates
    })
  }

  const handleCarSelection = (carId: string) => {
    if (carId === 'new') {
      setShowNewCarForm(true)
      setSelectedCar(null)
      form.setValue('selectedCarId', '')
    } else {
      const car = userCars.find(c => c._id?.toString() === carId)
      if (car) {
        setSelectedCar(car)
        setShowNewCarForm(false)
        form.setValue('selectedCarId', carId)
        // Pre-fill car details
        form.setValue('make', car.basicInfo.make)
        form.setValue('model', car.basicInfo.model)
        form.setValue('year', car.basicInfo.year)
        form.setValue('licensePlate', car.basicInfo.licensePlate)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* Car Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userCars.length > 0 && (
              <div className="space-y-4">
                <FormLabel>Select a car or add new vehicle details</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userCars.map((car) => (
                    <div
                      key={car._id?.toString()}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        selectedCar?._id === car._id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handleCarSelection(car._id?.toString() || '')}
                    >
                      <div className="font-medium">
                        {car.basicInfo.year} {car.basicInfo.make} {car.basicInfo.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {car.basicInfo.licensePlate} • {car.basicInfo.color}
                      </div>
                    </div>
                  ))}
                  <div
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors border-dashed",
                      showNewCarForm
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    onClick={() => handleCarSelection('new')}
                  >
                    <div className="font-medium text-blue-600">+ Add New Vehicle</div>
                    <div className="text-sm text-gray-500">Enter vehicle details manually</div>
                  </div>
                </div>
              </div>
            )}

            {showNewCarForm && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                            <SelectContent>
                              {carBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {getCarBrandLabel(brand)}
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
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Camry, Accord, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2020"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {userCars.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No cars registered yet.</p>
                <Link href="/cars/register" className="text-blue-600 hover:underline">
                  Register your car first
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Service Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FormLabel>Requested Services</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {serviceTypes.map((service) => (
                  <Badge
                    key={service}
                    variant={form.watch('requestedServices').includes(service) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleServiceToggle(service)}
                  >
                    {getServiceTypeLabel(service)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="damageDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damage Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe the damage, symptoms, or issues you're experiencing..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Budget (AED)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="500"
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
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Budget (AED)</FormLabel>
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
              name="budgetFlexible"
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
          disabled={isLoading}
        >
          {isLoading ? 'Submitting Request...' : 'Submit Quote Request'}
        </Button>
      </form>
    </Form>
  )
}
