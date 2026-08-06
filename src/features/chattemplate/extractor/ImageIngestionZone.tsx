/**
 * @file ImageIngestionZone.tsx
 * @description Drag-and-drop file dropzone & camera capture trigger supporting images and PDFs.
 */

import React, { useRef } from 'react'
import { Upload, Camera, FileText, Image as ImageIcon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageIngestionZoneProps {
  onFileSelect: (file: File) => void
}

export const ImageIngestionZone: React.FC<ImageIngestionZoneProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      onFileSelect(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <div className='flex flex-col items-center justify-center p-6 text-center h-full min-h-[380px]'>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleInputChange}
        accept='image/png,image/jpeg,image/webp,application/pdf'
        className='hidden'
      />
      <input
        type='file'
        ref={cameraInputRef}
        onChange={handleInputChange}
        accept='image/*'
        capture='environment'
        className='hidden'
      />

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className='group relative flex w-full max-w-xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 transition-all hover:border-primary hover:bg-muted/60'
      >
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm transition-transform group-hover:scale-110'>
          <Sparkles className='h-8 w-8' />
        </div>

        <h3 className='mb-1 text-lg font-semibold text-foreground'>
          Upload Image or PDF Document
        </h3>
        <p className='mb-6 max-w-xs text-xs text-muted-foreground'>
          Drag and drop your scanned document, photo, receipt, or PDF file here to extract readable text.
        </p>

        <div className='flex flex-wrap items-center justify-center gap-3'>
          <Button
            type='button'
            variant='default'
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            className='gap-2 shadow-xs'
          >
            <Upload className='h-4 w-4' /> Browse Files
          </Button>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              cameraInputRef.current?.click()
            }}
            className='gap-2 shadow-xs'
          >
            <Camera className='h-4 w-4' /> Use Camera
          </Button>
        </div>

        <div className='mt-6 flex items-center gap-4 text-[11px] text-muted-foreground/80'>
          <span className='inline-flex items-center gap-1'>
            <ImageIcon className='h-3.5 w-3.5 text-primary/70' /> PNG, JPG, WEBP
          </span>
          <span>•</span>
          <span className='inline-flex items-center gap-1'>
            <FileText className='h-3.5 w-3.5 text-primary/70' /> PDF Documents
          </span>
        </div>
      </div>
    </div>
  )
}
