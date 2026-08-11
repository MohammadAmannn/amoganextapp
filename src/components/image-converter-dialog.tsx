'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { FileUp, X, Loader2, Sparkles, FileText, Image as ImageIcon } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

interface ImageItem {
  id: string
  file: File
}

const SUPPORTED_TARGETS = [
  { label: 'PDF Document (.pdf)', value: 'pdf' },
  { label: 'PNG Image (.png)', value: 'png' },
  { label: 'JPG Image (.jpg)', value: 'jpg' },
  { label: 'WEBP Image (.webp)', value: 'webp' },
]

export function ImageConverterDialog({
  open,
  onOpenChange,
  onConverted,
}: ImageConverterDialogProps) {
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([])
  const [targetFormat, setTargetFormat] = useState<string>('pdf')
  const [pdfName, setPdfName] = useState<string>('')
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: ImageItem[] = []
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newItems.push({
          id: crypto.randomUUID(),
          file,
        })
      } else {
        toast.error(`${file.name} is not a supported image file`)
      }
    })

    const defaultName = newItems[0]?.file.name.replace(/\.[^/.]+$/, '') || 'Converted_Document'
    setSelectedImages((prev) => {
      if (prev.length === 0 || !pdfName || pdfName === 'editable') {
        setPdfName(defaultName)
      }
      return [...prev, ...newItems]
    })
    e.target.value = ''
  }

  const handleRemoveImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
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

      const fallbackName = selectedImages[0]?.file.name.replace(/\.[^/.]+$/, '') || 'Converted_Document'
      const finalName = pdfName.trim() && pdfName !== 'editable' ? pdfName.trim() : fallbackName
      formData.append('fileName', finalName)
      formData.append('targetFormat', targetFormat)

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
      <DialogContent className='w-full max-w-[calc(100vw-2rem)] sm:max-w-lg overflow-hidden rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-2xl'>
        <DialogHeader className='space-y-1.5 text-left w-full min-w-0 pr-6'>
          <div className='flex items-center gap-2 text-emerald-600 dark:text-emerald-500'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20'>
              <Sparkles className='h-5 w-5' />
            </div>
            <DialogTitle className='text-lg font-bold text-foreground truncate'>
              Image to PDF Converter
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs text-muted-foreground whitespace-normal break-words leading-normal'>
            Select your photos, compile them into a high-quality PDF document, and share it seamlessly in chat.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2 w-full min-w-0 overflow-hidden'>
          {/* File input drag and drop / picker dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className='group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 w-full min-w-0'
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp,image/jpg'
              multiple
              className='hidden'
              onChange={handleFileChange}
            />
            <div className='flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400'>
              <FileUp className='h-5 w-5' />
            </div>
            <p className='mt-2 text-xs font-bold text-foreground'>
              Click or drag photos to upload
            </p>
            <p className='mt-0.5 text-[11px] text-muted-foreground'>
              Supports JPG, JPEG, PNG, WEBP
            </p>
          </div>

          {/* Selected photos clean file card list (Matching DocConverterDialog) */}
          {selectedImages.length > 0 && (
            <div className='space-y-3 rounded-xl border border-border/60 bg-muted/40 p-3.5 w-full min-w-0 overflow-hidden'>
              <div className='flex items-center justify-between text-xs font-bold w-full min-w-0 pb-1 border-b border-border/40'>
                <span className='text-foreground truncate'>
                  Selected Photos ({selectedImages.length})
                </span>
                <button
                  type='button'
                  onClick={handleClearAll}
                  className='shrink-0 text-[11px] font-semibold text-red-500 hover:underline'
                >
                  Clear all
                </button>
              </div>

              <div className='space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin w-full min-w-0'>
                {selectedImages.map((img) => (
                  <div
                    key={img.id}
                    className='flex items-center justify-between gap-3 min-w-0 w-full rounded-lg bg-background p-2 border border-border/50 shadow-2xs'
                  >
                    <div className='flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden'>
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                        <ImageIcon className='h-4 w-4' />
                      </div>
                      <div className='min-w-0 flex-1 overflow-hidden'>
                        <p className='truncate text-xs font-bold text-foreground block w-full' title={img.file.name}>
                          {img.file.name}
                        </p>
                        <p className='text-[10px] text-muted-foreground truncate'>
                          {formatFileSize(img.file.size)} • {img.file.name.split('.').pop()?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(img.id)}
                      className='shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                      title='Remove photo'
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  </div>
                ))}
              </div>

              {/* Target Format & File Name Inputs matching DocConverterDialog */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 w-full min-w-0'>
                <div className='space-y-1 min-w-0 w-full'>
                  <Label className='text-xs font-bold text-foreground block truncate'>
                    Convert To Format
                  </Label>
                  <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger className='h-9 rounded-xl text-xs font-medium w-full min-w-0'>
                      <SelectValue placeholder='Select format' />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TARGETS.map((t) => (
                        <SelectItem key={t.value} value={t.value} className='text-xs font-semibold'>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1 min-w-0 w-full'>
                  <Label htmlFor='image-pdf-title' className='text-xs font-bold text-foreground block truncate'>
                    Output File Name
                  </Label>
                  <div className='relative flex items-center w-full min-w-0'>
                    <Input
                      id='image-pdf-title'
                      type='text'
                      value={pdfName}
                      onChange={(e) => setPdfName(e.target.value)}
                      placeholder='Enter document file name...'
                      className='h-9 rounded-xl text-xs pr-12 font-medium w-full min-w-0 truncate'
                    />
                    <span className='absolute right-2.5 text-[11px] font-bold text-muted-foreground select-none pointer-events-none'>
                      .{targetFormat}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='flex flex-row items-center justify-end gap-2 pt-2 w-full min-w-0'>
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
