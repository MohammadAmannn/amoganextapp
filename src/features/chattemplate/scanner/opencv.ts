/**
 * @file opencv.ts
 * @description OpenCV.js Loader, Edge Detection, Homography Unwarping & Enhancement Engine.
 * 
 * WHY IT EXISTS:
 * Consolidates all image computer vision algorithms (edge detection, 4-corner homography transform,
 * contrast enhancement, and WASM memory disposal) into a single clean module.
 */

import { CropQuad, Point, ScanFilterMode, OPENCV_CDN_URL, FALLBACK_CROP_MARGIN_RATIO } from './types'

class OpenCVService {
  private static instance: OpenCVService
  private isLoaded = false
  private loadPromise: Promise<any> | null = null

  public static getInstance(): OpenCVService {
    if (!OpenCVService.instance) {
      OpenCVService.instance = new OpenCVService()
    }
    return OpenCVService.instance
  }

  public isReady(): boolean {
    return this.isLoaded && typeof window !== 'undefined' && !!(window as any).cv
  }

  public loadOpenCV(): Promise<any> {
    console.log('[OpenCV] OpenCV script load disabled to ensure main-thread responsiveness. Falling back to native Canvas engine.')
    return Promise.resolve(null)
  }
}

export const opencvService = OpenCVService.getInstance()

export function getFallbackCropQuad(): CropQuad {
  const m = FALLBACK_CROP_MARGIN_RATIO
  return {
    topLeft: { x: m, y: m },
    topRight: { x: 1 - m, y: m },
    bottomRight: { x: 1 - m, y: 1 - m },
    bottomLeft: { x: m, y: 1 - m },
  }
}

export function sortQuadPoints(pts: Point[]): CropQuad {
  const sortedSum = [...pts].sort((a, b) => (a.x + a.y) - (b.x + b.y))
  const topLeft = sortedSum[0]
  const bottomRight = sortedSum[3]
  const rem = [sortedSum[1], sortedSum[2]].sort((a, b) => (a.y - a.x) - (b.y - b.x))
  return { topLeft, topRight: rem[0], bottomRight, bottomLeft: rem[1] }
}

export function detectRealDocumentContour(imageSource: HTMLImageElement | HTMLCanvasElement, cv?: any): CropQuad | null {
  const width = 'naturalWidth' in imageSource ? imageSource.naturalWidth : imageSource.width
  const height = 'naturalHeight' in imageSource ? imageSource.naturalHeight : imageSource.height

  if (!width || !height) return null

  if (cv && cv.Mat) {
    try {
      const src = cv.imread(imageSource)
      const gray = new cv.Mat()
      const blur = new cv.Mat()
      const canny = new cv.Mat()

      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)
      cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT)
      cv.Canny(blur, canny, 50, 150)

      const contours = new cv.MatVector()
      const hierarchy = new cv.Mat()
      cv.findContours(canny, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

      let maxArea = 0
      let maxContour: any = null

      for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i)
        const area = cv.contourArea(cnt)
        if (area > width * height * 0.10) {
          const peri = cv.arcLength(cnt, true)
          const approx = new cv.Mat()
          cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
          if (approx.rows === 4 && area > maxArea) {
            maxArea = area
            if (maxContour) maxContour.delete()
            maxContour = approx
          } else {
            approx.delete()
          }
        }
        cnt.delete()
      }

      let detected: CropQuad | null = null
      if (maxContour && maxContour.rows === 4) {
        const pts: Point[] = []
        const data = maxContour.data32S
        for (let i = 0; i < 4; i++) {
          pts.push({ x: data[i * 2] / width, y: data[i * 2 + 1] / height })
        }
        detected = sortQuadPoints(pts)
      }

      src.delete()
      gray.delete()
      blur.delete()
      canny.delete()
      contours.delete()
      hierarchy.delete()
      if (maxContour) maxContour.delete()

      if (detected) return detected
    } catch (e) {
      console.warn('[opencv] Real edge detection error:', e)
    }
  }

  return null
}

export function detectDocumentEdges(imageSource: HTMLImageElement | HTMLCanvasElement, cv?: any): CropQuad {
  const realQuad = detectRealDocumentContour(imageSource, cv)
  if (realQuad) return realQuad
  return getFallbackCropQuad()
}

