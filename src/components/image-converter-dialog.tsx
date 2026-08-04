'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { FileUp, Image as ImageIcon, X, Loader2, Sparkles, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ConvertedPdfResult {
  publicUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  storagePath: string
}

interface ImageConverterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConverted: (result: ConvertedPdfResult) => void
}

interface ImageFilePreview {
  id: string
  file: File
  previewUrl: string
}

export function ImageConverterDialog({
  open,
  onOpenChange,
  onConverted,
}: ImageConverterDialogProps) {
  const [selectedImages, setSelectedImages] = useState<ImageFilePreview[]>([])
  const [pdfName, setPdfName] = useState<string>('')
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPreviews: ImageFilePreview[] = []
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newPreviews.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        })
      } else {
        toast.error(`${file.name} is not a supported image file`)
      }
    })

    setSelectedImages((prev) => [...prev, ...newPreviews])
    if (!pdfName && newPreviews.length > 0) {
      const baseName = newPreviews[0].file.name.replace(/\.[^/.]+$/, '')
      setPdfName(`${baseName}_doc`)
    }
    e.target.value = ''
  }

  const handleRemoveImage = (id: string) => {
    setSelectedImages((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }

  const handleClearAll = () => {
    selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setSelectedImages([])
    setPdfName('')
  }

  const handleConvertAndSend = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one photo to convert')
      return
    }

    setIsConverting(true)
    try {
      const formData = new FormData()
      selectedImages.forEach((item) => {
        formData.append('file', item.file)
      })

      if (pdfName.trim()) {
        formData.append('fileName', pdfName.trim())
      }

      const res = await fetch('/api/convert/photo-to-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert image to PDF')
      }

      toast.success('Successfully converted photos to PDF!')
      
      onConverted({
        publicUrl: data.publicUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType || 'application/pdf',
        storagePath: data.storagePath,
      })

      // Clean up and close modal
      handleClearAll()
      onOpenChange(false)
    } catch (err) {
      console.error('Image to PDF conversion error:', err)
      toast.error(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setIsConverting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl border border-border bg-background p-5 shadow-2xl sm:max-w-lg'>
        <DialogHeader className='space-y-1.5 text-left'>
          <div className='flex items-center gap-2 text-emerald-600 dark:text-emerald-500'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20'>
              <Sparkles className='h-5 w-5' />
            </div>
            <DialogTitle className='text-lg font-bold text-foreground'>
              Image to PDF Converter
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs text-muted-foreground'>
            Select your photos, compile them into a high-quality PDF document, and share it seamlessly in chat.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* File input drag and drop / picker dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className='group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5'
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp,image/jpg'
              multiple
              className='hidden'
              onChange={handleFileChange}
            />
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400'>
              <FileUp className='h-6 w-6' />
            </div>
            <p className='mt-2.5 text-xs font-bold text-foreground'>
              Click or drag photos to upload
            </p>
            <p className='mt-1 text-[11px] text-muted-foreground'>
              Supports JPG, JPEG, PNG, WEBP
            </p>
          </div>

          {/* Selected photos preview container */}
          {selectedImages.length > 0 && (
            <div className='space-y-2.5'>
              <div className='flex items-center justify-between text-xs font-bold'>
                <span className='text-foreground'>
                  Selected Photos ({selectedImages.length})
                </span>
                <button
                  type='button'
                  onClick={handleClearAll}
                  className='text-[11px] font-semibold text-red-500 hover:underline'
                >
                  Clear all
                </button>
              </div>

              <div className='grid max-h-48 grid-cols-3 gap-2.5 overflow-y-auto pr-1 scrollbar-thin'>
                {selectedImages.map((img) => (
                  <div
                    key={img.id}
                    className='group/img relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-xs'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className='h-full w-full object-cover transition-transform group-hover/img:scale-105'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(img.id)}
                      className='absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white shadow-xs transition-opacity hover:bg-red-600'
                      title='Remove photo'
                    >
                      <X className='h-3 w-3' />
                    </button>
                    <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[9px] text-white truncate font-medium'>
                      {formatFileSize(img.file.size)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Document Name input */}
              <div className='space-y-1 pt-1'>
                <Label htmlFor='pdf-name' className='text-xs font-bold text-foreground'>
                  Output Document Name
                </Label>
                <div className='relative flex items-center'>
                  <Input
                    id='pdf-name'
                    type='text'
                    value={pdfName}
                    onChange={(e) => setPdfName(e.target.value)}
                    placeholder='Enter PDF file name'
                    className='h-9 rounded-xl text-xs pr-12 font-medium'
                  />
                  <span className='absolute right-3 text-xs font-bold text-muted-foreground select-none'>
                    .pdf
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='flex items-center justify-end gap-2 pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isConverting}
            className='h-9 rounded-xl text-xs font-bold'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConvertAndSend}
            disabled={selectedImages.length === 0 || isConverting}
            className='h-9 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 disabled:opacity-50'
          >
            {isConverting ? (
              <>
                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                Converting...
              </>
            ) : (
              <>
                <FileText className='mr-1.5 h-3.5 w-3.5' />
                Convert to PDF & Attach
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
