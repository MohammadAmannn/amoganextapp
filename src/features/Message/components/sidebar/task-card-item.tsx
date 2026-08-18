import React from 'react'
import { ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardItemProps {
  isSelected: boolean
  onSelect: () => void
}

export function TaskCardItem({ isSelected, onSelect }: TaskCardItemProps) {
  return (
    <div
      id='task-card'
      onClick={onSelect}
      className={cn(
        'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
        isSelected
          ? 'border-purple-200/50 bg-purple-500/10 dark:border-purple-900/30 dark:bg-purple-950/20'
          : 'border-transparent bg-background hover:bg-purple-500/5 hover:border-purple-200/30'
      )}
    >
      {isSelected && (
        <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-purple-600' />
      )}
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-200/40 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 dark:border-purple-800/40 dark:text-purple-400'>
            <ClipboardList className='h-3.5 w-3.5' />
          </div>
          <span className='flex items-center gap-1.5 truncate text-sm font-semibold text-foreground'>
            Project Roadmap & Tasks
          </span>
        </div>
        <span className='ml-2 shrink-0 rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400'>
          Kanban
        </span>
      </div>

      <span className='pl-10 text-[10px] text-muted-foreground/80 font-medium block'>
        July 30, 2026 - Aug 10, 2026
      </span>
    </div>
  )
}
