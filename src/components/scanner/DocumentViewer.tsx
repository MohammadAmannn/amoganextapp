/**
 * @file DocumentViewer.tsx
 * @description Inspection & Paginated Preview Component for Scanned Document Pages.
 * 
 * WHY IT EXISTS:
 * Renders high-fidelity paginated view of scanned output document pages.
 * 
 * WHAT IT DOES:
 * Displays single or multi-page document images in full resolution with page controls and zoom inspect.
 * 
 * WHEN IT RUNS:
 * Embedded in document detail panels or preview stages.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `ScanPage` from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: Document inspection containers.
 * WHO DEPENDS ON IT: Scanned document viewer UI.
 */

import React, { useState } from 'react'
import { ScanPage } from '../../types/scanner'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface DocumentViewerProps {
  pages: ScanPage[]
  initialPageIndex?: number
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  pages,
  initialPageIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialPageIndex)
  const [zoom, setZoom] = useState(1.0)

  if (!pages || pages.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
        No document pages to display
      </div>
    )
  }

  const currentPage = pages[currentIndex] || pages[0]

  return (
    <div className='flex flex-col items-center gap-3 rounded-xl border bg-card p-3 shadow-xs'>
      {/* Top Controls Bar */}
      <div className='flex w-full items-center justify-between border-b pb-2 text-xs font-semibold text-muted-foreground'>
        <div className='flex items-center gap-1'>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-7 w-7 p-0'
            disabled={currentIndex <= 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span>
            Page {currentIndex + 1} of {pages.length}
          </span>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-7 w-7 p-0'
            disabled={currentIndex >= pages.length - 1}
            onClick={() => setCurrentIndex((prev) => Math.min(pages.length - 1, prev + 1))}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-7 w-7 p-0'
            disabled={zoom <= 0.6}
            onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
          >
            <ZoomOut className='h-3.5 w-3.5' />
          </Button>
          <span className='font-mono text-[11px]'>{Math.round(zoom * 100)}%</span>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-7 w-7 p-0'
            disabled={zoom >= 2.5}
            onClick={() => setZoom((prev) => Math.min(3.0, prev + 0.2))}
          >
            <ZoomIn className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* Main Image Viewer */}
      <div className='relative flex h-[50vh] min-h-[300px] w-full items-center justify-center overflow-auto rounded-lg bg-black/80 p-2'>
        <img
          src={currentPage.processedUrl || currentPage.originalUrl}
          alt={`Page ${currentIndex + 1}`}
          className='max-h-full max-w-full rounded object-contain transition-transform duration-150'
          style={{
            transform: `scale(${zoom}) rotate(${currentPage.rotation}deg)`,
          }}
        />
      </div>
    </div>
  )
}
