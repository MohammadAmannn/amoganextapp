'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Plus,
  MoreVertical,
  Bell,
  PanelLeft,
  Search,
  X,
  Loader2,
  Ticket,
  CheckCircle2,
  Bot,
  Calendar,
  ClipboardList,
  FileText,
  Settings,
  Users,
  CornerUpLeft,
  CornerUpRight,
  Pin,
  Star,
  Heart,
  Flag,
  Archive,
  Trash2,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LinksTab } from '@/features/email-settings/components/accounts-tab'
import { useAuthStore } from '@/stores/auth-store'

import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search as HeaderSearch } from '@/components/search'
import { formatDistanceToNow } from 'date-fns'
import { ReviewPanel } from '@/components/dynamic-form/ReviewPanel'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'


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
import { ChatAttachment, ChatMessage, ChatView } from '../Message/components/chat/chat-view'
import { RealtimeChatView } from '../Message/components/chat/realtime-chat-view'
import { EmailView } from '../Message/components/emails/email-view'
import { NewEmail } from '../Message/components/emails/new-email'
import { ContactManagerTab } from '../Message/components/tabs/contact-manager-tab'
import { GroupManagerTab } from '../Message/components/tabs/group-manager-tab'
import { AiChatPanel } from '../Message/components/panels/ai-chat-panel'
import { MessageEmailSettings } from '../Message/components/panels/message-email-settings'
import { HeaderActions } from '../Message/components/chat/header-actions'
import CalendarTemplate from '@/features/calendartemplate'
import KanbanTemplate from '@/features/kanbantemplate'
import { emails as initialEmails, Email } from '../Message/data/emails'
import { InvoiceMaker } from './components/invoice-maker'
import { useVoucherStore } from '@/stores/voucher-store'


export interface VoucherItem {
  id: string
  voucherNo: string
  date: string
  from: string
  status: 'Active' | 'Redeemed' | 'Expired'
  pdfUrl: string
  fileName: string
}

const VOUCHERS_DATA: VoucherItem[] = [
  {
    id: 'voucher-1',
    voucherNo: 'VCH-2026-001',
    date: 'Aug 7, 2026 at 10:00 AM',
    from: 'Finance & Sales Dept',
    status: 'Active',
    pdfUrl: '',
    fileName: 'Invoice_VCH-2026-001.pdf',
  },
  {
    id: 'voucher-2',
    voucherNo: 'VCH-2026-002',
    date: 'Aug 7, 2026 at 02:30 PM',
    from: 'Operations Dept',
    status: 'Active',
    pdfUrl: '',
    fileName: 'Invoice_VCH-2026-002.pdf',
  },
]

interface DirectoryChat {
  id: string
  conversationId?: string
  kind: 'contact' | 'group'
  name: string
  avatar?: string
  membersCount?: number
  onlineCount?: number
}

