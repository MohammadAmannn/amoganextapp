import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DbNotification } from '@/stores/notification-store'

interface NotificationCardItemProps {
  notification: DbNotification
  isSelected: boolean
  onSelect: (notification: DbNotification) => void
}

export function NotificationCardItem({
  notification,
  isSelected,
  onSelect,
}: NotificationCardItemProps) {
  const senderName =
    notification.message_text.split(' send you a msg')[0] || 'Someone'

  return (
    <div
      id={`notification-card-${notification.id}`}
      onClick={() => onSelect(notification)}
      className={cn(
        'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2 transition-all duration-200 select-none border',
        isSelected
          ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
          : 'border-transparent bg-background hover:bg-muted/30',
        !notification.read && 'bg-primary/5'
      )}
    >
      {isSelected && (
        <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-indigo-600' />
      )}
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-1.5'>
          <span
            className={cn(
              'truncate text-sm font-medium text-foreground',
              !notification.read && 'font-semibold'
            )}
          >
            {senderName}
          </span>
          {!notification.read && (
            <span className='inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600' />
          )}
          <Badge className='h-4 rounded border-indigo-200/30 bg-indigo-500/10 px-1.5 py-0 text-[9px] font-medium text-indigo-600 dark:text-indigo-400'>
            Notification
          </Badge>
        </div>
        <span className='ml-2 shrink-0 text-[10px] whitespace-nowrap text-muted-foreground'>
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </span>
      </div>
      <p className='line-clamp-1 text-xs text-muted-foreground/70'>
        {notification.message_text}
      </p>
    </div>
  )
}
