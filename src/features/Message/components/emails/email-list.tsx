import React, { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Search,
  X,
  PanelLeft,
  MoreHorizontal,
  CornerUpLeft,
  CornerUpRight,
  Reply,
  Forward,
  Share2,
  Pin,
  Star,
  Heart,
  Flag,
  Archive,
  Bell,
  Trash2,
  ChevronRight,
  Users,
  Mail,
  MessageSquare,
  Bot,
  Sparkles,
  Calendar,
  ClipboardList,
  FileText,
  FolderOpen,
  Plus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotificationStore } from '@/stores/notification-store'
import { Search as HeaderSearch } from '@/components/search'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Conversation } from '@/features/chattemplate/chat/types/chat.types'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { Email } from '../../data/emails'
import { useVoucherStore, SavedVoucher } from '@/stores/voucher-store'

interface EmailListProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (email: Email) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  mode: 'inbox' | 'done'
  setMode: (mode: 'inbox' | 'done') => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  contacts?: Contact[]
  selectedContactId?: string | null
  onSelectContact?: (contact: Contact) => void
  conversations?: Conversation[]
  onSelectConversation?: (conversation: Conversation) => void
  onSelectAiChat?: () => void
  isAiChatSelected?: boolean
  onSelectCalendar?: () => void
  isCalendarSelected?: boolean
  onSelectTask?: () => void
  isTaskSelected?: boolean
  onSelectFile?: () => void
  isFileSelected?: boolean
  onSelectEmailSettings?: () => void
  isEmailSettingsSelected?: boolean
  activeTab?: string
  onTabChange?: (tab: string) => void
}

