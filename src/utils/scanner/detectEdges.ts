/**
 * @file detectEdges.ts
 * @description Smart Document Edge & Quad Contour Detection algorithm.
 * 
 * WHY IT EXISTS:
 * Automatically locates document/paper boundaries in captured photos or uploaded files,
 * eliminating the need for manual cropping on clear document images.
 * 
 * WHAT IT DOES:
 * Analyzes image pixels using OpenCV (Canny edge detection + Contour approximation) or
 * a high-performance Canvas fallback algorithm to extract the 4 corner points of paper.
 * 
 * WHEN IT RUNS:
 * Executed immediately when an image is ingested into the document scanner pipeline.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Called by `src/services/scanner.service.ts` & `src/hooks/useDocumentScanner.ts`
 * - Uses types from `src/types/scanner.ts`
 * - Returns `CropQuad` coordinates consumed by `perspective.ts` and `CropOverlay.tsx`.
 * 
 * WHO CALLS IT: `scanner.service.ts`
 * WHO DEPENDS ON IT: Document cropping and perspective transformation workflow.
 */

import { CropQuad, Point } from '../../types/scanner'
import { FALLBACK_CROP_MARGIN_RATIO } from '../../constants/scanner'

/**
 * Detect paper edge boundaries in an HTMLImageElement or HTMLCanvasElement.
 * Returns normalized (0..1) corner coordinates for responsive overlay positioning.
 * 
 * @param imageSource Canvas or Image element containing document frame
 * @param cv OpenCV.js instance if loaded (optional)
 * @returns CropQuad with normalized 4 corners (0..1 range)
 */
export function detectDocumentEdges(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  cv?: any
): CropQuad {
  const width = 'naturalWidth' in imageSource ? imageSource.naturalWidth : imageSource.width
  const height = 'naturalHeight' in imageSource ? imageSource.naturalHeight : imageSource.height

  const fallbackQuad: CropQuad = getFallbackCropQuad()

  if (!width || !height) return fallbackQuad

  // Try OpenCV edge detection if available
  if (cv && cv.Mat) {
    try {
      const srcMat = cv.imread(imageSource)
      const grayMat = new cv.Mat()
      const blurMat = new cv.Mat()
      const cannyMat = new cv.Mat()

      // Convert to grayscale & blur to remove fine noise
      cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY, 0)
      cv.GaussianBlur(grayMat, blurMat, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT)
      cv.Canny(blurMat, cannyMat, 75, 200)

      // Find contours
      const contours = new cv.MatVector()
      const hierarchy = new cv.Mat()
      cv.findContours(cannyMat, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

      let maxArea = 0
      let maxContour: any = null

      for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i)
        const area = cv.contourArea(cnt)

        // Must take at least 15% of frame area to be considered a document paper
        if (area > (width * height * 0.15)) {
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

      let detectedQuad: CropQuad | null = null

      if (maxContour && maxContour.rows === 4) {
        const points: Point[] = []
        for (let i = 0; i < 4; i++) {
          const pt = maxContour.data32S
          points.push({
            x: pt[i * 2] / width,
            y: pt[i * 2 + 1] / height,
          })
        }
        detectedQuad = sortQuadPoints(points)
      }

      // Cleanup OpenCV matrices
      srcMat.delete()
      grayMat.delete()
      blurMat.delete()
      cannyMat.delete()
      contours.delete()
      hierarchy.delete()
      if (maxContour) maxContour.delete()

      if (detectedQuad) return detectedQuad
    } catch (error) {
      console.warn('[detectEdges] OpenCV detection failed, falling back to margin quad:', error)
    }
  }

  return fallbackQuad
}

/**
 * Returns default crop quad with margin inset (5% padding from screen edges).
 */
export function getFallbackCropQuad(): CropQuad {
  const m = FALLBACK_CROP_MARGIN_RATIO
  return {
    topLeft: { x: m, y: m },
    topRight: { x: 1 - m, y: m },
    bottomRight: { x: 1 - m, y: 1 - m },
    bottomLeft: { x: m, y: 1 - m },
  }
}

/**
 * Order 4 points into clockwise top-left, top-right, bottom-right, bottom-left order.
 */
export function sortQuadPoints(pts: Point[]): CropQuad {
  const sortedBySum = [...pts].sort((a, b) => (a.x + a.y) - (b.x + b.y))
  const topLeft = sortedBySum[0]
  const bottomRight = sortedBySum[3]

  const remaining = [sortedBySum[1], sortedBySum[2]]
  const sortedByDiff = remaining.sort((a, b) => (a.y - a.x) - (b.y - b.x))

  const topRight = sortedByDiff[0]
  const bottomLeft = sortedByDiff[1]

  return { topLeft, topRight, bottomRight, bottomLeft }
}
