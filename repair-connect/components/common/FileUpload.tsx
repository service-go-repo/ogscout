'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone, Accept } from 'react-dropzone'
import { Upload, X, Image, Video, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateFile } from '@/lib/cloudinary'

interface FileWithPreview extends File {
  preview?: string
  id: string
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface FileUploadProps {
  onFilesChange: (files: FileWithPreview[]) => void
  acceptedFileTypes: 'photo' | 'video' | 'both'
  maxFiles?: number
  maxFileSize?: number // in MB
  className?: string
  disabled?: boolean
  existingFiles?: FileWithPreview[]
}

export function FileUpload({
  onFilesChange,
  acceptedFileTypes = 'photo',
  maxFiles = 10,
  maxFileSize = 10,
  className = '',
  disabled = false,
  existingFiles = [],
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>(existingFiles)
  const [dragActive, setDragActive] = useState(false)

  const getAcceptedTypes = (): Accept => {
    switch (acceptedFileTypes) {
      case 'photo':
        return {
          'image/*': ['.jpg', '.jpeg', '.png', '.webp']
        }
      case 'video':
        return {
          'video/*': ['.mp4', '.mov', '.avi', '.webm']
        }
      case 'both':
        return {
          'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
          'video/*': ['.mp4', '.mov', '.avi', '.webm']
        }
      default:
        return {}
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uploadStatus: 'pending' as const,
        })

        // Create preview for images
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file)
        }

        // Validate file
        const validation = validateFile(
          file,
          file.type.startsWith('image/') ? 'photo' : 'video'
        )
        
        if (!validation.isValid) {
          fileWithPreview.uploadStatus = 'error'
          fileWithPreview.error = validation.error
        }

        return fileWithPreview
      })

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    },
    [files, maxFiles, onFilesChange]
  )

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((file) => file.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    
    // Revoke object URL to prevent memory leaks
    const fileToRemove = files.find((file) => file.id === fileId)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }

  // File status update function - will be used for upload progress tracking
  // const updateFileStatus = (
  //   fileId: string,
  //   status: 'pending' | 'uploading' | 'success' | 'error',
  //   error?: string
  // ) => {
  //   const updatedFiles = files.map((file) => {
  //     if (file.id === fileId) {
  //       return { ...file, uploadStatus: status, error }
  //     }
  //     return file
  //   })
  //   setFiles(updatedFiles)
  //   onFilesChange(updatedFiles)
  // }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedTypes(),
    maxFiles: maxFiles - files.length,
    maxSize: maxFileSize * 1024 * 1024,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />
    }
    if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4" />
    }
    return <Upload className="w-4 h-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-warning" />
      case 'uploading':
        return (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragActive || dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive || dragActive
                ? 'Drop files here'
                : 'Drag & drop files here'
              }
            </p>
            
            <p className="text-sm text-gray-500">
              or{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                disabled={disabled || files.length >= maxFiles}
              >
                browse files
              </button>
            </p>
            
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                Accepts:{' '}
                {acceptedFileTypes === 'photo' && 'JPG, PNG, WebP'}
                {acceptedFileTypes === 'video' && 'MP4, MOV, AVI, WebM'}
                {acceptedFileTypes === 'both' && 'Images (JPG, PNG, WebP) and Videos (MP4, MOV, AVI, WebM)'}
              </p>
              <p>Max file size: {maxFileSize}MB</p>
              <p>Max files: {maxFiles} ({files.length} uploaded)</p>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
              >
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.error && (
                    <p className="text-xs text-warning mt-1">{file.error}</p>
                  )}
                </div>
                
                {/* Status & Actions */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.uploadStatus || 'pending')}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export type { FileWithPreview }