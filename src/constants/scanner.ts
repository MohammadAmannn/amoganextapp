/**
 * @file scanner.ts
 * @description Master constants and defaults for Document Scanning & PDF processing.
 * 
 * WHY IT EXISTS:
 * Centralizes defaults, UI filter metadata, image compression presets, OpenCV CDN URLs,
 * max page limits, and A4 page dimensions to prevent magic numbers across the app.
 * 
 * WHAT IT DOES:
 * Provides ready-to-use configuration constants used by services, hooks, and components.
 * 
 * WHEN IT RUNS:
 * Imported at startup by scanner modules.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * Used by:
 * - `src/services/opencv.service.ts`
 * - `src/services/scanner.service.ts`
 * - `src/services/pdf.service.ts`
 * - `src/hooks/*`
 * - `src/components/scanner/*`
 * 
 * WHO CALLS IT: Scanner components and services.
 * WHO DEPENDS ON IT: Document scanner configuration pipeline.
 */

import { ScanFilterMode, PaperSize, PaperOrientation } from '../types/scanner'

/** OpenCV.js CDN script URL (fast jsDelivr build) */
export const OPENCV_CDN_URL = 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.9.0-release.3/dist/opencv.js'

/** Max number of pages allowed per document scan session */
export const MAX_SCAN_PAGES = 30

/** Target JPEG compression quality for PDF page embedding (0.1 to 1.0) */
export const DEFAULT_JPEG_QUALITY = 0.85

/** A4 Dimensions in points (1 pt = 1/72 inch) */
export const A4_WIDTH_PTS = 595.28
export const A4_HEIGHT_PTS = 841.89

/** Default paper size setting */
export const DEFAULT_PAPER_SIZE: PaperSize = 'a4'

/** Default paper orientation setting */
export const DEFAULT_ORIENTATION: PaperOrientation = 'portrait'

/** Filter metadata UI options */
export const SCAN_FILTERS: { id: ScanFilterMode; label: string; description: string }[] = [
  {
    id: 'enhanced',
    label: 'Auto Enhance',
    description: 'Boost contrast, sharpen document text, and remove background shadows',
  },
  {
    id: 'bw',
    label: 'Black & White',
    description: 'High contrast binary monochrome ideal for printed documents & receipts',
  },
  {
    id: 'grayscale',
    label: 'Grayscale',
    description: 'Clean 8-bit gray gradient preserving soft shading',
  },
  {
    id: 'original',
    label: 'Original',
    description: 'Unfiltered raw photo as captured',
  },
]

/** Default crop padding inset ratio when auto edge detection fails */
export const FALLBACK_CROP_MARGIN_RATIO = 0.05
