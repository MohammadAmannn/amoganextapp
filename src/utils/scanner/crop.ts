/**
 * @file crop.ts
 * @description Image cropping and boundary extraction utility.
 * 
 * WHY IT EXISTS:
 * Crops raw document images according to specific quad coordinates before perspective correction.
 * 
 * WHAT IT DOES:
 * Extracts sub-region image bounding rects and renders cropped portions onto HTML5 Canvases.
 * 
 * WHEN IT RUNS:
 * Runs when user adjusts crop corners or during automated scanner pipeline execution.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `src/services/scanner.service.ts`
 * - Interacts with `CropQuad` from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `scanner.service.ts`
 * WHO DEPENDS ON IT: Image cropping & perspective processing pipeline.
 */

import { CropQuad } from '../../types/scanner'

/**
 * Crop image canvas to bounding box defined by quad points.
 * 
 * @param canvas Source Canvas element containing document photo
 * @param quad Crop Quad normalized points (0..1)
 * @returns New HTMLCanvasElement containing cropped region
 */
export function cropCanvasToQuad(
  canvas: HTMLCanvasElement,
  quad: CropQuad
): HTMLCanvasElement {
  const w = canvas.width
  const h = canvas.height

  const minX = Math.max(0, Math.min(quad.topLeft.x, quad.bottomLeft.x) * w)
  const maxX = Math.min(w, Math.max(quad.topRight.x, quad.bottomRight.x) * w)
  const minY = Math.max(0, Math.min(quad.topLeft.y, quad.topRight.y) * h)
  const maxY = Math.min(h, Math.max(quad.bottomLeft.y, quad.bottomRight.y) * h)

  const cropW = Math.max(1, maxX - minX)
  const cropH = Math.max(1, maxY - minY)

  const outCanvas = document.createElement('canvas')
  outCanvas.width = cropW
  outCanvas.height = cropH

  const ctx = outCanvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH)
  }

  return outCanvas
}
