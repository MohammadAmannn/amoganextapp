import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Crosshair,
} from 'lucide-react'
import { useState, useCallback } from 'react'

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onFullscreen: () => void
  onCurrentLocation: () => void
  isFullscreen?: boolean
  isLocating?: boolean
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onFullscreen,
  onCurrentLocation,
  isFullscreen = false,
  isLocating = false,
}: MapControlsProps) {
  const [isLocationLoading, setIsLocationLoading] = useState(false)

  const handleLocationClick = useCallback(async () => {
    setIsLocationLoading(true)
    await onCurrentLocation()
    setIsLocationLoading(false)
  }, [onCurrentLocation])

  const controls = [
    {
      icon: ZoomIn,
      label: 'Zoom In',
      onClick: onZoomIn,
      disabled: false,
    },
    {
      icon: ZoomOut,
      label: 'Zoom Out',
      onClick: onZoomOut,
      disabled: false,
    },
    {
      icon: RotateCcw,
      label: 'Reset View',
      onClick: onResetView,
      disabled: false,
    },
    {
      icon: isFullscreen ? Minimize : Maximize,
      label: isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
      onClick: onFullscreen,
      disabled: false,
    },
    {
      icon: Crosshair,
      label: 'Current Location',
      onClick: handleLocationClick,
      disabled: isLocating || isLocationLoading,
    },
  ]

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
      {controls.map((control, index) => {
        const Icon = control.icon
        const isLocationControl = index === controls.length - 1
        const isLoading = isLocationControl && (isLocating || isLocationLoading)

        return (
          <Button
            key={index}
            variant="secondary"
            size="icon"
            className={`
              h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-200
              bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80
              hover:bg-background/95 hover:scale-105
              ${isLoading ? 'animate-pulse' : ''}
            `}
            onClick={control.onClick}
            disabled={control.disabled || isLoading}
            aria-label={control.label}
            title={control.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
}