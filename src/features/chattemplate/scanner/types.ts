/**
 * @file types.ts
 * @description Master Types & Constants for Document Scanner & PDF System.
 */

export interface Point {
  x: number
  y: number
}

export interface CropQuad {
  topLeft: Point
  topRight: Point
  bottomRight: Point
  bottomLeft: Point
}

export type ScanFilterMode =
  | 'enhanced'
  | 'magic_color'
  | 'bw'
  | 'grayscale'
  | 'warm'
  | 'cool'
  | 'original'

export type PaperOrientation = 'portrait' | 'landscape'
export type PaperSize = 'a4' | 'original'
export type ScannerStage = 'capture' | 'edit' | 'sorter' | 'pdf_preview'

export interface ScanPage {
  id: string
  originalUrl: string
  processedUrl: string
  cropQuad: CropQuad
  filter: ScanFilterMode
  rotation: number
  brightness: number
  contrast: number
  width: number
  height: number
  timestamp: number
}

export interface PdfGenerationOptions {
  filename?: string
  paperSize?: PaperSize
  orientation?: PaperOrientation
  quality?: number
}

export interface ScannedPdfResult {
  publicUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  storagePath: string
  pageCount: number
}

export interface DocumentScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (result: ScannedPdfResult) => void
  initialMode?: 'upload' | 'camera'
}

/** Official OpenCV CDN script URL */
export const OPENCV_CDN_URL = 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.9.0-release.3/dist/opencv.js'
export const MAX_SCAN_PAGES = 30
export const DEFAULT_JPEG_QUALITY = 0.85
export const FALLBACK_CROP_MARGIN_RATIO = 0.05

export const SCAN_FILTERS: { id: ScanFilterMode; label: string; description: string }[] = [
  { id: 'enhanced', label: 'Auto Enhance', description: 'Contrast & shadow removal' },
  { id: 'magic_color', label: 'Magic Color', description: 'Vivid paper text enhancement' },
  { id: 'bw', label: 'B&W Doc', description: 'High contrast black & white text' },
  { id: 'grayscale', label: 'Grayscale', description: 'Smooth 8-bit grayscale' },
  { id: 'warm', label: 'Warm Paper', description: 'Removes cool phone shadows' },
  { id: 'cool', label: 'Cool White', description: 'Clean white paper background' },
  { id: 'original', label: 'Original', description: 'Unfiltered original photo' },
]
