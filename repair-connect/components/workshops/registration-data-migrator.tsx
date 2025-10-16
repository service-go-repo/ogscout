'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Building2,
  Phone,
  MapPin,
  Clock,
  Wrench,
  User,
  Shield,
  ArrowRight
} from 'lucide-react'

interface RegistrationData {
  businessName: string
  businessType: string
  businessPhone: string
  businessAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  servicesOffered: string[]
  businessHours: Record<string, { open: string; close: string; closed: boolean }>
  businessLicense: string
  insuranceInfo: string
  ownerInfo: {
    firstName: string
    lastName: string
    phone: string
  }
}

interface MigrationStatus {
  hasExistingProfile: boolean
  canMigrate: boolean
  registrationData: RegistrationData | null
  existingProfile: {
    id: string
    businessName: string
    createdAt: string
  } | null
}

interface RegistrationDataMigratorProps {
  onMigrationComplete?: () => void
}

export default function RegistrationDataMigrator({ onMigrationComplete }: RegistrationDataMigratorProps) {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migrationResult, setMigrationResult] = useState<any>(null)

  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/workshops/profile/migrate', {
        method: 'GET'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check migration status')
      }

      setMigrationStatus(data)
    } catch (error) {
      console.error('Migration status check error:', error)
      setError(error instanceof Error ? error.message : 'Failed to check migration status')
    } finally {
      setIsLoading(false)
    }
  }

  const performMigration = async () => {
    try {
      setIsMigrating(true)
      setError(null)

      const response = await fetch('/api/workshops/profile/migrate', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed')
      }

      setMigrationResult(data)
      if (onMigrationComplete) {
        onMigrationComplete()
      }
    } catch (error) {
      console.error('Migration error:', error)
      setError(error instanceof Error ? error.message : 'Migration failed')
    } finally {
      setIsMigrating(false)
    }
  }

  const formatBusinessHours = (hours: Record<string, { open: string; close: string; closed: boolean }>) => {
    return Object.entries(hours).map(([day, schedule]) => (
      <div key={day} className="flex justify-between text-sm">
        <span className="capitalize font-medium">{day}:</span>
        <span className={schedule.closed ? 'text-gray-500' : 'text-gray-700'}>
          {schedule.closed ? 'Closed' : `${schedule.open} - ${schedule.close}`}
        </span>
      </div>
    ))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Checking registration data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkMigrationStatus}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (migrationResult?.migrated) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Workshop profile created successfully!</p>
            <p className="text-sm">Your registration data has been migrated to your workshop profile. You can now manage your complete business profile.</p>
            <div className="text-xs text-gray-600">
              <p>Migrated: {migrationResult.migratedData.businessName}</p>
              <p>Services: {migrationResult.migratedData.servicesOffered.join(', ')}</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!migrationStatus) {
    return null
  }

  if (migrationStatus.hasExistingProfile) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Workshop profile already exists</p>
            <p className="text-sm">
              Your workshop profile "{migrationStatus.existingProfile?.businessName}" was created on{' '}
              {migrationStatus.existingProfile?.createdAt ? 
                new Date(migrationStatus.existingProfile.createdAt).toLocaleDateString() : 
                'unknown date'
              }.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!migrationStatus.registrationData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No registration data found. Please ensure you completed the workshop registration process.
        </AlertDescription>
      </Alert>
    )
  }

  const { registrationData } = migrationStatus

  return (
    <div className="space-y-6">
      {/* Migration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Import Registration Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                We found your workshop registration data! You can import this information to quickly set up your workshop profile.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={performMigration}
              disabled={isMigrating}
              className="w-full"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing Data...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Import Registration Data
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registration Data Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-lg">{registrationData.businessName}</p>
              <Badge variant="outline" className="mt-1">
                {registrationData.businessType.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              {registrationData.businessPhone}
            </div>
            
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5" />
              <div>
                <p>{registrationData.businessAddress.street}</p>
                <p>{registrationData.businessAddress.city}, {registrationData.businessAddress.state} {registrationData.businessAddress.zipCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5" />
              Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {registrationData.servicesOffered.map((service) => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formatBusinessHours(registrationData.businessHours)}
            </div>
          </CardContent>
        </Card>

        {/* Owner & Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Owner & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">
                {registrationData.ownerInfo.firstName} {registrationData.ownerInfo.lastName}
              </p>
              <p className="text-sm text-gray-600">{registrationData.ownerInfo.phone}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Business License:</span>
                <span className="text-gray-600">{registrationData.businessLicense}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium">Insurance:</span>
                <span className="text-gray-600">{registrationData.insuranceInfo}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
