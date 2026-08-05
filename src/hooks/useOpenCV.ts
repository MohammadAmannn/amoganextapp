/**
 * @file useOpenCV.ts
 * @description React hook for OpenCV.js asynchronous lazy-loading and runtime state management.
 * 
 * WHY IT EXISTS:
 * Exposes OpenCV readiness, loading state, and error handling to React components.
 * 
 * WHAT IT DOES:
 * Triggers `opencvService.loadOpenCV()`, updates state when loaded, and provides clean status indicators.
 * 
 * WHEN IT RUNS:
 * Invoked when `DocumentScannerModal` or crop tools mount.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `opencv.service.ts`
 * 
 * WHO CALLS IT: Scanner UI components & `useDocumentScanner.ts`.
 * WHO DEPENDS ON IT: Document Scanning edge detection.
 */

import { useState, useEffect } from 'react'
import { opencvService } from '../services/opencv.service'

export interface UseOpenCVReturn {
  /** True when OpenCV WebAssembly engine is loaded and ready */
  isReady: boolean
  /** True while OpenCV script is downloading/initializing */
  isLoading: boolean
  /** Error message if OpenCV load failed */
  error: string | null
}

/**
 * Hook to monitor and load OpenCV.js engine asynchronously.
 */
export function useOpenCV(enabled = false): UseOpenCVReturn {
  const [isReady, setIsReady] = useState<boolean>(opencvService.isReady())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!enabled) return

    if (opencvService.isReady()) {
      setIsReady(true)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    opencvService
      .loadOpenCV()
      .then((cv) => {
        if (isMounted) {
          setIsReady(!!cv)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load OpenCV')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [enabled])

  return { isReady, isLoading, error }
}
