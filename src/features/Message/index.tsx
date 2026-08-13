'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Mail, MessageSquare, Plus, MoreVertical, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LinksTab } from '@/features/email-settings/components/accounts-tab'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Search } from '@/components/search'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { useConversation } from '@/features/chattemplate/chat/hooks/use-conversation'
import { useRealtime } from '@/features/chattemplate/chat/hooks/use-realtime'
import {
  createGroupConversation,
  getOrCreateDirectConversation,
  getUserConversations,
} from '@/features/chattemplate/chat/repositories/conversation-repository'
import { getOrCreateProfileForContact } from '@/features/chattemplate/chat/repositories/profile-repository'
import { ensureProfileExists } from '@/features/chattemplate/chat/repositories/profile-repository'
import {
  Conversation,
  Message,
} from '@/features/chattemplate/chat/types/chat.types'
import { getUserContacts } from '@/features/chattemplate/contacts/repositories/contact-repository'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { Group } from '@/features/chattemplate/groups/types/group.types'
import { ChatAttachment, ChatMessage, ChatView } from './components/chat/chat-view'
import { RealtimeChatView } from './components/chat/realtime-chat-view'
import { EmailList } from './components/emails/email-list'
import { EmailView } from './components/emails/email-view'
import { NewEmail } from './components/emails/new-email'
import { ContactManagerTab } from './components/tabs/contact-manager-tab'
import { GroupManagerTab } from './components/tabs/group-manager-tab'
import { AiChatPanel } from './components/panels/ai-chat-panel'
import { MessageEmailSettings } from './components/panels/message-email-settings'
import { NotificationDetailPanel, ChatMessageDetail } from './components/panels/notification-detail-panel'
import { createClient } from '@/lib/supabase/client'
import { DbNotification } from '@/stores/notification-store'
import { HeaderActions } from './components/chat/header-actions'
import CalendarTemplate from '@/features/calendartemplate'
import KanbanTemplate from '@/features/kanbantemplate'
import { emails as initialEmails, Email } from './data/emails'
import dynamic from 'next/dynamic'
import { InvoiceMaker } from '../vouchers/components/invoice-maker'
import { ReviewPanel } from '@/components/dynamic-form/ReviewPanel'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'
import { useVoucherStore } from '@/stores/voucher-store'


interface DirectoryChat {
  id: string
  conversationId?: string
  kind: 'contact' | 'group'
  name: string
  avatar?: string
  membersCount?: number
  onlineCount?: number
}

