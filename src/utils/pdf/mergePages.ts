/**
 * @file mergePages.ts
 * @description Multi-PDF page merger utility.
 * 
 * WHY IT EXISTS:
 * Allows appending or merging multiple PDF byte buffers or document pages into a single PDF document.
 * 
 * WHAT IT DOES:
 * Uses `pdf-lib` to copy pages from source PDF byte arrays into a target merged `PDFDocument`.
 * 
 * WHEN IT RUNS:
 * Run when combining multiple PDF file uploads or appending pages to an existing scan session.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `src/services/pdf.service.ts`
 * 
 * WHO CALLS IT: `pdf.service.ts`
 * WHO DEPENDS ON IT: PDF document compilation.
 */

import { PDFDocument } from 'pdf-lib'

/**
 * Merge multiple PDF byte buffers into a single PDF document.
 * 
 * @param pdfBuffers Array of Uint8Array PDF buffers
 * @returns Uint8Array containing merged PDF document bytes
 */
export async function mergePdfBuffers(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  if (pdfBuffers.length === 0) {
    throw new Error('No PDF buffers provided for merging')
  }

  if (pdfBuffers.length === 1) {
    return pdfBuffers[0]
  }

  const mergedPdf = await PDFDocument.create()

  for (const buffer of pdfBuffers) {
    const srcDoc = await PDFDocument.load(buffer)
    const pageIndices = srcDoc.getPageIndices()
    const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices)
    for (const page of copiedPages) {
      mergedPdf.addPage(page)
    }
  }

  return await mergedPdf.save()
}
