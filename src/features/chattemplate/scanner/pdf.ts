/**
 * @file pdf.ts
 * @description Client-side PDF Compiler (pdf-lib), Compression & Supabase Upload Service.
 * 
 * WHY IT EXISTS:
 * Consolidates PDF page rendering, JPEG compression downscaling, preview Blob URL lifecycle management,
 * and Supabase Storage `/api/upload` POST dispatch into one compact file.
 */

import { PDFDocument, PageSizes } from 'pdf-lib'
import { ScanPage, PdfGenerationOptions, ScannedPdfResult, DEFAULT_JPEG_QUALITY } from './types'

export function compressCanvasToJpeg(sourceCanvas: HTMLCanvasElement, maxDimension = 2000, quality = DEFAULT_JPEG_QUALITY): string {
  let width = sourceCanvas.width
  let height = sourceCanvas.height

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }
  }

  const outCanvas = document.createElement('canvas')
  outCanvas.width = width
  outCanvas.height = height

  const ctx = outCanvas.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(sourceCanvas, 0, 0, width, height)
  }

  return outCanvas.toDataURL('image/jpeg', quality)
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64Str = dataUrl.split(',')[1] || dataUrl
  const binaryStr = atob(base64Str)
  const len = binaryStr.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return bytes
}

export async function createPdfFromScanPages(pages: ScanPage[], options: PdfGenerationOptions = {}): Promise<Uint8Array> {
  const { paperSize = 'a4', orientation = 'portrait', quality = 0.85 } = options
  const pdfDoc = await PDFDocument.create()

  for (const page of pages) {
    const imgCanvas = await renderPageToRotatedCanvas(page)
    const jpegDataUrl = compressCanvasToJpeg(imgCanvas, 2000, quality)
    const imageBytes = dataUrlToUint8Array(jpegDataUrl)
    const embeddedImage = await pdfDoc.embedJpg(imageBytes)

    let pageWidth = embeddedImage.width
    let pageHeight = embeddedImage.height

    if (paperSize === 'a4') {
      const a4 = PageSizes.A4
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
    const scale = Math.min(pageWidth / embeddedImage.width, pageHeight / embeddedImage.height)
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

async function renderPageToRotatedCanvas(page: ScanPage): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const rot = ((page.rotation % 360) + 360) % 360
      const is90or270 = rot === 90 || rot === 270
      const w = is90or270 ? img.height : img.width
      const h = is90or270 ? img.width : img.height

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context error'))

      ctx.translate(w / 2, h / 2)
      ctx.rotate((rot * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      resolve(canvas)
    }
    img.onerror = (e) => reject(e)
    img.src = page.processedUrl || page.originalUrl
  })
}

export async function uploadScannedPdf(pdfFile: File, pageCount: number): Promise<ScannedPdfResult> {
  const formData = new FormData()
  formData.append('file', pdfFile)
  formData.append('folder', 'documents')

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Upload failed (${response.status}): ${errText}`)
  }

  const data = await response.json()
  if (!data.success || !data.publicUrl) {
    throw new Error(data.error || 'Invalid upload response')
  }

  return {
    publicUrl: data.publicUrl,
    fileName: data.fileName || pdfFile.name,
    fileSize: data.fileSize || pdfFile.size,
    mimeType: 'application/pdf',
    storagePath: data.storagePath || `scanned/${pdfFile.name}`,
    pageCount,
  }
}
