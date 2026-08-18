import React, { useState, useEffect, useMemo } from 'react'
import {
  Mail,
  MessageSquare,
  Bell,
  Sparkles,
  Bot,
  ClipboardList,
  FolderOpen,
  FileText,
} from 'lucide-react'
import { useNotificationStore, DbNotification } from '@/stores/notification-store'
import { useVoucherStore, SavedVoucher } from '@/stores/voucher-store'
import { Conversation } from '@/features/chattemplate/chat/types/chat.types'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { Group } from '@/features/chattemplate/groups/types/group.types'
import { Email } from '../../types/email.types'
import { CategoryFilterType, SectionMode, InboxMode } from '../../types/message.types'
import { UserFolder, DEFAULT_USER_FOLDERS } from '@/features/Message/services/user-storage-files.service'
import {
  SidebarHeader,
  CategoryToolbar,
  SubTabsBar,
  SidebarSearchBar,
  EmailListSkeleton,
  EmailCardItem,
  ChatCardItem,
  NotificationCardItem,
  AiCardItem,
  TaskCardItem,
  FolderTreeItem,
} from '../sidebar'

interface EmailListProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (email: Email) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  mode: InboxMode
  setMode: (mode: InboxMode) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  contacts?: Contact[]
  selectedContactId?: string | null
  onSelectContact?: (contact: Contact) => void
  groups?: Group[]
  onSelectGroup?: (group: Group) => void
  onRefreshContactsAndGroups?: () => void
  conversations?: Conversation[]
  onSelectConversation?: (conversation: Conversation) => void
  onSelectAiChat?: () => void
  isAiChatSelected?: boolean
  onSelectTask?: () => void
  isTaskSelected?: boolean
  onSelectFile?: () => void
  isFileSelected?: boolean
  userFolders?: UserFolder[]
  selectedFolderId?: string | null
  onSelectFolder?: (folder: UserFolder) => void
  onUploadFileClick?: () => void
  onSelectEmailSettings?: () => void
  isEmailSettingsSelected?: boolean
  onSelectNotificationMode?: () => void
  onSelectNotification?: (notification: DbNotification) => void
  selectedNotificationId?: string | null
  isNotificationSelected?: boolean
  activeTab?: string
  onTabChange?: (tab: string) => void
  onSelectMailTab?: () => void
  onSelectChatTab?: () => void
  onSelectAiAssistantTab?: () => void
  sectionMode?: SectionMode
  onSectionModeChange?: (mode: SectionMode) => void
  isComposing?: boolean
  onComposeChange?: (composing: boolean) => void
  isEmailsLoading?: boolean
  emailsError?: string | null
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  page?: number
  limit?: number
  total?: number
  onPrevPage?: () => void
  onNextPage?: () => void
}

