import { useState } from 'react'
import {
  Copy,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreHorizontal,
  Heart,
  Flag,
  Star,
  Pin,
  Archive,
  Trash2,
  Bell,
  CornerUpLeft,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Message } from '../types/chat.types'

interface MessageToolbarProps {
  message: Message
  onCopy: () => void
  onReact: (
    action:
      | 'thumb'
      | 'favorite'
      | 'flag'
      | 'star'
      | 'pin'
      | 'archive'
      | 'action_this',
    value: boolean
  ) => void
  onDeleteForMe: () => void
  onDeleteForEveryone?: () => void
  onReply: () => void
  onForward: () => void
  onEdit?: () => void
  onShare: () => void
  isSender: boolean
  className?: string
}

export function MessageToolbar({
  message,
  onCopy,
  onReact,
  onDeleteForMe,
  onDeleteForEveryone,
  onReply,
  onForward,
  onEdit,
  onShare,
  isSender,
  className,
}: MessageToolbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border border-border/80 bg-card px-2.5 py-1 shadow-md select-none dark:bg-zinc-900',
        className,
        isDropdownOpen && '!pointer-events-auto !scale-100 !opacity-100'
      )}
      onClick={(e) => e.stopPropagation()} // Prevent bubble clicks
    >
      {/* Thumb Up reaction toggle */}
      <Button
        size='icon'
        variant='ghost'
        className={`h-7 w-7 cursor-pointer rounded-full text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 ${
          message.thumb ? 'bg-emerald-500/10 text-emerald-500' : ''
        }`}
        onClick={() => onReact('thumb', !message.thumb)}
        title='Thumb Up'
      >
        <ThumbsUp className='h-3.5 w-3.5' />
      </Button>

      {/* Thumb Down (toggles thumb boolean false) */}
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7 cursor-pointer rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500'
        onClick={() => onReact('thumb', false)}
        title='Thumb Down'
      >
        <ThumbsDown className='h-3.5 w-3.5' />
      </Button>

      {/* Copy Action */}
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7 cursor-pointer rounded-full text-muted-foreground hover:text-foreground'
        onClick={onCopy}
        title='Copy text'
      >
        <Copy className='h-3.5 w-3.5' />
      </Button>

      {/* Share Action */}
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7 cursor-pointer rounded-full text-muted-foreground hover:text-foreground'
        onClick={onShare}
        title='Share'
      >
        <Share2 className='h-3.5 w-3.5' />
      </Button>

      {/* Three Dot Menu dropdown */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size='icon'
            variant='ghost'
            className='h-7 w-7 cursor-pointer rounded-full text-muted-foreground hover:text-foreground'
            title='More actions'
          >
            <MoreHorizontal className='h-3.5 w-3.5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          side='top'
          sideOffset={8}
          className='w-52 rounded-xl border-border/80 shadow-lg'
        >
          <DropdownMenuItem onClick={onReply} className='cursor-pointer gap-2'>
            <CornerUpLeft className='h-4 w-4 text-blue-500' />
            <span>Reply</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onForward}
            className='cursor-pointer gap-2'
          >
            <ArrowRight className='h-4 w-4 text-sky-500' />
            <span>Forward</span>
          </DropdownMenuItem>

          {isSender && onEdit && message.message_type === 'text' && (
            <DropdownMenuItem onClick={onEdit} className='cursor-pointer gap-2'>
              <Pencil className='h-4 w-4 text-emerald-500' />
              <span>Edit</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => onReact('pin', !message.pin)}
            className='cursor-pointer gap-2'
          >
            <Pin className='h-4 w-4 text-purple-500' />
            <span>{message.pin ? 'Unpin Message' : 'Pin Message'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onReact('star', !message.star)}
            className='cursor-pointer gap-2'
          >
            <Star
              className={`h-4 w-4 text-amber-500 ${message.star ? 'fill-amber-500' : ''}`}
            />
            <span>{message.star ? 'Unstar' : 'Star'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onReact('favorite', !message.favorite)}
            className='cursor-pointer gap-2'
          >
            <Heart
              className={`h-4 w-4 text-rose-500 ${message.favorite ? 'fill-rose-500' : ''}`}
            />
            <span>{message.favorite ? 'Unfavorite' : 'Favorite'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onReact('flag', !message.flag)}
            className='cursor-pointer gap-2'
          >
            <Flag
              className={`h-4 w-4 text-red-500 ${message.flag ? 'fill-red-500' : ''}`}
            />
            <span>{message.flag ? 'Unflag' : 'Flag'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onReact('archive', !message.archive)}
            className='cursor-pointer gap-2'
          >
            <Archive className='h-4 w-4 text-indigo-500' />
            <span>{message.archive ? 'Unarchive' : 'Archive'}</span>
          </DropdownMenuItem>

          {/* Nested Submenu: Action This (Alarm) */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='cursor-pointer gap-2'>
              <Bell className='h-4 w-4 text-orange-500' />
              <span>Action This</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='rounded-xl border-border/80'>
              <DropdownMenuItem
                onClick={() => onReact('action_this', !message.action_this)}
                className='cursor-pointer'
              >
                <Bell className='mr-2 h-4 w-4 text-orange-500' />
                <span>
                  {message.action_this ? 'Cancel Alarm' : 'Set Alarm'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <span>Add Custom Action...</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Delete choice sub-menu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='cursor-pointer gap-2 text-rose-500 hover:text-rose-600 focus:text-rose-600'>
              <Trash2 className='h-4 w-4' />
              <span>Delete</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='rounded-xl border-border/80'>
              <DropdownMenuItem
                onClick={onDeleteForMe}
                className='cursor-pointer text-rose-500'
              >
                Delete for Me
              </DropdownMenuItem>
              {isSender && onDeleteForEveryone && (
                <DropdownMenuItem
                  onClick={onDeleteForEveryone}
                  className='cursor-pointer font-bold text-rose-600'
                >
                  Delete for Everyone
                </DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export default MessageToolbar
