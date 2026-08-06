/**
 * @file OcrPdfPreview.tsx
 * @description PDF review stage for OCR generated document before uploading and sending to chat thread.
 */

import React, { useState } from 'react'
import { ArrowLeft, Send, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface OcrPdfPreviewProps {
  pdfUrl: string
  pdfFile: File | null
  isUploading: boolean
  onBackToEdit: () => void
  onSend: (customFileName?: string) => void
}

export const OcrPdfPreview: React.FC<OcrPdfPreviewProps> = ({
  pdfUrl,
  pdfFile,
  isUploading,
  onBackToEdit,
  onSend,
}) => {
  const [fileName, setFileName] = useState<string>(pdfFile?.name || 'Extracted_Text.pdf')

  const handleSendClick = () => {
    const finalName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    onSend(finalName)
  }

  return (
    <div className='flex flex-col h-full overflow-hidden bg-background'>
      {/* Header Bar */}
      <div className='flex items-center justify-between border-b px-4 py-2.5 bg-muted/20 shrink-0'>
        <Button
          type='button'
          variant='ghost'
          size='xs'
          onClick={onBackToEdit}
          disabled={isUploading}
          className='gap-1.5'
        >
          <ArrowLeft className='h-3.5 w-3.5' /> Back to Text Editor
        </Button>

        <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
          <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' /> PDF Compiled Successfully
        </span>
      </div>

      {/* Main Preview Area */}
      <div className='flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border min-h-0 overflow-hidden'>
        {/* PDF Document Preview Canvas / Iframe */}
        <div className='md:col-span-2 bg-muted/30 p-4 flex flex-col items-center justify-center min-h-[250px] overflow-hidden'>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title='OCR PDF Preview'
              className='w-full h-full rounded-xl border bg-white shadow-xs'
            />
          ) : (
            <div className='flex flex-col items-center justify-center text-center p-6'>
              <FileText className='h-10 w-10 text-muted-foreground animate-pulse mb-2' />
              <p className='text-xs text-muted-foreground'>Rendering PDF document preview...</p>
            </div>
          )}
        </div>

        {/* Configuration Side Panel */}
        <div className='p-5 flex flex-col justify-between bg-card overflow-y-auto'>
          <div className='space-y-4'>
            <div>
              <Label className='text-xs font-semibold text-foreground mb-1.5 block'>
                Document File Name
              </Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder='Extracted_Text.pdf'
                disabled={isUploading}
                className='text-sm font-medium'
              />
            </div>

            <div className='rounded-xl bg-muted/40 p-3.5 border space-y-2 text-xs'>
              <div className='flex justify-between text-muted-foreground'>
                <span>File Format:</span>
                <span className='font-semibold text-foreground'>PDF Document</span>
              </div>
              <div className='flex justify-between text-muted-foreground'>
                <span>Size:</span>
                <span className='font-semibold text-foreground'>
                  {pdfFile ? Math.round(pdfFile.size / 1024) : 0} KB
                </span>
              </div>
              <div className='flex justify-between text-muted-foreground'>
                <span>Content:</span>
                <span className='font-semibold text-foreground'>Image + Extracted Text</span>
              </div>
            </div>
          </div>

          <div className='pt-6 border-t mt-4'>
            <Button
              type='button'
              size='lg'
              disabled={isUploading}
              onClick={handleSendClick}
              className='w-full gap-2 font-semibold shadow-md'
            >
              {isUploading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Sending to Chat...</span>
                </>
              ) : (
                <>
                  <Send className='h-4 w-4' />
                  <span>Send PDF to Chat</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
