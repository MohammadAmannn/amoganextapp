/**
 * @file CameraScanner.tsx
 * @description Camera Capture Viewport supporting Web MediaDevices & Capacitor Native Camera.
 * 
 * WHY IT EXISTS:
 * Provides real-time camera viewfinder, shutter capture button, camera flip, and mobile Capacitor camera triggering.
 * 
 * WHAT IT DOES:
 * Connects to `useCamera` hook, renders `<video>` element, triggers shutter captures, and ingests photos into scanner pipeline.
 * 
 * WHEN IT RUNS:
 * Active during `capture` stage when "Open Camera" is selected.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `useCamera.ts`
 * - Communicates captured image Data URL to `DocumentScannerModal.tsx`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx`
 * WHO DEPENDS ON IT: Camera document scanning UI.
 */

import React, { useEffect } from 'react'
import { useCamera } from '../../hooks/useCamera'
import { Camera, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CameraScannerProps {
  onCapture: (imageDataUrl: string) => void
  onCancel: () => void
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onCancel }) => {
  const {
    videoRef,
    isStreaming,
    isCapacitor,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    captureCapacitorPhoto,
    switchCamera,
  } = useCamera()

  useEffect(() => {
    if (!isCapacitor) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isCapacitor])

  const handleShutterClick = async () => {
    if (isCapacitor) {
      const dataUrl = await captureCapacitorPhoto()
      if (dataUrl) onCapture(dataUrl)
    } else {
      const dataUrl = await capturePhoto()
      if (dataUrl) onCapture(dataUrl)
    }
  }

  return (
    <div className='relative flex h-[60vh] min-h-[350px] w-full flex-col items-center justify-between rounded-xl bg-black p-4 text-white overflow-hidden'>
      {/* Header Bar */}
      <div className='z-10 flex w-full items-center justify-between'>
        <Button
          type='button'
          size='sm'
          variant='ghost'
          className='text-white hover:bg-white/20'
          onClick={onCancel}
        >
          <ArrowLeft className='mr-1.5 h-4 w-4' /> Back
        </Button>
        <span className='text-xs font-semibold uppercase tracking-wider text-white/80'>
          Document Camera
        </span>
        {!isCapacitor && isStreaming && (
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='text-white hover:bg-white/20'
            onClick={switchCamera}
            title='Switch Camera'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Video Viewfinder / Error State */}
      <div className='relative flex h-full w-full items-center justify-center overflow-hidden my-2'>
        {error ? (
          <div className='flex flex-col items-center justify-center p-6 text-center text-rose-400'>
            <AlertTriangle className='mb-2 h-10 w-10' />
            <p className='text-sm font-medium'>{error}</p>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='mt-4 text-white border-white/40 hover:bg-white/10'
              onClick={() => startCamera()}
            >
              Retry Camera
            </Button>
          </div>
        ) : isCapacitor ? (
          <div className='flex flex-col items-center justify-center p-6 text-center text-white/80'>
            <Camera className='mb-3 h-12 w-12 text-primary animate-pulse' />
            <p className='text-sm font-medium'>Tap button below to launch Native Camera</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className='h-full w-full object-cover rounded-lg'
          />
        )}
      </div>

      {/* Footer Controls & Shutter Button */}
      <div className='z-10 flex w-full items-center justify-center pb-2'>
        <button
          type='button'
          onClick={handleShutterClick}
          className='flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary p-1 shadow-2xl transition-transform active:scale-90 hover:scale-105'
          title='Capture Document Photo'
        >
          <div className='h-full w-full rounded-full border-2 border-white/80 bg-primary' />
        </button>
      </div>
    </div>
  )
}
