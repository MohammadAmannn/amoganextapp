/**
 * @file enhance.ts
 * @description Document Enhancement Filters, Contrast Adjustments & Shadow Removal.
 * 
 * WHY IT EXISTS:
 * Improves document readability by enhancing text sharpness, converting to monochrome/grayscale,
 * removing dark background shadows, and adjusting brightness & contrast levels.
 * 
 * WHAT IT DOES:
 * Applies specified filter modes ('original' | 'grayscale' | 'bw' | 'enhanced') plus brightness/contrast
 * parameters onto an HTMLCanvasElement using OpenCV or native Canvas ImageData filters.
 * 
 * WHEN IT RUNS:
 * Fired whenever the user changes filter selection, brightness, or contrast sliders in the ScanToolbar.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `src/services/scanner.service.ts`
 * - Uses types from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `scanner.service.ts`
 * WHO DEPENDS ON IT: Document image enhancement pipeline.
 */

import { ScanFilterMode } from '../../types/scanner'

/**
 * Apply enhancement filters and brightness/contrast parameters to a canvas.
 * 
 * @param canvas Source HTMLCanvasElement
 * @param filter Scan filter mode ('original' | 'grayscale' | 'bw' | 'enhanced')
 * @param brightness Brightness offset (-100 to 100)
 * @param contrast Contrast offset (-100 to 100)
 * @param cv Optional OpenCV instance
 * @returns Enhanced HTMLCanvasElement
 */
export function applyEnhancementFilter(
  canvas: HTMLCanvasElement,
  filter: ScanFilterMode,
  brightness = 0,
  contrast = 0,
  cv?: any
): HTMLCanvasElement {
  const outCanvas = document.createElement('canvas')
  outCanvas.width = canvas.width
  outCanvas.height = canvas.height

  const ctx = outCanvas.getContext('2d')
  if (!ctx) return canvas

  // First draw base canvas
  ctx.drawImage(canvas, 0, 0)

  // OpenCV Processing if available
  if (cv && cv.Mat && filter !== 'original') {
    try {
      const srcMat = cv.imread(outCanvas)
      const dstMat = new cv.Mat()

      if (filter === 'grayscale') {
        cv.cvtColor(srcMat, dstMat, cv.COLOR_RGBA2GRAY, 0)
        cv.cvtColor(dstMat, dstMat, cv.COLOR_GRAY2RGBA, 0)
      } else if (filter === 'bw') {
        // High contrast adaptive binary thresholding for text documents
        const grayMat = new cv.Mat()
        cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY, 0)
        cv.adaptiveThreshold(
          grayMat,
          grayMat,
          255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          cv.THRESH_BINARY,
          21,
          10
        )
        cv.cvtColor(grayMat, dstMat, cv.COLOR_GRAY2RGBA, 0)
        grayMat.delete()
      } else if (filter === 'enhanced') {
        // Color enhancement: Contrast sharpening + Shadow removal
        const labMat = new cv.Mat()
        cv.cvtColor(srcMat, labMat, cv.COLOR_RGBA2RGB, 0)
        cv.cvtColor(labMat, labMat, cv.COLOR_RGB2Lab, 0)

        // Split channels to equalize Luminance
        const channels = new cv.MatVector()
        cv.split(labMat, channels)
        const lChannel = channels.get(0)

        const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8))
        clahe.apply(lChannel, lChannel)

        channels.set(0, lChannel)
        cv.merge(channels, labMat)
        cv.cvtColor(labMat, dstMat, cv.COLOR_Lab2RGBA, 0)

        labMat.delete()
        channels.delete()
        lChannel.delete()
        clahe.delete()
      }

      cv.imshow(outCanvas, dstMat)
      srcMat.delete()
      dstMat.delete()
    } catch (e) {
      console.warn('[enhance] OpenCV enhancement failed, fallback to canvas pixel math:', e)
    }
  }

  // Fallback Canvas pixel math for brightness/contrast or when OpenCV is not present
  const imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height)
  const data = imgData.data

  const bFactor = brightness * 2.55 // map -100..100 to -255..255
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    // Apply manual filter if OpenCV was absent
    if (!cv && filter === 'grayscale') {
      const avg = 0.299 * r + 0.587 * g + 0.114 * b
      r = avg
      g = avg
      b = avg
    } else if (!cv && filter === 'bw') {
      const avg = 0.299 * r + 0.587 * g + 0.114 * b
      const bw = avg > 128 ? 255 : 0
      r = bw
      g = bw
      b = bw
    } else if (!cv && filter === 'enhanced') {
      // Mild auto-contrast increase
      r = Math.min(255, r * 1.1 + 10)
      g = Math.min(255, g * 1.1 + 10)
      b = Math.min(255, b * 1.1 + 10)
    }

    // Apply Brightness & Contrast
    if (brightness !== 0 || contrast !== 0) {
      r = cFactor * (r - 128) + 128 + bFactor
      g = cFactor * (g - 128) + 128 + bFactor
      b = cFactor * (b - 128) + 128 + bFactor
    }

    data[i] = Math.min(255, Math.max(0, r))
    data[i + 1] = Math.min(255, Math.max(0, g))
    data[i + 2] = Math.min(255, Math.max(0, b))
  }

  ctx.putImageData(imgData, 0, 0)
  return outCanvas
}
