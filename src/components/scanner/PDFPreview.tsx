/**
 * @file PDFPreview.tsx
 * @description Final Document PDF Preview Dialog View & Confirmation Controls.
 * 
 * WHY IT EXISTS:
 * Renders the compiled PDF preview, page count, file size, paper settings (A4 / Original, Portrait / Landscape),
 * filename edit input, and final "Send" button prior to Supabase Storage upload.
 * 
 * WHAT IT DOES:
 * Displays iframe or doc viewer preview of compiled PDF bytes, allows tweaking PDF filename & page paper options,
 * and triggers upload & message dispatch upon pressing Send.
 * 
 * WHEN IT RUNS:
 * Active during `pdf_preview` stage of the scanner modal.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `usePDF.ts`
 * - Uses `PaperSize`, `PaperOrientation` from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx`
 * WHO DEPENDS ON IT: Final PDF verification and chat dispatch UI.
 */

import React, { useState } from 'react'
import { PaperSize, PaperOrientation } from '../../types/scanner'
import { FileText, Send, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface PDFPreviewProps {
  pdfUrl: string | null
  pdfFile: File | null
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

  const formattedSize = pdfFile
    ? `${(pdfFile.size / 1024).toFixed(1)} KB`
    : 'Calculating...'

  return (
    <div className='flex flex-col gap-4 p-2 sm:p-4'>
      {/* Header Info & File Metadata */}
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

        {/* Paper Size & Orientation Controls */}
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
        </div>
      </div>

      {/* PDF Viewport Box */}
      <div className='relative flex h-[50vh] min-h-[300px] w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/20'>
        {isGenerating ? (
          <div className='flex flex-col items-center justify-center p-6 text-center text-muted-foreground'>
            <Loader2 className='mb-2 h-8 w-8 animate-spin text-primary' />
            <span className='text-sm font-medium'>Compiling PDF Document...</span>
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

      {/* Output Filename Input & Action Buttons */}
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
