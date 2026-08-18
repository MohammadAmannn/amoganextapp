import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  MoreHorizontal,
  CornerUpLeft,
  CornerUpRight,
  Pin,
  Star,
  Heart,
  Flag,
  Archive,
  Bell,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Email } from '../../types/email.types'

interface EmailCardItemProps {
  email: Email
  isSelected: boolean
  isCollapsed?: boolean
  onSelect: (email: Email) => void
}

export function cleanSenderName(rawName?: string): string {
  if (!rawName) return 'Unknown'
  let cleaned = rawName.replace(/<[^>]+>/g, '').trim()
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim()
  if (!cleaned) {
    const emailMatch = rawName.match(/<([^>]+)>/) || [null, rawName]
    return (emailMatch[1] || rawName).split('@')[0]
  }
  return cleaned
}

export function getLabelVariant(
  label: string
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (label) {
    case 'important':
      return 'default'
    case 'work':
      return 'outline'
    case 'personal':
      return 'secondary'
    case 'meeting':
      return 'outline'
    case 'budget':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function EmailCardItem({
  email,
  isSelected,
  isCollapsed = false,
  onSelect,
}: EmailCardItemProps) {
  return (
    <div
      onClick={() => onSelect(email)}
      className={cn(
        'group relative flex cursor-pointer transition-all duration-200 select-none',
        isCollapsed
          ? 'mx-3 my-0.5 justify-center rounded-lg p-2 hover:bg-muted/30'
          : 'mx-3 my-0.5 flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-muted/40 hover:shadow-xs',
        isSelected
          ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
          : 'bg-background hover:bg-muted/30',
        !email.read && 'bg-primary/5',
        'border border-transparent'
      )}
    >
      {isSelected && (
        <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-indigo-600' />
      )}

      {isCollapsed ? (
        <div className='relative shrink-0'>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold shadow-xs transition-all duration-200',
              isSelected
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-indigo-200/30 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
            )}
          >
            {email.avatarInitials ||
              cleanSenderName(email.name).charAt(0).toUpperCase()}
          </div>
          {!email.read && (
            <span className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background bg-indigo-600' />
          )}
        </div>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <div className='flex min-w-0 flex-wrap items-center gap-1.5'>
              <span
                className={cn(
                  'truncate text-sm font-medium text-foreground',
                  !email.read && 'font-semibold'
                )}
              >
                {cleanSenderName(email.name)}
              </span>
              {!email.read && (
                <span className='inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600' />
              )}
              {email.labels.length > 0 && (
                <div className='flex flex-wrap gap-0.5'>
                  {email.labels.slice(0, 2).map((label) => (
                    <Badge
                      key={label}
                      variant={getLabelVariant(label)}
                      className='h-4 rounded px-1.5 py-0 text-[9px] font-medium capitalize'
                    >
                      {label}
                    </Badge>
                  ))}
                  {email.labels.length > 2 && (
                    <Badge
                      variant='outline'
                      className='h-4 rounded px-1 py-0 text-[9px]'
                    >
                      +{email.labels.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <span className='ml-2 shrink-0 text-[10px] whitespace-nowrap text-muted-foreground'>
              {formatDistanceToNow(email.date, {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Subject */}
          <p
            className={cn(
              'truncate text-sm',
              !email.read ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
          >
            {email.subject}
          </p>

          {/* Preview */}
          <p className='line-clamp-1 text-xs text-muted-foreground/70'>
            {email.preview}
          </p>

          <div className='absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='flex h-6 w-6 cursor-pointer items-center justify-center rounded p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground'
                  title='More actions'
                >
                  <MoreHorizontal className='h-3.5 w-3.5' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-[150px] rounded-lg border border-border bg-background p-1 shadow-md'
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer gap-2 py-1.5 text-xs'
                >
                  <CornerUpLeft className='h-3 w-3 shrink-0 text-blue-500' />
                  <span>Reply</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer gap-2 py-1.5 text-xs'
                >
                  <CornerUpRight className='h-3 w-3 shrink-0 text-blue-500' />
                  <span>Forward</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer gap-2 py-1.5 text-xs'
                >
                  <Pin className='h-3 w-3 shrink-0 text-purple-500' />
                  <span>Pin Message</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer gap-2 py-1.5 text-xs'
                >
                  <Star className='h-3 w-3 shrink-0 text-amber-500' />
                  <span>Star</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer gap-2 py-1.5 text-xs'
                >
                  <Heart className='h-3 w-3 shrink-0 text-pink-500' />
                  <span>Favorite</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer gap-2 py-1.5 text-xs'
                >
                  <Flag className='h-3 w-3 shrink-0 text-red-500' />
                  <span>Flag</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer gap-2 py-1.5 text-xs'
                >
                  <Archive className='h-3 w-3 shrink-0 text-indigo-500' />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer justify-between gap-2 py-1.5 text-xs'
                >
                  <div className='flex items-center gap-2'>
                    <Bell className='h-3 w-3 shrink-0 text-orange-500' />
                    <span>Action This</span>
                  </div>
                  <ChevronRight className='h-3 w-3 text-muted-foreground' />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className='cursor-pointer justify-between gap-2 py-1.5 text-xs text-red-500 focus:bg-red-500/10 focus:text-red-500'
                >
                  <div className='flex items-center gap-2'>
                    <Trash2 className='h-3 w-3 shrink-0 text-red-500' />
                    <span>Delete</span>
                  </div>
                  <ChevronRight className='h-3 w-3 text-red-500' />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  )
}
