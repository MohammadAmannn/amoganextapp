import React from 'react'
import { Search, X, Mail, Upload, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CategoryFilterType, SectionMode } from '../../types/message.types'

interface SidebarSearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  isCollapsed?: boolean
  categoryFilter: CategoryFilterType
  sectionMode: SectionMode
  onComposeChange?: (composing: boolean) => void
  onUploadFileClick?: () => void
}

export function SidebarSearchBar({
  searchQuery,
  setSearchQuery,
  isCollapsed = false,
  categoryFilter,
  sectionMode,
  onComposeChange,
  onUploadFileClick,
}: SidebarSearchBarProps) {
  if (isCollapsed) {
    return (
      <div className='flex justify-center w-full'>
        {(categoryFilter === 'mail' || (!categoryFilter && sectionMode === 'mail')) && (
          <button
            type='button'
            onClick={() => onComposeChange?.(true)}
            className='flex items-center justify-center p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
            title='Compose New Email'
          >
            <Mail className='h-3.5 w-3.5' />
          </button>
        )}
        {categoryFilter === 'vouchers' && (
          <button
            type='button'
            onClick={() => onUploadFileClick?.()}
            className='flex items-center justify-center p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
            title='Upload New File'
          >
            <Upload className='h-3.5 w-3.5' />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className='flex items-center gap-1.5 w-full'>
      <div className='relative min-w-0 flex-1'>
        <Search className='absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60' />
        <Input
          placeholder='Search...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='h-8 w-full rounded-md border-border bg-muted/10 pr-7 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-ring'
        />
        {searchQuery && (
          <button
            type='button'
            onClick={() => setSearchQuery('')}
            className='absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer'
          >
            <X className='h-3 w-3' />
          </button>
        )}
      </div>

      {/* Mail Section: New Compose Email Button */}
      {(categoryFilter === 'mail' || (!categoryFilter && sectionMode === 'mail')) && (
        <button
          type='button'
          onClick={() => onComposeChange?.(true)}
          className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
          title='Compose New Email'
        >
          <Mail className='h-3.5 w-3.5' />
          <span>New</span>
          <Plus className='h-3 w-3' />
        </button>
      )}

      {/* File Section: Upload File Button */}
      {categoryFilter === 'vouchers' && (
        <button
          type='button'
          onClick={() => onUploadFileClick?.()}
          className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
          title='Upload New File'
        >
          <Upload className='h-3.5 w-3.5' />
          <span>Upload</span>
          <Plus className='h-3 w-3' />
        </button>
      )}
    </div>
  )
}
