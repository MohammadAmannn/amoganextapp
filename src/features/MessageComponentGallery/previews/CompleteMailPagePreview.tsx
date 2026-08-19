'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Email } from '@/features/Message/types/email.types'
import { mockEmails } from '../mocks'
import { EmailCardItem } from '@/features/Message/components/sidebar/email-card-item'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SubTabsBar } from '@/features/Message/components/sidebar/sub-tabs-bar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { SidebarPagination } from '@/features/Message/components/sidebar/sidebar-pagination'
import { EmailView } from '@/features/Message/components/emails/email-view'
import { NewEmail } from '@/features/Message/components/emails/new-email'

interface PagePreviewProps {
  isMobileView?: boolean
}

export function CompleteMailPagePreview({ isMobileView = false }: PagePreviewProps) {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [selectedEmailId, setSelectedEmailId] = useState<string>(mockEmails[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('inbox')
  const [isComposing, setIsComposing] = useState(false)
  const [page, setPage] = useState(1)
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

  // Filter emails based on tab & search
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const matchesSearch =
        !searchQuery ||
        email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase())

      if (activeTab === 'inbox') {
        return matchesSearch && !email.done
      }
      if (activeTab === 'sent') {
        return matchesSearch && email.labels.includes('sent')
      }
      return matchesSearch
    })
  }, [emails, searchQuery, activeTab])

  const selectedEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || filteredEmails[0] || null
  }, [emails, selectedEmailId, filteredEmails])

  const handleSelectEmail = (email: Email) => {
    setSelectedEmailId(email.id)
    setIsComposing(false)
    setIsMobileDetailOpen(true)
    // Mark as read
    setEmails((prev) =>
      prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
    )
  }

  const handleDeleteEmail = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id))
    toast.success('Email deleted (preview only)')
    setIsMobileDetailOpen(false)
    if (selectedEmailId === id) {
      const remaining = emails.filter((e) => e.id !== id)
      setSelectedEmailId(remaining[0]?.id || '')
    }
  }

  return (
    <div className='flex h-full w-full overflow-hidden bg-background select-none relative'>
      {/* ── LEFT SIDEBAR (Hidden on mobile when viewing detail) ─────────────────── */}
      <div
        className={cn(
          'flex flex-col h-full w-full md:w-80 border-r border-border shrink-0 bg-card/20 overflow-hidden',
          isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        {/* Header */}
        <div className='p-3 border-b border-border/60'>
          <SidebarHeader
            unreadCount={emails.filter((e) => !e.read).length}
            onSelectEmailSettings={() => toast.info('Settings (preview only)')}
            onSelectNotification={() => toast.info('Notifications (preview only)')}
          />
        </div>

        {/* Category Toolbar */}
        <div className='px-3 pt-2.5'>
          <CategoryToolbar
            categoryFilter='mail'
            onSelectTasks={() => toast.info('Switch to Tasks')}
            onSelectMail={() => {}}
            onSelectChat={() => toast.info('Switch to Chat')}
            onSelectAi={() => toast.info('Switch to AI')}
            onSelectAiAssistant={() => toast.info('Switch to AI Assistant')}
            onSelectVouchers={() => toast.info('Switch to Files')}
          />
        </div>

        {/* Sub Tabs */}
        <div className='px-1 py-1'>
          <SubTabsBar
            categoryFilter='mail'
            activeTab={activeTab}
            total={filteredEmails.length}
            page={page}
            limit={20}
            hasMore={false}
            onTabChange={(tab) => {
              setActiveTab(tab)
              setIsComposing(false)
            }}
          />
        </div>

        {/* Search & Compose */}
        <div className='px-3 py-1'>
          <SidebarSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter='mail'
            sectionMode='mail'
            onComposeChange={(composing) => {
              setIsComposing(composing)
              if (composing) setIsMobileDetailOpen(true)
            }}
          />
        </div>

        {/* Email Cards List */}
        <div className='flex-1 min-h-0 overflow-y-auto py-1 space-y-0.5 scrollbar-thin'>
          {filteredEmails.length === 0 ? (
            <div className='p-6 text-center text-xs text-muted-foreground'>
              No emails found
            </div>
          ) : (
            filteredEmails.map((email) => (
              <EmailCardItem
                key={email.id}
                email={email}
                isSelected={!isComposing && selectedEmail?.id === email.id}
                onSelect={handleSelectEmail}
              />
            ))
          )}
        </div>

        {/* Pagination footer */}
        <div className='border-t border-border/60 p-2'>
          <SidebarPagination
            page={page}
            limit={20}
            total={filteredEmails.length}
            hasMore={false}
            onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
            onNextPage={() => setPage((p) => p + 1)}
          />
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL (Full width on mobile when viewing detail) ──────────── */}
      <div
        className={cn(
          'flex-1 min-w-0 h-full overflow-hidden bg-background flex flex-col',
          !isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (!isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        {isComposing ? (
          <NewEmail
            onCancel={() => {
              setIsComposing(false)
              setIsMobileDetailOpen(false)
            }}
            onSend={(data) => {
              toast.success(`Sent email: "${data.subject}"`)
              setIsComposing(false)
              setIsMobileDetailOpen(false)
            }}
            onSaveDraft={(data) => {
              toast.success(`Draft saved: "${data.subject}"`)
              setIsComposing(false)
              setIsMobileDetailOpen(false)
            }}
            onPreviewAttachment={(att) => toast.info(`Preview: ${att.name}`)}
          />
        ) : selectedEmail ? (
          <EmailView
            email={selectedEmail}
            onBack={() => setIsMobileDetailOpen(false)}
            onDelete={handleDeleteEmail}
            onStartChat={() => toast.info('Start chat with sender')}
            onPreviewAttachment={(att) => toast.info(`Preview: ${att.name}`)}
          />
        ) : (
          <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
            Select an email from the left to view
          </div>
        )}
      </div>
    </div>
  )
}
