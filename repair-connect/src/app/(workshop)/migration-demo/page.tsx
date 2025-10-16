'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RegistrationDataMigrator from '@/components/workshops/registration-data-migrator'
import { 
  Database, 
  ArrowRight, 
  CheckCircle, 
  Building2,
  Phone,
  MapPin,
  Clock,
  Wrench,
  User,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react'

export default function MigrationDemoPage() {
  const [showMigrator, setShowMigrator] = useState(true)

  // Mock registration data for demonstration
  const mockRegistrationData = {
    businessName: "AutoCare Pro Services",
    businessType: "auto_repair",
    businessPhone: "+1 (555) 123-4567",
    businessAddress: {
      street: "1234 Main Street",
      city: "Springfield",
      state: "IL",
      zipCode: "62701"
    },
    servicesOffered: [
      "Engine Repair",
      "Brake Service", 
      "Oil Change",
      "Tire Service",
      "Electrical Repair",
      "AC/Heating"
    ],
    businessHours: {
      monday: { open: "08:00", close: "18:00", closed: false },
      tuesday: { open: "08:00", close: "18:00", closed: false },
      wednesday: { open: "08:00", close: "18:00", closed: false },
      thursday: { open: "08:00", close: "18:00", closed: false },
      friday: { open: "08:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "16:00", closed: false },
      sunday: { open: "10:00", close: "14:00", closed: true }
    },
    businessLicense: "IL-AUTO-2024-001234",
    insuranceInfo: "State Farm Commercial Auto Insurance",
    ownerInfo: {
      firstName: "John",
      lastName: "Smith", 
      phone: "+1 (555) 987-6543"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Registration Data Migration Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See how workshop registration data can be automatically imported to create a complete workshop profile.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Database className="w-3 h-3 mr-1" />
            Data Migration
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Automated Import
          </Badge>
        </div>
      </div>

      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Migration Process Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Detect Registration Data</h3>
              <p className="text-sm text-gray-600">
                System checks for existing workshop registration information from the signup process.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Import & Transform</h3>
              <p className="text-sm text-gray-600">
                Registration data is automatically mapped to the workshop profile structure with proper formatting.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Create Profile</h3>
              <p className="text-sm text-gray-600">
                Complete workshop profile is created with all business information ready for management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock Registration Data Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Sample Registration Data</h2>
          
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
                <p className="font-medium text-lg">{mockRegistrationData.businessName}</p>
                <Badge variant="outline" className="mt-1">
                  {mockRegistrationData.businessType.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {mockRegistrationData.businessPhone}
              </div>
              
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div>
                  <p>{mockRegistrationData.businessAddress.street}</p>
                  <p>{mockRegistrationData.businessAddress.city}, {mockRegistrationData.businessAddress.state} {mockRegistrationData.businessAddress.zipCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="w-5 h-5" />
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockRegistrationData.servicesOffered.map((service) => (
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
                {Object.entries(mockRegistrationData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{day}:</span>
                    <span className={hours.closed ? 'text-gray-500' : 'text-gray-700'}>
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
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
                  {mockRegistrationData.ownerInfo.firstName} {mockRegistrationData.ownerInfo.lastName}
                </p>
                <p className="text-sm text-gray-600">{mockRegistrationData.ownerInfo.phone}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Business License:</span>
                  <span className="text-gray-600">{mockRegistrationData.businessLicense}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Insurance:</span>
                  <span className="text-gray-600">{mockRegistrationData.insuranceInfo}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Migration Component */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Live Migration Demo</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMigrator(!showMigrator)}
            >
              {showMigrator ? 'Hide' : 'Show'} Migrator
            </Button>
          </div>

          {showMigrator ? (
            <RegistrationDataMigrator 
              onMigrationComplete={() => {
                console.log('Migration completed in demo')
              }}
            />
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Migration component is hidden. Click "Show Migrator" to see the live component.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of Automated Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium">Time Saving</h4>
              <p className="text-sm text-gray-600">No need to re-enter business information</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium">Accuracy</h4>
              <p className="text-sm text-gray-600">Reduces data entry errors</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <ArrowRight className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium">Seamless Flow</h4>
              <p className="text-sm text-gray-600">Smooth transition from signup to profile</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="font-medium">Data Consistency</h4>
              <p className="text-sm text-gray-600">Maintains data integrity across systems</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>Migration API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Check Migration Status</h4>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm block">
                GET /api/workshops/profile/migrate
              </code>
              <p className="text-sm text-gray-600 mt-1">
                Returns registration data and migration status for the authenticated workshop user.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Perform Migration</h4>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm block">
                POST /api/workshops/profile/migrate
              </code>
              <p className="text-sm text-gray-600 mt-1">
                Creates workshop profile from registration data with proper data transformation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
