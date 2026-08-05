/**
 * @file useCapacitorDocScanner.ts
 * @description React hook for trigger-and-scan Native Capacitor Document Scanner flow.
 * 
 * WHY IT EXISTS:
 * Connects UI attachment menu items directly to native device document camera scanning.
 * 
 * WHAT IT DOES:
 * - Invokes `nativeScannerService.scanWithNativeCamera()`.
 * - Handles loading state, toast notifications, and fallback for web/desktop environments.
 * - Passes `ScannedPdfResult` to completion handler to send as a chat document attachment.
 */

import { useState, useCallback } from 'react'
import { nativeScannerService } from '../services/native-scanner.service'
import { ScannedPdfResult } from '../types/scanner'
import { toast } from 'sonner'

export interface UseCapacitorDocScannerReturn {
  isScanning: boolean
  startDocScan: (
    onSuccess?: (result: ScannedPdfResult) => void,
    onFallbackWeb?: () => void
  ) => Promise<void>
}

export function useCapacitorDocScanner(): UseCapacitorDocScannerReturn {
  const [isScanning, setIsScanning] = useState(false)

  const startDocScan = useCallback(
    async (
      onSuccess?: (result: ScannedPdfResult) => void,
      onFallbackWeb?: () => void
    ) => {
      // Check if native Capacitor scanner plugin is available on current build
      if (!nativeScannerService.isPluginAvailable()) {
        if (onFallbackWeb) {
          onFallbackWeb()
        } else {
          toast.info('Opening document scanner...')
        }
        return
      }

      setIsScanning(true)
      try {
        const result = await nativeScannerService.scanWithNativeCamera()
        if (result) {
          toast.success('Document scanned successfully!')
          if (onSuccess) onSuccess(result)
        }
      } catch (err: any) {
        console.warn('[useCapacitorDocScanner] Native scan error, falling back to document scanner:', err)
        const isUnimplemented =
          err?.message?.toLowerCase()?.includes('not implemented') ||
          err?.code === 'UNIMPLEMENTED' ||
          err?.message?.toLowerCase()?.includes('unimplemented')

        if (isUnimplemented && onFallbackWeb) {
          onFallbackWeb()
        } else if (!isUnimplemented) {
          toast.error(err.message || 'Failed to scan document')
        }
      } finally {
        setIsScanning(false)
      }
    },
    []
  )

  return { isScanning, startDocScan }
}
