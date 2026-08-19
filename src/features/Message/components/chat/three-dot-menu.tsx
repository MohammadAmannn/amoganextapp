'use client'

import React from 'react'
import {
  MoreVertical,
  Reply,
  Forward,
  Pin,
  Star,
  Heart,
  Flag,
  Archive,
  Bell,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ThreeDotMenuProps {
  onDelete?: () => void
  onReply?: () => void
  onForward?: () => void
  onPin?: () => void
  onStar?: () => void
  onFavorite?: () => void
  onArchive?: () => void
  onActionThis?: () => void
  onOpenChange?: (open: boolean) => void
}

export function ThreeDotMenu({
  onDelete,
  onReply,
  onForward,
  onPin,
  onStar,
  onFavorite,
  onArchive,
  onActionThis,
  onOpenChange,
}: ThreeDotMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setInternalOpen(isOpen)
    if (onOpenChange) onOpenChange(isOpen)
  }

  return (
    <DropdownMenu open={internalOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          onClick={(e) => e.stopPropagation()}
          className='p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
          title='More options'
        >
          <MoreVertical className='h-4 w-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-48 border border-border/80 bg-background shadow-lg p-1 space-y-0.5 z-50'
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            toast.success('Flagged message')
          }}
          className='cursor-pointer text-xs flex items-center justify-between py-2 px-2.5 font-medium hover:bg-muted/80 rounded-md'
        >
          <div className='flex items-center gap-2.5'>
            <Flag className='h-4 w-4 text-red-500' />
            <span className='text-foreground'>Flag</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
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
  )
}
