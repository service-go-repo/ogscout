'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, User, Building2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CustomerRegistrationSchema, 
  WorkshopRegistrationSchema,
  type CustomerRegistrationData,
  type WorkshopRegistrationData 
} from '@/lib/validations'

type RegistrationStep = 'role' | 'details' | 'confirmation'

export function SimpleRegistrationForm() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('role')
  const [selectedRole, setSelectedRole] = useState<'customer' | 'workshop' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const customerForm = useForm<CustomerRegistrationData>({
    resolver: zodResolver(CustomerRegistrationSchema),
    defaultValues: {
      role: 'customer',
      acceptTerms: false,
    },
  })

  const workshopForm = useForm<WorkshopRegistrationData>({
    resolver: zodResolver(WorkshopRegistrationSchema),
    defaultValues: {
      role: 'workshop',
      acceptTerms: false,
      businessAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
  })

  const currentForm = selectedRole === 'customer' ? customerForm : workshopForm

  async function onSubmit(data: CustomerRegistrationData | WorkshopRegistrationData) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      // Registration successful
      setCurrentStep('confirmation')
      
      // Redirect based on role after a short delay
      setTimeout(() => {
        if (data.role === 'workshop') {
          router.push('/profile') // Redirect workshop to profile page
        } else {
          router.push('/dashboard') // Redirect customer to dashboard
        }
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  function handleRoleSelection(role: 'customer' | 'workshop') {
    setSelectedRole(role)
    setCurrentStep('details')
  }

  function handleBack() {
    if (currentStep === 'details') {
      setCurrentStep('role')
      setSelectedRole(null)
    }
  }

  // Confirmation step
  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-heading text-green-600">Registration Successful!</CardTitle>
              <CardDescription>
                {selectedRole === 'workshop' 
                  ? 'Your workshop account has been created. You will be redirected to your profile page to complete your setup.'
                  : 'Your account has been created successfully. You will be redirected to your dashboard.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Redirecting...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Role selection step
  if (currentStep === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Join Repair Connect</h2>
            <p className="mt-2 text-sm text-gray-600">Choose your account type to get started</p>
          </div>

          <div className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
              onClick={() => handleRoleSelection('customer')}
            >
              <CardContent className="p-6 text-center">
                <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-lg">I'm a Customer</CardTitle>
                <CardDescription className="mt-2">
                  I need car repair services and want to find trusted workshops
                </CardDescription>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
              onClick={() => handleRoleSelection('workshop')}
            >
              <CardContent className="p-6 text-center">
                <Building2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-lg">I'm a Workshop Owner</CardTitle>
                <CardDescription className="mt-2">
                  I own an auto repair shop and want to connect with customers
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Registration form step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {selectedRole === 'customer' ? 'Create Customer Account' : 'Create Workshop Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {selectedRole === 'customer' 
              ? 'Fill in your details to get started'
              : 'Enter your business information to get started'
            }
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={currentForm.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  {...(selectedRole === 'customer' ? customerForm.register('email') : workshopForm.register('email'))}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
                {currentForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{currentForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...(selectedRole === 'customer' ? customerForm.register('password') : workshopForm.register('password'))}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {currentForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{currentForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...(selectedRole === 'customer' ? customerForm.register('confirmPassword') : workshopForm.register('confirmPassword'))}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {currentForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{currentForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Customer specific fields */}
              {selectedRole === 'customer' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        {...customerForm.register('firstName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First name"
                      />
                      {customerForm.formState.errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{customerForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        {...customerForm.register('lastName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last name"
                      />
                      {customerForm.formState.errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{customerForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...customerForm.register('phone')}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                    {customerForm.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{customerForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* Workshop specific fields */}
              {selectedRole === 'workshop' && (
                <>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      {...workshopForm.register('businessName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your workshop name"
                    />
                    {workshopForm.formState.errors.businessName && (
                      <p className="mt-1 text-sm text-red-600">{workshopForm.formState.errors.businessName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone
                    </label>
                    <input
                      {...workshopForm.register('businessPhone')}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Business phone number"
                    />
                    {workshopForm.formState.errors.businessPhone && (
                      <p className="mt-1 text-sm text-red-600">{workshopForm.formState.errors.businessPhone.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ownerFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Owner First Name
                      </label>
                      <input
                        {...workshopForm.register('ownerFirstName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First name"
                      />
                      {workshopForm.formState.errors.ownerFirstName && (
                        <p className="mt-1 text-sm text-red-600">{workshopForm.formState.errors.ownerFirstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="ownerLastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Last Name
                      </label>
                      <input
                        {...workshopForm.register('ownerLastName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last name"
                      />
                      {workshopForm.formState.errors.ownerLastName && (
                        <p className="mt-1 text-sm text-red-600">{workshopForm.formState.errors.ownerLastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Business Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                    <div className="space-y-3">
                      <input
                        {...workshopForm.register('businessAddress.street')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Street address"
                      />
                      {workshopForm.formState.errors.businessAddress?.street && (
                        <p className="text-sm text-red-600">{workshopForm.formState.errors.businessAddress.street.message}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          {...workshopForm.register('businessAddress.city')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="City"
                        />
                        <input
                          {...workshopForm.register('businessAddress.state')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="State"
                        />
                      </div>
                      
                      <input
                        {...workshopForm.register('businessAddress.zipCode')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ZIP Code"
                      />
                      {workshopForm.formState.errors.businessAddress?.zipCode && (
                        <p className="text-sm text-red-600">{workshopForm.formState.errors.businessAddress.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  {...(selectedRole === 'customer' ? customerForm.register('acceptTerms') : workshopForm.register('acceptTerms'))}
                  id="acceptTerms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {currentForm.formState.errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{currentForm.formState.errors.acceptTerms.message}</p>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