function getLabelVariant(
  label: string
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (label) {
    case 'important':
      return 'default'
    case 'work':
      return 'outline'
    case 'personal':
      return 'secondary'
    case 'meeting':
      return 'outline'
    case 'budget':
      return 'destructive'
    default:
      return 'secondary'
  }
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
  onToggleCollapse,
  contacts = [],
  selectedContactId,
  onSelectContact,
  conversations = [],
  onSelectConversation,
  onSelectAiChat,
  isAiChatSelected,
  onSelectCalendar,
  isCalendarSelected,
  onSelectTask,
  isTaskSelected,
  onSelectFile,
  isFileSelected,
  onSelectEmailSettings,
  isEmailSettingsSelected,
  activeTab,
  onTabChange,
}: EmailListProps) {
  const router = useRouter()
  const { unreadCount } = useNotificationStore()
  const selectedVoucher = useVoucherStore((state) => state.selectedVoucher)
  const storeVouchers = useVoucherStore((state) => state.vouchers)
  const [dbVouchers, setDbVouchers] = useState<SavedVoucher[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'mail' | 'chat' | 'vouchers' | 'ai' | 'calendar' | 'tasks'>('all')

  // Fetch real vouchers from DB API with background polling for instant live updates without page refresh
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
            userName: v.user_name || v.customer_name || v.vendor_name || 'Aman',
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

  const savedVouchers = React.useMemo(() => {
    const list = dbVouchers.length > 0 ? dbVouchers : storeVouchers
    return [...list].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
  }, [dbVouchers, storeVouchers])

  const filteredSavedVouchers = React.useMemo(() => {
    if (!searchQuery.trim()) return savedVouchers
    const q = searchQuery.trim().toLowerCase()
    return savedVouchers.filter((voucher) => {
      const fileNameMatch = (voucher.fileName || '').toLowerCase().includes(q)
      const fromMatch = (voucher.from || '').toLowerCase().includes(q)
      const userMatch = (voucher.userName || '').toLowerCase().includes(q)
      const jsonMatch = voucher.editedJson
        ? JSON.stringify(voucher.editedJson).toLowerCase().includes(q)
        : false
      return fileNameMatch || fromMatch || userMatch || jsonMatch
    })
  }, [savedVouchers, searchQuery])


  const emailAccounts = React.useMemo(() => {
    const accounts = new Map()
    emails.forEach((email) => {
      if (!accounts.has(email.email)) {
        accounts.set(email.email, {
          email: email.email,
          name: email.name,
          avatarInitials: email.avatarInitials,
        })
      }
    })
    return Array.from(accounts.values())
  }, [emails])

  const filtered = emails.filter((email) => {
    const matchesSearch =
      email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesMode = mode === 'done' ? email.done : !email.done

    const matchesAccount =
      selectedAccount === 'all' || email.email === selectedAccount

    return matchesSearch && matchesMode && matchesAccount
  })

  const mailItems = React.useMemo(() => {
    return filtered.filter((e) => !e.isChat)
  }, [filtered])

  const chatItems = React.useMemo(() => {
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

  return (
    <div className='flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background'>
      <div className='shrink-0 border-b border-border bg-background px-3 pt-2 pb-1.5 flex flex-col gap-1.5'>
        {/* 1. Header: Messages title + Search + Bell (Desktop only to prevent mobile duplicate) */}
        <div className='hidden md:flex items-center justify-between pb-0.5 border-b border-border/40'>
          <h1 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
            Messages
          </h1>
          <div className='flex items-center gap-1 sm:gap-1.5'>
            <HeaderSearch iconOnly />

            <Button
              variant='ghost'
              size='icon'
              className='relative size-7 shrink-0'
              aria-label='Notifications'
              onClick={() => router.push('/notification')}
            >
              <Bell className='size-4' />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white shadow-xs'>
                  {unreadCount > 5 ? '5+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* 2. Toolbar (Horizontal Icon Navigation) placed on top of search bar */}
        <div className='rounded-xl border border-border/80 bg-muted/10 p-1 flex items-center justify-between gap-1'>
          {/* Mail / Email Settings Icon */}
          <button
            onClick={() => {
              setCategoryFilter((prev) => (prev === 'mail' ? 'all' : 'mail'))
              onSelectEmailSettings?.()
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
              (categoryFilter === 'mail' || isEmailSettingsSelected) &&
              'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm border border-border/60 font-semibold'
            )}
            title='Mail Items'
          >
            <Mail className='h-4 w-4' />
          </button>

          {/* Chat Icon */}
          <button
            onClick={() => {
              setCategoryFilter((prev) => (prev === 'chat' ? 'all' : 'chat'))
              const firstChat = chatItems[0]
              if (firstChat) {
                if (firstChat.id.startsWith('conversation-')) {
                  const convoId = firstChat.id.replace('conversation-', '')
                  const convo = conversations.find((c) => c.id === convoId)
                  if (convo) onSelectConversation?.(convo)
                } else if (firstChat.id.startsWith('contact-')) {
                  const contactId = firstChat.id.replace('contact-', '')
                  const contact = contacts.find((c) => c.id === contactId)
                  if (contact) onSelectContact?.(contact)
                }
              }
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
              (categoryFilter === 'chat' || selectedContactId !== null || (selectedEmailId !== null && chatItems.some((c) => c.id === selectedEmailId))) &&
              'bg-background text-emerald-600 dark:text-emerald-400 shadow-sm border border-border/60 font-semibold'
            )}
            title='Chats & Direct Messages'
          >
            <MessageSquare className='h-4 w-4' />
          </button>

          {/* AI Assistant Icon */}
          <button
            onClick={() => {
              setCategoryFilter((prev) => (prev === 'ai' ? 'all' : 'ai'))
              onSelectAiChat?.()
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
              (categoryFilter === 'ai' || isAiChatSelected) && 'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm border border-border/60 font-semibold'
            )}
            title='AI Assistant'
          >
            <Bot className='h-4 w-4' />
          </button>

          {/* Calendar Icon */}
          <button
            onClick={() => {
              setCategoryFilter((prev) => (prev === 'calendar' ? 'all' : 'calendar'))
              onSelectCalendar?.()
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
              (categoryFilter === 'calendar' || isCalendarSelected) && 'bg-background text-amber-600 dark:text-amber-400 shadow-sm border border-border/60 font-semibold'
            )}
            title='Calendar Schedule'
          >
            <Calendar className='h-4 w-4' />
          </button>

          {/* Tasks / Kanban Icon */}
          <button
            onClick={() => {
              setCategoryFilter((prev) => (prev === 'tasks' ? 'all' : 'tasks'))
              onSelectTask?.()
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
              (categoryFilter === 'tasks' || isTaskSelected) && 'bg-background text-purple-600 dark:text-purple-400 shadow-sm border border-border/60 font-semibold'
            )}
            title='Tasks & Kanban Board'
          >
            <ClipboardList className='h-4 w-4' />
          </button>

          {/* Voucher Icon (FileText icon for Vouchers list) */}
          <button
            onClick={() => {
              setCategoryFilter((prev) => (prev === 'vouchers' ? 'all' : 'vouchers'))
              onSelectFile?.()
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95',
              (categoryFilter === 'vouchers' || isFileSelected) && 'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm border border-border/60 font-semibold'
            )}
            title='Vouchers'
          >
            <FileText className='h-4 w-4' />
          </button>
        </div>

        {/* 3. Search input (placed below toolbar icons) */}
        <div className='relative min-w-0 flex-1'>
          <Search className='absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60' />
          <Input
            placeholder='Search...'
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
      </div>

      <div className='min-h-0 flex-1 scrollbar-thin overflow-y-auto bg-background'>
        <div className='flex flex-col gap-0 py-0.5'>
          {filtered.length === 0 && contacts.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground'>
              <p className='text-sm font-medium'>No messages found</p>
              <p className='mt-1 text-xs text-muted-foreground/60'>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            (() => {
              const mailItems = filtered.filter((e) => !e.isChat)
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
              const chatItems = [...conversationItems, ...contactItems].filter(
                (item) =>
                  !normalizedChatSearch ||
                  item.name.toLowerCase().includes(normalizedChatSearch) ||
                  item.preview.toLowerCase().includes(normalizedChatSearch)
              )

              const renderCard = (email: Email) => {
                const contact = contacts.find(
                  (item) => `contact-${item.id}` === email.id
                )
                const conversation = conversations.find(
                  (item) => `conversation-${item.id}` === email.id
                )
                const isSelected = contact
                  ? selectedContactId === email.id
                  : conversation
                    ? selectedContactId === email.id
                    : selectedEmailId === email.id

                return (
                  <div
                    key={email.id}
                    onClick={() => {
                      if (conversation) onSelectConversation?.(conversation)
                      else if (contact) onSelectContact?.(contact)
                      else onSelectEmail(email)
                    }}
                    className={cn(
                      'group relative flex cursor-pointer transition-all duration-200 select-none',
                      isCollapsed
                        ? 'mx-3 my-0.5 justify-center rounded-lg p-2 hover:bg-muted/30'
                        : 'mx-3 my-0.5 flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-muted/40 hover:shadow-xs',
                      isSelected
                        ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
                        : 'bg-background hover:bg-muted/30',
                      !email.read && 'bg-primary/5',
                      'border border-transparent'
                    )}
                  >
                    {isSelected && (
                      <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-indigo-600' />
                    )}

                    {isCollapsed ? (
                      <div className='relative shrink-0'>
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold shadow-xs transition-all duration-200',
                            isSelected
                              ? 'border-indigo-500 bg-indigo-600 text-white'
                              : email.isChat
                                ? 'border-emerald-200/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'border-indigo-200/30 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          )}
                        >
                          {email.avatarInitials || email.name.charAt(0)}
                        </div>
                        {!email.read && (
                          <span className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background bg-indigo-600' />
                        )}
                        {email.isChat && (
                          <span className='absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-emerald-500'>
                            <span className='text-[6px] font-bold text-white'>
                              💬
                            </span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className='flex items-center justify-between'>
                          <div className='flex min-w-0 flex-wrap items-center gap-1.5'>
                            <span
                              className={cn(
                                'truncate text-sm font-medium text-foreground',
                                !email.read && 'font-semibold'
                              )}
                            >
                              {email.name}
                            </span>
                            {!email.read && (
                              <span className='inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600' />
                            )}
                            {email.isChat && (
                              <Badge className='h-4 rounded border-emerald-200/30 bg-emerald-500/10 px-1.5 py-0 text-[9px] font-medium text-emerald-600'>
                                💬 Chat
                              </Badge>
                            )}
                            {email.labels.length > 0 && !email.isChat && (
                              <div className='flex flex-wrap gap-0.5'>
                                {email.labels.slice(0, 2).map((label) => (
                                  <Badge
                                    key={label}
                                    variant={getLabelVariant(label)}
                                    className='h-4 rounded px-1.5 py-0 text-[9px] font-medium capitalize'
                                  >
                                    {label}
                                  </Badge>
                                ))}
                                {email.labels.length > 2 && (
                                  <Badge
                                    variant='outline'
                                    className='h-4 rounded px-1 py-0 text-[9px]'
                                  >
                                    +{email.labels.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <span className='ml-2 shrink-0 text-[10px] whitespace-nowrap text-muted-foreground'>
                            {formatDistanceToNow(email.date, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {/* Subject / Chat Info */}
                        {email.isChat ? (
                          <p className='flex items-center gap-1 truncate text-xs text-muted-foreground/70'>
                            <Users className='h-3 w-3' />
                            <span>
                              {email.chatData?.membersCount} Members •{' '}
                              {email.chatData?.onlineCount} Online
                            </span>
                          </p>
                        ) : (
                          <p
                            className={cn(
                              'truncate text-sm',
                              !email.read
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {email.subject}
                          </p>
                        )}

                        {/* Preview / Last Message */}
                        {email.isChat ? (
                          <p className='line-clamp-1 text-xs text-muted-foreground/70'>
                            {email.chatData?.messages[
                              email.chatData.messages.length - 1
                            ]?.content || 'No messages'}
                          </p>
                        ) : (
                          <p className='line-clamp-1 text-xs text-muted-foreground/70'>
                            {email.preview}
                          </p>
                        )}

                        <div className='absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='flex h-6 w-6 cursor-pointer items-center justify-center rounded p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground'
                                title='More actions'
                              >
                                <MoreHorizontal className='h-3.5 w-3.5' />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='end'
                              className='w-[150px] rounded-lg border border-border bg-background p-1 shadow-md'
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer gap-2 py-1.5 text-xs'
                              >
                                <CornerUpLeft className='h-3 w-3 shrink-0 text-blue-500' />
                                <span>Reply</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer gap-2 py-1.5 text-xs'
                              >
                                <CornerUpRight className='h-3 w-3 shrink-0 text-blue-500' />
                                <span>Forward</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer gap-2 py-1.5 text-xs'
                              >
                                <Pin className='h-3 w-3 shrink-0 text-purple-500' />
                                <span>Pin Message</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer gap-2 py-1.5 text-xs'
                              >
                                <Star className='h-3 w-3 shrink-0 text-amber-500' />
                                <span>Star</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer gap-2 py-1.5 text-xs'
                              >
                                <Heart className='h-3 w-3 shrink-0 text-pink-500' />
                                <span>Favorite</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer gap-2 py-1.5 text-xs'
                              >
                                <Flag className='h-3 w-3 shrink-0 text-red-500' />
                                <span>Flag</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer gap-2 py-1.5 text-xs'
                              >
                                <Archive className='h-3 w-3 shrink-0 text-indigo-500' />
                                <span>Archive</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer justify-between gap-2 py-1.5 text-xs'
                              >
                                <div className='flex items-center gap-2'>
                                  <Bell className='h-3 w-3 shrink-0 text-orange-500' />
                                  <span>Action This</span>
                                </div>
                                <ChevronRight className='h-3 w-3 text-muted-foreground' />
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className='cursor-pointer justify-between gap-2 py-1.5 text-xs text-red-500 focus:bg-red-500/10 focus:text-red-500'
                              >
                                <div className='flex items-center gap-2'>
                                  <Trash2 className='h-3 w-3 shrink-0 text-red-500' />
                                  <span>Delete</span>
                                </div>
                                <ChevronRight className='h-3 w-3 text-red-500' />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </>
                    )}
                  </div>
                )
              }

              return (
                <>
                  {(categoryFilter === 'all' || categoryFilter === 'mail') && mailItems.length > 0 && (
                    <>
                      {!isCollapsed && (
                        <div className='flex items-center gap-2 px-3 pt-1.5 pb-0.5'>
                          <Mail className='h-3 w-3 shrink-0 text-indigo-500' />
                          <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                            Mail
                          </span>
                          <div className='h-px flex-1 bg-border' />
                          <span className='text-[10px] text-muted-foreground/50'>
                            {mailItems.length}
                          </span>
                        </div>
                      )}
                      {mailItems.map(renderCard)}
                    </>
                  )}

                  {(categoryFilter === 'all' || categoryFilter === 'chat') && chatItems.length > 0 && (
                    <>
                      {!isCollapsed && (
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
                      {chatItems.map(renderCard)}
                    </>
                  )}

                  {/* AI Chat card */}
                  {!isCollapsed && onSelectAiChat && (categoryFilter === 'all' || categoryFilter === 'ai' || isAiChatSelected) && (
                    <>
                      {!isCollapsed && (
                        <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                          <Bot className='h-3 w-3 shrink-0 text-indigo-500' />
                          <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                            AI
                          </span>
                          <div className='h-px flex-1 bg-border' />
                        </div>
                      )}
                      <div
                        id='ai-chat-card'
                        onClick={onSelectAiChat}
                        className={[
                          'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
                          isAiChatSelected
                            ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
                            : 'border-transparent bg-background hover:bg-indigo-500/5 hover:border-indigo-200/30',
                        ].join(' ')}
                      >
                        {isAiChatSelected && (
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

                  {/* Calendar card */}
                  {!isCollapsed && onSelectCalendar && (categoryFilter === 'all' || categoryFilter === 'calendar' || isCalendarSelected) && (
                    <>
                      {!isCollapsed && (
                        <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                          <Calendar className='h-3 w-3 shrink-0 text-amber-500' />
                          <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                            Calendar
                          </span>
                          <div className='h-px flex-1 bg-border' />
                        </div>
                      )}
                      <div
                        id='calendar-card'
                        onClick={onSelectCalendar}
                        className={[
                          'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
                          isCalendarSelected
                            ? 'border-amber-200/50 bg-amber-500/10 dark:border-amber-900/30 dark:bg-amber-950/20'
                            : 'border-transparent bg-background hover:bg-amber-500/5 hover:border-amber-200/30',
                        ].join(' ')}
                      >
                        {isCalendarSelected && (
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

                  {/* Task / Kanban card */}
                  {!isCollapsed && onSelectTask && (categoryFilter === 'all' || categoryFilter === 'tasks' || isTaskSelected) && (
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
                      <div
                        id='task-card'
                        onClick={onSelectTask}
                        className={[
                          'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 select-none border',
                          isTaskSelected
                            ? 'border-purple-200/50 bg-purple-500/10 dark:border-purple-900/30 dark:bg-purple-950/20'
                            : 'border-transparent bg-background hover:bg-purple-500/5 hover:border-purple-200/30',
                        ].join(' ')}
                      >
                        {isTaskSelected && (
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

                  {/* Real Saved Vouchers cards */}
                  {!isCollapsed && onSelectFile && (categoryFilter === 'all' || categoryFilter === 'vouchers' || isFileSelected) && (
                    <>
                      {categoryFilter === 'all' && (
                        <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                          <FileText className='h-3 w-3 shrink-0 text-indigo-500' />
                          <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                            Files
                          </span>
                          <div className='h-px flex-1 bg-border' />
                          <span className='text-[10px] text-muted-foreground/50'>
                            {filteredSavedVouchers.length}
                          </span>
                        </div>
                      )}

                      {filteredSavedVouchers.length === 0 ? (
                        <div className='mx-3 my-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
                          <FileText className='mx-auto h-7 w-7 opacity-30 mb-2 text-indigo-500' />
                          <p className='font-semibold text-foreground/80'>
                            {searchQuery ? 'No matching files found' : 'No Files yet'}
                          </p>
                          <p className='text-[11px] opacity-7 0 mt-0.5'>
                            {searchQuery ? `No files matching "${searchQuery}"` : 'Upload and save a file on the Chat page to see it here.'}
                          </p>
                        </div>
                      ) : (
                        filteredSavedVouchers.map((voucher) => {
                          const isVoucherActive = isFileSelected && selectedVoucher?.id === voucher.id

                          // Helper to extract JSON values safely
                          const getVal = (...keys: string[]) => {
                            const json = voucher.editedJson
                            if (!json || typeof json !== 'object') return null
                            for (const k of keys) {
                              const kl = k.toLowerCase().replace(/[_\-\s]/g, '')
                              for (const dk of Object.keys(json)) {
                                if (dk.toLowerCase().replace(/[_\-\s]/g, '') === kl && json[dk] != null && json[dk] !== '') {
                                  return String(json[dk])
                                }
                              }
                            }
                            return null
                          }

                          const vendor = getVal('vendor', 'businessName', 'company', 'from') || voucher.from || 'Vendor'
                          const username = voucher.userName || getVal('userName', 'user', 'owner') || voucher.from || 'System User'

                          return (
                            <div
                              key={voucher.id}
                              id={`voucher-card-${voucher.id}`}
                              onClick={() => {
                                useVoucherStore.getState().setSelectedVoucher({
                                  ...voucher,
                                  _selectedAt: Date.now(),
                                })
                                onSelectFile?.()
                              }}
                              className={[
                                'group relative mx-3 my-1 flex cursor-pointer flex-col gap-2 rounded-xl p-3 transition-all duration-200 select-none border shadow-2xs',
                                isVoucherActive
                                  ? 'border-indigo-300 bg-indigo-500/10 dark:border-indigo-800 dark:bg-indigo-950/30'
                                  : 'border-border/60 bg-card hover:bg-indigo-500/5 hover:border-indigo-200/50',
                              ].join(' ')}
                            >
                              {isVoucherActive && (
                                <div className='absolute top-1.5 bottom-1.5 left-0 w-1 rounded-l-full bg-indigo-600' />
                              )}
                              <div className='flex items-start justify-between gap-2 min-w-0'>
                                <div className='flex items-center gap-2 min-w-0 flex-1'>
                                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400'>
                                    <FileText className='h-4 w-4' />
                                  </div>
                                  <div className='flex flex-col min-w-0 flex-1'>
                                    <span className='truncate text-xs font-bold text-foreground'>
                                      📄 {voucher.fileName}
                                    </span>
                                    <span className='truncate text-[11px] text-muted-foreground font-medium mt-0.5'>
                                      Vendor: <span className='text-foreground/80 font-semibold'>{vendor}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className='flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground'>
                                <div className='flex items-center gap-2 truncate min-w-0 flex-1'>
                                  <span className='truncate'>User: <strong className='text-foreground/80 font-semibold'>{username}</strong></span>
                                  <span>·</span>
                                  <span className='shrink-0'>{voucher.date}</span>
                                </div>

                                {/* 3-dot dropdown menu in place of price */}
                                <div className='shrink-0 ml-2' onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type='button'
                                        className='flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer'
                                        title='Message actions'
                                      >
                                        <MoreHorizontal className='h-4 w-4' />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align='end'
                                      className='w-40 border border-border bg-popover text-popover-foreground shadow-md rounded-xl p-1'
                                    >
                                      <DropdownMenuItem
                                        onClick={() => {
                                          useVoucherStore.getState().setSelectedVoucher(voucher)
                                          onSelectFile?.()
                                        }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium rounded-lg'
                                      >
                                        <Reply className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>Reply</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => {
                                          useVoucherStore.getState().setSelectedVoucher(voucher)
                                          onSelectFile?.()
                                        }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium rounded-lg'
                                      >
                                        <Forward className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>Forward</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => { }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium rounded-lg'
                                      >
                                        <Star className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>Favorite</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => { }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium rounded-lg'
                                      >
                                        <Pin className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>Pin</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => { }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium rounded-lg'
                                      >
                                        <Flag className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>Flag</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => { }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium rounded-lg'
                                      >
                                        <Archive className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>Archive</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => {
                                          if (voucher.pdfUrl || voucher.originalFileUrl) {
                                            navigator.clipboard?.writeText(voucher.pdfUrl || voucher.originalFileUrl || '')
                                          }
                                        }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium rounded-lg'
                                      >
                                        <Share2 className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>Share</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => {
                                          useVoucherStore.getState().deleteVoucher(voucher.id)
                                        }}
                                        className='cursor-pointer text-xs flex items-center gap-2 py-1.5 font-medium text-destructive hover:text-destructive rounded-lg hover:bg-destructive/10'
                                      >
                                        <Trash2 className='h-3.5 w-3.5 text-destructive' />
                                        <span className='text-destructive'>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </>
                  )}

                </>
              )
            })()
          )}
        </div>
      </div>
    </div>
  )
}
