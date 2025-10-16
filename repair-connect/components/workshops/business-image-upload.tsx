'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/common/image-upload'
import { Building2, Camera, X } from 'lucide-react'

interface BusinessImageUploadProps {
  logoUrl?: string
  coverImageUrl?: string
  onLogoChange?: (url: string | null) => void
  onCoverImageChange?: (url: string | null) => void
  disabled?: boolean
}

export default function BusinessImageUpload({
  logoUrl,
  coverImageUrl,
  onLogoChange,
  onCoverImageChange,
  disabled = false
}: BusinessImageUploadProps) {
  const [showLogoUpload, setShowLogoUpload] = useState(false)
  const [showCoverUpload, setShowCoverUpload] = useState(false)

  const handleLogoUpload = (files: any[]) => {
    if (files.length > 0 && onLogoChange) {
      onLogoChange(files[0].secure_url)
      setShowLogoUpload(false)
    }
  }

  const handleCoverUpload = (files: any[]) => {
    if (files.length > 0 && onCoverImageChange) {
      onCoverImageChange(files[0].secure_url)
      setShowCoverUpload(false)
    }
  }

  const removeLogo = () => {
    if (onLogoChange) {
      onLogoChange(null)
    }
  }

  const removeCoverImage = () => {
    if (onCoverImageChange) {
      onCoverImageChange(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <Label className="text-base font-medium">Workshop Logo</Label>
        <p className="text-sm text-gray-600 mb-3">
          Upload your workshop logo (recommended: square format, 200x200px)
        </p>
        
        {logoUrl ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={logoUrl}
                    alt="Workshop Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Current Logo</p>
                  <p className="text-xs text-gray-600">Click to change or remove</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowLogoUpload(true)}
                    disabled={disabled}
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    Change
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeLogo}
                    disabled={disabled}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-3">No logo uploaded</p>
                <Button
                  onClick={() => setShowLogoUpload(true)}
                  disabled={disabled}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showLogoUpload && (
          <div className="mt-4">
            <ImageUpload
              uploadType="logo"
              maxFiles={1}
              maxSizePerFile={2}
              onUploadComplete={handleLogoUpload}
              onUploadError={(error) => {
                console.error('Logo upload error:', error)
                setShowLogoUpload(false)
              }}
            />
            <Button
              variant="outline"
              onClick={() => setShowLogoUpload(false)}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Cover Image Upload */}
      <div>
        <Label className="text-base font-medium">Cover Image</Label>
        <p className="text-sm text-gray-600 mb-3">
          Upload a cover image for your workshop (recommended: 1200x400px)
        </p>
        
        {coverImageUrl ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="aspect-[3/1] rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={coverImageUrl}
                    alt="Workshop Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Cover Image</p>
                    <p className="text-xs text-gray-600">This will be displayed on your workshop profile</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCoverUpload(true)}
                      disabled={disabled}
                    >
                      <Camera className="w-3 h-3 mr-1" />
                      Change
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={removeCoverImage}
                      disabled={disabled}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="aspect-[3/1] rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-3">No cover image uploaded</p>
                <Button
                  onClick={() => setShowCoverUpload(true)}
                  disabled={disabled}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Cover Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showCoverUpload && (
          <div className="mt-4">
            <ImageUpload
              uploadType="cover"
              maxFiles={1}
              maxSizePerFile={5}
              onUploadComplete={handleCoverUpload}
              onUploadError={(error) => {
                console.error('Cover image upload error:', error)
                setShowCoverUpload(false)
              }}
            />
            <Button
              variant="outline"
              onClick={() => setShowCoverUpload(false)}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
