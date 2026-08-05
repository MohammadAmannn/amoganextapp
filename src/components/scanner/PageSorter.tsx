/**
 * @file PageSorter.tsx
 * @description Horizontal Multi-Page Thumbnail Strip & Reordering Control Bar.
 * 
 * WHY IT EXISTS:
 * Enables reordering, adding, switching between, and deleting pages in multi-page document scans.
 * 
 * WHAT IT DOES:
 * Renders scrollable thumbnail strip with move left / move right controls and an "Add Page" trigger.
 * 
 * WHEN IT RUNS:
 * Displayed in the document scanner modal during `edit` and `sorter` stages.
 * 
 * HOW IT CONNECTS WITH OTHER FILES:
 * - Uses `PageThumbnail.tsx`
 * - Uses `ScanPage` from `src/types/scanner.ts`
 * 
 * WHO CALLS IT: `DocumentScannerModal.tsx`
 * WHO DEPENDS ON IT: Multi-page document reordering and pagination UI.
 */

import React from 'react'
import { ScanPage } from '../../types/scanner'
import { PageThumbnail } from './PageThumbnail'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className='flex flex-col gap-2 rounded-xl border bg-card/60 p-2.5 backdrop-blur-sm'>
      {/* Sorter Header & Reorder Controls */}
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
            title='Move Active Page Left'
          >
            <ChevronLeft className='mr-0.5 h-3.5 w-3.5' /> Move Left
          </Button>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-6 px-1.5 text-xs'
            disabled={activePageIndex >= pages.length - 1}
            onClick={() => onReorderPages(activePageIndex, activePageIndex + 1)}
            title='Move Active Page Right'
          >
            Move Right <ChevronRight className='ml-0.5 h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* Horizontal Scrollable Thumbnail List */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin'>
        {pages.map((page, idx) => (
          <PageThumbnail
            key={page.id}
            page={page}
            index={idx}
            isActive={idx === activePageIndex}
            onClick={() => onSelectPage(idx)}
            onDelete={() => onDeletePage(page.id)}
            onRotate={() => onRotatePage(page.id)}
          />
        ))}

        {/* Add Page Button */}
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
