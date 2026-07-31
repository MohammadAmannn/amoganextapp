'use client'

import React from 'react'
import {
  Flag,
  AlertTriangle,
  FileText,
  MoreVertical,
  Reply,
  Forward,
  Archive,
  Share2,
  Printer,
  Download,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderActionsProps {
  onDelete?: () => void
  onDownload?: () => void
  onPrint?: () => void
  onShare?: () => void
}

export function HeaderActions({
  onDelete,
  onDownload,
  onPrint,
  onShare,
}: HeaderActionsProps) {
  return (
    <div className='flex items-center gap-1 sm:gap-2 shrink-0 select-none'>
      {/* Quick Action Icons */}
      <button
        type='button'
        onClick={() => toast.success('Flagged message')}
        className='p-1.5 rounded-lg hover:bg-muted text-red-500 transition-colors cursor-pointer'
        title='Flag'
      >
        <Flag className='h-4.5 w-4.5' />
      </button>

      <button
        type='button'
        onClick={() => toast.success('Action alert created')}
        className='p-1.5 rounded-lg hover:bg-muted text-amber-500 transition-colors cursor-pointer'
        title='Alert'
      >
        <AlertTriangle className='h-4.5 w-4.5' />
      </button>

      <button
        type='button'
        onClick={() => toast.info('Document options opened')}
        className='p-1.5 rounded-lg hover:bg-muted text-emerald-500 transition-colors cursor-pointer'
        title='Document'
      >
        <FileText className='h-4.5 w-4.5' />
      </button>

      {/* 3-Dot Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            title='More options'
          >
            <MoreVertical className='h-4.5 w-4.5' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-44 border border-border bg-background shadow-md'
        >
          <DropdownMenuItem
            onClick={() => toast.info('Reply option selected')}
            className='cursor-pointer text-xs flex items-center gap-2.5 py-2 font-medium'
          >
            <Reply className='h-4 w-4 text-muted-foreground' />
            <span>Reply</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => toast.info('Forward option selected')}
            className='cursor-pointer text-xs flex items-center gap-2.5 py-2 font-medium'
          >
            <Forward className='h-4 w-4 text-muted-foreground' />
            <span>Forward</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => toast.success('Archived successfully')}
            className='cursor-pointer text-xs flex items-center gap-2.5 py-2 font-medium'
          >
            <Archive className='h-4 w-4 text-muted-foreground' />
            <span>Archive</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (onShare) onShare()
              else toast.success('Share link copied to clipboard')
            }}
            className='cursor-pointer text-xs flex items-center gap-2.5 py-2 font-medium'
          >
            <Share2 className='h-4 w-4 text-muted-foreground' />
            <span>Share</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (onPrint) onPrint()
              else toast.info('Preparing print document...')
            }}
            className='cursor-pointer text-xs flex items-center gap-2.5 py-2 font-medium'
          >
            <Printer className='h-4 w-4 text-muted-foreground' />
            <span>Print</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (onDownload) onDownload()
              else toast.success('Download started')
            }}
            className='cursor-pointer text-xs flex items-center gap-2.5 py-2 font-medium'
          >
            <Download className='h-4 w-4 text-muted-foreground' />
            <span>Download</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (onDelete) onDelete()
              else toast.success('Item deleted')
            }}
            className='cursor-pointer text-xs flex items-center gap-2.5 py-2 text-red-500 focus:bg-red-500/10 focus:text-red-500 font-medium'
          >
            <Trash2 className='h-4 w-4 text-red-500' />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
