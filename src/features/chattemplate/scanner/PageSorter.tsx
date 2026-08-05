/**
 * @file PageSorter.tsx
 * @description Page Thumbnail Strip & Reordering Controls.
 */

import React from 'react'
import { ScanPage } from './types'
import { Plus, ChevronLeft, ChevronRight, Trash2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PageSorterProps {
  pages: ScanPage[]
  activePageIndex: number
  onSelectPage: (index: number) => void
  onReorderPages: (fromIndex: number, toIndex: number) => void
  onDeletePage: (pageId: string) => void
  onRotatePage: (pageId: string) => void
  onAddPage: () => void
}

export const PageSorter: React.FC<PageSorterProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onReorderPages,
  onDeletePage,
  onRotatePage,
  onAddPage,
}) => {
  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-card/60 p-2.5 backdrop-blur-xs'>
      <div className='flex items-center justify-between text-xs font-semibold text-muted-foreground px-1'>
        <span>Pages ({pages.length})</span>
        <div className='flex items-center gap-1'>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-6 px-1.5 text-xs'
            disabled={activePageIndex <= 0}
            onClick={() => onReorderPages(activePageIndex, activePageIndex - 1)}
          >
            <ChevronLeft className='mr-0.5 h-3.5 w-3.5' /> Left
          </Button>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-6 px-1.5 text-xs'
            disabled={activePageIndex >= pages.length - 1}
            onClick={() => onReorderPages(activePageIndex, activePageIndex + 1)}
          >
            Right <ChevronRight className='ml-0.5 h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      <div className='flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin'>
        {pages.map((page, idx) => (
          <div
            key={page.id}
            onClick={() => onSelectPage(idx)}
            className={`group relative flex flex-col items-center cursor-pointer rounded-lg border-2 p-1 transition-all ${
              idx === activePageIndex
                ? 'border-primary bg-primary/5 shadow-md scale-105 z-10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className='relative h-24 w-18 overflow-hidden rounded bg-muted/30'>
              <img
                src={page.processedUrl || page.originalUrl}
                alt={`Page ${idx + 1}`}
                className='h-full w-full object-contain transition-transform'
                style={{ transform: `rotate(${page.rotation}deg)` }}
              />
              <div className='absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    onRotatePage(page.id)
                  }}
                  className='rounded-full bg-background/80 p-1 text-foreground hover:bg-background'
                >
                  <RotateCw className='h-3.5 w-3.5' />
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeletePage(page.id)
                  }}
                  className='rounded-full bg-destructive/80 p-1 text-white hover:bg-destructive'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </button>
              </div>
            </div>
            <span className='mt-1 text-[11px] font-medium text-muted-foreground'>
              Page {idx + 1}
            </span>
          </div>
        ))}

        <button
          type='button'
          onClick={onAddPage}
          className='flex h-24 w-18 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition-all shrink-0'
        >
          <Plus className='h-5 w-5' />
          <span className='text-[10px] font-medium'>Add Page</span>
        </button>
      </div>
    </div>
  )
}
