import React from 'react'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HeaderActions } from './header-actions'

interface ChatHeaderProps {
  chatName: string
  chatAvatar?: string
  subtitle: string
  typingText?: string
  onBack?: () => void
  onShowProfile: () => void
}

export function ChatHeader({
  chatName,
  chatAvatar,
  subtitle,
  typingText,
  onBack,
  onShowProfile,
}: ChatHeaderProps) {
  return (
    <div className='flex flex-none shrink-0 items-center justify-between border-b border-border bg-muted/10 p-3 sm:p-4 select-none'>
      <div className='flex min-w-0 items-center gap-2 sm:gap-3'>
        <div
          onClick={onShowProfile}
          className='flex cursor-pointer items-center gap-2.5 sm:gap-3 transition-opacity select-none hover:opacity-85 min-w-0'
          title='Click to view info'
        >
          <div className='relative shrink-0'>
            <Avatar className='h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-border/60'>
              {chatAvatar ? (
                <AvatarImage src={chatAvatar} alt={chatName} />
              ) : null}
              <AvatarFallback className='rounded-xl bg-primary/10 font-bold text-primary'>
                {chatName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className='flex min-w-0 flex-col'>
            <span className='block truncate text-sm leading-tight font-bold text-foreground'>
              {chatName}
            </span>
            <span className='truncate text-xs leading-tight text-muted-foreground'>
              {typingText || subtitle}
            </span>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-1 shrink-0'>
        <HeaderActions onDelete={onBack} />
        {onBack && (
          <button
            type='button'
            onClick={onBack}
            className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted/60 text-foreground transition-colors hover:bg-muted md:hidden ml-1'
            title='Close'
            aria-label='Close chat'
          >
            <X className='h-4.5 w-4.5' />
          </button>
        )}
      </div>
    </div>
  )
}
