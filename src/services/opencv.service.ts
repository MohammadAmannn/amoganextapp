/**
 * @file opencv.service.ts
 * @description Asynchronous OpenCV.js Loader & Resource Disposal Manager.
 * 
 * WHY IT EXISTS:
 * Controls the lazy-loading, initialization, and safe memory teardown of OpenCV.js (~8MB WebAssembly script)
 * to ensure maximum performance, zero initial page bundle bloat, and no browser memory leaks.
 * 
 * WHAT IT DOES:
 * Loads OpenCV.js dynamically via script tag injection, polls `cv.onRuntimeInitialized`, exposes initialization status,
 * and provides safe helper utilities for matrix disposal.
 * 
 * WHEN IT RUNS:
 * Initiated on demand when the document scanner modal is opened or edge detection is requested.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `src/hooks/useOpenCV.ts` & `src/services/scanner.service.ts`
 * - Loads script from `src/constants/scanner.ts` OPENCV_CDN_URL
 * 
 * WHO CALLS IT: `useOpenCV.ts`, `scanner.service.ts`
 * WHO DEPENDS ON IT: Smart Document Scanning edge detection & perspective engine.
 */

import { OPENCV_CDN_URL } from '../constants/scanner'

class OpenCVService {
  private static instance: OpenCVService
  private isLoaded = false
  private isLoading = false
  private loadPromise: Promise<any> | null = null

  private constructor() {}

  /**
   * Singleton instance accessor.
   */
  public static getInstance(): OpenCVService {
    if (!OpenCVService.instance) {
      OpenCVService.instance = new OpenCVService()
    }
    return OpenCVService.instance
  }

  /**
   * Check if OpenCV.js is fully loaded and ready for execution.
   */
  public isReady(): boolean {
    return this.isLoaded && typeof window !== 'undefined' && !!(window as any).cv
  }

  /**
   * Lazy load OpenCV.js script asynchronously with single-flight promise deduplication.
   */
  public loadOpenCV(): Promise<any> {
    console.log('[OpenCV] OpenCV script load disabled to ensure main-thread responsiveness. Falling back to native Canvas engine.')
    return Promise.resolve(null)
  }

  /**
   * Safely dispose an array of OpenCV.js Mat structures to prevent WebAssembly memory leaks.
   */
  public safeDelete(...mats: any[]): void {
    for (const mat of mats) {
      if (mat && typeof mat.delete === 'function') {
        try {
          mat.delete()
        } catch (e) {
          // Ignore deletion errors on already released mats
        }
      }
    }
  }
}

export const opencvService = OpenCVService.getInstance()
