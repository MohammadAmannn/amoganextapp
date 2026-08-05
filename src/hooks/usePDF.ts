/**
 * @file usePDF.ts
 * @description React hook for PDF compilation state, preview rendering, and memory cleanup.
 * 
 * WHY IT EXISTS:
 * Manages PDF compilation loading states, binary buffers, preview object URLs, and page options.
 * 
 * WHAT IT DOES:
 * Calls `pdfService` to compile `ScanPage[]` into a preview Blob URL, tracks compilation progress,
 * and revokes preview URLs when unmounted.
 * 
 * WHEN IT RUNS:
 * Executed during PDF Preview step in scanner modal.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `pdf.service.ts`
 * - Uses types from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `PDFPreview.tsx`
 * WHO DEPENDS ON IT: PDF document preview & confirmation UI.
 */

import { useState, useCallback, useEffect } from 'react'
import { ScanPage, PdfGenerationOptions } from '../types/scanner'
import { pdfService } from '../services/pdf.service'

export interface UsePDFReturn {
  pdfUrl: string | null
  pdfFile: File | null
  isGenerating: boolean
  error: string | null
  generatePdf: (pages: ScanPage[], filename?: string, options?: PdfGenerationOptions) => Promise<void>
  clearPdf: () => void
}

export function usePDF(): UsePDFReturn {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearPdf = useCallback(() => {
    if (pdfUrl) {
      pdfService.revokePdfPreviewUrl(pdfUrl)
      setPdfUrl(null)
    }
    setPdfFile(null)
    setError(null)
  }, [pdfUrl])

  const generatePdf = useCallback(
    async (pages: ScanPage[], filename = 'scanned_document.pdf', options: PdfGenerationOptions = {}) => {
      if (!pages || pages.length === 0) return

      setIsGenerating(true)
      setError(null)

      try {
        const file = await pdfService.generatePdfFile(pages, filename, options)
        const buffer = new Uint8Array(await file.arrayBuffer())
        const url = pdfService.createPdfPreviewUrl(buffer)

        if (pdfUrl) {
          pdfService.revokePdfPreviewUrl(pdfUrl)
        }

        setPdfFile(file)
        setPdfUrl(url)
      } catch (err: any) {
        console.error('[usePDF] Error generating PDF:', err)
        setError(err.message || 'Failed to generate PDF')
      } finally {
        setIsGenerating(false)
      }
    },
    [pdfUrl]
  )

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        pdfService.revokePdfPreviewUrl(pdfUrl)
      }
    }
  }, [pdfUrl])

  return {
    pdfUrl,
    pdfFile,
    isGenerating,
    error,
    generatePdf,
    clearPdf,
  }
}
