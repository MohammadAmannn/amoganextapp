'use client'

import React from 'react'
import {
  Bell,
  Flag,
  MoreVertical,
  Reply,
  Forward,
  Pin,
  Star,
  Heart,
  Archive,
  Trash2,
  ChevronRight,
  X,
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
  onReply?: () => void
  onForward?: () => void
  onPin?: () => void
  onStar?: () => void
  onFavorite?: () => void
  onArchive?: () => void
  onActionThis?: () => void
  onClose?: () => void
}

export function HeaderActions({
  onDelete,
  onDownload,
  onPrint,
  onShare,
  onReply,
  onForward,
  onPin,
  onStar,
  onFavorite,
  onArchive,
  onActionThis,
  onClose,
}: HeaderActionsProps) {
  return (
    <div className='flex items-center gap-1 shrink-0 select-none'>
      {/* Icon 1: Act on this Quick Action (Left of Flag) */}
      <button
        type='button'
        onClick={() => {
          if (onActionThis) onActionThis()
          else toast.info('Act on this option selected')
        }}
        className='p-1.5 rounded-lg hover:bg-muted text-amber-500 hover:text-amber-600 transition-colors cursor-pointer'
        title='Act on this'
      >
        <Bell className='h-4.5 w-4.5' />
      </button>

      {/* Icon 2: Quick Flag Action */}
      <button
        type='button'
        onClick={() => toast.success('Flagged item')}
        className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
        title='Flag'
      >
        <Flag className='h-4.5 w-4.5' />
      </button>

      {/* Icon 3: 3-Dot More Menu */}
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
          className='w-48 border border-border/80 bg-background shadow-lg p-1 space-y-0.5'
        >
          {/* 1. Reply */}
          <DropdownMenuItem
            onClick={() => {
              if (onReply) onReply()
              else toast.info('Reply option selected')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Reply className='h-4 w-4 text-blue-500' />
              <span className='text-foreground'>Reply</span>
            </div>
          </DropdownMenuItem>

          {/* 2. Forward */}
          <DropdownMenuItem
            onClick={() => {
              if (onForward) onForward()
              else toast.info('Forward option selected')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Forward className='h-4 w-4 text-sky-400' />
              <span className='text-foreground'>Forward</span>
            </div>
          </DropdownMenuItem>

          {/* 3. Pin Message */}
          <DropdownMenuItem
            onClick={() => {
              if (onPin) onPin()
              else toast.success('Message pinned')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Pin className='h-4 w-4 text-purple-500' />
              <span className='text-foreground'>Pin Message</span>
            </div>
          </DropdownMenuItem>

          {/* 4. Star */}
          <DropdownMenuItem
            onClick={() => {
              if (onStar) onStar()
              else toast.success('Starred successfully')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Star className='h-4 w-4 text-amber-500' />
              <span className='text-foreground'>Star</span>
            </div>
          </DropdownMenuItem>

          {/* 5. Favorite */}
          <DropdownMenuItem
            onClick={() => {
              if (onFavorite) onFavorite()
              else toast.success('Added to favorites')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Heart className='h-4 w-4 text-rose-500' />
              <span className='text-foreground'>Favorite</span>
            </div>
          </DropdownMenuItem>

          {/* 6. Flag */}
          <DropdownMenuItem
            onClick={() => toast.success('Flagged message')}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Flag className='h-4 w-4 text-red-500' />
              <span className='text-foreground'>Flag</span>
            </div>
          </DropdownMenuItem>

          {/* 7. Archive */}
          <DropdownMenuItem
            onClick={() => {
              if (onArchive) onArchive()
              else toast.success('Archived successfully')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Archive className='h-4 w-4 text-indigo-500' />
              <span className='text-foreground'>Archive</span>
            </div>
          </DropdownMenuItem>

          {/* 8. Action This */}
          <DropdownMenuItem
            onClick={() => {
              if (onActionThis) onActionThis()
              else toast.info('Action This selected')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
          >
            <div className='flex items-center gap-2.5'>
              <Bell className='h-4 w-4 text-amber-500' />
              <span className='text-foreground'>Action This</span>
            </div>
          </DropdownMenuItem>

          {/* 9. Delete */}
          <DropdownMenuItem
            onClick={() => {
              if (onDelete) onDelete()
              else toast.success('Item deleted')
            }}
            className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-red-500/10 rounded-md text-red-500 focus:text-red-500'
          >
            <div className='flex items-center gap-2.5'>
              <Trash2 className='h-4 w-4 text-red-500' />
              <span className='font-semibold text-red-500'>Delete</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Icon 4: Close / Cross Button */}
      {onClose && (
        <button
          type='button'
          onClick={onClose}
          className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-0.5'
          title='Close'
          aria-label='Close'
        >
          <X className='h-4.5 w-4.5' />
        </button>
      )}
    </div>
  )
}
