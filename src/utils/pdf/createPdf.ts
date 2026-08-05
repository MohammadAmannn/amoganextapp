/**
 * @file createPdf.ts
 * @description Client-Side PDF Generation using `pdf-lib`.
 * 
 * WHY IT EXISTS:
 * Compiles single or multi-page scanned document images into a clean, compact, standard PDF document.
 * 
 * WHAT IT DOES:
 * Takes an array of processed `ScanPage` objects, embeds JPEG image streams into `PDFDocument` pages
 * configured for A4 or Original page size and Portrait or Landscape orientation.
 * 
 * WHEN IT RUNS:
 * Executed when user completes editing and moves to the PDF Preview or Send step.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `src/services/pdf.service.ts` & `src/hooks/usePDF.ts`
 * - Uses types from `src/types/scanner.ts`
 * - Uses `compress.ts` for JPEG byte encoding
 * 
 * WHO CALLS IT: `pdf.service.ts`
 * WHO DEPENDS ON IT: PDF document generation pipeline.
 */

import { PDFDocument, PageSizes } from 'pdf-lib'
import { ScanPage, PdfGenerationOptions } from '../../types/scanner'
import { compressCanvasToJpeg, dataUrlToUint8Array } from '../scanner/compress'

/**
 * Generate a PDF document from an array of processed scan pages.
 * 
 * @param pages Array of ScanPage items
 * @param options PDF settings (A4 / Original, Portrait / Landscape, Compression quality)
 * @returns Uint8Array containing compiled PDF byte stream
 */
export async function createPdfFromScanPages(
  pages: ScanPage[],
  options: PdfGenerationOptions = {}
): Promise<Uint8Array> {
  const {
    paperSize = 'a4',
    orientation = 'portrait',
    quality = 0.85,
  } = options

  const pdfDoc = await PDFDocument.create()

  for (const page of pages) {
    // Render image to canvas to apply rotation
    const imgCanvas = await renderPageToRotatedCanvas(page)
    const jpegDataUrl = compressCanvasToJpeg(imgCanvas, 2000, quality)
    const imageBytes = dataUrlToUint8Array(jpegDataUrl)

    const embeddedImage = await pdfDoc.embedJpg(imageBytes)

    let pageWidth = embeddedImage.width
    let pageHeight = embeddedImage.height

    if (paperSize === 'a4') {
      const a4 = PageSizes.A4 // [595.28, 841.89]
      if (orientation === 'landscape') {
        pageWidth = a4[1]
        pageHeight = a4[0]
      } else {
        pageWidth = a4[0]
        pageHeight = a4[1]
      }
    } else if (orientation === 'landscape' && pageWidth < pageHeight) {
      const tmp = pageWidth
      pageWidth = pageHeight
      pageHeight = tmp
    }

    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight])

    // Scale image proportionally to fit PDF page box
    const scale = Math.min(
      pageWidth / embeddedImage.width,
      pageHeight / embeddedImage.height
    )

    const drawW = embeddedImage.width * scale
    const drawH = embeddedImage.height * scale
    const drawX = (pageWidth - drawW) / 2
    const drawY = (pageHeight - drawH) / 2

    pdfPage.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    })
  }

  return await pdfDoc.save()
}

/**
 * Helper to load page image URL and apply page rotation onto a temporary canvas.
 */
async function renderPageToRotatedCanvas(page: ScanPage): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const rot = (page.rotation % 360 + 360) % 360
      const is90or270 = rot === 90 || rot === 270

      const w = is90or270 ? img.height : img.width
      const h = is90or270 ? img.width : img.height

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get 2d context for PDF page render'))
        return
      }

      ctx.translate(w / 2, h / 2)
      ctx.rotate((rot * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      resolve(canvas)
    }
    img.onerror = (err) => reject(err)
    img.src = page.processedUrl || page.originalUrl
  })
}
