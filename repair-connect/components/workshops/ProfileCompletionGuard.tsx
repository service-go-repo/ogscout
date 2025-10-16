'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useProfileCompletion } from '@/hooks/useProfileCompletion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'

interface ProfileCompletionGuardProps {
  children: React.ReactNode
  allowedPaths?: string[] // Paths that are always allowed even with incomplete profile
  redirectTo?: string // Where to redirect if profile is incomplete
}

export function ProfileCompletionGuard({ 
  children, 
  allowedPaths = ['/profile', '/auth/logout'],
  redirectTo = '/profile'
}: ProfileCompletionGuardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { isComplete, isLoading, completionPercentage, missingFields } = useProfileCompletion()

  // Always allow access for non-workshop users
  if (!session || session.user.role !== 'workshop') {
    return <>{children}</>
  }

  // Always allow access to allowed paths
  if (allowedPaths.some(path => pathname.startsWith(path))) {
    return <>{children}</>
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If profile is complete, allow access
  if (isComplete) {
    return <>{children}</>
  }

  // Show profile completion prompt
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Complete Your Workshop Profile
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please complete your workshop profile to access all features and start receiving service requests.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profile Completion</span>
                <span className="font-medium text-gray-900">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            {/* Completion Status */}
            <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-900">Profile Incomplete</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Your profile needs to be at least 80% complete to access workshop features.
                </p>
              </div>
            </div>

            {/* Missing Fields */}
            {missingFields.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Missing Information:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {missingFields.slice(0, 8).map((field, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
                {missingFields.length > 8 && (
                  <p className="text-sm text-gray-500">
                    +{missingFields.length - 8} more fields...
                  </p>
                )}
              </div>
            )}

            {/* Benefits of Completion */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Complete your profile to unlock:</h4>
              <div className="space-y-2">
                {[
                  'Receive service requests from customers',
                  'Appear in workshop search results',
                  'Manage your portfolio and certifications',
                  'Access customer management tools',
                  'View analytics and performance metrics'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/profile">
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team for assistance with setting up your workshop profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
