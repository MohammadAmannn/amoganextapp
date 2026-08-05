/**
 * @file hooks.ts
 * @description Consolidated React Hooks for Document Scanner, Camera Capture, PDF Preview & Uploads.
 * 
 * WHY IT EXISTS:
 * Groups all scanner React state hooks into one clean module for easy maintenance.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import {
  ScanPage,
  CropQuad,
  ScanFilterMode,
  ScannerStage,
  PaperSize,
  PaperOrientation,
  PdfGenerationOptions,
  ScannedPdfResult,
  MAX_SCAN_PAGES,
} from './types'
import { opencvService, detectDocumentEdges, applyPerspectiveTransform, applyEnhancementFilter } from './opencv'
import { createPdfFromScanPages, uploadScannedPdf } from './pdf'

export function useOpenCV(enabled = false) {
  const [isReady, setIsReady] = useState<boolean>(opencvService.isReady())
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
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
        if (mounted) {
          setIsReady(!!cv)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [enabled])

  return { isReady, isLoading }
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const isCapacitor = Capacitor.isNativePlatform()

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setIsStreaming(false)
  }, [])

  const startCamera = useCallback(async () => {
    stopCamera()
    setError(null)
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API unavailable')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('webkit-playsinline', 'true')
        videoRef.current.muted = true
        try {
          await videoRef.current.play()
        } catch (e) {
          console.warn('[useCamera] Play error:', e)
        }
        setIsStreaming(true)
      }
    } catch (err: any) {
      console.warn('[useCamera] getUserMedia error:', err)
      setError(err.message || 'Camera permission denied or camera not available')
      setIsStreaming(false)
    }
  }, [facingMode, stopCamera])

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !isStreaming) return null
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [isStreaming])

  const captureCapacitorPhoto = useCallback(async (): Promise<string | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      })
      return image.dataUrl || null
    } catch (e) {
      return null
    }
  }, [])

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  return {
    videoRef,
    isStreaming,
    isCapacitor,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    captureCapacitorPhoto,
    switchCamera,
  }
}

export function usePDF() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const clearPdf = useCallback(() => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
    setPdfFile(null)
  }, [pdfUrl])

  const generatePdf = useCallback(
    async (pages: ScanPage[], filename = 'scanned_doc.pdf', options: PdfGenerationOptions = {}) => {
      if (!pages || pages.length === 0) return
      setIsGenerating(true)
      try {
        const buffer = await createPdfFromScanPages(pages, options)
        const file = new File([buffer.buffer as ArrayBuffer], filename.endsWith('.pdf') ? filename : `${filename}.pdf`, { type: 'application/pdf' })
        const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        if (pdfUrl) URL.revokeObjectURL(pdfUrl)
        setPdfFile(file)
        setPdfUrl(url)
      } catch (e) {
        console.error('[usePDF] PDF generation failed:', e)
      } finally {
        setIsGenerating(false)
      }
    },
    [pdfUrl]
  )

  return { pdfUrl, pdfFile, isGenerating, generatePdf, clearPdf }
}

export function useSupabaseUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const uploadPdf = useCallback(async (pdfFile: File, pageCount: number): Promise<ScannedPdfResult | null> => {
    setIsUploading(true)
    try {
      return await uploadScannedPdf(pdfFile, pageCount)
    } catch (e) {
      console.error('[useSupabaseUpload] Upload failed:', e)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { isUploading, uploadPdf }
}

export function useDocumentScanner(initialStage: ScannerStage = 'capture') {
  const [stage, setStage] = useState<ScannerStage>(initialStage)
  const [pages, setPages] = useState<ScanPage[]>([])
  const [activePageIndex, setActivePageIndex] = useState<number>(0)
  const [paperSize, setPaperSize] = useState<PaperSize>('a4')
  const [orientation, setOrientation] = useState<PaperOrientation>('portrait')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const activePage = pages[activePageIndex] || null

  const addImages = useCallback(
    async (imageSources: (File | string)[]) => {
      if (!imageSources.length) return
      setIsProcessing(true)
      await new Promise((res) => setTimeout(res, 20))
      try {
        const newPages: ScanPage[] = []
        for (const src of imageSources) {
          if (pages.length + newPages.length >= MAX_SCAN_PAGES) break
          const dataUrl = typeof src === 'string' ? src : await fileToDataUrl(src)
          const img = await loadImage(dataUrl)
          const cv = opencvService.isReady() ? (window as any).cv : undefined
          const quad = detectDocumentEdges(img, cv)

          const baseCanvas = imageToCanvas(img)
          const unwarped = applyPerspectiveTransform(baseCanvas, quad, cv)
          const enhanced = applyEnhancementFilter(unwarped, 'enhanced', 0, 0, cv)

          newPages.push({
            id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            originalUrl: dataUrl,
            processedUrl: enhanced.toDataURL('image/jpeg', 0.88),
            cropQuad: quad,
            filter: 'enhanced',
            rotation: 0,
            brightness: 0,
            contrast: 0,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            timestamp: Date.now(),
          })
        }

        setPages((prev) => [...prev, ...newPages])
        if (newPages.length > 0) {
          setActivePageIndex(pages.length)
          setStage('edit')
        }
      } catch (e) {
        console.error('[useDocumentScanner] Error processing images:', e)
      } finally {
        setIsProcessing(false)
      }
    },
    [pages.length]
  )

  const updateCropQuad = useCallback(async (pageId: string, quad: CropQuad) => {
    setIsProcessing(true)
    await new Promise((res) => setTimeout(res, 20))
    try {
      const target = pages.find((p) => p.id === pageId)
      if (target) {
        const updated = await reprocessPage({ ...target, cropQuad: quad })
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)))
      }
    } finally {
      setIsProcessing(false)
    }
  }, [pages])

  const updateFilter = useCallback(async (pageId: string, filter: ScanFilterMode) => {
    setIsProcessing(true)
    await new Promise((res) => setTimeout(res, 20))
    try {
      const target = pages.find((p) => p.id === pageId)
      if (target) {
        const updated = await reprocessPage({ ...target, filter })
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)))
      }
    } finally {
      setIsProcessing(false)
    }
  }, [pages])

  const updateBrightnessContrast = useCallback(async (pageId: string, brightness: number, contrast: number) => {
    const target = pages.find((p) => p.id === pageId)
    if (target) {
      const updated = await reprocessPage({ ...target, brightness, contrast })
      setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)))
    }
  }, [pages])

  const rotatePage = useCallback((pageId: string, delta = 90) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, rotation: (p.rotation + delta) % 360 } : p))
    )
  }, [])

  const deletePage = useCallback((pageId: string) => {
    setPages((prev) => {
      const next = prev.filter((p) => p.id !== pageId)
      if (next.length === 0) setStage('capture')
      return next
    })
  }, [])

  const reorderPages = useCallback((from: number, to: number) => {
    setPages((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(from, 1)
      copy.splice(to, 0, item)
      return copy
    })
    setActivePageIndex(to)
  }, [])

  const resetScanner = useCallback(() => {
    setPages([])
    setActivePageIndex(0)
    setStage(initialStage)
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

async function reprocessPage(page: ScanPage): Promise<ScanPage> {
  const img = await loadImage(page.originalUrl)
  const cv = opencvService.isReady() ? (window as any).cv : undefined
  const baseCanvas = imageToCanvas(img)
  const unwarped = applyPerspectiveTransform(baseCanvas, page.cropQuad, cv)
  const enhanced = applyEnhancementFilter(unwarped, page.filter, page.brightness, page.contrast, cv)

  return {
    ...page,
    processedUrl: enhanced.toDataURL('image/jpeg', 0.88),
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result as string)
    reader.onerror = (e) => rej(e)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = (e) => rej(e)
    img.src = src
  })
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const maxDim = 2048
  let w = img.naturalWidth || img.width
  let h = img.naturalHeight || img.height

  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w)
      w = maxDim
    } else {
      w = Math.round((w * maxDim) / h)
      h = maxDim
    }
  }

  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.drawImage(img, 0, 0, w, h)
  return canvas
}
