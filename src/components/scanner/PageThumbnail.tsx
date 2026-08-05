/**
 * @file PageThumbnail.tsx
 * @description Single Document Page Thumbnail Card with Action Badges.
 * 
 * WHY IT EXISTS:
 * Displays miniature page previews in the page sorter list, indicating page numbers, selection state, and quick action buttons.
 * 
 * WHAT IT DOES:
 * Renders thumbnail image, index badge (`Page 1`), active focus border, and quick delete/rotate icons.
 * 
 * WHEN IT RUNS:
 * Rendered within `PageSorter.tsx` bar.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `ScanPage` from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `PageSorter.tsx`
 * WHO DEPENDS ON IT: Multi-page thumbnail management.
 */

import React from 'react'
import { ScanPage } from '../../types/scanner'
import { Trash2, RotateCw } from 'lucide-react'

export interface PageThumbnailProps {
  page: ScanPage
  index: number
  isActive: boolean
  onClick: () => void
  onDelete?: () => void
  onRotate?: () => void
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  page,
  index,
  isActive,
  onClick,
  onDelete,
  onRotate,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col items-center cursor-pointer rounded-lg border-2 p-1 transition-all ${
        isActive
          ? 'border-primary bg-primary/5 shadow-md scale-105 z-10'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {/* Thumbnail Container */}
      <div className='relative h-24 w-18 overflow-hidden rounded bg-muted/30'>
        <img
          src={page.processedUrl || page.originalUrl}
          alt={`Page ${index + 1}`}
          className='h-full w-full object-contain transition-transform'
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />

        {/* Hover Quick Overlay Actions */}
        <div className='absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
          {onRotate && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                onRotate()
              }}
              className='rounded-full bg-background/80 p-1 text-foreground hover:bg-background'
              title='Rotate'
            >
              <RotateCw className='h-3.5 w-3.5' />
            </button>
          )}
          {onDelete && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className='rounded-full bg-destructive/80 p-1 text-white hover:bg-destructive'
              title='Delete Page'
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      {/* Page Index Label */}
      <span className='mt-1 text-[11px] font-medium text-muted-foreground'>
        Page {index + 1}
      </span>
    </div>
  )
}
