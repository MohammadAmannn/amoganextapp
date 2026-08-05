/**
 * @file CropOverlay.tsx
 * @description 4-Corner Draggable Quad Overlay for Manual Paper Boundary Adjustment.
 */

import React, { useState, useRef, useCallback } from 'react'
import { CropQuad, Point } from './types'

export interface CropOverlayProps {
  quad: CropQuad
  onChange: (updatedQuad: CropQuad) => void
  disabled?: boolean
}

type CornerKey = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'

export const CropOverlay: React.FC<CropOverlayProps> = ({ quad, onChange, disabled }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggingCorner, setDraggingCorner] = useState<CornerKey | null>(null)
  const [localQuad, setLocalQuad] = useState<CropQuad>(quad)

  // Keep localQuad synced with prop when not actively dragging
  React.useEffect(() => {
    if (!draggingCorner) {
      setLocalQuad(quad)
    }
  }, [quad, draggingCorner])

  const handlePointerDown = (corner: CornerKey, e: React.PointerEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch (err) {}
    setDraggingCorner(corner)
  }

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingCorner || !containerRef.current || disabled) return
      const rect = containerRef.current.getBoundingClientRect()
      const rawX = (e.clientX - rect.left) / rect.width
      const rawY = (e.clientY - rect.top) / rect.height

      const clampedX = Math.max(0, Math.min(1, rawX))
      const clampedY = Math.max(0, Math.min(1, rawY))

      setLocalQuad((prev) => ({
        ...prev,
        [draggingCorner]: { x: clampedX, y: clampedY },
      }))
    },
    [draggingCorner, disabled]
  )

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingCorner) {
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch (err) {}
      setDraggingCorner(null)
      onChange(localQuad)
    }
  }

  const pointsString =
    `${localQuad.topLeft.x * 100},${localQuad.topLeft.y * 100} ` +
    `${localQuad.topRight.x * 100},${localQuad.topRight.y * 100} ` +
    `${localQuad.bottomRight.x * 100},${localQuad.bottomRight.y * 100} ` +
    `${localQuad.bottomLeft.x * 100},${localQuad.bottomLeft.y * 100}`

  const handles: { key: CornerKey; pt: Point }[] = [
    { key: 'topLeft', pt: localQuad.topLeft },
    { key: 'topRight', pt: localQuad.topRight },
    { key: 'bottomRight', pt: localQuad.bottomRight },
    { key: 'bottomLeft', pt: localQuad.bottomLeft },
  ]

  return (
    <div
      ref={containerRef}
      className='absolute inset-0 z-20 touch-none select-none'
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg className='h-full w-full pointer-events-none' viewBox='0 0 100 100' preserveAspectRatio='none'>
        <polygon
          points={pointsString}
          fill='rgba(59, 130, 246, 0.15)'
          stroke='#3b82f6'
          strokeWidth='2.5'
          vectorEffect='non-scaling-stroke'
          strokeDasharray='4 2'
        />
      </svg>

      {handles.map(({ key, pt }) => (
        <div
          key={key}
          onPointerDown={(e) => handlePointerDown(key, e)}
          style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%` }}
          className={`absolute z-30 h-8 w-8 sm:h-7 sm:w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-primary shadow-lg transition-transform active:cursor-grabbing active:scale-125 ${
            draggingCorner === key ? 'scale-125 ring-4 ring-primary/40' : ''
          }`}
        >
          <div className='h-full w-full rounded-full bg-primary/80' />
        </div>
      ))}
    </div>
  )
}
