# Image Fallback System

This document explains the comprehensive image fallback system implemented in the Repair Connect application to ensure images are always available, even when Cloudinary fails.

## Overview

The image fallback system provides multiple layers of redundancy:

1. **Primary**: Cloudinary CDN (fast, optimized)
2. **Secondary**: Local storage backup (reliable fallback)
3. **Tertiary**: SVG placeholder (always available)

## Components

### 1. ImageWithFallback Component

**Location**: `components/common/ImageWithFallback.tsx`

A drop-in replacement for Next.js Image component with automatic fallback handling.

```tsx
import ImageWithFallback from '@/components/common/ImageWithFallback'

<ImageWithFallback
  src={cloudinaryUrl}
  localPath={localImagePath}
  fallbackSrc="/images/placeholder-car.svg"
  alt="Car image"
  width={400}
  height={300}
/>
```

**Features**:
- Automatic fallback progression
- Loading states with smooth transitions
- Error handling with retry logic
- Support for both fixed dimensions and fill layouts
- Responsive image sizing

### 2. Image Storage Service

**Location**: `lib/imageStorage.ts`

Handles local image storage and fallback path generation.

**Key Functions**:

```typescript
// Save image locally during upload
await saveImageLocally({
  carId: 'car123',
  filename: 'photo1',
  buffer: imageBuffer,
  mimeType: 'image/jpeg'
})

// Generate fallback data
const imageData = getImageWithFallback(cloudinaryUrl, carId, filename)

// Check if local image exists
const exists = await checkLocalImageExists('/images/cars/car123/photo1.jpg')

// Clean up local images
await deleteLocalImages('car123')
```

### 3. Custom Hooks

**Location**: `hooks/useImageFallback.ts`

React hooks for advanced image fallback handling.

```typescript
// Full-featured hook with loading states
const { src, isLoading, hasError, isUsingFallback, retry } = useImageFallback({
  cloudinaryUrl,
  carId,
  filename,
  fallbackType: 'car'
})

// Simple hook for basic fallback
const imageSrc = useSimpleImageFallback(cloudinaryUrl, localPath)
```

## Directory Structure

```
public/
├── images/
│   ├── cars/
│   │   └── [carId]/
│   │       ├── photo1.jpg
│   │       ├── photo2.jpg
│   │       └── ...
│   ├── placeholder-car.svg
│   ├── placeholder-damage.svg
│   └── placeholder-profile.svg
```

## API Integration

### Upload Endpoint

**Location**: `src/app/api/upload/route.ts`

Enhanced to save images locally during Cloudinary upload:

```typescript
// Upload includes local backup
const result = await uploadToCloudinary(buffer, options)
const localPath = await saveImageLocally({
  carId,
  filename: publicId,
  buffer,
  mimeType: file.type
})
```

### Car Management APIs

**Location**: `src/app/api/cars/[id]/route.ts`

Enhanced DELETE endpoint cleans up both Cloudinary and local images:

```typescript
// Delete from both sources
await deleteFromCloudinary(publicId, resourceType)
await deleteLocalImages(carId)
```

## Usage Examples

### 1. Car Detail Page

```tsx
// In car detail page
{car.media.map((media, index) => {
  const imageData = getImageWithFallback(media.url, carId, media.publicId)
  return (
    <ImageWithFallback
      key={index}
      src={imageData.cloudinaryUrl}
      localPath={imageData.localPath}
      fallbackSrc={imageData.fallbackUrl}
      alt={`Car photo ${index + 1}`}
      fill
      className="object-cover"
    />
  )
})}
```

### 2. Car Upload Form

```typescript
// During upload, include carId for local storage
const formData = new FormData()
formData.append('files', file)
formData.append('type', 'photo')
formData.append('carId', carId) // Important for local organization

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

### 3. Custom Image Component

```tsx
function CarImage({ cloudinaryUrl, carId, filename, ...props }) {
  const { src, isLoading, hasError, retry } = useImageFallback({
    cloudinaryUrl,
    carId,
    filename,
    fallbackType: 'car'
  })

  return (
    <div className="relative">
      <img src={src} {...props} />
      {isLoading && <LoadingSpinner />}
      {hasError && (
        <button onClick={retry} className="retry-btn">
          Retry
        </button>
      )}
    </div>
  )
}
```

## Error Handling

The system gracefully handles various failure scenarios:

1. **Cloudinary Outage**: Automatically falls back to local images
2. **Network Issues**: Retries with exponential backoff
3. **Missing Local Files**: Falls back to SVG placeholders
4. **Corrupted Images**: Shows error state with retry option

## Performance Considerations

### Optimizations

1. **Lazy Loading**: Images load only when needed
2. **Progressive Enhancement**: Start with placeholder, upgrade to real image
3. **Caching**: Local images cached by browser
4. **Compression**: SVG placeholders are lightweight

### Best Practices

1. Always provide `carId` during upload for proper organization
2. Use appropriate `sizes` prop for responsive images
3. Include descriptive `alt` text for accessibility
4. Monitor local storage usage and clean up old images

## Monitoring and Maintenance

### Logging

The system logs important events:

```typescript
console.log(`Image saved locally: ${localPath}`)
console.warn(`Failed to load image: ${cloudinaryUrl}`)
console.error(`Upload failed for ${filename}:`, error)
```

### Cleanup

Local images are automatically cleaned up when:
- Cars are deleted
- Images are removed from Cloudinary
- Manual cleanup is triggered

### Storage Management

Monitor the `public/images/cars/` directory size and implement rotation if needed:

```bash
# Check directory size
du -sh public/images/cars/

# Clean up old car directories
find public/images/cars/ -type d -mtime +30 -exec rm -rf {} \;
```

## Security Considerations

1. **File Validation**: Only allow approved image types
2. **Size Limits**: Enforce maximum file sizes
3. **Path Sanitization**: Prevent directory traversal attacks
4. **Access Control**: Ensure users can only access their own images

## Future Enhancements

1. **WebP Conversion**: Convert images to WebP for better compression
2. **Image Resizing**: Generate multiple sizes for responsive images
3. **CDN Integration**: Use additional CDN providers as fallbacks
4. **Background Sync**: Sync local images back to Cloudinary when available
5. **Progressive Web App**: Cache images for offline access

## Troubleshooting

### Common Issues

1. **Images not falling back**: Check console for error messages
2. **Local images not saving**: Verify file permissions on `public/images/cars/`
3. **Placeholder not showing**: Ensure SVG files exist in `public/images/`
4. **Performance issues**: Check image sizes and implement lazy loading

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG_IMAGES=true npm run dev
```

This comprehensive fallback system ensures that users always see images, providing a robust and reliable experience even when external services fail.
