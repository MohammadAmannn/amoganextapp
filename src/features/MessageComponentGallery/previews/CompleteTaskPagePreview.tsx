'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { TaskCardItem } from '@/features/Message/components/sidebar/task-card-item'
import KanbanTemplate from '@/features/kanbantemplate'

interface PagePreviewProps {
  isMobileView?: boolean
}

export function CompleteTaskPagePreview({ isMobileView = false }: PagePreviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

  return (
    <div className='flex h-full w-full overflow-hidden bg-background select-none relative'>
      {/* ── LEFT SIDEBAR (Hidden on mobile when detail is open) ─────────────────── */}
      <div
        className={cn(
          'flex h-full w-full md:w-80 shrink-0 flex-col border-r border-border bg-muted/10 overflow-hidden',
          isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        {/* Header */}
        <div className='p-3 border-b border-border/60'>
          <SidebarHeader
            onSelectEmailSettings={() => toast.info('Settings (preview only)')}
            onSelectNotification={() => toast.info('Notifications (preview only)')}
          />
        </div>

        {/* Category Toolbar (Task icon active in purple) */}
        <div className='px-3 pt-2.5'>
          <CategoryToolbar
            categoryFilter='tasks'
            onSelectTasks={() => {}}
            onSelectMail={() => toast.info('Switch to Mail')}
            onSelectChat={() => toast.info('Switch to Chat')}
            onSelectAi={() => toast.info('Switch to AI')}
            onSelectAiAssistant={() => toast.info('Switch to AI Assistant')}
            onSelectVouchers={() => toast.info('Switch to Files')}
          />
        </div>

        {/* Search */}
        <div className='px-3 py-2'>
          <SidebarSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter='tasks'
            sectionMode='mail'
          />
        </div>

        {/* Section Label */}
        <div className='px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
          <ClipboardList className='h-3.5 w-3.5' />
          <span>Tasks</span>
        </div>

        {/* Task Card Item (Active / Selected state) */}
        <div className='py-1'>
          <TaskCardItem
            isSelected={true}
            onSelect={() => setIsMobileDetailOpen(true)}
          />
        </div>

        <div className='flex-1' />
      </div>

      {/* ── RIGHT MAIN PANEL (Sprint Board / Kanban) ──────────────────────────── */}
      <div
        className={cn(
          'flex-1 min-w-0 h-full overflow-y-auto bg-background flex flex-col',
          !isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (!isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <KanbanTemplate
            embedded={true}
            onBack={() => setIsMobileDetailOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}

