/**
 * @file scanner.service.ts
 * @description Master Image & Document Scanner Pipeline Orchestrator.
 * 
 * WHY IT EXISTS:
 * Centralizes image processing steps (edge detection, unwarping perspective transform, image filter enhancement,
 * and page record creation) so UI components don't deal with raw image manipulation algorithms.
 * 
 * WHAT IT DOES:
 * Ingests image URLs or File objects, runs edge detection, applies 4-corner perspective unwarping,
 * processes enhancement filters, and returns complete `ScanPage` objects.
 * 
 * WHEN IT RUNS:
 * Executed whenever a photo is captured, uploaded, cropped, or edited in the scanner UI.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `opencv.service.ts` for OpenCV instance
 * - Uses `detectEdges.ts`, `crop.ts`, `perspective.ts`, `enhance.ts` from `src/utils/scanner/`
 * - Uses types from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `useDocumentScanner.ts` & `ScanPreview.tsx`
 * WHO DEPENDS ON IT: Document Scanning workflow state machine.
 */

import { ScanPage, CropQuad, ScanFilterMode } from '../types/scanner'
import { opencvService } from './opencv.service'
import { detectDocumentEdges, getFallbackCropQuad } from '../utils/scanner/detectEdges'
import { applyPerspectiveTransform } from '../utils/scanner/perspective'
import { applyEnhancementFilter } from '../utils/scanner/enhance'

class ScannerService {
  /**
   * Process a new raw image file or Data URL into a fully-initialized ScanPage.
   * 
   * @param imageSource File object or Image Data URL
   * @returns Promise resolving to a fresh ScanPage object
   */
  public async createScanPage(imageSource: File | string): Promise<ScanPage> {
    const dataUrl = typeof imageSource === 'string'
      ? imageSource
      : await this.fileToDataUrl(imageSource)

    const img = await this.loadImage(dataUrl)
    const width = img.naturalWidth || img.width
    const height = img.naturalHeight || img.height

    const cv = opencvService.isReady() ? (window as any).cv : undefined
    const cropQuad = detectDocumentEdges(img, cv)

    const pageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // Generate initial processed preview canvas
    const baseCanvas = this.imageToCanvas(img)
    const unwarpedCanvas = applyPerspectiveTransform(baseCanvas, cropQuad, cv)
    const enhancedCanvas = applyEnhancementFilter(unwarpedCanvas, 'enhanced', 0, 0, cv)

    const processedUrl = enhancedCanvas.toDataURL('image/jpeg', 0.88)

    return {
      id: pageId,
      originalUrl: dataUrl,
      processedUrl,
      cropQuad,
      filter: 'enhanced',
      rotation: 0,
      brightness: 0,
      contrast: 0,
      width,
      height,
      timestamp: Date.now(),
    }
  }

  /**
   * Re-process an existing ScanPage when user modifies cropQuad, filter, rotation, brightness, or contrast.
   * 
   * @param page ScanPage to update
   * @returns Promise resolving to updated ScanPage with fresh processedUrl
   */
  public async reprocessScanPage(page: ScanPage): Promise<ScanPage> {
    const img = await this.loadImage(page.originalUrl)
    const cv = opencvService.isReady() ? (window as any).cv : undefined

    const baseCanvas = this.imageToCanvas(img)
    const unwarpedCanvas = applyPerspectiveTransform(baseCanvas, page.cropQuad, cv)
    const enhancedCanvas = applyEnhancementFilter(
      unwarpedCanvas,
      page.filter,
      page.brightness,
      page.contrast,
      cv
    )

    const processedUrl = enhancedCanvas.toDataURL('image/jpeg', 0.88)

    return {
      ...page,
      processedUrl,
    }
  }

  /**
   * Helper to convert File to Data URL string.
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  }

  /**
   * Helper to load Image element asynchronously.
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = (err) => reject(err)
      img.src = src
    })
  }

  private imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const maxDim = 2048
    let w = img.naturalWidth || img.width
    let h = img.naturalHeight || img.height

    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w)
        w = maxDim
      } else {
        w = Math.round((w * maxDim) / h)
        h = maxDim
      }
    }

    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(img, 0, 0, w, h)
    }
    return canvas
  }
}

export const scannerService = new ScannerService()