export function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  searchQuery,
  setSearchQuery,
  mode,
  setMode,
  isCollapsed,
  contacts = [],
  selectedContactId,
  onSelectContact,
  conversations = [],
  onSelectConversation,
  onSelectAiChat,
  isAiChatSelected,
  onSelectTask,
  isTaskSelected,
  onSelectFile,
  isFileSelected,
  userFolders = DEFAULT_USER_FOLDERS,
  selectedFolderId,
  onSelectFolder,
  onUploadFileClick,
  onSelectEmailSettings,
  isEmailSettingsSelected,
  onSelectNotificationMode,
  onSelectNotification,
  selectedNotificationId,
  isNotificationSelected,
  activeTab,
  onTabChange,
  onSelectMailTab,
  onSelectChatTab,
  sectionMode = 'mail',
  onSectionModeChange,
  onComposeChange,
  isEmailsLoading,
  emailsError,
  hasMore,
  isLoadingMore,
  onLoadMore,
  page = 1,
  limit = 20,
  total = 0,
  onPrevPage,
  onNextPage,
}: EmailListProps) {
  const { notifications, unreadCount } = useNotificationStore()
  const storeVouchers = useVoucherStore((state) => state.vouchers)
  const [dbVouchers, setDbVouchers] = useState<SavedVoucher[]>([])
  const [selectedAccount] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('mail')
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set())

  const toggleFolderExpand = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedFolderIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  // Keep categoryFilter in sync with parent flags
  useEffect(() => {
    if (isAiChatSelected) {
      if (categoryFilter !== 'ai-assistant') {
        setCategoryFilter('ai')
      }
    } else if (isTaskSelected) {
      setCategoryFilter('tasks')
    } else if (isFileSelected) {
      setCategoryFilter('vouchers')
    } else if (isNotificationSelected) {
      setCategoryFilter('notification')
    } else if (sectionMode === 'chat') {
      setCategoryFilter('chat')
    } else if (categoryFilter !== 'ai-assistant' && categoryFilter !== 'ai') {
      setCategoryFilter('mail')
    }
  }, [isAiChatSelected, isTaskSelected, isFileSelected, isNotificationSelected, sectionMode])

  const setSectionMode = (newMode: SectionMode) => onSectionModeChange?.(newMode)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (
      scrollHeight - (scrollTop + clientHeight) < 80 &&
      hasMore &&
      !isLoadingMore &&
      !isEmailsLoading
    ) {
      onLoadMore?.()
    }
  }

  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications
    const q = searchQuery.trim().toLowerCase()
    return notifications.filter((notif) => {
      const senderName =
        notif.message_text.split(' send you a msg')[0] || 'Someone'
      return (
        senderName.toLowerCase().includes(q) ||
        notif.message_text.toLowerCase().includes(q)
      )
    })
  }, [notifications, searchQuery])

  const isSearchingFolders =
    categoryFilter === 'vouchers' && Boolean(searchQuery && searchQuery.trim())
  const folderSearchTerm = searchQuery.trim().toLowerCase()

  const filteredUserFolders = useMemo(() => {
    if (!isSearchingFolders) return userFolders
    return userFolders.filter(
      (folder) =>
        folder.name.toLowerCase().includes(folderSearchTerm) ||
        folder.path.toLowerCase().includes(folderSearchTerm) ||
        folder.section.toLowerCase().includes(folderSearchTerm)
    )
  }, [userFolders, isSearchingFolders, folderSearchTerm])

  // Fetch real vouchers from DB API with background polling for live updates
  useEffect(() => {
    let cancelled = false

    const loadFiles = () => {
      fetch('/api/vouchers')
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (cancelled || !json?.data) return
          const mapped: SavedVoucher[] = json.data.map((v: any) => ({
            id: v.id,
            voucherNo: v.voucher_no,
            date: new Date(v.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            from: v.vendor_name || 'Vendor',
            userName:
              v.user_name || v.customer_name || v.vendor_name || 'Aman',
            status: v.status || 'Active',
            fileName: v.file_name,
            originalFileUrl: v.original_file_url || undefined,
            editedFileUrl: v.edited_file_url || undefined,
            editedJson: v.edited_json || null,
            pdfUrl: v.edited_file_url || v.original_file_url || undefined,
            createdAt: v.created_at,
          }))

          setDbVouchers(mapped)
          const storeState = useVoucherStore.getState()
          storeState.setVouchers(mapped)

          // If no file is currently selected, pick top file automatically
          if (!storeState.selectedVoucher && mapped.length > 0) {
            const sorted = [...mapped].sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return timeB - timeA
            })
            storeState.setSelectedVoucher(sorted[0])
          }
        })
        .catch(() => {
          /* Keep store vouchers */
        })
    }

    loadFiles()
    const interval = setInterval(loadFiles, 3000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const filtered = useMemo(() => {
    return emails.filter((email) => {
      const matchesSearch =
        email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesMode = mode === 'done' ? email.done : !email.done

      const matchesAccount =
        selectedAccount === 'all' || email.email === selectedAccount

      return matchesSearch && matchesMode && matchesAccount
    })
  }, [emails, searchQuery, mode, selectedAccount])

  const mailItems = useMemo(() => {
    return filtered.filter((e) => !e.isChat)
  }, [filtered])

  const chatItems = useMemo(() => {
    const conversationItems: Email[] = conversations.map((conversation) => ({
      id: `conversation-${conversation.id}`,
      name: conversation.name || 'Conversation',
      email: '',
      replyTo: '',
      subject: '',
      preview: conversation.lastMessage?.message || '',
      body: '',
      date: conversation.lastMessage?.created_at
        ? new Date(conversation.lastMessage.created_at)
        : new Date(conversation.created_at),
      read: !conversation.unreadCount,
      labels: ['chat'],
      avatarInitials: (conversation.name || 'Chat')
        .slice(0, 2)
        .toUpperCase(),
      from: undefined,
      isChat: true,
      chatData: {
        name: conversation.name || 'Conversation',
        avatar: conversation.image || '',
        membersCount: conversation.members?.length || 0,
        onlineCount: 0,
        messages: conversation.lastMessage
          ? [
              {
                id: conversation.lastMessage.id,
                sender: '',
                content:
                  conversation.lastMessage.message ||
                  conversation.lastMessage.file_name ||
                  'Attachment',
                time: new Date(conversation.lastMessage.created_at),
                isOwn: false,
                avatarInitials: (conversation.name || 'Chat')
                  .slice(0, 2)
                  .toUpperCase(),
              },
            ]
          : [],
      },
    }))
    const conversationContactIds = new Set(
      conversations.flatMap(
        (conversation) =>
          conversation.members?.map((member) => member.id) || []
      )
    )
    const contactItems: Email[] = contacts
      .filter((contact) => !conversationContactIds.has(contact.contactUserId))
      .map((contact) => ({
        id: `contact-${contact.id}`,
        name: contact.nickname || contact.fullName,
        email: contact.email,
        replyTo: contact.email,
        subject: '',
        preview: '',
        body: '',
        date: contact.createdAt ? new Date(contact.createdAt) : new Date(),
        read: true,
        labels: ['chat'],
        avatarInitials: (contact.nickname || contact.fullName)
          .slice(0, 2)
          .toUpperCase(),
        from: undefined,
        isChat: true,
        chatData: {
          name: contact.nickname || contact.fullName,
          avatar: contact.avatarUrl || '',
          membersCount: 1,
          onlineCount: contact.status === 'Active' ? 1 : 0,
          messages: [],
        },
      }))
    const normalizedChatSearch = searchQuery.trim().toLowerCase()
    return [...conversationItems, ...contactItems].filter(
      (item) =>
        !normalizedChatSearch ||
        item.name.toLowerCase().includes(normalizedChatSearch) ||
        item.preview.toLowerCase().includes(normalizedChatSearch)
    )
  }, [conversations, contacts, searchQuery])

  return (
    <div className='flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background'>
      <div className='shrink-0 border-b border-border bg-background px-3 pt-2 pb-1.5 flex flex-col gap-1.5'>
        {/* 1. Header: Messages title + Settings + Bell (Desktop only) */}
        <SidebarHeader
          isEmailSettingsSelected={isEmailSettingsSelected}
          isNotificationSelected={
            categoryFilter === 'notification' || isNotificationSelected
          }
          unreadCount={unreadCount}
          onSelectEmailSettings={onSelectEmailSettings}
          onSelectNotification={() => {
            setCategoryFilter((prev) =>
              prev === 'notification' ? 'mail' : 'notification'
            )
            onSelectNotificationMode?.()
          }}
        />

        {/* 2. Toolbar (Horizontal Icon Navigation) */}
        <CategoryToolbar
          categoryFilter={categoryFilter}
          onSelectTasks={() => {
            setCategoryFilter('tasks')
            setSectionMode('mail')
            onSelectMailTab?.()
          }}
          onSelectMail={() => {
            setCategoryFilter('mail')
            setSectionMode('mail')
            onSelectMailTab?.()
            if (
              activeTab === 'chats' ||
              activeTab === 'contact' ||
              activeTab === 'groups' ||
              activeTab === 'folder' ||
              activeTab === 'chat-contact' ||
              activeTab === 'chat-groups' ||
              activeTab === 'chat-folder' ||
              activeTab === 'ai-chat' ||
              activeTab === 'ai-recent' ||
              activeTab === 'ai-prompts'
            ) {
              onTabChange?.('inbox')
              setMode('inbox')
            }
          }}
          onSelectChat={() => {
            setCategoryFilter('chat')
            setSectionMode('chat')
            onSelectChatTab?.()
            onTabChange?.('chats')
          }}
          onSelectAi={() => {
            setCategoryFilter('ai')
            setSectionMode('mail')
            onSelectMailTab?.()
            onTabChange?.('ai-chat')
          }}
          onSelectAiAssistant={() => {
            setCategoryFilter('ai-assistant')
            setSectionMode('mail')
            onSelectMailTab?.()
            onTabChange?.('ai-chat')
          }}
          onSelectVouchers={() => {
            setCategoryFilter('vouchers')
            setSectionMode('mail')
            onSelectMailTab?.()
            onTabChange?.('vouchers')
          }}
        />

        {/* 3. Sub-Tabs Bar */}
        <SubTabsBar
          categoryFilter={categoryFilter}
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          total={total}
          page={page}
          limit={limit}
          hasMore={hasMore}
          isEmailsLoading={isEmailsLoading}
          onTabChange={onTabChange}
          onModeChange={setMode}
          onSectionModeChange={setSectionMode}
          onSelectFile={onSelectFile}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
        />

        {/* 4. Search input + Action Buttons */}
        <SidebarSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isCollapsed={isCollapsed}
          categoryFilter={categoryFilter}
          sectionMode={sectionMode}
          onComposeChange={onComposeChange}
          onUploadFileClick={onUploadFileClick}
        />
      </div>

      {/* 5. Scrollable Content Area */}
      <div
        onScroll={handleScroll}
        className='min-h-0 flex-1 scrollbar-thin overflow-y-auto bg-background'
      >
        <div className='flex flex-col gap-0 py-0.5'>
          {isEmailsLoading ? (
            <EmailListSkeleton />
          ) : emailsError ? (
            <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-1.5'>
              <span className='text-sm font-semibold text-destructive'>
                Unable to load emails
              </span>
              <span className='text-xs text-muted-foreground/60 max-w-[200px] break-words'>
                {emailsError}
              </span>
            </div>
          ) : filtered.length === 0 && contacts.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground'>
              <p className='text-sm font-medium'>No messages found</p>
              <p className='mt-1 text-xs text-muted-foreground/60'>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              {/* Mail section */}
              {categoryFilter === 'mail' && (
                <>
                  {!isCollapsed && mailItems.length > 0 && (
                    <div className='flex items-center gap-2 px-3 pt-1.5 pb-0.5'>
                      <Mail className='h-3 w-3 shrink-0 text-indigo-500' />
                      <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                        {activeTab === 'send' || mode === 'done'
                          ? 'Sent Mails'
                          : 'Inbox Mails'}
                      </span>
                      <div className='h-px flex-1 bg-border' />
                      <span className='text-[10px] text-muted-foreground/50'>
                        {mailItems.length}
                      </span>
                    </div>
                  )}
                  {mailItems.length === 0 ? (
                    <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground'>
                      <p className='text-sm font-medium'>No emails found</p>
                      <p className='mt-1 text-xs text-muted-foreground/60'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                    mailItems.map((email) => (
                      <EmailCardItem
                        key={email.id}
                        email={email}
                        isSelected={selectedEmailId === email.id}
                        isCollapsed={isCollapsed}
                        onSelect={onSelectEmail}
                      />
                    ))
                  )}
                </>
              )}

              {/* Chat section */}
              {categoryFilter === 'chat' && (
                <>
                  {!isCollapsed && chatItems.length > 0 && (
                    <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                      <MessageSquare className='h-3 w-3 shrink-0 text-emerald-500' />
                      <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                        Chats
                      </span>
                      <div className='h-px flex-1 bg-border' />
                      <span className='text-[10px] text-muted-foreground/50'>
                        {chatItems.length}
                      </span>
                    </div>
                  )}
                  {chatItems.length === 0 ? (
                    <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground'>
                      <p className='text-sm font-medium'>No chats found</p>
                      <p className='mt-1 text-xs text-muted-foreground/60'>
                        Try adjusting your search or start a new conversation
                      </p>
                    </div>
                  ) : (
                    chatItems.map((item) => {
                      const contact = contacts.find(
                        (c) => `contact-${c.id}` === item.id
                      )
                      const conversation = conversations.find(
                        (c) => `conversation-${c.id}` === item.id
                      )
                      const isSelected = contact
                        ? selectedContactId === item.id
                        : conversation
                          ? selectedContactId === item.id
                          : selectedEmailId === item.id

                      return (
                        <ChatCardItem
                          key={item.id}
                          email={item}
                          isSelected={isSelected}
                          isCollapsed={isCollapsed}
                          onSelect={() => {
                            if (conversation) {
                              onSelectConversation?.(conversation)
                            } else if (contact) {
                              onSelectContact?.(contact)
                            } else {
                              onSelectEmail(item)
                            }
                          }}
                        />
                      )
                    })
                  )}
                </>
              )}

              {/* Notification cards */}
              {categoryFilter === 'notification' && onSelectNotification && (
                <>
                  {!isCollapsed && (
                    <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                      <Bell className='h-3 w-3 shrink-0 text-indigo-500' />
                      <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                        Notifications
                      </span>
                      <div className='h-px flex-1 bg-border' />
                      <span className='text-[10px] text-muted-foreground/50'>
                        {filteredNotifications.length}
                      </span>
                    </div>
                  )}
                  {filteredNotifications.length === 0 ? (
                    <div className='mx-3 my-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
                      <Bell className='mx-auto h-7 w-7 opacity-30 mb-2 text-indigo-500' />
                      <p className='font-semibold text-foreground/80'>
                        No notifications
                      </p>
                      <p className='text-[11px] opacity-70 mt-0.5'>
                        {searchQuery
                          ? `No notifications matching "${searchQuery}"`
                          : 'You have no notifications at this time.'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => (
                      <NotificationCardItem
                        key={notif.id}
                        notification={notif}
                        isSelected={Boolean(
                          isNotificationSelected &&
                            selectedNotificationId === notif.id
                        )}
                        onSelect={(n) => {
                          setCategoryFilter('notification')
                          onSelectNotification(n)
                        }}
                      />
                    ))
                  )}
                </>
              )}

              {/* AI Chat & AI Assistant section */}
              {(categoryFilter === 'ai' ||
                categoryFilter === 'ai-assistant') &&
                onSelectAiChat && (
                  <>
                    {!isCollapsed && (
                      <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                        {categoryFilter === 'ai' ? (
                          <Sparkles className='h-3 w-3 shrink-0 text-indigo-500' />
                        ) : (
                          <Bot className='h-3 w-3 shrink-0 text-indigo-500' />
                        )}
                        <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                          {categoryFilter === 'ai'
                            ? 'AI Chat'
                            : 'AI Assistant'}
                        </span>
                        <div className='h-px flex-1 bg-border' />
                      </div>
                    )}

                    {activeTab === 'ai-recent' ? (
                      <div className='mx-3 my-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
                        <Bot className='mx-auto h-7 w-7 opacity-30 mb-2 text-indigo-500' />
                        <p className='font-semibold text-foreground/80'>
                          Recent AI Chats
                        </p>
                        <p className='text-[11px] opacity-70 mt-0.5'>
                          Coming Soon
                        </p>
                      </div>
                    ) : activeTab === 'ai-prompts' ? (
                      <div className='mx-3 my-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
                        <Sparkles className='mx-auto h-7 w-7 opacity-30 mb-2 text-indigo-500' />
                        <p className='font-semibold text-foreground/80'>
                          My Prompts
                        </p>
                        <p className='text-[11px] opacity-70 mt-0.5'>
                          Coming Soon
                        </p>
                      </div>
                    ) : (
                      <AiCardItem
                        isSelected={isAiChatSelected || false}
                        onSelect={onSelectAiChat}
                      />
                    )}
                  </>
                )}

              {/* Task / Kanban card */}
              {categoryFilter === 'tasks' && onSelectTask && (
                <>
                  {!isCollapsed && (
                    <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                      <ClipboardList className='h-3 w-3 shrink-0 text-purple-500' />
                      <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                        Tasks
                      </span>
                      <div className='h-px flex-1 bg-border' />
                    </div>
                  )}
                  <TaskCardItem
                    isSelected={isTaskSelected || false}
                    onSelect={onSelectTask}
                  />
                </>
              )}

              {/* Storage Folders List for File Tab (File Explorer) */}
              {categoryFilter === 'vouchers' && onSelectFile && (
                <>
                  {!isCollapsed && (
                    <div className='flex items-center justify-between px-3 pt-2 pb-0.5'>
                      <div className='flex items-center gap-1.5'>
                        <FolderOpen className='h-3 w-3 shrink-0 text-indigo-500' />
                        <span className='text-[10px] font-semibold text-muted-foreground/60 uppercase'>
                          File Explorer
                        </span>
                      </div>
                      <span className='text-[10px] text-muted-foreground/50'>
                        {userFolders.length}
                      </span>
                    </div>
                  )}

                  {activeTab === 'file-recent' ? (
                    <div className='mx-3 my-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
                      <FileText className='mx-auto h-7 w-7 opacity-30 mb-2 text-indigo-500' />
                      <p className='font-semibold text-foreground/80'>
                        Recent Files
                      </p>
                      <p className='text-[11px] opacity-70 mt-0.5'>
                        Coming Soon
                      </p>
                    </div>
                  ) : (
                    <div className='flex flex-col gap-0.5 px-2 py-1'>
                      {filteredUserFolders.length === 0 && isSearchingFolders ? (
                        <div className='py-4 px-3 text-center text-xs text-muted-foreground'>
                          No folders matching "{searchQuery}"
                        </div>
                      ) : (
                        filteredUserFolders.map((folder) => {
                          const isFolderActive =
                            selectedFolderId === folder.id
                          const isLevel0 = folder.level === 0
                          const isLevel1 = folder.level === 1
                          const isLevel2 = folder.level === 2

                          const isExpanded = expandedFolderIds.has(folder.id)
                          const isVisible =
                            isSearchingFolders ||
                            isLevel0 ||
                            (isLevel1 && expandedFolderIds.has('Chat')) ||
                            (isLevel2 &&
                              expandedFolderIds.has('Chat') &&
                              expandedFolderIds.has(folder.parentId || ''))

                          if (!isVisible) return null

                          return (
                            <FolderTreeItem
                              key={folder.id}
                              folder={folder}
                              isFolderActive={isFolderActive}
                              isExpanded={isExpanded}
                              onToggleExpand={toggleFolderExpand}
                              onSelectFolder={(f) => {
                                onSelectFolder?.(f)
                                onSelectFile?.()
                              }}
                            />
                          )
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {isLoadingMore && (
            <div className='p-2.5 space-y-2 animate-pulse'>
              <div className='flex flex-col rounded-xl border border-border/40 bg-card/60 p-3.5 space-y-2 shadow-2xs'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                    <div className='h-6 w-6 rounded-full shrink-0 bg-muted/70' />
                    <div className='h-3 w-28 rounded-sm bg-muted/70' />
                  </div>
                  <div className='h-2.5 w-10 rounded-xs shrink-0 bg-muted/50' />
                </div>
                <div className='h-3 w-2/3 rounded-sm bg-muted/80' />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
