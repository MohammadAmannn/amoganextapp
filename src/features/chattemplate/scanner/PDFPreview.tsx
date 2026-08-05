/**
 * @file PDFPreview.tsx
 * @description Final PDF Review & Compiled Page Viewer (iOS/Android Mobile & Desktop Compatible).
 * 
 * WHY IT EXISTS:
 * Mobile browsers (iOS Safari & Android WebViews) block or render blank frames for blob PDF iframes.
 * This component provides an interactive high-resolution compiled page previewer with full device compatibility.
 */

import React, { useState } from 'react'
import { PaperSize, PaperOrientation, ScanPage } from './types'
import { FileText, Send, ArrowLeft, Loader2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface PDFPreviewProps {
  pdfUrl: string | null
  pdfFile: File | null
  pages?: ScanPage[]
  pageCount: number
  isGenerating: boolean
  isUploading: boolean
  onBackToEdit: () => void
  onSend: (customFilename: string) => void
  paperSize: PaperSize
  onChangePaperSize: (size: PaperSize) => void
  orientation: PaperOrientation
  onChangeOrientation: (orientation: PaperOrientation) => void
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  pdfUrl,
  pdfFile,
  pages = [],
  pageCount,
  isGenerating,
  isUploading,
  onBackToEdit,
  onSend,
  paperSize,
  onChangePaperSize,
  orientation,
  onChangeOrientation,
}) => {
  const defaultTitle = pdfFile?.name ? pdfFile.name.replace('.pdf', '') : `Scanned_Doc_${new Date().toISOString().slice(0, 10)}`
  const [filename, setFilename] = useState(defaultTitle)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)

  const formattedSize = pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : 'Calculating...'
  const activePreviewPage = pages[currentPreviewIndex] || pages[0]

  return (
    <div className='flex flex-col gap-4 p-2 sm:p-4'>
      {/* Header Info & Preset Selectors */}
      <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3 shadow-2xs'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <FileText className='h-5 w-5' />
          </div>
          <div className='flex flex-col min-w-0'>
            <span className='text-sm font-semibold truncate'>
              {filename || 'Scanned Document'}.pdf
            </span>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span>{pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</span>
              <span>•</span>
              <span className='font-mono'>{formattedSize}</span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Select value={paperSize} onValueChange={(val) => onChangePaperSize(val as PaperSize)}>
            <SelectTrigger className='h-8 w-24 text-xs'>
              <SelectValue placeholder='Size' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='a4'>A4 Paper</SelectItem>
              <SelectItem value='original'>Original</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orientation} onValueChange={(val) => onChangeOrientation(val as PaperOrientation)}>
            <SelectTrigger className='h-8 w-28 text-xs'>
              <SelectValue placeholder='Orientation' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='portrait'>Portrait</SelectItem>
              <SelectItem value='landscape'>Landscape</SelectItem>
            </SelectContent>
          </Select>

          {pdfUrl && (
            <Button
              type='button'
              size='sm'
              variant='ghost'
              className='h-8 px-2 text-xs text-primary hover:bg-primary/10'
              onClick={() => window.open(pdfUrl, '_blank')}
              title='Open Raw PDF File'
            >
              <ExternalLink className='h-3.5 w-3.5' />
            </Button>
          )}
        </div>
      </div>

      {/* Compiled Page Document Viewer Box */}
      <div className='relative flex h-[42vh] sm:h-[50vh] min-h-[250px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-slate-950/80 p-2 sm:p-4'>
        {isGenerating ? (
          <div className='flex flex-col items-center justify-center p-6 text-center text-muted-foreground'>
            <Loader2 className='mb-2 h-8 w-8 animate-spin text-primary' />
            <span className='text-sm font-medium text-white'>Compiling PDF Document...</span>
          </div>
        ) : activePreviewPage ? (
          <div className='relative flex h-full w-full flex-col items-center justify-between'>
            {/* Page Navigation Controls */}
            {pages.length > 1 && (
              <div className='z-20 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 shadow-md'>
                <button
                  type='button'
                  disabled={currentPreviewIndex <= 0}
                  onClick={() => setCurrentPreviewIndex((prev) => Math.max(0, prev - 1))}
                  className='p-1 disabled:opacity-30 hover:text-primary transition-colors'
                >
                  <ChevronLeft className='h-4 w-4' />
                </button>
                <span>
                  Page {currentPreviewIndex + 1} of {pages.length}
                </span>
                <button
                  type='button'
                  disabled={currentPreviewIndex >= pages.length - 1}
                  onClick={() => setCurrentPreviewIndex((prev) => Math.min(pages.length - 1, prev + 1))}
                  className='p-1 disabled:opacity-30 hover:text-primary transition-colors'
                >
                  <ChevronRight className='h-4 w-4' />
                </button>
              </div>
            )}

            {/* Compiled Page Image Preview */}
            <div className='relative flex h-full w-full flex-1 items-center justify-center overflow-hidden p-2'>
              <img
                src={activePreviewPage.processedUrl || activePreviewPage.originalUrl}
                alt={`Compiled Page ${currentPreviewIndex + 1}`}
                className='max-h-full max-w-full rounded object-contain shadow-2xl transition-transform duration-200'
                style={{ transform: `rotate(${activePreviewPage.rotation}deg)` }}
              />
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title='PDF Preview'
            className='h-full w-full rounded-xl border-0'
          />
        ) : (
          <div className='text-sm text-muted-foreground'>PDF preview unavailable</div>
        )}
      </div>

      {/* Metadata Input & Action Buttons */}
      <div className='flex flex-col gap-3 pt-1'>
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-semibold text-muted-foreground'>
            Document Filename
          </label>
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder='Enter PDF title...'
            className='h-9 text-sm font-medium'
          />
        </div>

        <div className='flex items-center justify-between gap-2 pt-1'>
          <Button
            type='button'
            variant='outline'
            size='default'
            onClick={onBackToEdit}
            disabled={isUploading || isGenerating}
            className='gap-1.5'
          >
            <ArrowLeft className='h-4 w-4' /> Edit Pages
          </Button>

          <Button
            type='button'
            size='default'
            onClick={() => onSend(filename)}
            disabled={isUploading || isGenerating || !pdfFile}
            className='gap-2 font-semibold min-w-[120px] shadow-sm'
          >
            {isUploading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Send className='h-4 w-4' />
                <span>Send PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
