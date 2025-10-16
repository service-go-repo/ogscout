import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Eye, 
  Building2, 
  Briefcase, 
  Award, 
  Camera,
  Upload,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function WorkshopManagementPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Workshop Management Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Access your workshop profile management tools and explore the comprehensive 
          feature demonstration.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Profile Settings Card */}
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <p className="text-gray-600">
              Manage your workshop profile, business information, and settings
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-500" />
                <span className="text-sm">Business Information & Images</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-500" />
                <span className="text-sm">Portfolio Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-sm">Certification Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-green-500" />
                <span className="text-sm">Gallery Organization</span>
              </div>
            </div>
            
            <Button asChild className="w-full">
              <Link href="/profile" className="flex items-center gap-2">
                Open Profile Settings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Demo Card */}
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Feature Demo</CardTitle>
            <p className="text-gray-600">
              Explore all features with interactive demonstrations and examples
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Image Upload System</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Interactive Components</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Live Feature Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Mock Data Examples</span>
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
              <Link href="/demo" className="flex items-center gap-2">
                View Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Overview */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Complete Workshop Management System</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center pb-3">
              <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Business Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Business information</li>
                <li>• Logo & cover images</li>
                <li>• Contact details</li>
                <li>• Operating hours</li>
                <li>• Service specializations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <Briefcase className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Before/after photos</li>
                <li>• Service categorization</li>
                <li>• Featured projects</li>
                <li>• Project descriptions</li>
                <li>• Completion tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Certifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Professional credentials</li>
                <li>• Expiration tracking</li>
                <li>• Certificate images</li>
                <li>• Verification status</li>
                <li>• Multiple cert types</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Gallery</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Photo organization</li>
                <li>• Category management</li>
                <li>• Bulk operations</li>
                <li>• Featured images</li>
                <li>• Grid/list views</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Production Ready
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Upload className="w-3 h-3 mr-1" />
          Cloudinary Integration
        </Badge>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Settings className="w-3 h-3 mr-1" />
          Full CRUD Operations
        </Badge>
      </div>
    </div>
  )
}
