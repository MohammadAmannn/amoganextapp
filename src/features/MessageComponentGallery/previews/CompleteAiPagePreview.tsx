'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SubTabsBar } from '@/features/Message/components/sidebar/sub-tabs-bar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { AiCardItem } from '@/features/Message/components/sidebar/ai-card-item'
import { AiChatWindowPreview } from './AiChatWindowPreview'

interface PagePreviewProps {
  isMobileView?: boolean
}

export function CompleteAiPagePreview({ isMobileView = false }: PagePreviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('ai-chat')
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

        {/* Category Toolbar (AI active) */}
        <div className='px-3 pt-2.5'>
          <CategoryToolbar
            categoryFilter='ai'
            onSelectTasks={() => toast.info('Switch to Tasks')}
            onSelectMail={() => toast.info('Switch to Mail')}
            onSelectChat={() => toast.info('Switch to Chat')}
            onSelectAi={() => {}}
            onSelectAiAssistant={() => toast.info('Switch to AI Assistant')}
            onSelectVouchers={() => toast.info('Switch to Files')}
          />
        </div>

        {/* Sub Tabs */}
        <div className='px-1 py-1'>
          <SubTabsBar
            categoryFilter='ai'
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        </div>

        {/* Search */}
        <div className='px-3 py-1'>
          <SidebarSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter='ai'
            sectionMode='mail'
          />
        </div>

        {/* Section Label */}
        <div className='px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
          <Bot className='h-3.5 w-3.5' />
          <span>AI Assistants</span>
        </div>

        {/* AI Card Item */}
        <div className='py-1'>
          <AiCardItem
            isSelected={true}
            onSelect={() => setIsMobileDetailOpen(true)}
          />
        </div>

        <div className='flex-1' />
      </div>

      {/* ── RIGHT MAIN PANEL (Hidden on mobile when viewing AI list) ───────────── */}
      <div
        className={cn(
          'flex-1 min-w-0 h-full overflow-hidden bg-background flex flex-col',
          !isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (!isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        <AiChatWindowPreview
          initialState='conversation'
          onClose={() => setIsMobileDetailOpen(false)}
        />
      </div>
    </div>
  )
}

