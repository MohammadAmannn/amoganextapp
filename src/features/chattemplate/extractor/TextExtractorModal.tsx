/**
 * @file TextExtractorModal.tsx
 * @description Master responsive modal for Extract Text (OCR Image-to-PDF) workflow.
 */

import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextExtractorModalProps } from './types'
import { useOcrExtractor } from './hooks'
import { ImageIngestionZone } from './ImageIngestionZone'
import { OcrEditStudio } from './OcrEditStudio'
import { OcrPdfPreview } from './OcrPdfPreview'

export const TextExtractorModal: React.FC<TextExtractorModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const {
    stage,
    setStage,
    selectedFile,
    previewUrl,
    language,
    progressPct,
    progressText,
    isProcessing,
    ocrResult,
    editedText,
    setEditedText,
    pdfFile,
    pdfUrl,
    isUploading,
    handleFileSelect,
    handleLanguageChange,
    handleProceedToPdfPreview,
    handleConfirmSend,
    reset,
  } = useOcrExtractor()

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const handleCompleteSend = (customFileName?: string) => {
    handleConfirmSend((result) => {
      if (onComplete) onComplete(result)
      onClose()
    }, customFileName)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='p-0 gap-0 overflow-hidden border-border shadow-2xl flex flex-col h-dvh w-screen max-w-none rounded-none sm:h-[85vh] sm:max-w-4xl sm:rounded-2xl transition-all'>
        {/* Modal Header */}
        <DialogHeader className='flex flex-row items-center justify-between border-b px-5 py-3 shrink-0 space-y-0 bg-card'>
          <DialogTitle className='text-base font-semibold flex items-center gap-2 text-foreground'>
            <FileText className='h-4 w-4 text-primary' />
            <span>OCR Text Extractor</span>
            <span className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
              <Sparkles className='h-3 w-3' /> AI Text Recognizer
            </span>
          </DialogTitle>

          {/* Breadcrumb Steps */}
          <div className='hidden md:flex items-center gap-3 text-xs text-muted-foreground'>
            <span className={stage === 'ingest' ? 'font-semibold text-primary' : ''}>1. Select File</span>
            <span>→</span>
            <span className={stage === 'ocr_studio' ? 'font-semibold text-primary' : ''}>2. Extract & Edit</span>
            <span>→</span>
            <span className={stage === 'pdf_preview' ? 'font-semibold text-primary' : ''}>3. Send PDF</span>
          </div>
        </DialogHeader>

        {/* Modal Body Container */}
        <div className='flex-1 min-h-0 overflow-hidden bg-background'>
          {stage === 'ingest' && (
            <ImageIngestionZone onFileSelect={handleFileSelect} />
          )}

          {stage === 'ocr_studio' && (
            <OcrEditStudio
              previewUrl={previewUrl}
              selectedFile={selectedFile}
              language={language}
              progressPct={progressPct}
              progressText={progressText}
              isProcessing={isProcessing}
              ocrResult={ocrResult}
              editedText={editedText}
              onEditedTextChange={setEditedText}
              onLanguageChange={handleLanguageChange}
              onProceedToPdf={handleProceedToPdfPreview}
              onBackToIngest={() => setStage('ingest')}
            />
          )}

          {stage === 'pdf_preview' && (
            <OcrPdfPreview
              pdfUrl={pdfUrl}
              pdfFile={pdfFile}
              isUploading={isUploading}
              onBackToEdit={() => setStage('ocr_studio')}
              onSend={handleCompleteSend}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
