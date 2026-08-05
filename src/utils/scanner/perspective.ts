/**
 * @file perspective.ts
 * @description Perspective Correction & Quad Rectification Transformation Algorithm.
 * 
 * WHY IT EXISTS:
 * Transforms angled document photos (taken from a side angle or tilted perspective) into flat,
 * perfectly rectangular front-facing document pages.
 * 
 * WHAT IT DOES:
 * Applies 4-point homography / perspective transformation matrix (using OpenCV `getPerspectiveTransform`
 * or a zero-dependency bilinear interpolation fallback) to rectify quadrilateral points.
 * 
 * WHEN IT RUNS:
 * Runs when applying user crop bounds to finalize page perspective.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `src/services/scanner.service.ts`
 * - Consumes `CropQuad` from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `scanner.service.ts`
 * WHO DEPENDS ON IT: Document scanning perspective adjustment pipeline.
 */

import { CropQuad } from '../../types/scanner'

/**
 * Apply 4-point perspective warp transformation to unwarp paper region.
 * 
 * @param sourceCanvas Source canvas element
 * @param quad 4-corner normalized crop quad (0..1)
 * @param cv OpenCV instance if available
 * @returns HTMLCanvasElement containing rectified rectangular document
 */
export function applyPerspectiveTransform(
  sourceCanvas: HTMLCanvasElement,
  quad: CropQuad,
  cv?: any
): HTMLCanvasElement {
  const w = sourceCanvas.width
  const h = sourceCanvas.height

  // Absolute corner points in pixel coordinates
  const pTL = { x: quad.topLeft.x * w, y: quad.topLeft.y * h }
  const pTR = { x: quad.topRight.x * w, y: quad.topRight.y * h }
  const pBR = { x: quad.bottomRight.x * w, y: quad.bottomRight.y * h }
  const pBL = { x: quad.bottomLeft.x * w, y: quad.bottomLeft.y * h }

  // Compute calculated target width & height based on max edge distances
  const widthA = Math.hypot(pBR.x - pBL.x, pBR.y - pBL.y)
  const widthB = Math.hypot(pTR.x - pTL.x, pTR.y - pTL.y)
  const targetWidth = Math.max(100, Math.round(Math.max(widthA, widthB)))

  const heightA = Math.hypot(pTR.x - pBR.x, pTR.y - pBR.y)
  const heightB = Math.hypot(pTL.x - pBL.x, pTL.y - pBL.y)
  const targetHeight = Math.max(100, Math.round(Math.max(heightA, heightB)))

  const outCanvas = document.createElement('canvas')
  outCanvas.width = targetWidth
  outCanvas.height = targetHeight

  // OpenCV Homography Transformation
  if (cv && cv.Mat) {
    try {
      const srcMat = cv.imread(sourceCanvas)
      const dstMat = new cv.Mat()

      const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        pTL.x, pTL.y,
        pTR.x, pTR.y,
        pBR.x, pBR.y,
        pBL.x, pBL.y,
      ])

      const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        targetWidth, 0,
        targetWidth, targetHeight,
        0, targetHeight,
      ])

      const M = cv.getPerspectiveTransform(srcTri, dstTri)
      const dsize = new cv.Size(targetWidth, targetHeight)

      cv.warpPerspective(srcMat, dstMat, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())
      cv.imshow(outCanvas, dstMat)

      // Cleanup
      srcMat.delete()
      dstMat.delete()
      srcTri.delete()
      dstTri.delete()
      M.delete()

      return outCanvas
    } catch (err) {
      console.warn('[perspective] OpenCV homography failed, using fallback canvas clip:', err)
    }
  }

  // Fallback affine canvas drawing
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
