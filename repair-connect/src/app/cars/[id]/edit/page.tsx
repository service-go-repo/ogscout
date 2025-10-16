'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { CarProfile, CAR_MAKES, CAR_COLORS, TRANSMISSION_TYPES, FUEL_TYPES } from '@/models/CarProfile'
import { z } from 'zod'
import { toast } from 'sonner'

interface CarEditPageProps {
  params: Promise<{
    id: string
  }>
}

// Edit schema matching CarProfile structure
const carEditSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Color is required'),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  mileage: z.number().min(0).optional(),
  engineSize: z.string().optional(),
  transmission: z.enum(['manual', 'automatic', 'cvt']),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric']),
  nickname: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'archived', 'sold']),
})

type CarEditFormData = z.infer<typeof carEditSchema>

export default function CarEditPage({ params }: CarEditPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [car, setCar] = useState<CarProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CarEditFormData>({
    resolver: zodResolver(carEditSchema),
  })

  const watchedStatus = watch('status')
  const watchedTransmission = watch('transmission')
  const watchedFuelType = watch('fuelType')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Fetch car details
  useEffect(() => {
    const fetchCar = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/cars/${resolvedParams.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Car not found')
          } else {
            throw new Error('Failed to fetch car details')
          }
          return
        }

        const data = await response.json()
        const carData: CarProfile = data.data
        setCar(carData)

        // Populate form with existing data
        if (carData) {
          reset({
            make: carData.make,
            model: carData.model,
            year: carData.year,
            color: carData.color,
            vin: carData.vin || '',
            licensePlate: carData.licensePlate || '',
            mileage: carData.mileage,
            engineSize: carData.engineSize || '',
            transmission: carData.transmission,
            fuelType: carData.fuelType,
            nickname: carData.nickname || '',
            notes: carData.notes || '',
            status: carData.status,
          })
        }
      } catch (err) {
        console.error('Error fetching car:', err)
        setError('Failed to load car details')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchCar()
    }
  }, [session?.user?.id, resolvedParams.id, reset])

  const onSubmit = async (data: CarEditFormData) => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/cars/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update car')
      }

      const result = await response.json()
      toast.success('Car updated successfully!')

      // Redirect back to car detail page
      router.push(`/cars/${resolvedParams.id}`)
    } catch (err) {
      console.error('Error updating car:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update car'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/cars">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Cars
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
          <p className="text-gray-600 mb-6">The car you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
          <Button asChild>
            <Link href="/cars">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Cars
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href={`/cars/${resolvedParams.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Car Details
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Car</h1>
          <p className="text-gray-600">
            {car.year} {car.make} {car.model}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Select
                  value={watch('make')}
                  onValueChange={(value) => setValue('make', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_MAKES.map(make => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.make && (
                  <p className="text-sm text-red-600">{errors.make.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="e.g., Camry, Accord, Model 3"
                />
                {errors.model && (
                  <p className="text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  placeholder="e.g., 2023"
                />
                {errors.year && (
                  <p className="text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select
                  value={watch('color')}
                  onValueChange={(value) => setValue('color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_COLORS.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.color && (
                  <p className="text-sm text-red-600">{errors.color.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  {...register('vin')}
                  placeholder="17-character VIN"
                  className="font-mono"
                  maxLength={17}
                />
                {errors.vin && (
                  <p className="text-sm text-red-600">{errors.vin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  {...register('licensePlate')}
                  placeholder="e.g., ABC123"
                />
                {errors.licensePlate && (
                  <p className="text-sm text-red-600">{errors.licensePlate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  {...register('mileage', { valueAsNumber: true })}
                  placeholder="e.g., 50000"
                />
                {errors.mileage && (
                  <p className="text-sm text-red-600">{errors.mileage.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="engineSize">Engine Size</Label>
                <Input
                  id="engineSize"
                  {...register('engineSize')}
                  placeholder="e.g., 2.0L, V6, 1.8T"
                />
                {errors.engineSize && (
                  <p className="text-sm text-red-600">{errors.engineSize.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission *</Label>
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
                {errors.transmission && (
                  <p className="text-sm text-red-600">{errors.transmission.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type *</Label>
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
                {errors.fuelType && (
                  <p className="text-sm text-red-600">{errors.fuelType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                {...register('nickname')}
                placeholder="Give your car a friendly name (optional)"
              />
              {errors.nickname && (
                <p className="text-sm text-red-600">{errors.nickname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Private notes about your car (optional)"
                rows={4}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/cars/${resolvedParams.id}`}>
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
