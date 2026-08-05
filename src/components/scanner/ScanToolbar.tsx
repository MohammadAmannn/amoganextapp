/**
 * @file ScanToolbar.tsx
 * @description Document Scanner Action Control Toolbar for Filter Toggles, Rotation, and Brightness Adjustments.
 * 
 * WHY IT EXISTS:
 * Gives users quick access to enhancement filters (Auto Enhance, B&W, Grayscale, Original), page rotation,
 * manual crop toggle, brightness/contrast sliders, and page deletion.
 * 
 * WHAT IT DOES:
 * Renders structured action buttons and sliders, triggering state updates on the active scanned page.
 * 
 * WHEN IT RUNS:
 * Displayed at the bottom of the scanner modal during the `edit` stage.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `SCAN_FILTERS` from `src/constants/scanner.ts`
 * - Controls `ScanPage` properties from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx` & `ScanPreview.tsx`
 * WHO DEPENDS ON IT: Document image editing user controls.
 */

import React, { useState } from 'react'
import { ScanFilterMode, ScanPage } from '../../types/scanner'
import { SCAN_FILTERS } from '../../constants/scanner'
import { RotateCw, Crop, Sliders, Trash2, Wand2, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export interface ScanToolbarProps {
  activePage: ScanPage
  onFilterChange: (filter: ScanFilterMode) => void
  onRotate: () => void
  onToggleCrop: () => void
  isCropActive: boolean
  onBrightnessContrastChange: (brightness: number, contrast: number) => void
  onDeletePage: () => void
  isProcessing?: boolean
}

export const ScanToolbar: React.FC<ScanToolbarProps> = ({
  activePage,
  onFilterChange,
  onRotate,
  onToggleCrop,
  isCropActive,
  onBrightnessContrastChange,
  onDeletePage,
  isProcessing,
}) => {
  const [showSliders, setShowSliders] = useState(false)

  return (
    <div className='flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm'>
      {/* Top Filter Buttons Row */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-1.5'>
          {SCAN_FILTERS.map((f) => (
            <Button
              key={f.id}
              type='button'
              size='sm'
              variant={activePage.filter === f.id ? 'default' : 'outline'}
              className='h-8 text-xs font-medium'
              disabled={isProcessing}
              onClick={() => onFilterChange(f.id)}
            >
              {f.id === 'enhanced' && <Wand2 className='mr-1.5 h-3.5 w-3.5' />}
              {f.label}
            </Button>
          ))}
        </div>

        <div className='flex items-center gap-1'>
          {/* Rotate Button */}
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-8 w-8 p-0'
            title='Rotate 90°'
            onClick={onRotate}
            disabled={isProcessing}
          >
            <RotateCw className='h-4 w-4' />
          </Button>

          {/* Toggle Crop Handle Overlay */}
          <Button
            type='button'
            size='sm'
            variant={isCropActive ? 'secondary' : 'ghost'}
            className='h-8 w-8 p-0'
            title='Adjust Crop Quad'
            onClick={onToggleCrop}
            disabled={isProcessing}
          >
            <Crop className='h-4 w-4' />
          </Button>

          {/* Toggle Sliders Panel */}
          <Button
            type='button'
            size='sm'
            variant={showSliders ? 'secondary' : 'ghost'}
            className='h-8 w-8 p-0'
            title='Brightness & Contrast'
            onClick={() => setShowSliders(!showSliders)}
            disabled={isProcessing}
          >
            <Sliders className='h-4 w-4' />
          </Button>

          {/* Delete Page */}
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
            title='Delete Page'
            onClick={onDeletePage}
            disabled={isProcessing}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Expandable Brightness & Contrast Sliders */}
      {showSliders && (
        <div className='grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Sun className='h-3.5 w-3.5' /> Brightness
              </span>
              <span className='font-mono'>{activePage.brightness}</span>
            </div>
            <Slider
              min={-100}
              max={100}
              step={5}
              value={[activePage.brightness]}
              onValueChange={([val]) => onBrightnessContrastChange(val, activePage.contrast)}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Moon className='h-3.5 w-3.5' /> Contrast
              </span>
              <span className='font-mono'>{activePage.contrast}</span>
            </div>
            <Slider
              min={-100}
              max={100}
              step={5}
              value={[activePage.contrast]}
              onValueChange={([val]) => onBrightnessContrastChange(activePage.brightness, val)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
