/**
 * @file DocumentScannerModal.tsx
 * @description Master Modal Dialog wrapping the Enterprise Document Scanner Experience.
 * 
 * WHY IT EXISTS:
 * Primary dialog entry point for scanning documents from both Chat Template and Messages pages.
 * 
 * IMPORTANT FOR TOUCH / FOCUS FIX:
 * Returns `null` when `isOpen === false` to ensure Radix UI Dialog never mounts or injects
 * residual `pointer-events: none` on `document.body` when modal is closed.
 */

import React, { useState, useEffect } from 'react'
import { DocumentScannerModalProps } from './types'
import { useDocumentScanner, usePDF, useSupabaseUpload, useOpenCV } from './hooks'

import { FileScanner } from './FileScanner'
import { CameraScanner } from './CameraScanner'
import { ScanPreview } from './ScanPreview'
import { ScanToolbar } from './ScanToolbar'
import { PageSorter } from './PageSorter'
import { PDFPreview } from './PDFPreview'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileCheck, Sparkles, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialMode = 'upload',
}) => {
  const {
    stage,
    pages,
    activePageIndex,
    activePage,
    paperSize,
    orientation,
    isProcessing,
    setStage,
    setActivePageIndex,
    setPaperSize,
    setOrientation,
    addImages,
    updateCropQuad,
    updateFilter,
    updateBrightnessContrast,
    rotatePage,
    deletePage,
    reorderPages,
    resetScanner,
  } = useDocumentScanner('capture')

  const { isReady: isOpenCVReady } = useOpenCV(isOpen)
  const { pdfUrl, pdfFile, isGenerating, generatePdf, clearPdf } = usePDF()
  const { isUploading, uploadPdf } = useSupabaseUpload()

  const [captureSourceMode, setCaptureSourceMode] = useState<'upload' | 'camera'>(initialMode)
  const [isCropActive, setIsCropActive] = useState(false)

  useEffect(() => {
    if (isOpen) {
      resetScanner()
      clearPdf()
      setCaptureSourceMode(initialMode)
      setStage('capture')
      setIsCropActive(false)
    }
  }, [isOpen, initialMode])

  const handleFilesSelected = async (files: File[]) => {
    await addImages(files)
  }

  const handleCameraPhoto = async (dataUrl: string) => {
    await addImages([dataUrl])
  }

  const handleProceedToPdfPreview = async () => {
    if (pages.length === 0) return
    setStage('pdf_preview')
    await generatePdf(pages, `Scanned_Doc_${Date.now()}.pdf`, {
      paperSize,
      orientation,
    })
  }

  const handleConfirmSend = async (customFilename: string) => {
    if (!pdfFile || pages.length === 0) return

    try {
      const cleanName = customFilename.trim()
        ? (customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`)
        : pdfFile.name

      const renamedFile = new File([pdfFile], cleanName, { type: 'application/pdf' })
      const uploadResult = await uploadPdf(renamedFile, pages.length)

      if (uploadResult) {
        toast.success('Document scanned & uploaded successfully!')
        onComplete(uploadResult)
        onClose()
      } else {
        toast.error('Failed to upload scanned PDF document')
      }
    } catch (err: any) {
      console.error('[DocumentScannerModal] Upload error:', err)
      toast.error(err.message || 'Upload failed')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='fixed inset-0 top-0 left-0 right-0 bottom-0 translate-x-0 translate-y-0 z-50 h-dvh w-screen max-w-none max-h-none sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:w-full sm:max-w-4xl sm:max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0 rounded-none sm:rounded-2xl border-none sm:border'>
        <DialogHeader className='flex flex-row items-center justify-between border-b px-4 py-3 sm:px-6 pr-12 sm:pr-12 shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <FileCheck className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-semibold flex items-center gap-2'>
                <span>Enterprise Document Scanner</span>
                {isOpenCVReady && (
                  <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400'>
                    <Sparkles className='h-3 w-3' /> OpenCV Smart AI
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {stage === 'capture' && 'Select images or capture using camera'}
                {stage === 'edit' && `Editing Page ${activePageIndex + 1} of ${pages.length}`}
                {stage === 'pdf_preview' && 'Review compiled PDF prior to sending'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={`flex-1 overflow-y-auto ${stage === 'capture' && captureSourceMode === 'camera' ? 'p-0 h-full flex flex-col' : 'p-3 sm:p-5'}`}>
          {stage === 'capture' && (
            <div className={captureSourceMode === 'camera' ? 'h-full flex-1 flex flex-col' : 'flex flex-col gap-4'}>
              {captureSourceMode === 'camera' ? (
                <CameraScanner
                  onCapture={handleCameraPhoto}
                  onCancel={() => setCaptureSourceMode('upload')}
                  scannedCount={pages.length}
                  onViewPages={() => pages.length > 0 && setStage('edit')}
                />
              ) : (
                <FileScanner
                  onFilesSelected={handleFilesSelected}
                  onSelectCamera={() => setCaptureSourceMode('camera')}
                />
              )}
            </div>
          )}

          {(stage === 'edit' || stage === 'sorter') && activePage && (
            <div className='flex flex-col gap-3'>
              <ScanPreview
                page={activePage}
                isCropActive={isCropActive}
                onCropChange={(quad) => updateCropQuad(activePage.id, quad)}
                isProcessing={isProcessing}
              />

              <ScanToolbar
                activePage={activePage}
                onFilterChange={(filter) => updateFilter(activePage.id, filter)}
                onRotate={() => rotatePage(activePage.id, 90)}
                onToggleCrop={() => setIsCropActive(!isCropActive)}
                isCropActive={isCropActive}
                onBrightnessContrastChange={(b, c) => updateBrightnessContrast(activePage.id, b, c)}
                onDeletePage={() => deletePage(activePage.id)}
                isProcessing={isProcessing}
              />

              <PageSorter
                pages={pages}
                activePageIndex={activePageIndex}
                onSelectPage={setActivePageIndex}
                onReorderPages={reorderPages}
                onDeletePage={deletePage}
                onRotatePage={(id) => rotatePage(id, 90)}
                onAddPage={() => setStage('capture')}
              />

              <div className='flex items-center justify-between border-t pt-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setStage('capture')}
                >
                  + Add More Pages
                </Button>

                <Button
                  type='button'
                  size='default'
                  className='gap-2 font-semibold shadow-sm'
                  onClick={handleProceedToPdfPreview}
                >
                  Generate PDF <ArrowRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}

          {stage === 'pdf_preview' && (
            <PDFPreview
              pdfUrl={pdfUrl}
              pdfFile={pdfFile}
              pages={pages}
              pageCount={pages.length}
              isGenerating={isGenerating}
              isUploading={isUploading}
              onBackToEdit={() => setStage('edit')}
              onSend={handleConfirmSend}
              paperSize={paperSize}
              onChangePaperSize={setPaperSize}
              orientation={orientation}
              onChangeOrientation={setOrientation}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
