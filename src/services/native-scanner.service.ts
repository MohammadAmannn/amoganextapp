/**
 * @file native-scanner.service.ts
 * @description Native Capacitor Document Scanner Service wrapping @capgo/capacitor-document-scanner.
 * 
 * WHY IT EXISTS:
 * Enables mobile devices to scan physical documents on a table using native ML Kit / VisionKit camera AI.
 * 
 * WHAT IT DOES:
 * - Invokes `DocumentScanner.scanDocument()` on native Capacitor platforms (iOS/Android).
 * - Receives scanned document images auto-detected, cropped, and enhanced by native camera AI.
 * - Compiles scanned pages into PDF format using `createPdfFromScanPages`.
 * - Uploads the scanned PDF via `uploadScannedPdf` and returns `ScannedPdfResult`.
 */

import { DocumentScanner, ResponseType, ScannerMode, ScanDocumentResponseStatus } from '@capgo/capacitor-document-scanner'
import { Capacitor } from '@capacitor/core'
import { createPdfFromScanPages } from '../features/chattemplate/scanner/pdf'
import { scannerUploadService } from './upload.service'
import { ScanPage, ScannedPdfResult } from '../types/scanner'

class NativeScannerService {
  /**
   * Check if running on a native platform (iOS / Android).
   */
  public isNative(): boolean {
    return Capacitor.isNativePlatform()
  }

  /**
   * Check if native DocumentScanner plugin is available on current native runtime build.
   */
  public isPluginAvailable(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('DocumentScanner')
  }

  /**
   * Launch native camera document scanner.
   * 
   * User places document on table -> device camera auto-detects edges, crops, enhances,
   * and returns compiled ScannedPdfResult.
   * 
   * @returns ScannedPdfResult or null if cancelled / non-native fallback
   */
  public async scanWithNativeCamera(): Promise<ScannedPdfResult | null> {
    if (!Capacitor.isNativePlatform()) {
      return null
    }

    try {
      const response = await DocumentScanner.scanDocument({
        responseType: ResponseType.Base64,
        letUserAdjustCrop: true,
        reviewCapturedDocument: true,
        croppedImageQuality: 100,
        scannerMode: ScannerMode.Full,
        maxNumDocuments: 24,
      })

      if (response.status === ScanDocumentResponseStatus.Cancel || !response.scannedImages || response.scannedImages.length === 0) {
        return null
      }

      const scanPages: ScanPage[] = []

      for (let i = 0; i < response.scannedImages.length; i++) {
        const raw = response.scannedImages[i]
        const dataUrl = raw.startsWith('data:') ? raw : `data:image/jpeg;base64,${raw}`

        scanPages.push({
          id: `native_${Date.now()}_${i}`,
          originalUrl: dataUrl,
          processedUrl: dataUrl,
          cropQuad: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 1, y: 0 },
            bottomRight: { x: 1, y: 1 },
            bottomLeft: { x: 0, y: 1 },
          },
          filter: 'enhanced',
          rotation: 0,
          brightness: 0,
          contrast: 0,
          width: 1200,
          height: 1600,
          timestamp: Date.now(),
        })
      }

      // Compile scanned images into PDF document
      const pdfBuffer = await createPdfFromScanPages(scanPages)
      const fileName = `Scanned_Doc_${Date.now()}.pdf`
      const pdfFile = new File([pdfBuffer.buffer as ArrayBuffer], fileName, { type: 'application/pdf' })

      // Upload to storage bucket
      const uploadResult = await scannerUploadService.uploadScannedPdf(pdfFile, scanPages.length)
      return uploadResult
    } catch (err: any) {
      console.error('[NativeScannerService] Scan error:', err)
      throw err
    }
  }
}

export const nativeScannerService = new NativeScannerService()
