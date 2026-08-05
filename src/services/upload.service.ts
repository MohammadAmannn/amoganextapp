/**
 * @file upload.service.ts
 * @description Document & PDF Storage Upload Service.
 * 
 * WHY IT EXISTS:
 * Handles sending compiled scanned PDF documents to the `/api/upload` endpoint (which uploads directly to Supabase Storage bucket `chat-files` under the `scanned/` folder).
 * 
 * WHAT IT DOES:
 * Wraps multipart/form-data upload dispatch, handles network errors, and returns formatted `ScannedPdfResult` with public URLs and file details.
 * 
 * WHEN IT RUNS:
 * Executed ONLY when the user explicitly clicks the "Send" button in the scanner modal.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `useSupabaseUpload.ts` & `DocumentScannerModal.tsx`
 * - Integrates with project `/api/upload` Next.js route
 * - Returns `ScannedPdfResult` type from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `useSupabaseUpload.ts`
 * WHO DEPENDS ON IT: Chat document message attachment flow.
 */

import { ScannedPdfResult } from '../types/scanner'

class UploadService {
  /**
   * Upload scanned PDF file to Supabase Storage via `/api/upload` route.
   * 
   * @param pdfFile Compiled PDF File object
   * @param pageCount Total number of pages included in document
   * @returns ScannedPdfResult containing publicUrl, fileName, fileSize, mimeType, and storagePath
   */
  public async uploadScannedPdf(pdfFile: File, pageCount: number): Promise<ScannedPdfResult> {
    const formData = new FormData()
    formData.append('file', pdfFile)
    formData.append('folder', 'documents')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Upload failed (${response.status}): ${errText}`)
    }

    const data = await response.json()

    if (!data.success || !data.publicUrl) {
      throw new Error(data.error || 'Server did not return a valid public upload URL')
    }

    return {
      publicUrl: data.publicUrl,
      fileName: data.fileName || pdfFile.name,
      fileSize: data.fileSize || pdfFile.size,
      mimeType: 'application/pdf',
      storagePath: data.storagePath || `scanned/${pdfFile.name}`,
      pageCount,
    }
  }
}

export const scannerUploadService = new UploadService()