export default function MessageFeature() {
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState<'inbox' | 'done'>('inbox')
  const [activeTab, setActiveTab] = useState('inbox')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [isEmailsLoading, setIsEmailsLoading] = useState(false)
  const [emailsError, setEmailsError] = useState<string | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedDirectoryChat, setSelectedDirectoryChat] =
    useState<DirectoryChat | null>(null)
  const [directoryMessages, setDirectoryMessages] = useState<
    Record<string, ChatMessage[]>
  >({})
  const [isAiChatOpen, setIsAiChatOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isKanbanOpen, setIsKanbanOpen] = useState(false)
  const [isFileOpen, setIsFileOpen] = useState(false)
  const selectedVoucher = useVoucherStore((state) => state.selectedVoucher)
  const [previewAttachment, setPreviewAttachment] = useState<{ fileName: string; fileUrl: string } | null>(null)
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<DbNotification | null>(null)
  const [selectedNotificationMessage, setSelectedNotificationMessage] = useState<ChatMessageDetail | null>(null)
  const [isFetchingNotificationMessage, setIsFetchingNotificationMessage] = useState(false)
  const currentUser = useAuthStore((state) => state.auth.user)
  const router = useRouter()
  const { unreadCount } = useNotificationStore()
  const { conversations, setConversations, loadConversations } =
    useConversation()

  useEffect(() => {
    setIsSidebarCollapsed(
      localStorage.getItem('message_sidebar_collapsed') === 'true'
    )
  }, [])

  useEffect(() => {
    if (!currentUser) return
    void ensureProfileExists(currentUser).then(() =>
      loadConversations(currentUser.accountNo)
    )
  }, [currentUser, loadConversations])

  const handleGlobalMessageInsert = useCallback(
    (message: Message) => {
      setConversations((previous) => {
        const existing = previous.find(
          (conversation) => conversation.id === message.conversation_id
        )
        if (!existing) {
          if (currentUser) void loadConversations(currentUser.accountNo)
          return previous
        }
        const updated = {
          ...existing,
          lastMessage: message,
          unreadCount:
            selectedDirectoryChat?.conversationId === message.conversation_id ||
            message.sender_user_id === currentUser?.accountNo
              ? 0
              : (existing.unreadCount || 0) + 1,
        }
        return [
          updated,
          ...previous.filter(
            (conversation) => conversation.id !== message.conversation_id
          ),
        ]
      })
    },
    [
      currentUser,
      loadConversations,
      selectedDirectoryChat?.conversationId,
      setConversations,
    ]
  )

  const handleGlobalMessageUpdate = useCallback(
    (message: Message) => {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === message.conversation_id &&
          conversation.lastMessage?.id === message.id
            ? { ...conversation, lastMessage: message }
            : conversation
        )
      )
    },
    [setConversations]
  )

  useRealtime(
    currentUser?.accountNo,
    handleGlobalMessageInsert,
    handleGlobalMessageUpdate
  )

  const fetchContactsAndGroups = async () => {
    if (!currentUser) return

    try {
      const [contactsData, groupsResponse] = await Promise.all([
        getUserContacts(currentUser.accountNo),
        fetch(
          `/api/groups?email=${encodeURIComponent(currentUser.email || '')}`
        ),
      ])
      setContacts(contactsData)
      if (groupsResponse.ok) setGroups(await groupsResponse.json())
    } catch (error) {
      console.error('Failed to fetch contacts or groups:', error)
      toast.error('Failed to load contacts and groups.')
    }
  }

  const fetchInbox = async () => {
    setIsEmailsLoading(true)
    setEmailsError(null)
    try {
      const res = await fetch('/api/mail/inbox')
      const data = await res.json()
      if (data.success) {
        const mappedEmails: Email[] = data.emails.map((email: any) => ({
          id: email.id,
          name: email.fromName || email.from.split('@')[0],
          email: email.from,
          replyTo: email.from,
          subject: email.subject,
          preview: email.text ? email.text.substring(0, 100) : '',
          body: email.html || email.text || '',
          date: new Date(email.date),
          read: email.isRead,
          labels: email.isRead ? ['inbox'] : ['unread', 'inbox'],
          avatarInitials: (email.fromName || email.from)
            .split('@')[0]
            .slice(0, 2)
            .toUpperCase(),
          from: undefined,
        }))
        setEmails((prev) => {
          const chats = prev.filter((e) => e.isChat)
          return [...mappedEmails, ...chats]
        })
      } else {
        setEmailsError(data.message || 'Unable to load emails')
      }
    } catch (err: any) {
      console.error('Failed to fetch inbox:', err)
      setEmailsError('Unable to load emails')
    } finally {
      setIsEmailsLoading(false)
    }
  }

  useEffect(() => {
    void fetchContactsAndGroups()
    void fetchInbox()
  }, [currentUser?.accountNo, currentUser?.email])

  // Set default state on initial page load
  useEffect(() => {
    const storeState = useVoucherStore.getState()
    if (storeState.vouchers && storeState.vouchers.length > 0) {
      const sorted = [...storeState.vouchers].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA
      })
      storeState.setSelectedVoucher(sorted[0])
    }
  }, [])

  const handleSendDirectoryChatMessage = (
    content: string,
    attachment?: ChatAttachment
  ) => {
    if (!selectedDirectoryChat) return
    const newMessage: ChatMessage = {
      id: String(Date.now()),
      sender: 'You',
      content,
      time: new Date(),
      isOwn: true,
      avatarInitials: 'YU',
      attachment,
    }
    setDirectoryMessages((previous) => ({
      ...previous,
      [selectedDirectoryChat.id]: [
        ...(previous[selectedDirectoryChat.id] || []),
        newMessage,
      ],
    }))
  }

  const handleOpenNewMail = () => {
    setSelectedEmail(null)
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(true)
  }

  const handleSelectContact = async (contact: Contact) => {
    if (!currentUser) return
    setSelectedEmail(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(false)
    const conversationId = await getOrCreateDirectConversation(
      currentUser.accountNo,
      contact.contactUserId
    )
    if (!conversationId) {
      toast.error('Unable to open this conversation.')
      return
    }
    setSelectedDirectoryChat({
      id: `conversation-${conversationId}`,
      conversationId,
      kind: 'contact',
      name: contact.nickname || contact.fullName,
      avatar: contact.avatarUrl,
    })
    // Switch to inbox tab so the split-panel chat view renders
    setActiveTab('inbox')
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedEmail(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(false)
    setSelectedDirectoryChat({
      id: `conversation-${conversation.id}`,
      conversationId: conversation.id,
      kind: conversation.type === 'direct' ? 'contact' : 'group',
      name: conversation.name || 'Conversation',
      avatar: conversation.image,
      membersCount: conversation.members?.length,
      onlineCount: 0,
    })
  }

  const handleSelectGroup = async (group: Group) => {
    if (!currentUser) return
    let conversation = (await getUserConversations(currentUser.accountNo)).find(
      (item) =>
        item.type === 'group' &&
        item.name?.toLowerCase() === group.groupName.toLowerCase()
    )

    if (!conversation) {
      const members = await Promise.all(
        group.users.map((email) =>
          getOrCreateProfileForContact(email, email.split('@')[0])
        )
      )
      conversation =
        (await createGroupConversation(
          group.groupName,
          group.groupImage || null,
          members
            .filter((member): member is NonNullable<typeof member> =>
              Boolean(member)
            )
            .map((member) => member.id),
          currentUser.accountNo
        )) || undefined
    }

    if (!conversation) {
      toast.error('Unable to open this group conversation.')
      return
    }
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(false)
    setSelectedDirectoryChat({
      id: `group-${group.id}`,
      conversationId: conversation.id,
      kind: 'group',
      name: group.groupName,
      avatar: group.groupImage,
      membersCount: group.users.length,
      onlineCount: 0,
    })
    setActiveTab('inbox')
  }

  const handleSelectEmail = (email: Email) => {
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(false)
    setSelectedEmail(email)
    if (!email.read) {
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
      )
    }
  }

  const handleSelectNotification = async (notif: DbNotification) => {
    setSelectedEmail(null)
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(true)
    setSelectedNotification(notif)
    setIsComposing(false)
    setSelectedNotificationMessage(null)

    // Mark notification as read
    const store = useNotificationStore.getState()
    if (!notif.read) {
      void store.markAsRead(notif.id)
    }

    if (notif.message_id) {
      setIsFetchingNotificationMessage(true)
      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:profiles!sender_user_id (
              id,
              name,
              email,
              avatar
            )
          `)
          .eq('id', notif.message_id)
          .maybeSingle()

        if (!error && data) {
          setSelectedNotificationMessage(data as ChatMessageDetail)
        }
      } catch (err) {
        console.error('Error fetching notification message detail:', err)
      } finally {
        setIsFetchingNotificationMessage(false)
      }
    }
  }

  const handleSelectNotificationMode = () => {
    setSelectedEmail(null)
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(true)

    const notifications = useNotificationStore.getState().notifications
    if (notifications.length > 0 && !selectedNotification) {
      void handleSelectNotification(notifications[0])
    }
  }

  const handleDelete = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id))
    toast.success('Message deleted')
    if (selectedEmail?.id === id) setSelectedEmail(null)
  }

  const handleArchive = (id: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, done: true } : e))
    )
    toast.success('Message archived')
    if (selectedEmail?.id === id) setSelectedEmail(null)
  }

  const handleSendChatMessage = (
    content: string,
    attachment?: ChatAttachment
  ) => {
    if (!selectedEmail || !selectedEmail.chatData) return
    const newMsg = {
      id: String(Date.now()),
      sender: 'You',
      content,
      time: new Date(),
      isOwn: true,
      avatarInitials: 'YU',
      attachment,
    }
    setEmails((prev) =>
      prev.map((e) =>
        e.id === selectedEmail.id && e.chatData
          ? {
              ...e,
              chatData: {
                ...e.chatData,
                messages: [...e.chatData.messages, newMsg],
              },
            }
          : e
      )
    )
    // Keep selectedEmail in sync
    setSelectedEmail((prev) =>
      prev && prev.chatData
        ? {
            ...prev,
            chatData: {
              ...prev.chatData,
              messages: [...prev.chatData.messages, newMsg],
            },
          }
        : prev
    )
  }

  /* ── shared inbox panel ──────────────────────────────────── */
  const renderInboxPanel = (doneMode = false) => (
    <div className='flex h-full min-h-0 w-full flex-1 flex-row overflow-hidden'>
      <div
        className={cn(
          'flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border transition-all duration-300 ease-in-out',
          (selectedEmail || selectedDirectoryChat || isAiChatOpen || isCalendarOpen || isKanbanOpen || isFileOpen || isEmailSettingsOpen || isComposing) && 'hidden md:flex',
          isSidebarCollapsed ? 'w-20' : 'w-full md:w-[340px] lg:w-[380px]'
        )}
      >
        <EmailList
          emails={emails}
          selectedEmailId={selectedEmail?.id ?? null}
          onSelectEmail={handleSelectEmail}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          mode={doneMode ? 'done' : 'inbox'}
          setMode={setMode}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() =>
            setIsSidebarCollapsed((collapsed) => {
              const next = !collapsed
              localStorage.setItem('message_sidebar_collapsed', String(next))
              return next
            })
          }
          isComposing={isComposing}
          onComposeChange={(composing) => {
            if (composing) handleOpenNewMail()
            else setIsComposing(false)
          }}
          isEmailsLoading={isEmailsLoading}
          emailsError={emailsError}
          contacts={contacts}
          selectedContactId={
            selectedDirectoryChat ? selectedDirectoryChat.id : null
          }
          onSelectContact={handleSelectContact}
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onSelectAiChat={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsCalendarOpen(false)
            setIsKanbanOpen(false)
            setIsFileOpen(false)
            setIsEmailSettingsOpen(false)
            setIsNotificationOpen(false)
            setSelectedNotification(null)
            setIsComposing(false)
            setIsAiChatOpen(true)
          } : undefined}
          isAiChatSelected={isAiChatOpen}
          onSelectCalendar={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsAiChatOpen(false)
            setIsKanbanOpen(false)
            setIsFileOpen(false)
            setIsEmailSettingsOpen(false)
            setIsNotificationOpen(false)
            setSelectedNotification(null)
            setIsComposing(false)
            setIsCalendarOpen(true)
          } : undefined}
          isCalendarSelected={isCalendarOpen}
          onSelectTask={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsAiChatOpen(false)
            setIsCalendarOpen(false)
            setIsFileOpen(false)
            setIsEmailSettingsOpen(false)
            setIsNotificationOpen(false)
            setSelectedNotification(null)
            setIsComposing(false)
            setIsKanbanOpen(true)
          } : undefined}
          isTaskSelected={isKanbanOpen}
          onSelectFile={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsAiChatOpen(false)
            setIsCalendarOpen(false)
            setIsKanbanOpen(false)
            setIsEmailSettingsOpen(false)
            setIsNotificationOpen(false)
            setSelectedNotification(null)
            setIsComposing(false)
            setIsFileOpen(true)

            // Automatically select top (latest) file as default ONLY if no file is currently selected
            const storeState = useVoucherStore.getState()
            if (!storeState.selectedVoucher && storeState.vouchers && storeState.vouchers.length > 0) {
              const sorted = [...storeState.vouchers].sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return timeB - timeA
              })
              storeState.setSelectedVoucher(sorted[0])
            }
          } : undefined}
          isFileSelected={isFileOpen}
          onSelectEmailSettings={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsAiChatOpen(false)
            setIsCalendarOpen(false)
            setIsKanbanOpen(false)
            setIsFileOpen(false)
            setIsNotificationOpen(false)
            setSelectedNotification(null)
            setIsComposing(false)
            setIsEmailSettingsOpen(true)
          } : undefined}
          isEmailSettingsSelected={isEmailSettingsOpen}
          onSelectNotificationMode={!doneMode ? handleSelectNotificationMode : undefined}
          onSelectNotification={!doneMode ? handleSelectNotification : undefined}
          selectedNotificationId={selectedNotification?.id ?? null}
          isNotificationSelected={isNotificationOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* RIGHT: detail / chat view */}
      <div
        className={cn(
          'relative flex h-full min-h-0 flex-1 flex-col overflow-hidden',
          !selectedEmail && !selectedDirectoryChat && !isAiChatOpen && !isCalendarOpen && !isKanbanOpen && !isFileOpen && !isEmailSettingsOpen && !isNotificationOpen && !previewAttachment && !isComposing && 'hidden md:flex'
        )}
      >
        {/* Mobile back button (only for email view — chat has its own) */}
        {selectedEmail && !selectedEmail.isChat && (
          <button
            onClick={() => setSelectedEmail(null)}
            className='absolute top-3 left-4 z-50 shrink-0 rounded-full border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted md:hidden'
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
        )}

        {previewAttachment ? (
          <SafeDocumentPreview
            fileName={previewAttachment.fileName}
            fileUrl={previewAttachment.fileUrl}
            onClose={() => setPreviewAttachment(null)}
            hideToggle={true}
          />
        ) : isComposing ? (
          <NewEmail
            onCancel={() => setIsComposing(false)}
            onPreviewAttachment={(att) => setPreviewAttachment({ fileName: att.name, fileUrl: att.url || '' })}
            onSend={(emailData) => {
              const newEmail: Email = {
                id: String(Date.now()),
                from: undefined,
                name: 'Me',
                email: 'user@example.com',
                replyTo: 'user@example.com',
                subject: emailData.subject || '(No Subject)',
                preview: emailData.body
                  ? emailData.body.replace(/<[^>]*>/g, '').substring(0, 100)
                  : '(No Content)',
                body: emailData.body || '',
                date: new Date(),
                read: true,
                labels: ['sent'],
                avatarInitials: 'ME',
                done: true,
              }
              setEmails((prev) => [newEmail, ...prev])
              fetchInbox()
              setIsComposing(false)
            }}
            onSaveDraft={() => {
              toast.success('Draft saved!')
              setIsComposing(false)
            }}
          />
        ) : isNotificationOpen && selectedNotification ? (
          <NotificationDetailPanel
            notification={selectedNotification}
            messageDetail={selectedNotificationMessage}
            isLoadingMessage={isFetchingNotificationMessage}
            onClose={() => {
              setIsNotificationOpen(false)
              setSelectedNotification(null)
            }}
          />
        ) : isEmailSettingsOpen ? (
          <MessageEmailSettings
            contacts={contacts}
            groups={groups}
            onRefreshContactsAndGroups={fetchContactsAndGroups}
            onSelectContact={handleSelectContact}
            onSelectGroup={handleSelectGroup}
            onBack={() => setIsEmailSettingsOpen(false)}
            onClose={() => setIsEmailSettingsOpen(false)}
          />
        ) : isAiChatOpen ? (
          <AiChatPanel onBack={() => setIsAiChatOpen(false)} />
        ) : isCalendarOpen ? (
          <CalendarTemplate embedded onBack={() => setIsCalendarOpen(false)} />
        ) : isKanbanOpen ? (
          <KanbanTemplate embedded onBack={() => setIsKanbanOpen(false)} />
        ) : isFileOpen ? (
          <SafeDocumentPreview
            key={`${selectedVoucher?.id || 'doc'}-${selectedVoucher?._selectedAt || 0}`}
            fileName={selectedVoucher?.fileName || 'invoice.pdf'}
            fileUrl={selectedVoucher?.editedFileUrl || selectedVoucher?.pdfUrl || selectedVoucher?.originalFileUrl}
            editedJson={selectedVoucher?.editedJson}
            onClose={() => setIsFileOpen(false)}
            hideToggle={true}
          />
        ) : selectedDirectoryChat ? (

          selectedDirectoryChat.conversationId ? (
            <RealtimeChatView
              conversationId={selectedDirectoryChat.conversationId}
              chatName={selectedDirectoryChat.name}
              chatAvatar={selectedDirectoryChat.avatar}
              conversation={conversations.find(
                (c) => c.id === selectedDirectoryChat.conversationId
              )}
              onBack={() => setSelectedDirectoryChat(null)}
            />
          ) : (
            <ChatView
              chatName={selectedDirectoryChat.name}
              chatAvatar={selectedDirectoryChat.avatar}
              messages={directoryMessages[selectedDirectoryChat.id] || []}
              onBack={() => setSelectedDirectoryChat(null)}
              onSendMessage={handleSendDirectoryChatMessage}
              currentUser={currentUser}
            />
          )
        ) : selectedEmail && selectedEmail.isChat && selectedEmail.chatData ? (
          <ChatView
            chatName={selectedEmail.chatData.name}
            chatAvatar={selectedEmail.chatData.avatar}
            membersCount={selectedEmail.chatData.membersCount}
            onlineCount={selectedEmail.chatData.onlineCount}
            messages={selectedEmail.chatData.messages}
            onBack={() => setSelectedEmail(null)}
            onSendMessage={handleSendChatMessage}
            currentUser={currentUser}
          />
        ) : selectedEmail ? (
          <EmailView
            email={selectedEmail}
            onBack={() => setSelectedEmail(null)}
            onDelete={handleDelete}
            onPreviewAttachment={(att) => setPreviewAttachment({ fileName: att.name, fileUrl: att.url || '' })}
          />
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-3 bg-background p-8 text-muted-foreground'>
            <MessageSquare className='h-10 w-10 opacity-20' />
            <p className='text-sm'>Select a message to view its content</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile-only global top header */}
      <div
        className={cn(
          'md:hidden',
          (selectedEmail ||
            selectedDirectoryChat ||
            isAiChatOpen ||
            isCalendarOpen ||
            isKanbanOpen ||
            isFileOpen ||
            isEmailSettingsOpen ||
            previewAttachment) &&
            'hidden'
        )}
      >
        <AppHeader title='Messages' />
      </div>

      <Main
        fixed
        className='flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background p-0 sm:px-4 sm:py-0'
      >


        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'
        >
          <TabsContent
            value='inbox'
            className='mt-0 flex h-full min-h-0 flex-1 flex-row overflow-hidden bg-background focus-visible:outline-none'
          >
            {renderInboxPanel()}
          </TabsContent>

          <TabsContent
            value='send'
            className='mt-0 flex h-full min-h-0 flex-1 flex-row overflow-hidden bg-background focus-visible:outline-none'
          >
            {renderInboxPanel(true)}
          </TabsContent>

          <TabsContent
            value='folder'
            className='mt-0 flex flex-1 flex-col items-center justify-start overflow-y-auto bg-transparent focus-visible:outline-none p-3 sm:p-6 lg:p-8'
          >
            <div className='w-full max-w-3xl mx-auto'>
              <LinksTab />
            </div>
          </TabsContent>

          <TabsContent
            value='contact'
            className='mt-0 flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto bg-transparent focus-visible:outline-none p-3 sm:p-6 lg:p-8'
          >
            <ContactManagerTab
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectContact={handleSelectContact}
            />
          </TabsContent>

          <TabsContent
            value='groups'
            className='mt-0 flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto bg-transparent focus-visible:outline-none p-3 sm:p-6 lg:p-8'
          >
            <GroupManagerTab
              groups={groups}
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectGroup={handleSelectGroup}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
