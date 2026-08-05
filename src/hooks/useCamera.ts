/**
 * @file useCamera.ts
 * @description React hook for Web MediaDevices Stream Camera Capture & Capacitor Native Camera integration.
 * 
 * WHY IT EXISTS:
 * Encapsulates camera stream initialization, photo frame capture, device switching, video track teardown,
 * and Capacitor Camera API (@capacitor/camera) fallback for native mobile apps.
 * 
 * WHAT IT DOES:
 * Controls `<video>` element media streams on web browsers, captures image frames onto a canvas,
 * and calls native Capacitor camera pickers on mobile devices.
 * 
 * WHEN IT RUNS:
 * Executed when user selects "Open Camera" stage inside the document scanner dialog.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Used by `CameraScanner.tsx`
 * - Integrates with `@capacitor/camera` & `@capacitor/core`
 * 
 * WHO CALLS IT: `CameraScanner.tsx`
 * WHO DEPENDS ON IT: Camera document capture feature.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isStreaming: boolean
  isCapacitor: boolean
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  capturePhoto: () => Promise<string | null>
  captureCapacitorPhoto: () => Promise<string | null>
  switchCamera: () => Promise<void>
  facingMode: 'user' | 'environment'
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const isCapacitor = Capacitor.isNativePlatform()

  /**
   * Stop all active camera tracks and release stream resources.
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }, [])

  /**
   * Start web media stream camera.
   */
  const startCamera = useCallback(async () => {
    if (isCapacitor) return // Mobile uses native Capacitor plugin

    stopCamera()
    setError(null)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported on this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err: any) {
      console.error('[useCamera] Error accessing camera stream:', err)
      setError(err.message || 'Permission denied or camera unavailable')
      setIsStreaming(false)
    }
  }, [facingMode, isCapacitor, stopCamera])

  /**
   * Capture single photo frame from active web video stream onto canvas.
   */
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

  /**
   * Trigger Capacitor Camera plugin for native mobile document capture.
   */
  const captureCapacitorPhoto = useCallback(async (): Promise<string | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      })
      return image.dataUrl || null
    } catch (err: any) {
      console.warn('[useCamera] Capacitor camera cancelled or failed:', err)
      return null
    }
  }, [])

  /**
   * Switch between front (user) and rear (environment) cameras.
   */
  const switchCamera = useCallback(async () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  // Auto restart stream when facingMode changes
  useEffect(() => {
    if (isStreaming && !isCapacitor) {
      startCamera()
    }
  }, [facingMode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
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
    facingMode,
  }
}
