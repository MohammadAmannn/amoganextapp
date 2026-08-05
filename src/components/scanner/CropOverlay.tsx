/**
 * @file CropOverlay.tsx
 * @description Interactive 4-Corner Draggable Quad Handle Overlay for Manual Crop Adjustments.
 * 
 * WHY IT EXISTS:
 * Allows users to manually adjust document paper crop boundary points when automatic edge detection
 * needs refinement.
 * 
 * WHAT IT DOES:
 * Renders SVG overlay polygon lines with 4 interactive corner drag handles (topLeft, topRight, bottomRight, bottomLeft)
 * over the document image preview container. Supports mouse and touch drag gestures.
 * 
 * WHEN IT RUNS:
 * Active during the `edit` stage of document scanning when manual crop mode is enabled.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `CropQuad` & `Point` from `src/types/scanner.ts`
 * - Communicates corner updates back to `ScanPreview.tsx` & `useDocumentScanner.ts`
 * 
 * WHO CALLS IT: `ScanPreview.tsx`
 * WHO DEPENDS ON IT: Manual document boundary editing interface.
 */

import React, { useState, useRef, useCallback } from 'react'
import { CropQuad, Point } from '../../types/scanner'

export interface CropOverlayProps {
  quad: CropQuad
  onChange: (updatedQuad: CropQuad) => void
  disabled?: boolean
}

type CornerKey = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'

export const CropOverlay: React.FC<CropOverlayProps> = ({ quad, onChange, disabled }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggingCorner, setDraggingCorner] = useState<CornerKey | null>(null)

  const handlePointerDown = (corner: CornerKey, e: React.PointerEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDraggingCorner(corner)
  }

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingCorner || !containerRef.current || disabled) return
      const rect = containerRef.current.getBoundingClientRect()

      // Calculate normalized X, Y (0..1)
      const rawX = (e.clientX - rect.left) / rect.width
      const rawY = (e.clientY - rect.top) / rect.height

      const clampedX = Math.max(0, Math.min(1, rawX))
      const clampedY = Math.max(0, Math.min(1, rawY))

      onChange({
        ...quad,
        [draggingCorner]: { x: clampedX, y: clampedY },
      })
    },
    [draggingCorner, quad, onChange, disabled]
  )

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingCorner) {
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch (err) {
        // Ignore pointer capture errors
      }
      setDraggingCorner(null)
    }
  }

  // Polygon SVG point string
  const pointsString = `${quad.topLeft.x * 100},${quad.topLeft.y * 100} ` +
    `${quad.topRight.x * 100},${quad.topRight.y * 100} ` +
    `${quad.bottomRight.x * 100},${quad.bottomRight.y * 100} ` +
    `${quad.bottomLeft.x * 100},${quad.bottomLeft.y * 100}`

  const handles: { key: CornerKey; pt: Point }[] = [
    { key: 'topLeft', pt: quad.topLeft },
    { key: 'topRight', pt: quad.topRight },
    { key: 'bottomRight', pt: quad.bottomRight },
    { key: 'bottomLeft', pt: quad.bottomLeft },
  ]

  return (
    <div
      ref={containerRef}
      className='absolute inset-0 z-20 touch-none select-none'
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg className='h-full w-full pointer-events-none' viewBox='0 0 100 100' preserveAspectRatio='none'>
        {/* Semi-transparent outer mask */}
        <polygon
          points={pointsString}
          fill='rgba(59, 130, 246, 0.15)'
          stroke='#3b82f6'
          strokeWidth='2.5'
          vectorEffect='non-scaling-stroke'
          strokeDasharray='4 2'
        />
      </svg>

      {/* 4 Corner Drag Handles */}
      {handles.map(({ key, pt }) => (
        <div
          key={key}
          onPointerDown={(e) => handlePointerDown(key, e)}
          style={{
            left: `${pt.x * 100}%`,
            top: `${pt.y * 100}%`,
          }}
          className={`absolute z-30 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-primary shadow-lg transition-transform active:cursor-grabbing active:scale-125 ${
            draggingCorner === key ? 'scale-125 ring-4 ring-primary/40' : ''
          }`}
        >
          <div className='h-full w-full rounded-full bg-primary/80' />
        </div>
      ))}
    </div>
  )
}
