'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { NotificationCardItem } from '@/features/Message/components/sidebar/notification-card-item'
import { NotificationDetailPanel, ChatMessageDetail } from '@/features/Message/components/panels/notification-detail-panel'
import { mockNotifications } from '../mocks'
import { DbNotification } from '@/stores/notification-store'

interface PagePreviewProps {
  isMobileView?: boolean
}

export function CompleteNotificationPagePreview({ isMobileView = false }: PagePreviewProps) {
  const [notifications, setNotifications] = useState<DbNotification[]>(mockNotifications)
  const [selectedNotification, setSelectedNotification] = useState<DbNotification | null>(
    mockNotifications[0] || null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

  const mockMessageDetail: ChatMessageDetail = {
    id: 'msg-notif-001',
    conversation_id: 'conv-001',
    sender_user_id: 'user-001',
    message: 'Hey, please review the latest sprint updates and let me know if you need any clarification on the OAuth deliverables.',
    message_type: 'text',
    created_at: new Date().toISOString(),
    sender: {
      id: 'user-001',
      name: 'Alex Johnson',
      email: 'alex@demo.com',
      avatar: null,
    },
  }

  const handleSelectNotification = (notif: DbNotification) => {
    setSelectedNotification(notif)
    setIsMobileDetailOpen(true)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    )
  }

  const filteredNotifications = notifications.filter((n) =>
    n.message_text.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            isNotificationSelected={true}
            unreadCount={notifications.filter((n) => !n.read).length}
            onSelectEmailSettings={() => toast.info('Settings (preview only)')}
            onSelectNotification={() => {}}
          />
        </div>

        {/* Category Toolbar */}
        <div className='px-3 pt-2.5'>
          <CategoryToolbar
            categoryFilter='mail'
            onSelectTasks={() => toast.info('Switch to Tasks')}
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
            categoryFilter='mail'
            sectionMode='mail'
          />
        </div>

        {/* Section Label */}
        <div className='px-4 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
          <div className='flex items-center gap-1.5'>
            <Bell className='h-3.5 w-3.5' />
            <span>Notifications</span>
          </div>
          <span className='text-[10px] font-mono'>{filteredNotifications.length}</span>
        </div>

        {/* Notification Cards List */}
        <div className='flex-1 min-h-0 overflow-y-auto py-1 space-y-0.5 scrollbar-thin'>
          {filteredNotifications.map((notif) => (
            <NotificationCardItem
              key={notif.id}
              notification={notif}
              isSelected={selectedNotification?.id === notif.id}
              onSelect={handleSelectNotification}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL (Hidden on mobile when viewing list) ─────────────── */}
      <div
        className={cn(
          'flex-1 min-w-0 h-full overflow-y-auto bg-background flex flex-col',
          !isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (!isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        {selectedNotification ? (
          <NotificationDetailPanel
            notification={selectedNotification}
            messageDetail={mockMessageDetail}
            isLoadingMessage={false}
            onClose={() => setIsMobileDetailOpen(false)}
          />
        ) : (
          <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
            Select a notification from the left to view details
          </div>
        )}
      </div>
    </div>
  )
}

