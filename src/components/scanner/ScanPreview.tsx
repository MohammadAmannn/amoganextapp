/**
 * @file ScanPreview.tsx
 * @description Main Interactive Document Editing Canvas & Crop Viewport.
 * 
 * WHY IT EXISTS:
 * Displays the currently selected scanned document page with zoom, perspective rotation,
 * and optional 4-corner crop handle overlay.
 * 
 * WHAT IT DOES:
 * Renders active page image, applies rotation CSS transforms, and mounts `CropOverlay.tsx` when manual crop is toggled.
 * 
 * WHEN IT RUNS:
 * Displayed in the center of the scanner modal during the `edit` stage.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `CropOverlay.tsx`
 * - Uses `ScanPage`, `CropQuad` from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx`
 * WHO DEPENDS ON IT: Document image editing viewport.
 */

import React from 'react'
import { ScanPage, CropQuad } from '../../types/scanner'
import { CropOverlay } from './CropOverlay'
import { Loader2 } from 'lucide-react'

export interface ScanPreviewProps {
  page: ScanPage
  isCropActive: boolean
  onCropChange: (updatedQuad: CropQuad) => void
  isProcessing?: boolean
}

export const ScanPreview: React.FC<ScanPreviewProps> = ({
  page,
  isCropActive,
  onCropChange,
  isProcessing,
}) => {
  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950/80 p-2 sm:p-4'>
      {/* Loading Overlay */}
      {isProcessing && (
        <div className='absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xs'>
          <div className='flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium shadow-xl'>
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
            <span>Processing document...</span>
          </div>
        </div>
      )}

      {/* Main Document Image Frame */}
      <div className='relative flex max-h-full max-w-full items-center justify-center'>
        <img
          src={isCropActive ? page.originalUrl : page.processedUrl || page.originalUrl}
          alt='Scanned Document'
          className='max-h-[55vh] max-w-full rounded object-contain shadow-2xl transition-transform duration-200'
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />

        {/* Manual 4-Corner Crop Overlay */}
        {isCropActive && (
          <CropOverlay
            quad={page.cropQuad}
            onChange={onCropChange}
            disabled={isProcessing}
          />
        )}
      </div>
    </div>
  )
}
