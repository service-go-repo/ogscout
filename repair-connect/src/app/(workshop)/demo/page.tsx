'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PortfolioManager from '@/components/workshops/portfolio-manager'
import CertificationManager from '@/components/workshops/certification-manager'
import GalleryManager from '@/components/workshops/gallery-manager'
import BusinessImageUpload from '@/components/workshops/business-image-upload'
import ImageUpload from '@/components/common/image-upload'
import { 
  Building2, 
  Award, 
  Camera, 
  Briefcase, 
  Upload,
  CheckCircle,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe
} from 'lucide-react'

// Mock data for demonstration
const mockPortfolioItems = [
  {
    id: 'portfolio-1',
    title: 'Engine Rebuild - 2018 BMW M3',
    description: 'Complete engine rebuild including new pistons, rings, and timing chain. Customer reported loss of power and unusual noises.',
    serviceType: 'engine' as const,
    carBrand: 'bmw' as const,
    completedDate: new Date('2024-01-15'),
    featured: true,
    beforeImages: ['/api/placeholder/400/300'],
    afterImages: ['/api/placeholder/400/300']
  },
  {
    id: 'portfolio-2',
    title: 'Brake System Overhaul - 2020 Toyota Camry',
    description: 'Complete brake system replacement including pads, rotors, calipers, and brake fluid flush.',
    serviceType: 'brakes' as const,
    carBrand: 'toyota' as const,
    completedDate: new Date('2024-02-20'),
    featured: false,
    beforeImages: ['/api/placeholder/400/300'],
    afterImages: ['/api/placeholder/400/300']
  }
]

const mockCertifications = [
  {
    id: 'cert-1',
    name: 'ASE Master Technician',
    issuedBy: 'National Institute for Automotive Service Excellence',
    issuedDate: new Date('2020-06-15'),
    expiryDate: new Date('2025-06-15'),
    certificateNumber: 'ASE-MT-2020-001234',
    type: 'ase' as const,
    verified: true,
    imageUrl: '/api/placeholder/400/600'
  },
  {
    id: 'cert-2',
    name: 'BMW Certified Technician',
    issuedBy: 'BMW Group',
    issuedDate: new Date('2021-03-10'),
    expiryDate: new Date('2024-03-10'),
    certificateNumber: 'BMW-CT-2021-005678',
    type: 'manufacturer' as const,
    verified: true
  }
]

const mockGalleryImages = [
  {
    id: 'img-1',
    url: '/api/placeholder/400/300',
    title: 'Main Workshop Floor',
    description: 'Our spacious workshop with modern equipment',
    category: 'facility' as const,
    featured: true,
    uploadDate: new Date('2024-01-01')
  },
  {
    id: 'img-2',
    url: '/api/placeholder/400/300',
    title: 'Diagnostic Equipment',
    description: 'State-of-the-art diagnostic tools',
    category: 'equipment' as const,
    featured: false,
    uploadDate: new Date('2024-01-02')
  }
]

export default function WorkshopDemoPage() {
  const [activeDemo, setActiveDemo] = useState('overview')
  const [logoUrl, setLogoUrl] = useState('/api/placeholder/200/200')
  const [coverImageUrl, setCoverImageUrl] = useState('/api/placeholder/1200/400')

  const handlePortfolioSave = async (items: any[]) => {
    console.log('Portfolio items saved:', items)
    // In real implementation, this would save to API
  }

  const handleCertificationSave = async (items: any[]) => {
    console.log('Certifications saved:', items)
    // In real implementation, this would save to API
  }

  const handleGallerySave = async (items: any[]) => {
    console.log('Gallery items saved:', items)
    // In real implementation, this would save to API
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Workshop Profile Management Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive workshop profile management system with image uploads, portfolio management, 
          certification tracking, and gallery organization.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Fully Functional
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Upload className="w-3 h-3 mr-1" />
            Cloudinary Integration
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Star className="w-3 h-3 mr-1" />
            Production Ready
          </Badge>
        </div>
      </div>

      {/* Demo Navigation */}
      <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="business-images" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Business Images
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="image-upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Image Upload
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Business information forms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Logo & cover image upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contact & location management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Operating hours configuration</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Portfolio Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Before/after photo uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Service type categorization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Featured project highlighting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Project completion tracking</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Professional certification tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Expiration date monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Certificate image uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Verification status display</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Gallery Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Photo categorization system</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Bulk photo operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Grid & list view modes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Featured image highlighting</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Image Upload System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Drag & drop interface</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Cloudinary integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Automatic image optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">File validation & error handling</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Technical Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">React Hook Form + Zod validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">TypeScript type safety</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Responsive design</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Real-time form validation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Images Demo */}
        <TabsContent value="business-images">
          <Card>
            <CardHeader>
              <CardTitle>Business Image Upload Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessImageUpload
                logoUrl={logoUrl}
                coverImageUrl={coverImageUrl}
                onLogoChange={(url) => setLogoUrl(url || '')}
                onCoverImageChange={(url) => setCoverImageUrl(url || '')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Demo */}
        <TabsContent value="portfolio">
          <PortfolioManager
            portfolioItems={mockPortfolioItems}
            onSave={handlePortfolioSave}
          />
        </TabsContent>

        {/* Certifications Demo */}
        <TabsContent value="certifications">
          <CertificationManager
            certifications={mockCertifications}
            onSave={handleCertificationSave}
          />
        </TabsContent>

        {/* Gallery Demo */}
        <TabsContent value="gallery">
          <GalleryManager
            images={mockGalleryImages}
            onSave={handleGallerySave}
          />
        </TabsContent>

        {/* Image Upload Demo */}
        <TabsContent value="image-upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Image Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  uploadType="portfolio"
                  category="before"
                  maxFiles={5}
                  maxSizePerFile={10}
                  onUploadComplete={(files) => {
                    console.log('Portfolio images uploaded:', files)
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certification Image Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  uploadType="certification"
                  maxFiles={1}
                  maxSizePerFile={5}
                  onUploadComplete={(files) => {
                    console.log('Certification image uploaded:', files)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Workshop Profile API</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div><code className="bg-gray-100 px-2 py-1 rounded">GET /api/workshops/profile</code> - Fetch profile</div>
                <div><code className="bg-gray-100 px-2 py-1 rounded">POST /api/workshops/profile</code> - Create profile</div>
                <div><code className="bg-gray-100 px-2 py-1 rounded">PUT /api/workshops/profile</code> - Update profile</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Image Upload API</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div><code className="bg-gray-100 px-2 py-1 rounded">POST /api/workshops/upload</code> - Upload images</div>
                <div><code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/workshops/upload</code> - Delete images</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
