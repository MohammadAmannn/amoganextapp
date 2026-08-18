import React from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiCardItemProps {
  isSelected: boolean
  onSelect: () => void
}

export function AiCardItem({ isSelected, onSelect }: AiCardItemProps) {
  return (
    <div
      id='ai-assistant-chat-card'
      onClick={onSelect}
      className={cn(
        'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
        isSelected
          ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
          : 'border-transparent bg-background hover:bg-indigo-500/5 hover:border-indigo-200/30'
      )}
    >
      {isSelected && (
        <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-indigo-600' />
      )}
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400'>
            <Bot className='h-3.5 w-3.5' />
          </div>
          <span className='flex items-center gap-1 truncate text-sm font-semibold text-foreground'>
            AI Assistant
            <Sparkles className='h-3 w-3 text-indigo-400' />
          </span>
        </div>
        <span className='ml-2 shrink-0 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400'>
          AI
        </span>
      </div>
      <p className='line-clamp-2 text-xs text-muted-foreground/70 leading-relaxed pl-10'>
        Explain the new features of React 19 with examples of Server Actions and the use() hook.
      </p>
    </div>
  )
}
