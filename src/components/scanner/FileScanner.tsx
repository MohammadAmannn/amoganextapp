/**
 * @file FileScanner.tsx
 * @description Drag & Drop File Upload Ingestion Zone for Document Images.
 * 
 * WHY IT EXISTS:
 * Allows desktop and web users to upload photo scans, receipts, or document images from their local filesystem.
 * 
 * WHAT IT DOES:
 * Provides file drop zone and file input element, accepting PNG, JPG, JPEG, WEBP files and forwarding them to `addImages`.
 * 
 * WHEN IT RUNS:
 * Displayed in `capture` stage of the scanner modal.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Communicates files to `DocumentScannerModal.tsx`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx`
 * WHO DEPENDS ON IT: File-based document scanning ingestion.
 */

import React, { useRef, useState } from 'react'
import { Upload, FileImage, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface FileScannerProps {
  onFilesSelected: (files: File[]) => void
  onSelectCamera: () => void
}

export const FileScanner: React.FC<FileScannerProps> = ({ onFilesSelected, onSelectCamera }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      )
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    }
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-primary bg-primary/10 scale-[0.99]'
            : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/png, image/jpeg, image/jpg, image/webp'
          multiple
          className='hidden'
          onChange={handleFileChange}
        />

        <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
          <Upload className='h-7 w-7' />
        </div>

        <h3 className='text-base font-semibold text-foreground'>
          Drag & Drop Document Photos
        </h3>
        <p className='mt-1 text-xs text-muted-foreground max-w-xs'>
          Supports PNG, JPG, JPEG, WEBP images. You can select single or multiple pages at once.
        </p>

        <Button type='button' size='sm' className='mt-4 gap-2 font-medium'>
          <FileImage className='h-4 w-4' /> Browse Photos
        </Button>
      </div>

      {/* Alternative Choice: Open Camera */}
      <div className='relative flex items-center justify-center my-1'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <span className='relative bg-background px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Or
        </span>
      </div>

      <Button
        type='button'
        variant='outline'
        size='lg'
        className='w-full gap-2 font-semibold shadow-xs'
        onClick={onSelectCamera}
      >
        <Camera className='h-5 w-5 text-primary' /> Open Camera
      </Button>
    </div>
  )
}
