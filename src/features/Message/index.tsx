'use client'

import { useCallback, useEffect, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ComingSoon } from '@/components/coming-soon'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore, DbNotification } from '@/stores/notification-store'
import { useVoucherStore } from '@/stores/voucher-store'
import { cn } from '@/lib/utils'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { useConversation } from '@/features/chattemplate/chat/hooks/use-conversation'
import { useRealtime } from '@/features/chattemplate/chat/hooks/use-realtime'
import {
  createGroupConversation,
  getOrCreateDirectConversation,
  getUserConversations,
} from '@/features/chattemplate/chat/repositories/conversation-repository'
import {
  getOrCreateProfileForContact,
  ensureProfileExists,
} from '@/features/chattemplate/chat/repositories/profile-repository'
import {
  Conversation,
  Message,
} from '@/features/chattemplate/chat/types/chat.types'
import { getUserContacts } from '@/features/chattemplate/contacts/repositories/contact-repository'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { Group } from '@/features/chattemplate/groups/types/group.types'
import { createClient } from '@/lib/supabase/client'
import CalendarTemplate from '@/features/calendartemplate'
import KanbanTemplate from '@/features/kanbantemplate'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'
import { emails as initialEmails, Email } from './data/emails'
import {
  getUserStorageFilesAndFolders,
  StorageFileItem,
  UserFolder,
  DEFAULT_USER_FOLDERS,
} from './services/user-storage-files.service'
import {
  DirectoryChat,
  ChatMessage,
  ChatAttachment,
} from './types'
import {
  ChatView,
  RealtimeChatView,
  EmailList,
  EmailView,
  NewEmail,
  MsgContactTab,
  MsgGroupTab,
  AiChatPanel,
  MessageEmailSettings,
  NotificationDetailPanel,
  UserFileCardsView,
  FileUploadForm,
} from './components'
import { ChatMessageDetail } from './components/panels/notification-detail-panel'

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
  const [hasFetchedMail, setHasFetchedMail] = useState(false)
  const [sentEmails, setSentEmails] = useState<Email[]>([])
  const [isSentLoading, setIsSentLoading] = useState(false)
  const [sentError, setSentError] = useState<string | null>(null)
  const [inboxPage, setInboxPage] = useState(1)
  const [hasMoreInbox, setHasMoreInbox] = useState(true)
  const [isLoadingMoreInbox, setIsLoadingMoreInbox] = useState(false)
  const [sentPage, setSentPage] = useState(1)
  const [hasMoreSent, setHasMoreSent] = useState(true)
  const [isLoadingMoreSent, setIsLoadingMoreSent] = useState(false)
  const [totalInbox, setTotalInbox] = useState(0)
  const [totalSent, setTotalSent] = useState(0)
  const [sectionMode, setSectionMode] = useState<'mail' | 'chat'>('mail')
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
  const currentUser = useAuthStore((state) => state.auth.user)
  const [userStorageFiles, setUserStorageFiles] = useState<StorageFileItem[]>([])
  const [userFolders, setUserFolders] = useState<UserFolder[]>(DEFAULT_USER_FOLDERS)
  const [selectedUserFolder, setSelectedUserFolder] = useState<UserFolder | null>(null)
  const [activePreviewFile, setActivePreviewFile] = useState<StorageFileItem | null>(null)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const selectedVoucher = useVoucherStore((state) => state.selectedVoucher)

  useEffect(() => {
    if (currentUser?.email || isFileOpen) {
      getUserStorageFilesAndFolders(currentUser?.email)
        .then(({ files, folders }) => {
          setUserStorageFiles(files)
          setUserFolders(folders)
        })
        .catch((err) => console.warn('Failed to load user storage files:', err))
    }
  }, [currentUser?.email, isFileOpen])
  const [previewAttachment, setPreviewAttachment] = useState<{ fileName: string; fileUrl: string } | null>(null)
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<DbNotification | null>(null)
  const [selectedNotificationMessage, setSelectedNotificationMessage] = useState<ChatMessageDetail | null>(null)
  const [isFetchingNotificationMessage, setIsFetchingNotificationMessage] = useState(false)
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

  const fetchInbox = async (page = 1, append = false) => {
    if (append) {
      setIsLoadingMoreInbox(true)
    } else {
      setIsEmailsLoading(true)
      setEmailsError(null)
    }

    try {
      const res = await fetch(`/api/mail/inbox?page=${page}&limit=20`)
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
          attachments: email.attachments || [],
        }))

        setHasMoreInbox(!!data.hasMore)
        setInboxPage(page)
        if (data.total !== undefined) setTotalInbox(data.total)

        if (append) {
          setEmails((prev) => {
            const existingIds = new Set(prev.map((e) => e.id))
            const newMails = mappedEmails.filter((e) => !existingIds.has(e.id))
            return [...prev, ...newMails]
          })
        } else {
          setEmails((prev) => {
            const chats = prev.filter((e) => e.isChat)
            return [...mappedEmails, ...chats]
          })
        }
      } else {
        if (!append) setEmailsError(data.message || 'Unable to load emails')
      }
    } catch (err: any) {
      console.error('Failed to fetch inbox:', err)
      if (!append) setEmailsError('Unable to load emails')
    } finally {
      setIsEmailsLoading(false)
      setIsLoadingMoreInbox(false)
    }
  }

  const fetchSentMails = async (page = 1, append = false) => {
    if (append) {
      setIsLoadingMoreSent(true)
    } else {
      setIsSentLoading(true)
      setSentError(null)
    }

    try {
      const res = await fetch(`/api/mail/sent?page=${page}&limit=20`)
      const data = await res.json()
      if (data.success && Array.isArray(data.emails)) {
        const mappedSent: Email[] = data.emails.map((email: any) => ({
          id: `sent-${email.id}`,
          name: email.to || email.fromName || 'Recipient',
          email: email.to || email.from,
          replyTo: email.from,
          subject: email.subject,
          preview: email.text ? email.text.substring(0, 100) : '',
          body: email.html || email.text || '',
          date: new Date(email.date),
          read: true,
          labels: ['sent'],
          avatarInitials: (email.to || email.from || 'RE')
            .split('@')[0]
            .slice(0, 2)
            .toUpperCase(),
          done: true,
          from: undefined,
          attachments: email.attachments || [],
        }))

        setHasMoreSent(!!data.hasMore)
        setSentPage(page)
        if (data.total !== undefined) setTotalSent(data.total)

        if (append) {
          setSentEmails((prev) => {
            const existingIds = new Set(prev.map((e) => e.id))
            const newMails = mappedSent.filter((e) => !existingIds.has(e.id))
            return [...prev, ...newMails]
          })
        } else {
          setSentEmails(mappedSent)
        }
      } else {
        if (!append) setSentError(data.message || 'Unable to load sent emails')
      }
    } catch (err: any) {
      console.error('Failed to fetch sent emails:', err)
      if (!append) setSentError('Unable to load sent emails')
    } finally {
      setIsSentLoading(false)
      setIsLoadingMoreSent(false)
    }
  }

  const handleLoadMoreInbox = () => {
    if (!hasMoreInbox || isLoadingMoreInbox || isEmailsLoading) return
    void fetchInbox(inboxPage + 1, true)
  }

  const handleLoadMoreSent = () => {
    if (!hasMoreSent || isLoadingMoreSent || isSentLoading) return
    void fetchSentMails(sentPage + 1, true)
  }

  const handlePrevPageInbox = () => {
    if (inboxPage <= 1 || isEmailsLoading) return
    void fetchInbox(inboxPage - 1, false)
  }

  const handleNextPageInbox = () => {
    if (!hasMoreInbox || isEmailsLoading) return
    void fetchInbox(inboxPage + 1, false)
  }

  const handlePrevPageSent = () => {
    if (sentPage <= 1 || isSentLoading) return
    void fetchSentMails(sentPage - 1, false)
  }

  const handleNextPageSent = () => {
    if (!hasMoreSent || isSentLoading) return
    void fetchSentMails(sentPage + 1, false)
  }

  useEffect(() => {
    void fetchContactsAndGroups()
  }, [currentUser?.accountNo, currentUser?.email])

  // Defer SMTP Email Fetching to execute ONLY when Email tab is active
  useEffect(() => {
    const isEmailTabActive =
      !isFileOpen &&
      !isAiChatOpen &&
      !isCalendarOpen &&
      !isKanbanOpen &&
      !isEmailSettingsOpen &&
      !isNotificationOpen &&
      sectionMode === 'mail'

    if (isEmailTabActive && currentUser?.accountNo && !hasFetchedMail && !isEmailsLoading) {
      setHasFetchedMail(true)
      void fetchInbox()
      void fetchSentMails()
    }
  }, [
    isFileOpen,
    isAiChatOpen,
    isCalendarOpen,
    isKanbanOpen,
    isEmailSettingsOpen,
    isNotificationOpen,
    sectionMode,
    currentUser?.accountNo,
    hasFetchedMail,
    isEmailsLoading,
  ])

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
    setActiveTab('chats')
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
    setActiveTab('chats')
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

  const handleSelectMailTab = () => {
    setSelectedEmail(null)
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(false)
    setSectionMode('mail')
    setActiveTab('inbox')
  }

  const handleSelectChatTab = () => {
    setSelectedEmail(null)
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(false)
    setSectionMode('chat')
    setActiveTab('chats')
  }

  const handleSelectAiAssistantTab = () => {
    setSelectedEmail(null)
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setIsEmailSettingsOpen(false)
    setIsNotificationOpen(false)
    setSelectedNotification(null)
    setIsComposing(false)
    setActiveTab('ai-chat')
  }

  const isSpecialTabActive =
    activeTab === 'folder' ||
    activeTab === 'contact' ||
    activeTab === 'groups' ||
    activeTab === 'chat-contact' ||
    activeTab === 'chat-groups' ||
    activeTab === 'chat-folder' ||
    activeTab === 'ai-recent' ||
    activeTab === 'ai-prompts' ||
    activeTab === 'file-recent'

  /* ── shared inbox panel ──────────────────────────────────── */
  const renderInboxPanel = (doneMode = false) => (
    <div className='flex h-full min-h-0 w-full flex-1 flex-row overflow-hidden'>
      <div
        className={cn(
          'flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border transition-all duration-300 ease-in-out',
          (selectedEmail || selectedDirectoryChat || isAiChatOpen || isCalendarOpen || isKanbanOpen || isFileOpen || isEmailSettingsOpen || isComposing || isSpecialTabActive) && 'hidden md:flex',
          isSidebarCollapsed ? 'w-20' : 'w-full md:w-[340px] lg:w-[380px]'
        )}
      >
        <EmailList
          emails={doneMode ? (sentEmails.length > 0 ? sentEmails : emails) : emails}
          selectedEmailId={selectedEmail?.id ?? null}
          onSelectEmail={handleSelectEmail}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          mode={doneMode ? 'done' : 'inbox'}
          setMode={setMode}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            if (tab === 'contact' || tab === 'groups' || tab === 'folder' ||
                tab === 'chat-contact' || tab === 'chat-groups' || tab === 'chat-folder') {
              setSelectedDirectoryChat(null)
              setSelectedEmail(null)
            }
          }}
          onSelectMailTab={handleSelectMailTab}
          onSelectChatTab={handleSelectChatTab}
          onSelectAiAssistantTab={handleSelectAiAssistantTab}
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
          isEmailsLoading={doneMode ? isSentLoading : isEmailsLoading}
          emailsError={doneMode ? sentError : emailsError}
          hasMore={doneMode ? hasMoreSent : hasMoreInbox}
          isLoadingMore={doneMode ? isLoadingMoreSent : isLoadingMoreInbox}
          onLoadMore={doneMode ? handleLoadMoreSent : handleLoadMoreInbox}
          page={doneMode ? sentPage : inboxPage}
          limit={20}
          total={doneMode ? totalSent : totalInbox}
          onPrevPage={doneMode ? handlePrevPageSent : handlePrevPageInbox}
          onNextPage={doneMode ? handleNextPageSent : handleNextPageInbox}
          contacts={contacts}
          selectedContactId={
            selectedDirectoryChat ? selectedDirectoryChat.id : null
          }
          onSelectContact={handleSelectContact}
          groups={groups}
          onSelectGroup={handleSelectGroup}
          onRefreshContactsAndGroups={fetchContactsAndGroups}
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
          } : undefined}
          isFileSelected={isFileOpen}
          userFolders={userFolders}
          selectedFolderId={selectedUserFolder?.id ?? null}
          onSelectFolder={(folder) => {
            setSelectedUserFolder(folder)
            setActivePreviewFile(null)
            setIsUploadingFile(false)
          }}
          onUploadFileClick={() => {
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
            setActivePreviewFile(null)
            setIsUploadingFile(true)
          }}
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
          sectionMode={sectionMode}
          onSectionModeChange={setSectionMode}
        />
      </div>

      {/* RIGHT: detail / chat view */}
      <div
        className={cn(
          'relative flex h-full min-h-0 flex-1 flex-col overflow-hidden',
          !selectedEmail && !selectedDirectoryChat && !isAiChatOpen && !isCalendarOpen && !isKanbanOpen && !isFileOpen && !isEmailSettingsOpen && !isNotificationOpen && !previewAttachment && !isComposing && !isSpecialTabActive &&
          'hidden md:flex'
        )}
      >
        {/* Mobile close button (only for email view — chat has its own) */}
        {selectedEmail && !selectedEmail.isChat && (
          <button
            onClick={() => setSelectedEmail(null)}
            className='absolute top-3 left-4 z-50 shrink-0 rounded-full border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted md:hidden'
            title='Close email'
          >
            <X className='h-4 w-4' />
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
              const recipientName = Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to || 'Recipient'
              const newEmail: Email = {
                id: `sent-${Date.now()}`,
                from: undefined,
                name: recipientName,
                email: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to || '',
                replyTo: 'ask@morrai.com',
                subject: emailData.subject || '(No Subject)',
                preview: emailData.body
                  ? emailData.body.replace(/<[^>]*>/g, '').substring(0, 100)
                  : '(No Content)',
                body: emailData.body || '',
                date: new Date(),
                read: true,
                labels: ['sent'],
                avatarInitials: recipientName.slice(0, 2).toUpperCase(),
                done: true,
                attachments: emailData.attachments || [],
              }
              setSentEmails((prev) => [newEmail, ...prev])
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
          activePreviewFile ? (
            <SafeDocumentPreview
              key={`${activePreviewFile.id}-${activePreviewFile.fileName}`}
              fileName={activePreviewFile.fileName}
              fileUrl={activePreviewFile.fileUrl}
              editedJson={activePreviewFile.editedJson}
              onClose={() => setActivePreviewFile(null)}
              hideToggle={true}
            />
          ) : isUploadingFile ? (
            <FileUploadForm
              userEmail={currentUser?.email}
              folders={userFolders}
              onClose={() => setIsUploadingFile(false)}
              onPreviewAttachment={(att) => setPreviewAttachment({ fileName: att.name, fileUrl: att.url || '' })}
              onUploadSuccess={() => {
                setIsUploadingFile(false)
                if (currentUser?.email) {
                  getUserStorageFilesAndFolders(currentUser.email).then(({ files, folders }) => {
                    setUserStorageFiles(files)
                    setUserFolders(folders)
                  })
                }
              }}
            />
          ) : (
            <UserFileCardsView
              folder={selectedUserFolder}
              files={userStorageFiles}
              onSelectFileForPreview={(file) => setActivePreviewFile(file)}
              onBack={() => setIsFileOpen(false)}
            />
          )
        ) : activeTab === 'contact' ? (
          <div className='flex h-full flex-col overflow-y-auto p-4 md:p-6 bg-background'>
            <MsgContactTab
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectContact={handleSelectContact}
              onClose={() => setActiveTab('inbox')}
            />
          </div>
        ) : activeTab === 'groups' ? (
          <div className='flex h-full flex-col overflow-y-auto p-4 md:p-6 bg-background'>
            <MsgGroupTab
              groups={groups}
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectGroup={handleSelectGroup}
              onClose={() => setActiveTab('inbox')}
            />
          </div>
        ) : activeTab === 'folder' ? (
          <div className='relative flex h-full flex-col items-center justify-center p-6 bg-background'>
            <button
              type='button'
              onClick={() => setActiveTab('inbox')}
              className='absolute top-3 left-4 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden cursor-pointer'
              title='Close view'
            >
              <X className='h-4 w-4' />
            </button>
            <ComingSoon />
          </div>
        ) : activeTab === 'chat-contact' ? (
          <div className='flex h-full flex-col overflow-y-auto p-4 md:p-6 bg-background'>
            <MsgContactTab
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectContact={handleSelectContact}
              onClose={() => setActiveTab('chats')}
            />
          </div>
        ) : activeTab === 'chat-groups' ? (
          <div className='flex h-full flex-col overflow-y-auto p-4 md:p-6 bg-background'>
            <MsgGroupTab
              groups={groups}
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectGroup={handleSelectGroup}
              onClose={() => setActiveTab('chats')}
            />
          </div>
        ) : activeTab === 'chat-folder' || activeTab === 'ai-recent' || activeTab === 'ai-prompts' || activeTab === 'file-recent' ? (
          <div className='relative flex h-full flex-col items-center justify-center p-6 bg-background'>
            <button
              type='button'
              onClick={() => {
                if (activeTab === 'chat-folder') setActiveTab('chats')
                else if (activeTab === 'file-recent') setActiveTab('vouchers')
                else setActiveTab('ai-chat')
              }}
              className='absolute top-3 left-4 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden cursor-pointer'
              title='Close view'
            >
              <X className='h-4 w-4' />
            </button>
            <ComingSoon />
          </div>
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
            isSpecialTabActive ||
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
        <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
          {renderInboxPanel(activeTab === 'send')}
        </div>
      </Main>
    </>
  )
}
