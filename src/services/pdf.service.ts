/**
 * @file pdf.service.ts
 * @description Master PDF Generation & Blob Management Service.
 * 
 * WHY IT EXISTS:
 * Handles multi-page PDF generation, blob URL lifecycle management, and page count/byte size calculation.
 * 
 * WHAT IT DOES:
 * Delegates page compilation to `createPdfFromScanPages`, generates object URLs for PDF previews,
 * and releases blob URLs when preview dialogs close to avoid browser memory leaks.
 * 
 * WHEN IT RUNS:
 * Run when user clicks "Generate PDF" or opens the PDF preview stage in the Document Scanner.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `createPdfFromScanPages` from `src/utils/pdf/createPdf.ts`
 * - Uses types from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `usePDF.ts` & `PDFPreview.tsx`
 * WHO DEPENDS ON IT: PDF preview and upload submission pipeline.
 */

import { ScanPage, PdfGenerationOptions } from '../types/scanner'
import { createPdfFromScanPages } from '../utils/pdf/createPdf'

class PdfService {
  /**
   * Generate a PDF Uint8Array buffer from scan pages.
   * 
   * @param pages Array of ScanPage items
   * @param options PDF compilation parameters
   * @returns Uint8Array PDF byte stream
   */
  public async generatePdfBuffer(
    pages: ScanPage[],
    options: PdfGenerationOptions = {}
  ): Promise<Uint8Array> {
    if (!pages || pages.length === 0) {
      throw new Error('Cannot generate PDF with 0 pages')
    }
    return await createPdfFromScanPages(pages, options)
  }

  /**
   * Create a File object containing PDF binary data ready for uploading.
   * 
   * @param pages Array of ScanPage items
   * @param filename Desired PDF filename
   * @param options PDF settings
   * @returns Promise resolving to a File instance (`application/pdf`)
   */
  public async generatePdfFile(
    pages: ScanPage[],
    filename = `scanned_doc_${Date.now()}.pdf`,
    options: PdfGenerationOptions = {}
  ): Promise<File> {
    const pdfBuffer = await this.generatePdfBuffer(pages, options)
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

    return new File([pdfBuffer.buffer as ArrayBuffer], cleanFilename, { type: 'application/pdf' })
  }

  /**
   * Create a browser Blob preview URL from PDF bytes.
   * 
   * @param pdfBuffer Uint8Array PDF data
   * @returns Object URL string (`blob:http...`)
   */
  public createPdfPreviewUrl(pdfBuffer: Uint8Array): string {
    const blob = new Blob([pdfBuffer.buffer as ArrayBuffer], { type: 'application/pdf' })
    return URL.createObjectURL(blob)
  }

  /**
   * Revoke blob URL to release browser memory.
   * 
   * @param url Blob URL to revoke
   */
  public revokePdfPreviewUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }
}

export const pdfService = new PdfService()
