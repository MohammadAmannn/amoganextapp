import React from 'react'
import { Settings, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
  isEmailSettingsSelected?: boolean
  isNotificationSelected?: boolean
  unreadCount?: number
  onSelectEmailSettings?: () => void
  onSelectNotification?: () => void
}

export function SidebarHeader({
  isEmailSettingsSelected,
  isNotificationSelected,
  unreadCount = 0,
  onSelectEmailSettings,
  onSelectNotification,
}: SidebarHeaderProps) {
  return (
    <div className='hidden md:flex items-center justify-between pb-0.5 border-b border-border/40'>
      <h1 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
        Messages
      </h1>
      <div className='flex items-center gap-1 sm:gap-1.5'>
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'relative size-7 shrink-0 transition-colors',
            isEmailSettingsSelected && 'bg-accent text-accent-foreground'
          )}
          aria-label='Settings'
          title='Email Settings'
          onClick={onSelectEmailSettings}
        >
          <Settings className='size-4' />
        </Button>

        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'relative size-7 shrink-0 transition-colors',
            isNotificationSelected && 'bg-accent text-accent-foreground'
          )}
          aria-label='Notifications'
          title='Notifications'
          onClick={onSelectNotification}
        >
          <Bell className='size-4' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white shadow-xs'>
              {unreadCount > 5 ? '5+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
