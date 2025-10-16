'use client'

import Image from 'next/image'
import ImageWithFallback from '../common/ImageWithFallback'

interface ImageTestProps {
  imageUrl: string
}

export default function ImageTest({ imageUrl }: ImageTestProps) {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-bold">Image Test Component</h3>
      <p className="text-sm text-gray-600">Testing URL: {imageUrl}</p>
      
      {/* Test with regular Next.js Image */}
      <div>
        <h4 className="font-semibold mb-2">Regular Next.js Image:</h4>
        <div className="w-48 h-48 bg-gray-100 border">
          <Image
            src={imageUrl}
            alt="Test image"
            width={192}
            height={192}
            className="w-full h-full object-cover"
            onError={() => console.error('❌ Next.js Image failed:', imageUrl)}
            onLoad={() => console.log('✅ Next.js Image loaded:', imageUrl)}
          />
        </div>
      </div>
      
      {/* Test with ImageWithFallback */}
      <div>
        <h4 className="font-semibold mb-2">ImageWithFallback Component:</h4>
        <div className="w-48 h-48 bg-gray-100 border">
          <ImageWithFallback
            src={imageUrl}
            localPath=""
            fallbackSrc="/images/placeholder-car.svg"
            alt="Test image with fallback"
            width={192}
            height={192}
            className="w-full h-full object-cover"
            onError={() => console.error('❌ ImageWithFallback failed:', imageUrl)}
          />
        </div>
      </div>
      
      {/* Test with regular img tag */}
      <div>
        <h4 className="font-semibold mb-2">Regular HTML img tag:</h4>
        <div className="w-48 h-48 bg-gray-100 border">
          <img
            src={imageUrl}
            alt="Test image HTML"
            className="w-full h-full object-cover"
            onError={() => console.error('❌ HTML img failed:', imageUrl)}
            onLoad={() => console.log('✅ HTML img loaded:', imageUrl)}
          />
        </div>
      </div>
    </div>
  )
}
