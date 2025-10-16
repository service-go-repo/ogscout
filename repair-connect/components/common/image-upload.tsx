'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Camera
} from 'lucide-react'

interface UploadedFile {
  name: string
  size: number
  type: string
  uploadType: string
  category?: string
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
}

interface ImageUploadProps {
  uploadType: 'portfolio' | 'gallery' | 'certification' | 'logo' | 'cover'
  category?: string
  maxFiles?: number
  maxSizePerFile?: number // in MB
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadError?: (error: string) => void
  existingImages?: string[]
  className?: string
  disabled?: boolean
}

export default function ImageUpload({
  uploadType,
  category,
  maxFiles = 10,
  maxSizePerFile = 10,
  onUploadComplete,
  onUploadError,
  existingImages = [],
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    setErrors([])
    setUploading(true)

    try {
      // Validate file count
      if (acceptedFiles.length + uploadedFiles.length + existingImages.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed`)
      }

      // Validate file sizes
      const oversizedFiles = acceptedFiles.filter(file => file.size > maxSizePerFile * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        throw new Error(`Files too large. Maximum size: ${maxSizePerFile}MB`)
      }

      // Create FormData
      const formData = new FormData()
      acceptedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('type', uploadType)
      if (category) {
        formData.append('category', category)
      }

      // Upload files
      const response = await fetch('/api/workshops/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      if (result.success) {
        const newFiles = result.data.uploaded.map((item: any) => item.file)
        setUploadedFiles(prev => [...prev, ...newFiles])
        
        if (onUploadComplete) {
          onUploadComplete(newFiles)
        }

        // Show any failed uploads
        if (result.data.failed.length > 0) {
          const failedErrors = result.data.failed.map((item: any) => 
            `${item.file.name}: ${item.error}`
          )
          setErrors(failedErrors)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setErrors([errorMessage])
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    } finally {
      setUploading(false)
    }
  }, [uploadType, category, maxFiles, maxSizePerFile, uploadedFiles.length, existingImages.length, disabled, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: maxFiles > 1,
    disabled: disabled || uploading
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getUploadTypeLabel = () => {
    switch (uploadType) {
      case 'portfolio': return 'Portfolio Images'
      case 'gallery': return 'Gallery Photos'
      case 'certification': return 'Certificate Images'
      case 'logo': return 'Logo'
      case 'cover': return 'Cover Image'
      default: return 'Images'
    }
  }

  const getUploadTypeIcon = () => {
    switch (uploadType) {
      case 'portfolio': return <ImageIcon className="w-8 h-8" />
      case 'gallery': return <Camera className="w-8 h-8" />
      case 'certification': return <Upload className="w-8 h-8" />
      case 'logo': return <ImageIcon className="w-8 h-8" />
      case 'cover': return <ImageIcon className="w-8 h-8" />
      default: return <Upload className="w-8 h-8" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50'}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              <div className="text-gray-400">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  getUploadTypeIcon()
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {uploading ? 'Uploading...' : `Upload ${getUploadTypeLabel()}`}
                </h3>
                
                {!uploading && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {isDragActive 
                        ? 'Drop the files here...' 
                        : 'Drag & drop files here, or click to select'
                      }
                    </p>
                    <p>
                      Maximum {maxFiles} files, {maxSizePerFile}MB each
                    </p>
                    <p>
                      Supports: JPEG, PNG, WebP
                    </p>
                  </div>
                )}
              </div>
              
              {!uploading && (
                <Button type="button" variant="outline" disabled={disabled}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Upload Errors</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h4 className="text-sm font-medium text-green-800">
                Successfully Uploaded ({uploadedFiles.length})
              </h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={file.secure_url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  
                  <div className="mt-1 space-y-1">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(file.bytes / 1024)}KB
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {file.width}×{file.height}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Count Info */}
      <div className="text-sm text-gray-600 text-center">
        {existingImages.length + uploadedFiles.length} of {maxFiles} files
      </div>
    </div>
  )
}
