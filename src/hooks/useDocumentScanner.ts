/**
 * @file useDocumentScanner.ts
 * @description Master React State Machine Hook for Document Scanner Session Management.
 * 
 * WHY IT EXISTS:
 * Serves as the central state store managing scanned document pages, selected active page, stage transitions,
 * paper crop coordinates, filter application, page reordering, rotation, deletion, and paper format settings.
 * 
 * WHAT IT DOES:
 * Holds array of `ScanPage`, orchestrates `scannerService` calls, updates crop quads & filters, and transitions
 * modal stages (`capture` -> `edit` -> `sorter` -> `pdf_preview`).
 * 
 * WHEN IT RUNS:
 * Active whenever the `DocumentScannerModal` is open.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `scanner.service.ts`
 * - Uses types from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx` & underlying components.
 * WHO DEPENDS ON IT: Entire interactive document scanning editing interface.
 */

import { useState, useCallback } from 'react'
import {
  ScanPage,
  CropQuad,
  ScanFilterMode,
  ScannerStage,
  PaperSize,
  PaperOrientation,
} from '../types/scanner'
import { scannerService } from '../services/scanner.service'
import { MAX_SCAN_PAGES, DEFAULT_PAPER_SIZE, DEFAULT_ORIENTATION } from '../constants/scanner'

export interface UseDocumentScannerReturn {
  stage: ScannerStage
  pages: ScanPage[]
  activePageIndex: number
  activePage: ScanPage | null
  paperSize: PaperSize
  orientation: PaperOrientation
  isProcessing: boolean
  error: string | null
  setStage: (stage: ScannerStage) => void
  setActivePageIndex: (index: number) => void
  setPaperSize: (size: PaperSize) => void
  setOrientation: (orientation: PaperOrientation) => void
  addImages: (imageSources: (File | string)[]) => Promise<void>
  updateCropQuad: (pageId: string, quad: CropQuad) => Promise<void>
  updateFilter: (pageId: string, filter: ScanFilterMode) => Promise<void>
  updateBrightnessContrast: (pageId: string, brightness: number, contrast: number) => Promise<void>
  rotatePage: (pageId: string, angleDelta?: number) => Promise<void>
  deletePage: (pageId: string) => void
  reorderPages: (fromIndex: number, toIndex: number) => void
  resetScanner: () => void
}

export function useDocumentScanner(initialStage: ScannerStage = 'capture'): UseDocumentScannerReturn {
  const [stage, setStage] = useState<ScannerStage>(initialStage)
  const [pages, setPages] = useState<ScanPage[]>([])
  const [activePageIndex, setActivePageIndex] = useState<number>(0)
  const [paperSize, setPaperSize] = useState<PaperSize>(DEFAULT_PAPER_SIZE)
  const [orientation, setOrientation] = useState<PaperOrientation>(DEFAULT_ORIENTATION)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const activePage = pages[activePageIndex] || null

  /**
   * Ingest array of image files or Data URLs into new ScanPage records.
   */
  const addImages = useCallback(async (imageSources: (File | string)[]) => {
    if (!imageSources || imageSources.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const newPages: ScanPage[] = []
      for (const src of imageSources) {
        if (pages.length + newPages.length >= MAX_SCAN_PAGES) break
        const scanPage = await scannerService.createScanPage(src)
        newPages.push(scanPage)
      }

      setPages((prev) => {
        const next = [...prev, ...newPages]
        return next
      })

      if (newPages.length > 0) {
        setActivePageIndex(pages.length) // Focus on newly added page
        setStage('edit')
      }
    } catch (err: any) {
      console.error('[useDocumentScanner] Error adding images:', err)
      setError(err.message || 'Failed to process document image')
    } finally {
      setIsProcessing(false)
    }
  }, [pages.length])

  /**
   * Update corner quad points for a page and re-render perspective transform.
   */
  const updateCropQuad = useCallback(async (pageId: string, quad: CropQuad) => {
    setIsProcessing(true)
    try {
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, cropQuad: quad } : p))
      )
      const target = pages.find((p) => p.id === pageId)
      if (target) {
        const updated = await scannerService.reprocessScanPage({ ...target, cropQuad: quad })
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)))
      }
    } catch (err: any) {
      console.error('[useDocumentScanner] Error updating crop quad:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [pages])

  /**
   * Apply filter mode to page.
   */
  const updateFilter = useCallback(async (pageId: string, filter: ScanFilterMode) => {
    setIsProcessing(true)
    try {
      const target = pages.find((p) => p.id === pageId)
      if (target) {
        const updated = await scannerService.reprocessScanPage({ ...target, filter })
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)))
      }
    } catch (err: any) {
      console.error('[useDocumentScanner] Error updating filter:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [pages])

  /**
   * Adjust brightness and contrast for a page.
   */
  const updateBrightnessContrast = useCallback(
    async (pageId: string, brightness: number, contrast: number) => {
      try {
        const target = pages.find((p) => p.id === pageId)
        if (target) {
          const updated = await scannerService.reprocessScanPage({ ...target, brightness, contrast })
          setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)))
        }
      } catch (err: any) {
        console.error('[useDocumentScanner] Error updating brightness/contrast:', err)
      }
    },
    [pages]
  )

  /**
   * Rotate page clockwise by angleDelta degrees (default 90°).
   */
  const rotatePage = useCallback(
    async (pageId: string, angleDelta = 90) => {
      try {
        setPages((prev) =>
          prev.map((p) => {
            if (p.id === pageId) {
              const newRot = (p.rotation + angleDelta) % 360
              return { ...p, rotation: newRot }
            }
            return p
          })
        )
      } catch (err: any) {
        console.error('[useDocumentScanner] Error rotating page:', err)
      }
    },
    []
  )

  /**
   * Delete a page by ID.
   */
  const deletePage = useCallback(
    (pageId: string) => {
      setPages((prev) => {
        const next = prev.filter((p) => p.id !== pageId)
        if (next.length === 0) {
          setStage('capture')
          setActivePageIndex(0)
        } else if (activePageIndex >= next.length) {
          setActivePageIndex(next.length - 1)
        }
        return next
      })
    },
    [activePageIndex]
  )

  /**
   * Reorder page items in list.
   */
  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev
      }
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
    setActivePageIndex(toIndex)
  }, [])

  /**
   * Reset scanner session state.
   */
  const resetScanner = useCallback(() => {
    setPages([])
    setActivePageIndex(0)
    setStage(initialStage)
    setError(null)
    setIsProcessing(false)
  }, [initialStage])

  return {
    stage,
    pages,
    activePageIndex,
    activePage,
    paperSize,
    orientation,
    isProcessing,
    error,
    setStage,
    setActivePageIndex,
    setPaperSize,
    setOrientation,
    addImages,
    updateCropQuad,
    updateFilter,
    updateBrightnessContrast,
    rotatePage,
    deletePage,
    reorderPages,
    resetScanner,
  }
}
