'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SubTabsBar } from '@/features/Message/components/sidebar/sub-tabs-bar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { ChatCardItem } from '@/features/Message/components/sidebar/chat-card-item'
import { ChatView } from '@/features/Message/components/chat/chat-view'
import { mockChatEmails, mockChatMessages, mockCurrentUser } from '../mocks'
import { Email } from '@/features/Message/types/email.types'
import { ChatMessage } from '@/features/Message/types/chat.types'

interface PagePreviewProps {
  isMobileView?: boolean
}

export function CompleteChatPagePreview({ isMobileView = false }: PagePreviewProps) {
  const [chatEmails, setChatEmails] = useState<Email[]>(mockChatEmails)
  const [selectedChatEmail, setSelectedChatEmail] = useState<Email>(mockChatEmails[0])
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('chats')
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

  const handleSelectChat = (chat: Email) => {
    setSelectedChatEmail(chat)
    setIsMobileDetailOpen(true)
    // Mark as read
    setChatEmails((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, read: true } : c))
    )
  }

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'You',
      content,
      time: new Date(),
      isOwn: true,
      avatarInitials: 'ME',
      messageStatus: 'delivered',
    }
    setMessages((prev) => [...prev, newMsg])
    toast.success('Message sent! (preview only)')
  }

  const filteredChats = chatEmails.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            onSelectEmailSettings={() => toast.info('Settings (preview only)')}
            onSelectNotification={() => toast.info('Notifications (preview only)')}
          />
        </div>

        {/* Category Toolbar (Chat active) */}
        <div className='px-3 pt-2.5'>
          <CategoryToolbar
            categoryFilter='chat'
            onSelectTasks={() => toast.info('Switch to Tasks')}
            onSelectMail={() => toast.info('Switch to Mail')}
            onSelectChat={() => {}}
            onSelectAi={() => toast.info('Switch to AI')}
            onSelectAiAssistant={() => toast.info('Switch to AI Assistant')}
            onSelectVouchers={() => toast.info('Switch to Files')}
          />
        </div>

        {/* Sub Tabs */}
        <div className='px-1 py-1'>
          <SubTabsBar
            categoryFilter='chat'
            activeTab={activeTab}
            total={filteredChats.length}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        </div>

        {/* Search */}
        <div className='px-3 py-1'>
          <SidebarSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter='chat'
            sectionMode='chat'
          />
        </div>

        {/* Section Label */}
        <div className='px-4 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
          <div className='flex items-center gap-1.5'>
            <MessageSquare className='h-3.5 w-3.5' />
            <span>Direct Chats</span>
          </div>
          <span className='text-[10px] font-mono'>{filteredChats.length}</span>
        </div>

        {/* Chat Cards List */}
        <div className='flex-1 min-h-0 overflow-y-auto py-1 space-y-0.5 scrollbar-thin'>
          {filteredChats.map((chat) => (
            <ChatCardItem
              key={chat.id}
              email={chat}
              isSelected={selectedChatEmail?.id === chat.id}
              onSelect={handleSelectChat}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL (Hidden on mobile when viewing chat list) ──────────── */}
      <div
        className={cn(
          'flex-1 min-w-0 h-full overflow-hidden bg-background flex flex-col',
          !isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (!isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        {selectedChatEmail ? (
          <ChatView
            chatName={selectedChatEmail.chatData?.name || selectedChatEmail.name}
            chatAvatar={selectedChatEmail.chatData?.avatar}
            membersCount={selectedChatEmail.chatData?.membersCount || 2}
            onlineCount={selectedChatEmail.chatData?.onlineCount || 1}
            messages={messages}
            onBack={() => setIsMobileDetailOpen(false)}
            onSendMessage={handleSendMessage}
            currentUser={mockCurrentUser}
          />
        ) : (
          <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
            Select a chat conversation from the left to view
          </div>
        )}
      </div>
    </div>
  )
}

