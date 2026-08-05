/**
 * @file compress.ts
 * @description Image Compression & Dimension Downscaling Helper.
 * 
 * WHY IT EXISTS:
 * Prevents memory leaks and bloated PDF file sizes by downscaling ultra-high-resolution photo captures
 * (e.g. 12MP 4000x3000 camera shots) down to standard document resolution (max 2000px edge).
 * 
 * WHAT IT DOES:
 * Scales down an HTMLCanvasElement or ImageData URL while preserving aspect ratio, returning an optimized JPEG Blob/DataURL.
 * 
 * WHEN IT RUNS:
 * Executed before embedding processed pages into PDF documents or uploading files.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `src/services/pdf.service.ts` & `src/utils/pdf/createPdf.ts`
 * 
 * WHO CALLS IT: `pdf.service.ts`
 * WHO DEPENDS ON IT: PDF size optimization pipeline.
 */

import { DEFAULT_JPEG_QUALITY } from '../../constants/scanner'

/**
 * Resize canvas to max bounding dimension and convert to JPEG Data URL.
 * 
 * @param sourceCanvas HTMLCanvasElement to compress
 * @param maxDimension Max width/height in pixels (default 2000px)
 * @param quality JPEG quality ratio 0.1 to 1.0 (default 0.85)
 * @returns Compressed JPEG Data URL
 */
export function compressCanvasToJpeg(
  sourceCanvas: HTMLCanvasElement,
  maxDimension = 2000,
  quality = DEFAULT_JPEG_QUALITY
): string {
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

/**
 * Convert a Data URL string into a Uint8Array binary array buffer.
 */
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
