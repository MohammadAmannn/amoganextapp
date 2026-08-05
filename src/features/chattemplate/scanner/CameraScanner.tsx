/**
 * @file CameraScanner.tsx
 * @description Enterprise Document Camera Viewfinder with Real-Time OpenCV AI Paper Contour Detection, 2-Second Hold-Still Auto Timer & Native Plugin Safety.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useCamera, useOpenCV } from './hooks'
import { detectRealDocumentContour } from './opencv'
import { CropQuad } from './types'
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Layers,
  CheckCircle2,
  ScanLine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { nativeScannerService } from '@/services/native-scanner.service'
import { toast } from 'sonner'

export interface CameraScannerProps {
  onCapture: (imageDataUrl: string) => void
  onCancel: () => void
  scannedCount?: number
  onViewPages?: () => void
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCapture,
  onCancel,
  scannedCount = 0,
  onViewPages,
}) => {
  const {
    videoRef,
    isStreaming,
    isCapacitor,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  } = useCamera()

  const { isReady: isOpenCVReady } = useOpenCV(true)

  // Real-time edge detection & auto capture state
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [detectedQuad, setDetectedQuad] = useState<CropQuad | null>(null)
  const [isAutoCapture, setIsAutoCapture] = useState<boolean>(true)
  const [stabilityScore, setStabilityScore] = useState<number>(0)
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false)
  const [isNativeScanning, setIsNativeScanning] = useState<boolean>(false)

  const prevQuadRef = useRef<CropQuad | null>(null)
  const autoCaptureLockRef = useRef<boolean>(false)

  const TARGET_STABILITY_THRESHOLD = 18 // ~2.0 seconds of continuous stability check

  // Start web camera stream
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  // Real-time Frame Analysis Loop with OpenCV AI Paper Detection
  useEffect(() => {
    if (!isStreaming || !videoRef.current) return

    let isMounted = true
    let animationFrameId: number

    const analyzeFrame = () => {
      if (!isMounted || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animationFrameId = requestAnimationFrame(analyzeFrame)
        return
      }

      const video = videoRef.current
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        if (!hiddenCanvasRef.current) {
          hiddenCanvasRef.current = document.createElement('canvas')
        }

        const canvas = hiddenCanvasRef.current
        const targetW = 480
        const targetH = Math.round((video.videoHeight / video.videoWidth) * targetW) || 360

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, targetW, targetH)
          const cv = (window as any).cv
          const realQuad = detectRealDocumentContour(canvas, cv)

          if (realQuad) {
            setDetectedQuad(realQuad)

            // Stability check for Auto-Capture with calibrated 2-second delay
            if (isAutoCapture && !autoCaptureLockRef.current) {
              const prev = prevQuadRef.current
              if (prev) {
                const delta =
                  Math.abs(realQuad.topLeft.x - prev.topLeft.x) +
                  Math.abs(realQuad.topLeft.y - prev.topLeft.y) +
                  Math.abs(realQuad.topRight.x - prev.topRight.x) +
                  Math.abs(realQuad.topRight.y - prev.topRight.y)

                if (delta < 0.06) {
                  setStabilityScore((s) => {
                    const next = s + 1
                    if (next >= TARGET_STABILITY_THRESHOLD) {
                      autoCaptureLockRef.current = true
                      triggerCapture()
                      return 0
                    }
                    return next
                  })
                } else {
                  setStabilityScore(0)
                }
              }
              prevQuadRef.current = realQuad
            }
          } else {
            setDetectedQuad(null)
            setStabilityScore(0)
            prevQuadRef.current = null
          }
        }
      }

      animationFrameId = requestAnimationFrame(analyzeFrame)
    }

    animationFrameId = requestAnimationFrame(analyzeFrame)

    return () => {
      isMounted = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [isStreaming, isAutoCapture])

  // Trigger photo capture with visual shutter flash & 3s cooldown delay
  const triggerCapture = useCallback(async () => {
    setIsFlashActive(true)
    setTimeout(() => setIsFlashActive(false), 250)

    try {
      const dataUrl = await capturePhoto()
      if (dataUrl) {
        onCapture(dataUrl)
        toast.success('Page captured!')
      }
    } catch (err) {
      console.error('[CameraScanner] Capture error:', err)
    } finally {
      // 3.0s cooldown lock after capture before next auto-capture is allowed
      setTimeout(() => {
        autoCaptureLockRef.current = false
        setStabilityScore(0)
      }, 3000)
    }
  }, [capturePhoto, onCapture])

  const handleNativeMLKitScan = async () => {
    setIsNativeScanning(true)
    try {
      if (!nativeScannerService.isPluginAvailable()) {
        toast.info('Native OS scanner plugin is not implemented on this build. Using live AI camera.')
        return
      }
      const result = await nativeScannerService.scanWithNativeCamera()
      if (result) {
        toast.success('Document scan complete!')
      }
    } catch (err: any) {
      console.warn('[CameraScanner] Native scan error:', err)
      toast.info('Native scanner unavailable. Using live AI camera.')
    } finally {
      setIsNativeScanning(false)
    }
  }

  const svgPoints = detectedQuad
    ? `${detectedQuad.topLeft.x * 100},${detectedQuad.topLeft.y * 100} ` +
      `${detectedQuad.topRight.x * 100},${detectedQuad.topRight.y * 100} ` +
      `${detectedQuad.bottomRight.x * 100},${detectedQuad.bottomRight.y * 100} ` +
      `${detectedQuad.bottomLeft.x * 100},${detectedQuad.bottomLeft.y * 100}`
    : ''

  // Calculated 2-second countdown value
  const remainingSeconds = Math.max(1, Math.ceil((TARGET_STABILITY_THRESHOLD - stabilityScore) / 9))

  return (
    <div className='relative flex h-full w-full min-h-[480px] flex-1 flex-col items-center justify-between bg-zinc-950 text-foreground overflow-hidden select-none'>
      {/* Visual Shutter Flash */}
      {isFlashActive && (
        <div className='absolute inset-0 z-50 bg-white/90 animate-pulse pointer-events-none' />
      )}

      {/* Floating Top Header Bar */}
      <div className='absolute top-3 left-3 right-3 z-30 flex items-center justify-between rounded-xl bg-card/85 backdrop-blur-md px-3.5 py-2 border shadow-sm'>
        <Button
          type='button'
          size='sm'
          variant='ghost'
          className='h-8 px-2.5 text-xs font-medium'
          onClick={onCancel}
        >
          <ArrowLeft className='mr-1.5 h-4 w-4' /> Back
        </Button>

        {/* Document Detection Status Pill */}
        <div className='flex items-center gap-2'>
          {detectedQuad ? (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20'>
              <CheckCircle2 className='h-3.5 w-3.5' /> AI Document Detected
            </span>
          ) : (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground border border-border'>
              <ScanLine className='h-3.5 w-3.5 animate-spin' /> Align Document
            </span>
          )}

          {isOpenCVReady && (
            <span className='hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary'>
              <Sparkles className='h-3 w-3' /> OpenCV AI
            </span>
          )}
        </div>

        <div className='flex items-center gap-1'>
          {!isCapacitor && isStreaming && (
            <Button
              type='button'
              size='sm'
              variant='ghost'
              className='h-8 w-8 p-0 rounded-full'
              onClick={switchCamera}
              title='Switch Camera'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Main Video Viewfinder & Quad Overlay */}
      <div className='relative flex h-full w-full flex-1 items-center justify-center overflow-hidden bg-black'>
        {error ? (
          <div className='flex flex-col items-center justify-center p-6 text-center text-destructive max-w-sm'>
            <AlertTriangle className='mb-3 h-12 w-12' />
            <p className='text-sm font-semibold text-foreground mb-1'>Camera Permission Required</p>
            <p className='text-xs text-muted-foreground mb-4'>{error}</p>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => startCamera()}
            >
              Retry Camera
            </Button>
          </div>
        ) : (
          <div
            className='relative h-full w-full flex items-center justify-center overflow-hidden cursor-pointer'
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {})
              }
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              controls={false}
              className='h-full w-full object-cover pointer-events-none'
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {})
                }
              }}
            />

            {/* Real OpenCV AI Quad Contour Overlay */}
            {detectedQuad ? (
              <svg
                className='absolute inset-0 h-full w-full z-20 pointer-events-none'
                viewBox='0 0 100 100'
                preserveAspectRatio='none'
              >
                <polygon
                  points={svgPoints}
                  fill='rgba(59, 130, 246, 0.18)'
                  stroke='#3b82f6'
                  strokeWidth='2'
                  vectorEffect='non-scaling-stroke'
                  className='transition-all duration-100'
                />
                <circle cx={detectedQuad.topLeft.x * 100} cy={detectedQuad.topLeft.y * 100} r='1.5' fill='#3b82f6' stroke='#ffffff' strokeWidth='0.5' />
                <circle cx={detectedQuad.topRight.x * 100} cy={detectedQuad.topRight.y * 100} r='1.5' fill='#3b82f6' stroke='#ffffff' strokeWidth='0.5' />
                <circle cx={detectedQuad.bottomRight.x * 100} cy={detectedQuad.bottomRight.y * 100} r='1.5' fill='#3b82f6' stroke='#ffffff' strokeWidth='0.5' />
                <circle cx={detectedQuad.bottomLeft.x * 100} cy={detectedQuad.bottomLeft.y * 100} r='1.5' fill='#3b82f6' stroke='#ffffff' strokeWidth='0.5' />
              </svg>
            ) : (
              /* Fallback Guide Frame when searching for paper */
              <div className='absolute inset-10 sm:inset-16 pointer-events-none rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-between p-6 transition-opacity duration-300'>
                <div className='flex justify-between w-full'>
                  <div className='h-5 w-5 border-t-2 border-l-2 border-primary' />
                  <div className='h-5 w-5 border-t-2 border-r-2 border-primary' />
                </div>
                <div className='rounded-full bg-card/85 backdrop-blur-md px-3.5 py-1 text-xs font-medium text-foreground border shadow-sm'>
                  Position document flat inside frame
                </div>
                <div className='flex justify-between w-full'>
                  <div className='h-5 w-5 border-b-2 border-l-2 border-primary' />
                  <div className='h-5 w-5 border-b-2 border-r-2 border-primary' />
                </div>
              </div>
            )}

            {/* 2-Second Hold Still Countdown Timer (Adobe Style) */}
            {isAutoCapture && detectedQuad && (
              <div className='absolute top-20 z-30 flex flex-col items-center gap-1.5 bg-card/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 shadow-lg animate-fade-in'>
                <span className='text-xs font-semibold text-primary tracking-wide flex items-center gap-1.5'>
                  <span className='h-2 w-2 rounded-full bg-primary animate-ping' />
                  {stabilityScore > 0
                    ? `Hold Still... Capturing in ${remainingSeconds}s`
                    : 'Document Detected - Hold Still'}
                </span>
                <div className='h-1.5 w-32 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary transition-all duration-150 ease-out'
                    style={{ width: `${Math.min(100, (stabilityScore / TARGET_STABILITY_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Controls */}
      <div className='z-30 flex w-full flex-col items-center gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-6 pt-4 px-4'>
        {/* Native Capacitor ML Kit Document Scanner Button (Only shown if native plugin is available) */}
        {nativeScannerService.isPluginAvailable() && (
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='mb-1 gap-2 border-primary/30 text-xs font-semibold rounded-full px-4'
            onClick={handleNativeMLKitScan}
            disabled={isNativeScanning}
          >
            <Sparkles className='h-3.5 w-3.5 text-primary' />
            <span>Launch Native ML Kit Scanner</span>
          </Button>
        )}

        {/* Clean Auto / Manual Mode Selector */}
        <div className='flex items-center rounded-full bg-card/90 p-1 border shadow-xs'>
          <button
            type='button'
            onClick={() => setIsAutoCapture(true)}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              isAutoCapture
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AUTO
          </button>
          <button
            type='button'
            onClick={() => setIsAutoCapture(false)}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              !isAutoCapture
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            MANUAL
          </button>
        </div>

        {/* Bottom Shutter & Pages Bar */}
        <div className='flex w-full items-center justify-between px-6 max-w-md'>
          {/* Scanned Pages Thumbnail Badge (Bottom Left) */}
          {scannedCount > 0 ? (
            <button
              type='button'
              onClick={onViewPages}
              className='group relative flex items-center gap-2 rounded-xl bg-card/80 p-1.5 border hover:bg-card transition-all'
              title='View Scanned Pages'
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs group-hover:scale-105 transition-transform'>
                <Layers className='h-5 w-5' />
              </div>
              <span className='pr-2 text-xs font-bold text-foreground'>
                {scannedCount} {scannedCount === 1 ? 'Page' : 'Pages'}
              </span>
            </button>
          ) : (
            <div className='w-16' />
          )}

          {/* Clean Primary Shutter Capture Button */}
          <button
            type='button'
            onClick={triggerCapture}
            className='relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary p-1 shadow-lg transition-transform active:scale-90 hover:scale-105 ring-4 ring-primary/20'
          >
            <div className='h-full w-full rounded-full bg-primary flex items-center justify-center'>
              <Camera className='h-6 w-6 text-primary-foreground' />
            </div>
          </button>

          {/* Right Action Button */}
          <div className='w-16 flex justify-end'>
            {scannedCount > 0 && (
              <Button
                type='button'
                size='sm'
                className='font-bold text-xs rounded-lg px-3 shadow-xs'
                onClick={onViewPages}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
