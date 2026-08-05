/**
 * @file useSupabaseUpload.ts
 * @description React hook for uploading compiled PDF files to Supabase Storage via `/api/upload`.
 * 
 * WHY IT EXISTS:
 * Encapsulates upload progress, loading states, and error handling when sending scanned documents.
 * 
 * WHAT IT DOES:
 * Calls `scannerUploadService.uploadScannedPdf()` and provides simple status indicators.
 * 
 * WHEN IT RUNS:
 * Executed when user confirms Send inside `DocumentScannerModal.tsx`.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `upload.service.ts`
 * - Uses types from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx`
 * WHO DEPENDS ON IT: Scanned Document dispatch pipeline.
 */

import { useState, useCallback } from 'react'
import { ScannedPdfResult } from '../types/scanner'
import { scannerUploadService } from '../services/upload.service'

export interface UseSupabaseUploadReturn {
  isUploading: boolean
  error: string | null
  uploadPdf: (pdfFile: File, pageCount: number) => Promise<ScannedPdfResult | null>
}

export function useSupabaseUpload(): UseSupabaseUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPdf = useCallback(
    async (pdfFile: File, pageCount: number): Promise<ScannedPdfResult | null> => {
      setIsUploading(true)
      setError(null)

      try {
        const result = await scannerUploadService.uploadScannedPdf(pdfFile, pageCount)
        return result
      } catch (err: any) {
        console.error('[useSupabaseUpload] Upload error:', err)
        setError(err.message || 'Failed to upload scanned PDF')
        return null
      } finally {
        setIsUploading(false)
      }
    },
    []
  )

  return {
    isUploading,
    error,
    uploadPdf,
  }
}