export default function VouchersFeature() {
  const vouchers = useVoucherStore((state) => state.vouchers)
  const selectedVoucher = useVoucherStore((state) => state.selectedVoucher)
  const setSelectedVoucher = useVoucherStore((state) => state.setSelectedVoucher)
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState<'inbox' | 'done'>('inbox')
  const [activeTab, setActiveTab] = useState('inbox')
  const [pageTab, setPageTab] = useState<'purchase' | 'analytics'>('purchase')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
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
  const [isInvoiceMakerOpen, setIsInvoiceMakerOpen] = useState(false)
  const [invoiceMakerKey, setInvoiceMakerKey] = useState(0)
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false)


  const currentUser = useAuthStore((state) => state.auth.user)
  const router = useRouter()
  const { unreadCount } = useNotificationStore()
  const { conversations, setConversations, loadConversations } =
    useConversation()

  useEffect(() => {
    setIsSidebarCollapsed(
      localStorage.getItem('vouchers_sidebar_collapsed') === 'true'
    )
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/vouchers')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return
        const mapped = json.data.map((v: any) => ({
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
          userName: 'Aman',
          status: v.status || 'Active',
          fileName: v.file_name,
          originalFileUrl: v.original_file_url || undefined,
          editedFileUrl: v.edited_file_url || undefined,
          editedJson: v.edited_json || null,
          pdfUrl: v.edited_file_url || v.original_file_url || undefined,
          createdAt: v.created_at,
        }))
        useVoucherStore.getState().setVouchers(mapped)
      })
      .catch(() => { /* Keep store vouchers fallback */ })
    return () => {
      cancelled = true
    }
  }, [currentUser])

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
    }
  }

  useEffect(() => {
    void fetchContactsAndGroups()
  }, [currentUser?.accountNo, currentUser?.email])

  const resetAllSelections = () => {
    setSelectedVoucher(null)
    setSelectedEmail(null)
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsInvoiceMakerOpen(false)
    setIsEmailSettingsOpen(false)
  }

  const handleSelectVoucher = (voucher: import('@/stores/voucher-store').SavedVoucher) => {
    resetAllSelections()
    setSelectedVoucher(voucher)
  }

  const handleSelectContact = async (contact: Contact) => {
    if (!currentUser) return
    resetAllSelections()
    const conversationId = await getOrCreateDirectConversation(
      currentUser.accountNo,
      contact.contactUserId
    )
    if (!conversationId) {
      return
    }
    setSelectedDirectoryChat({
      id: `conversation-${conversationId}`,
      conversationId,
      kind: 'contact',
      name: contact.nickname || contact.fullName,
      avatar: contact.avatarUrl,
    })
    setActiveTab('inbox')
  }

  const handleSelectConversation = (conversation: Conversation) => {
    resetAllSelections()
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
      return
    }

    resetAllSelections()
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
    resetAllSelections()
    setSelectedEmail(email)
    if (!email.read) {
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
      )
    }
  }

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

  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase()
    return (
      v.voucherNo.toLowerCase().includes(q) ||
      v.from.toLowerCase().includes(q) ||
      v.date.toLowerCase().includes(q)
    )
  })

  const filteredEmails = emails.filter((e) => {
    const q = searchQuery.toLowerCase()
    return (
      e.name.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      e.preview.toLowerCase().includes(q)
    )
  })

  // Format chats list exactly like email-list.tsx
  const chatItems: Email[] = useMemo(() => {
    const conversationItems: Email[] = conversations.map(
      (conversation) => ({
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
      })
    )
    const conversationContactIds = new Set(
      conversations.flatMap(
        (conversation) =>
          conversation.members?.map((member) => member.id) || []
      )
    )
    const contactItems: Email[] = contacts
      .filter(
        (contact) =>
          !conversationContactIds.has(contact.contactUserId)
      )
      .map((contact) => ({
        id: `contact-${contact.id}`,
        name: contact.nickname || contact.fullName,
        email: contact.email,
        replyTo: contact.email,
        subject: '',
        preview: '',
        body: '',
        date: contact.createdAt
          ? new Date(contact.createdAt)
          : new Date(),
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

  // Helper function to render exact email/chat cards like email-list.tsx
  const renderEmailChatCard = (item: Email) => {
    const contact = contacts.find(
      (c) => `contact-${c.id}` === item.id
    )
    const conversation = conversations.find(
      (c) => `conversation-${c.id}` === item.id
    )
    const isSelected = contact
      ? selectedDirectoryChat?.id === item.id
      : conversation
        ? selectedDirectoryChat?.id === item.id
        : selectedEmail?.id === item.id

    return (
      <div
        key={item.id}
        onClick={() => {
          if (conversation) handleSelectConversation(conversation)
          else if (contact) void handleSelectContact(contact)
          else handleSelectEmail(item)
        }}
        className={cn(
          'group relative flex cursor-pointer transition-all duration-200 select-none',
          isSidebarCollapsed
            ? 'mx-3 my-0.5 justify-center rounded-lg p-2 hover:bg-muted/30'
            : 'mx-3 my-0.5 flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-muted/40 hover:shadow-xs',
          isSelected
            ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
            : 'bg-background hover:bg-muted/30',
          !item.read && 'bg-primary/5',
          'border border-transparent'
        )}
      >
        {isSelected && (
          <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-indigo-600' />
        )}

        {isSidebarCollapsed ? (
          <div className='relative shrink-0'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold shadow-xs transition-all duration-200',
                isSelected
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : item.isChat
                    ? 'border-emerald-200/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-indigo-200/30 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
              )}
            >
              {item.avatarInitials || item.name.charAt(0)}
            </div>
            {!item.read && (
              <span className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background bg-indigo-600' />
            )}
            {item.isChat && (
              <span className='absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-emerald-500'>
                <span className='text-[6px] font-bold text-white'>💬</span>
              </span>
            )}
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between'>
              <div className='flex min-w-0 flex-wrap items-center gap-1.5'>
                <span className={cn('truncate text-sm font-medium text-foreground', !item.read && 'font-semibold')}>
                  {item.name}
                </span>
                {!item.read && (
                  <span className='inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600' />
                )}
                {item.isChat && (
                  <Badge className='h-4 rounded border-emerald-200/30 bg-emerald-500/10 px-1.5 py-0 text-[9px] font-medium text-emerald-600'>
                    💬 Chat
                  </Badge>
                )}
              </div>
              <span className='ml-2 shrink-0 text-[10px] whitespace-nowrap text-muted-foreground'>
                {formatDistanceToNow(item.date, { addSuffix: true })}
              </span>
            </div>

            {item.isChat ? (
              <p className='flex items-center gap-1 truncate text-xs text-muted-foreground/70'>
                <Users className='h-3 w-3' />
                <span>
                  {item.chatData?.membersCount} Members • {item.chatData?.onlineCount} Online
                </span>
              </p>
            ) : (
              <p className={cn('truncate text-sm', !item.read ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                {item.subject}
              </p>
            )}

            <p className='line-clamp-1 text-xs text-muted-foreground/70'>
              {item.isChat
                ? item.chatData?.messages[item.chatData.messages.length - 1]?.content || 'No messages'
                : item.preview}
            </p>
          </>
        )}
      </div>
    )
  }

  /* ── render Left Sidebar List ───────────────────────────────────── */
  const renderSidebarContent = () => (
    <div
      className={cn(
        'flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border transition-all duration-300 ease-in-out',
        (selectedVoucher ||
          selectedEmail ||
          selectedDirectoryChat ||
          isAiChatOpen ||
          isCalendarOpen ||
          isKanbanOpen ||
          isInvoiceMakerOpen ||
          isEmailSettingsOpen) &&
          'hidden md:flex',
        isSidebarCollapsed ? 'w-20' : 'w-full md:w-[340px] lg:w-[380px]'
      )}
    >
      {/* Top Header & Search */}
      <div className='shrink-0 border-b border-border bg-background px-3 pt-2.5 pb-2 flex flex-col gap-2 select-none'>
        {/* 1. Header: Voucher Title + Top-Right Search & Bell Icons */}
        <div className='hidden md:flex items-center justify-between'>
          {!isSidebarCollapsed && (
            <h1 className='text-xl font-black tracking-tight text-foreground'>
              Voucher
            </h1>
          )}
          <div className='flex items-center gap-1 ml-auto'>
            <HeaderSearch iconOnly />
            <Button
              variant='ghost'
              size='icon'
              className='relative size-8 shrink-0 cursor-pointer'
              aria-label='Notifications'
              onClick={() => router.push('/notification')}
            >
              <Bell className='size-4' />
              {unreadCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white shadow-xs'>
                  {unreadCount > 5 ? '5+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* 2. Line Tabs: Purchase & Analytics (placed at left below Voucher title) */}
        {!isSidebarCollapsed && (
          <div className='flex items-center gap-6 border-b border-border/60 px-1 pt-1 pb-1 text-xs font-bold'>
            <button
              type='button'
              onClick={() => setPageTab('purchase')}
              className={cn(
                'pb-1 border-b-2 transition-all cursor-pointer select-none',
                pageTab === 'purchase'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Purchase
            </button>
            <button
              type='button'
              onClick={() => setPageTab('analytics')}
              className={cn(
                'pb-1 border-b-2 transition-all cursor-pointer select-none',
                pageTab === 'analytics'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Analytics
            </button>
          </div>
        )}

        {/* 3. Toolbar Icons (Email Settings, Chat, AI Chat, Calendar, Tasks, File) WITHOUT + icon */}
        {!isSidebarCollapsed && (
          <div className='rounded-xl border border-border/80 bg-muted/10 p-1 flex items-center justify-between gap-1'>
            {/* Email Settings */}
            <button
              onClick={() => {
                resetAllSelections()
                setIsEmailSettingsOpen(true)
              }}
              className={cn(
                'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
                isEmailSettingsOpen &&
                  'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm border border-border/60 font-semibold'
              )}
              title='Email Settings'
            >
              <Mail className='h-4 w-4' />
            </button>

            {/* Chat Icon */}
            <button
              onClick={() => {
                if (conversations.length > 0) {
                  handleSelectConversation(conversations[0])
                } else if (contacts.length > 0) {
                  void handleSelectContact(contacts[0])
                }
              }}
              className={cn(
                'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
                selectedDirectoryChat &&
                  'bg-background text-emerald-600 dark:text-emerald-400 shadow-sm border border-border/60 font-semibold'
              )}
              title='Chats & Direct Messages'
            >
              <MessageSquare className='h-4 w-4' />
            </button>

            {/* AI Assistant Icon */}
            <button
              onClick={() => {
                resetAllSelections()
                setIsAiChatOpen(true)
              }}
              className={cn(
                'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
                isAiChatOpen &&
                  'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm border border-border/60 font-semibold'
              )}
              title='AI Assistant'
            >
              <Bot className='h-4 w-4' />
            </button>

            {/* Calendar Icon */}
            <button
              onClick={() => {
                resetAllSelections()
                setIsCalendarOpen(true)
              }}
              className={cn(
                'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
                isCalendarOpen &&
                  'bg-background text-amber-600 dark:text-amber-400 shadow-sm border border-border/60 font-semibold'
              )}
              title='Calendar Schedule'
            >
              <Calendar className='h-4 w-4' />
            </button>

            {/* Tasks / Kanban Icon */}
            <button
              onClick={() => {
                resetAllSelections()
                setIsKanbanOpen(true)
              }}
              className={cn(
                'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
                isKanbanOpen &&
                  'bg-background text-purple-600 dark:text-purple-400 shadow-sm border border-border/60 font-semibold'
              )}
              title='Tasks & Kanban Board'
            >
              <ClipboardList className='h-4 w-4' />
            </button>

            {/* New Voucher Form (+ icon) */}
            <button
              onClick={() => {
                resetAllSelections()
                setInvoiceMakerKey((k) => k + 1)
                setIsInvoiceMakerOpen(true)
              }}

              className={cn(
                'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
                isInvoiceMakerOpen &&
                  'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm border border-border/60 font-semibold'
              )}
              title='New Voucher Form'
            >
              <Plus className='h-4 w-4' />
            </button>
          </div>
        )}

        {/* Search input */}
        {!isSidebarCollapsed && (
          <div className='relative min-w-0 flex-1'>
            <Search className='absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60' />
            <Input
              placeholder='Search vouchers, emails, chats...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-8 w-full rounded-md border-border bg-muted/10 pr-7 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-ring'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              >
                <X className='h-3 w-3' />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className='min-h-0 flex-1 overflow-y-auto bg-background scrollbar-thin'>
        <div className='flex flex-col gap-1 py-1.5'>
          
          {/* SECTION 1: VOUCHERS */}
          {filteredVouchers.length > 0 && (
            <>
              {!isSidebarCollapsed && (
                <div className='flex items-center gap-2 px-3 pt-2 pb-1'>
                  <Ticket className='h-3 w-3 shrink-0 text-emerald-500' />
                  <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                    Vouchers
                  </span>
                  <div className='h-px flex-1 bg-border' />
                  <span className='text-[10px] text-muted-foreground/50'>
                    {filteredVouchers.length}
                  </span>
                </div>
              )}

              {filteredVouchers.map((voucher) => {
                const isSelected = selectedVoucher?.id === voucher.id

                return (
                  <div
                    key={voucher.id}
                    onClick={() => handleSelectVoucher(voucher)}
                    className={cn(
                      'group relative flex cursor-pointer transition-all duration-200 select-none',
                      isSidebarCollapsed
                        ? 'mx-3 my-0.5 justify-center rounded-lg p-2 hover:bg-muted/30'
                        : 'mx-3 my-0.5 flex-col gap-1 rounded-lg px-3.5 py-3 hover:bg-muted/40 hover:shadow-xs',
                      isSelected
                        ? 'border-emerald-200/60 bg-emerald-500/10 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                        : 'bg-background hover:bg-muted/30',
                      'border border-transparent'
                    )}
                  >
                    {isSelected && (
                      <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-emerald-600' />
                    )}

                    {isSidebarCollapsed ? (
                      <div className='relative shrink-0'>
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold shadow-xs transition-all duration-200',
                            isSelected
                              ? 'border-emerald-500 bg-emerald-600 text-white'
                              : 'border-emerald-200/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          )}
                        >
                          <Ticket className='h-4 w-4' />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex items-center gap-1.5 min-w-0'>
                            <span className='font-semibold text-sm text-foreground truncate'>
                              Voucher #{voucher.voucherNo}
                            </span>
                            <Badge className='h-4 rounded border-emerald-200/30 bg-emerald-500/15 px-1.5 py-0 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400'>
                              <CheckCircle2 className='mr-0.5 h-2.5 w-2.5 inline' />
                              {voucher.status}
                            </Badge>
                          </div>
                          <span className='shrink-0 text-[10px] text-muted-foreground whitespace-nowrap'>
                            {voucher.date}
                          </span>
                        </div>

                        <div className='text-xs text-muted-foreground truncate'>
                          <span className='font-medium text-foreground/70'>
                            From:{' '}
                          </span>
                          {voucher.from}
                        </div>

                        <div className='flex items-center gap-1.5 mt-0.5'>
                          <div className='inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
                            <FileText className='h-3 w-3 text-red-500' />
                            <span className='truncate max-w-[180px]'>
                              {voucher.fileName}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* SECTION 2: MAIL */}
          {filteredEmails.length > 0 && (
            <>
              {!isSidebarCollapsed && (
                <div className='flex items-center gap-2 px-3 pt-3 pb-1'>
                  <Mail className='h-3 w-3 shrink-0 text-indigo-500' />
                  <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                    Mail
                  </span>
                  <div className='h-px flex-1 bg-border' />
                  <span className='text-[10px] text-muted-foreground/50'>
                    {filteredEmails.length}
                  </span>
                </div>
              )}
              {filteredEmails.map(renderEmailChatCard)}
            </>
          )}

          {/* SECTION 3: CHATS */}
          {chatItems.length > 0 && (
            <>
              {!isSidebarCollapsed && (
                <div className='flex items-center gap-2 px-3 pt-3 pb-1'>
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
              {chatItems.map(renderEmailChatCard)}
            </>
          )}

          {/* SECTION 4: AI CARD */}
          {!isSidebarCollapsed && (
            <>
              <div className='flex items-center gap-2 px-3 pt-3 pb-1'>
                <Bot className='h-3 w-3 shrink-0 text-indigo-500' />
                <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                  AI
                </span>
                <div className='h-px flex-1 bg-border' />
              </div>
              <div
                onClick={() => {
                  resetAllSelections()
                  setIsAiChatOpen(true)
                }}
                className={cn(
                  'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
                  isAiChatOpen
                    ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
                    : 'border-transparent bg-background hover:bg-indigo-500/5 hover:border-indigo-200/30'
                )}
              >
                {isAiChatOpen && (
                  <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-indigo-600' />
                )}
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400'>
                      <Bot className='h-3.5 w-3.5' />
                    </div>
                    <span className='flex items-center gap-1 truncate text-sm font-semibold text-foreground'>
                      AI Assistant
                      <Sparkles className='h-3 w-3 text-indigo-400' />
                    </span>
                  </div>
                  <span className='ml-2 shrink-0 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400'>
                    AI
                  </span>
                </div>
                <p className='line-clamp-2 text-xs text-muted-foreground/70 leading-relaxed pl-10'>
                  Explain the new features of React 19 with examples of Server Actions and the use() hook.
                </p>
              </div>
            </>
          )}

          {/* SECTION 5: CALENDAR CARD */}
          {!isSidebarCollapsed && (
            <>
              <div className='flex items-center gap-2 px-3 pt-3 pb-1'>
                <Calendar className='h-3 w-3 shrink-0 text-amber-500' />
                <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                  Calendar
                </span>
                <div className='h-px flex-1 bg-border' />
              </div>
              <div
                onClick={() => {
                  resetAllSelections()
                  setIsCalendarOpen(true)
                }}
                className={cn(
                  'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
                  isCalendarOpen
                    ? 'border-amber-200/50 bg-amber-500/10 dark:border-amber-900/30 dark:bg-amber-950/20'
                    : 'border-transparent bg-background hover:bg-amber-500/5 hover:border-amber-200/30'
                )}
              >
                {isCalendarOpen && (
                  <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-amber-600' />
                )}
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200/40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:border-amber-800/40 dark:text-amber-400'>
                      <Calendar className='h-3.5 w-3.5' />
                    </div>
                    <span className='flex items-center gap-1.5 truncate text-sm font-semibold text-foreground'>
                      Weekly Planning & Sync
                    </span>
                  </div>
                  <span className='ml-2 shrink-0 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400'>
                    Event
                  </span>
                </div>
                <span className='pl-10 text-[10px] text-muted-foreground/80 font-medium block'>
                  July 30, 2026 - Aug 05, 2026
                </span>
              </div>
            </>
          )}

          {/* SECTION 6: TASKS CARD */}
          {!isSidebarCollapsed && (
            <>
              <div className='flex items-center gap-2 px-3 pt-3 pb-1'>
                <ClipboardList className='h-3 w-3 shrink-0 text-purple-500' />
                <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                  Tasks
                </span>
                <div className='h-px flex-1 bg-border' />
              </div>
              <div
                onClick={() => {
                  resetAllSelections()
                  setIsKanbanOpen(true)
                }}
                className={cn(
                  'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
                  isKanbanOpen
                    ? 'border-purple-200/50 bg-purple-500/10 dark:border-purple-900/30 dark:bg-indigo-950/20'
                    : 'border-transparent bg-background hover:bg-purple-500/5 hover:border-purple-200/30'
                )}
              >
                {isKanbanOpen && (
                  <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-purple-600' />
                )}
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-200/40 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 dark:border-purple-800/40 dark:text-purple-400'>
                      <ClipboardList className='h-3.5 w-3.5' />
                    </div>
                    <span className='flex items-center gap-1.5 truncate text-sm font-semibold text-foreground'>
                      Sprint 5 Kanban Board
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
            </>
          )}

        </div>
      </div>
    </div>
  )

  /* ── render Right Preview Panel ───────────────────────────────────── */
  const renderRightPanelContent = () => (
    <div
      className={cn(
        'relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background',
        !selectedVoucher &&
          !selectedEmail &&
          !selectedDirectoryChat &&
          !isAiChatOpen &&
          !isCalendarOpen &&
          !isKanbanOpen &&
          !isInvoiceMakerOpen &&
          !isEmailSettingsOpen &&
          'hidden md:flex'
      )}
    >
      {isEmailSettingsOpen ? (
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
      ) : isInvoiceMakerOpen ? (
        <div className='fixed inset-0 z-50 flex h-full w-full flex-col bg-background overflow-hidden animate-in fade-in duration-200 md:relative md:z-auto md:h-full md:w-full md:flex-1 md:min-h-0'>
          {/* Header matching other panels */}
          <div className='flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none gap-3'>
            <div className='flex min-w-0 items-center gap-3 flex-1'>
              <button
                onClick={() => setIsInvoiceMakerOpen(false)}
                className='-ml-1 flex md:hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                title='Close'
              >
                <X className='h-5 w-5' />
              </button>

              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400'>
                <Plus className='h-4.5 w-4.5' />
              </div>

              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-foreground'>
                  New Voucher
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  Create, review and print digital vouchers.
                </p>
              </div>
            </div>

            <HeaderActions
              onDelete={() => setIsInvoiceMakerOpen(false)}
            />
          </div>

          <div className='relative h-full min-h-0 w-full flex-1 overflow-hidden bg-background flex flex-col'>
            <InvoiceMaker key={invoiceMakerKey} />
          </div>

        </div>
      ) : selectedVoucher ? (
        <div className="fixed inset-0 z-50 flex flex-col w-full h-full h-[100dvh] bg-background md:relative md:z-auto md:h-full">
          <SafeDocumentPreview
            fileName={selectedVoucher.fileName}
            fileUrl={selectedVoucher.pdfUrl || selectedVoucher.originalFileUrl}
            editedJson={selectedVoucher.editedJson}
            onClose={() => setSelectedVoucher(null)}
            defaultViewMode="structured"
            showToggle={true}
          />
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
          onDelete={(id) => {
            setEmails((prev) => prev.filter((e) => e.id !== id))
            setSelectedEmail(null)
          }}
        />
      ) : (
        <div className='flex h-full flex-col items-center justify-center gap-3 bg-background p-8 text-muted-foreground'>
          <Ticket className='h-10 w-10 opacity-20' />
          <p className='text-sm'>Select an item to view content</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile-only global top header */}
      <div
        className={cn(
          'md:hidden',
          (selectedVoucher ||
            selectedEmail ||
            selectedDirectoryChat ||
            isAiChatOpen ||
            isCalendarOpen ||
            isKanbanOpen ||
            isInvoiceMakerOpen ||
            isEmailSettingsOpen) &&
            'hidden'
        )}
      >
        <AppHeader title="Voucher" />
      </div>

      <Main
        fixed
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background p-0 sm:px-4 sm:py-0"
      >
        {pageTab === 'purchase' ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
          >
            {isComposing ? (
              <div className="mt-0 flex h-full flex-grow flex-col overflow-hidden bg-background">
                <NewEmail
                  onCancel={() => setIsComposing(false)}
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
                    setIsComposing(false)
                  }}
                  onSaveDraft={() => {
                    setIsComposing(false)
                  }}

                />
              </div>
            ) : (
              <>
                <TabsContent
                  value="inbox"
                  className="mt-0 flex h-full min-h-0 flex-1 flex-row overflow-hidden bg-background focus-visible:outline-none"
                >
                  <div className="flex h-full min-h-0 w-full flex-1 flex-row overflow-hidden">
                    {renderSidebarContent()}
                    {renderRightPanelContent()}
                  </div>
                </TabsContent>

                <TabsContent
                  value="send"
                  className="mt-0 flex h-full min-h-0 flex-1 flex-row overflow-hidden bg-background focus-visible:outline-none"
                >
                  <div className="flex h-full min-h-0 w-full flex-1 flex-row overflow-hidden">
                    {renderSidebarContent()}
                    {renderRightPanelContent()}
                  </div>
                </TabsContent>

                <TabsContent
                  value="folder"
                  className="mt-0 flex flex-1 flex-col items-center justify-start overflow-y-auto bg-transparent focus-visible:outline-none p-3 sm:p-6 lg:p-8"
                >
                  <div className="w-full max-w-3xl mx-auto">
                    <LinksTab />
                  </div>
                </TabsContent>

                <TabsContent
                  value="contact"
                  className="mt-0 flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto bg-transparent focus-visible:outline-none p-3 sm:p-6 lg:p-8"
                >
                  <ContactManagerTab
                    contacts={contacts}
                    onRefresh={fetchContactsAndGroups}
                    onSelectContact={handleSelectContact}
                  />
                </TabsContent>

                <TabsContent
                  value="groups"
                  className="mt-0 flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto bg-transparent focus-visible:outline-none p-3 sm:p-6 lg:p-8"
                >
                  <GroupManagerTab
                    groups={groups}
                    contacts={contacts}
                    onRefresh={fetchContactsAndGroups}
                    onSelectGroup={handleSelectGroup}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        ) : (
          <div className="flex h-full min-h-0 flex-1 flex-row overflow-hidden">
            {renderSidebarContent()}
            <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center p-8 text-center bg-background">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Sparkles className="size-7" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground">Analytics Coming Soon</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-sm">
                Detailed voucher performance metrics, spending insights, and analytics dashboard will be available here soon.
              </p>
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
