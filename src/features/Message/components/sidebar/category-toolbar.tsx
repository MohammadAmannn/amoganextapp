import React from 'react'
import { Calendar, Mail, MessageSquare, Sparkles, Bot, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryFilterType } from '../../types/message.types'

interface CategoryToolbarProps {
  categoryFilter: CategoryFilterType
  onSelectTasks: () => void
  onSelectMail: () => void
  onSelectChat: () => void
  onSelectAi: () => void
  onSelectAiAssistant: () => void
  onSelectVouchers: () => void
}

export function CategoryToolbar({
  categoryFilter,
  onSelectTasks,
  onSelectMail,
  onSelectChat,
  onSelectAi,
  onSelectAiAssistant,
  onSelectVouchers,
}: CategoryToolbarProps) {
  return (
    <div className='w-full max-w-full overflow-x-auto scrollbar-none rounded-xl bg-muted/20 p-1 flex items-center justify-between gap-0.5 sm:gap-1 border-0 min-w-0 select-none'>
      {/* 1st Icon: Task / Kanban (visually Calendar icon) */}
      <button
        type='button'
        onClick={onSelectTasks}
        className={cn(
          'flex flex-1 min-w-[34px] items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0 shrink-0',
          categoryFilter === 'tasks' &&
            'bg-purple-500/15 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 font-semibold shadow-2xs'
        )}
        title='Tasks / Kanban Board'
      >
        <Calendar className='h-4 w-4' />
      </button>

      {/* 2nd Icon: Email */}
      <button
        type='button'
        onClick={onSelectMail}
        className={cn(
          'flex flex-1 min-w-[34px] items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0 shrink-0',
          categoryFilter === 'mail' &&
            'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
        )}
        title='Mail Items'
      >
        <Mail className='h-4 w-4' />
      </button>

      {/* 3rd Icon: Chat */}
      <button
        type='button'
        onClick={onSelectChat}
        className={cn(
          'flex flex-1 min-w-[34px] items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0 shrink-0',
          categoryFilter === 'chat' &&
            'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold shadow-2xs'
        )}
        title='Chats & Direct Messages'
      >
        <MessageSquare className='h-4 w-4' />
      </button>

      {/* 4th Icon: AI Chat */}
      <button
        type='button'
        onClick={onSelectAi}
        className={cn(
          'flex flex-1 min-w-[34px] items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0 shrink-0',
          categoryFilter === 'ai' &&
            'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
        )}
        title='AI Chat'
      >
        <Sparkles className='h-4 w-4' />
      </button>

      {/* 5th Icon: AI Assistant */}
      <button
        type='button'
        onClick={onSelectAiAssistant}
        className={cn(
          'flex flex-1 min-w-[34px] items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0 shrink-0',
          categoryFilter === 'ai-assistant' &&
            'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
        )}
        title='AI Assistant'
      >
        <Bot className='h-4 w-4' />
      </button>

      {/* 6th Icon: Vouchers / Files */}
      <button
        type='button'
        onClick={onSelectVouchers}
        className={cn(
          'flex flex-1 min-w-[34px] items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0 shrink-0',
          categoryFilter === 'vouchers' &&
            'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
        )}
        title='Vouchers'
      >
        <FileText className='h-4 w-4' />
      </button>
    </div>
  )
}