export function applyPerspectiveTransform(sourceCanvas: HTMLCanvasElement, quad: CropQuad, cv?: any): HTMLCanvasElement {
  const w = sourceCanvas.width
  const h = sourceCanvas.height

  const pTL = { x: quad.topLeft.x * w, y: quad.topLeft.y * h }
  const pTR = { x: quad.topRight.x * w, y: quad.topRight.y * h }
  const pBR = { x: quad.bottomRight.x * w, y: quad.bottomRight.y * h }
  const pBL = { x: quad.bottomLeft.x * w, y: quad.bottomLeft.y * h }

  const widthA = Math.hypot(pBR.x - pBL.x, pBR.y - pBL.y)
  const widthB = Math.hypot(pTR.x - pTL.x, pTR.y - pTL.y)
  const targetWidth = Math.max(100, Math.round(Math.max(widthA, widthB)))

  const heightA = Math.hypot(pTR.x - pBR.x, pTR.y - pBR.y)
  const heightB = Math.hypot(pTL.x - pBL.x, pTL.y - pBL.y)
  const targetHeight = Math.max(100, Math.round(Math.max(heightA, heightB)))

  const outCanvas = document.createElement('canvas')
  outCanvas.width = targetWidth
  outCanvas.height = targetHeight

  if (cv && cv.Mat) {
    try {
      const srcMat = cv.imread(sourceCanvas)
      const dstMat = new cv.Mat()
      const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [pTL.x, pTL.y, pTR.x, pTR.y, pBR.x, pBR.y, pBL.x, pBL.y])
      const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, targetWidth, 0, targetWidth, targetHeight, 0, targetHeight])
      const M = cv.getPerspectiveTransform(srcTri, dstTri)

      cv.warpPerspective(srcMat, dstMat, M, new cv.Size(targetWidth, targetHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())
      cv.imshow(outCanvas, dstMat)

      srcMat.delete()
      dstMat.delete()
      srcTri.delete()
      dstTri.delete()
      M.delete()
      return outCanvas
    } catch (e) {
      console.warn('[opencv] Perspective transform fallback:', e)
    }
  }

  const ctx = outCanvas.getContext('2d')
  if (ctx) {
    const minX = Math.min(pTL.x, pTR.x, pBR.x, pBL.x)
    const minY = Math.min(pTL.y, pTR.y, pBR.y, pBL.y)
    const cropW = Math.max(1, Math.max(pTL.x, pTR.x, pBR.x, pBL.x) - minX)
    const cropH = Math.max(1, Math.max(pTL.y, pTR.y, pBR.y, pBL.y) - minY)
    ctx.drawImage(sourceCanvas, minX, minY, cropW, cropH, 0, 0, targetWidth, targetHeight)
  }

  return outCanvas
}

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

  ctx.drawImage(canvas, 0, 0)

  if (cv && cv.Mat && filter !== 'original') {
    try {
      const srcMat = cv.imread(outCanvas)
      const dstMat = new cv.Mat()

      if (filter === 'grayscale') {
        cv.cvtColor(srcMat, dstMat, cv.COLOR_RGBA2GRAY, 0)
        cv.cvtColor(dstMat, dstMat, cv.COLOR_GRAY2RGBA, 0)
      } else if (filter === 'bw') {
        const grayMat = new cv.Mat()
        cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY, 0)
        cv.adaptiveThreshold(grayMat, grayMat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 10)
        cv.cvtColor(grayMat, dstMat, cv.COLOR_GRAY2RGBA, 0)
        grayMat.delete()
      } else if (filter === 'enhanced' || filter === 'magic_color') {
        const labMat = new cv.Mat()
        cv.cvtColor(srcMat, labMat, cv.COLOR_RGBA2RGB, 0)
        cv.cvtColor(labMat, labMat, cv.COLOR_RGB2Lab, 0)
        const channels = new cv.MatVector()
        cv.split(labMat, channels)
        const lChannel = channels.get(0)
        const clahe = new cv.CLAHE(filter === 'magic_color' ? 3.0 : 2.0, new cv.Size(8, 8))
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
      console.warn('[opencv] Enhancement fallback:', e)
    }
  }

  const imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height)
  const data = imgData.data
  const bFactor = brightness * 2.55
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    if (filter === 'grayscale') {
      const avg = 0.299 * r + 0.587 * g + 0.114 * b
      r = g = b = avg
    } else if (filter === 'bw') {
      const avg = 0.299 * r + 0.587 * g + 0.114 * b
      const bw = avg > 125 ? 255 : 0
      r = g = b = bw
    } else if (filter === 'enhanced') {
      r = Math.min(255, r * 1.08 + 8)
      g = Math.min(255, g * 1.08 + 8)
      b = Math.min(255, b * 1.08 + 8)
    } else if (filter === 'magic_color') {
      r = Math.min(255, Math.max(0, (r - 128) * 1.25 + 128 + 10))
      g = Math.min(255, Math.max(0, (g - 128) * 1.25 + 128 + 10))
      b = Math.min(255, Math.max(0, (b - 128) * 1.25 + 128 + 10))
    } else if (filter === 'warm') {
      r = Math.min(255, r * 1.1 + 12)
      g = Math.min(255, g * 1.05 + 6)
      b = Math.max(0, b * 0.95)
    } else if (filter === 'cool') {
      r = Math.max(0, r * 0.95)
      g = Math.min(255, g * 1.05 + 4)
      b = Math.min(255, b * 1.15 + 14)
    }

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
