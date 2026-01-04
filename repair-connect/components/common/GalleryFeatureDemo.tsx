'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Download,
  Play,
  Grid3X3,
  Maximize,
  Keyboard
} from 'lucide-react'

export function GalleryFeatureDemo() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Gallery Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-primary-500" />
              <span className="font-medium">Zoom Controls</span>
            </div>
            <ul className="text-secondary/60 dark:text-accent/60 space-y-1 ml-6">
              <li>• Click zoom buttons or use mouse wheel</li>
              <li>• Keyboard: <Badge variant="outline" className="text-xs">+</Badge> / <Badge variant="outline" className="text-xs">-</Badge></li>
              <li>• Reset: <Badge variant="outline" className="text-xs">0</Badge> key</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <ChevronLeft className="h-4 w-4 text-[var(--ns-green)]" />
                <ChevronRight className="h-4 w-4 text-[var(--ns-green)]" />
              </div>
              <span className="font-medium">Navigation</span>
            </div>
            <ul className="text-secondary/60 dark:text-accent/60 space-y-1 ml-6">
              <li>• Click arrows or use keyboard</li>
              <li>• Keys: <Badge variant="outline" className="text-xs">←</Badge> / <Badge variant="outline" className="text-xs">→</Badge></li>
              <li>• Thumbnail strip at bottom</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary-500" />
              <span className="font-medium">Slideshow</span>
            </div>
            <ul className="text-secondary/60 dark:text-accent/60 space-y-1 ml-6">
              <li>• Auto-play through images</li>
              <li>• Toggle: <Badge variant="outline" className="text-xs">Space</Badge> key</li>
              <li>• 3-second intervals</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RotateCw className="h-4 w-4 text-[var(--ns-yellow)]" />
              <span className="font-medium">Transform</span>
            </div>
            <ul className="text-secondary/60 dark:text-accent/60 space-y-1 ml-6">
              <li>• Rotate images 90° steps</li>
              <li>• Drag to pan when zoomed</li>
              <li>• Keyboard: <Badge variant="outline" className="text-xs">R</Badge> to rotate</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary-500" />
              <span className="font-medium">Download</span>
            </div>
            <ul className="text-secondary/60 dark:text-accent/60 space-y-1 ml-6">
              <li>• Save images locally</li>
              <li>• Original quality preserved</li>
              <li>• Right-click also works</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-[var(--ns-red)]" />
              <span className="font-medium">Keyboard Shortcuts</span>
            </div>
            <ul className="text-secondary/60 dark:text-accent/60 space-y-1 ml-6">
              <li>• <Badge variant="outline" className="text-xs">Esc</Badge> - Close gallery</li>
              <li>• <Badge variant="outline" className="text-xs">Space</Badge> - Toggle slideshow</li>
              <li>• Full keyboard navigation</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary-100 rounded-lg border border-primary-500">
          <div className="flex items-start gap-3">
            <Grid3X3 className="h-5 w-5 text-primary-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-secondary dark:text-accent">How to Use</h4>
              <p className="text-secondary/80 dark:text-accent/80 text-sm mt-1">
                Click any image to open the full-screen gallery. Use mouse, touch, or keyboard to navigate. 
                The gallery supports images and videos with smooth transitions and professional controls.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GalleryFeatureDemo