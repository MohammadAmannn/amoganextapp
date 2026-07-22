import React from 'react'
import { Mic } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserTypingState } from '../types/typing.types'
import { cn, getDisplayNameInitials } from '@/lib/utils'

interface TypingIndicatorProps {
  typingUsers: UserTypingState[]
  className?: string
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (!typingUsers || typingUsers.length === 0) return null

  // Determine primary user and status text
  const primaryUser = typingUsers[0]
  const isRecording = typingUsers.some(u => u.status === 'recording')

  let statusText = ''
  if (typingUsers.length === 1) {
    statusText = isRecording
      ? `${primaryUser.userName} is recording audio...`
      : `${primaryUser.userName} is typing...`
  } else if (typingUsers.length === 2) {
    statusText = isRecording
      ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are recording audio...`
      : `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
  } else {
    statusText = isRecording
      ? `${primaryUser.userName} and ${typingUsers.length - 1} others are recording audio...`
      : `${primaryUser.userName} and ${typingUsers.length - 1} others are typing...`
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 px-4 my-2 max-w-xs rounded-2xl bg-background/80 dark:bg-card/80 backdrop-blur-md border border-border/50 shadow-sm animate-in fade-in-50 slide-in-from-bottom-2 duration-200 select-none",
        className
      )}
    >
      {/* User Avatar */}
      <Avatar className="h-7 w-7 ring-2 ring-emerald-500/20 shrink-0">
        <AvatarFallback className="text-[10px] bg-emerald-600/10 text-emerald-600 font-bold dark:bg-emerald-500/20 dark:text-emerald-400">
          {getDisplayNameInitials(primaryUser.userName)}
        </AvatarFallback>
      </Avatar>

      {/* Visual Animation & Label */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground overflow-hidden">
        {isRecording ? (
          <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
            <Mic className="h-3.5 w-3.5 animate-pulse shrink-0" />
            <span className="truncate text-xs font-semibold text-foreground">{statusText}</span>
            <div className="flex items-center gap-0.5 ml-1">
              <span className="h-1.5 w-0.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2.5 w-0.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-3.5 w-0.5 bg-red-500 rounded-full animate-bounce"></span>
              <span className="h-2.5 w-0.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-0.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-semibold text-foreground">{statusText}</span>
            {/* Telegram / WhatsApp Bouncing Dots */}
            <div className="flex items-center gap-1 shrink-0 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.32s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.16s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TypingIndicator
