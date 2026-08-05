/**
 * @file ScanToolbar.tsx
 * @description Scanner Toolbar for Filters, Rotation, Crop Toggle & Brightness Sliders.
 */

import React, { useState } from 'react'
import { ScanFilterMode, ScanPage, SCAN_FILTERS } from './types'
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
    <div className='flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none'>
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
