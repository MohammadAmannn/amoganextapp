import React, { useState, useEffect, useMemo } from 'react'
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  Settings,
  Loader2,
  Upload,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotificationStore, DbNotification } from '@/stores/notification-store'
import { Search as HeaderSearch } from '@/components/search'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Group } from '@/features/chattemplate/groups/types/group.types'
import { MsgContactTab } from '../tabs/contact-manager-tab'
import { MsgGroupTab } from '../tabs/group-manager-tab'
import { UserFolder, DEFAULT_USER_FOLDERS } from '@/features/Message/services/user-storage-files.service'

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
  sectionMode?: 'mail' | 'chat'
  onSectionModeChange?: (mode: 'mail' | 'chat') => void
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

function cleanSenderName(rawName?: string): string {
  if (!rawName) return 'Unknown'
  let cleaned = rawName.replace(/<[^>]+>/g, '').trim()
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim()
  if (!cleaned) {
    const emailMatch = rawName.match(/<([^>]+)>/) || [null, rawName]
    return (emailMatch[1] || rawName).split('@')[0]
  }
  return cleaned
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

function EmailSkeletonList() {
  return (
    <div className='flex flex-col space-y-2 p-2.5 animate-in fade-in duration-200'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className='flex flex-col rounded-xl border border-border/50 bg-card p-3.5 space-y-2.5 shadow-2xs'
        >
          {/* Header Row: Checkbox/Avatar placeholder, Sender Name, Date */}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
              <Skeleton className='h-7 w-7 rounded-full shrink-0 bg-muted/80' />
              <Skeleton className='h-3.5 w-28 sm:w-36 rounded-sm bg-muted/80' />
            </div>
            <Skeleton className='h-3 w-12 rounded-xs shrink-0 bg-muted/60' />
          </div>

          {/* Subject Line */}
          <Skeleton className='h-3.5 w-3/4 rounded-sm bg-muted/90' />

          {/* Body Snippet Lines */}
          <div className='space-y-1.5 pt-0.5'>
            <Skeleton className='h-3 w-full rounded-sm bg-muted/60' />
            <Skeleton className='h-3 w-4/5 rounded-sm bg-muted/40' />
          </div>

          {/* Badges Footer */}
          <div className='flex items-center justify-between pt-1'>
            <div className='flex items-center gap-1.5'>
              <Skeleton className='h-4 w-12 rounded-full bg-muted/70' />
              <Skeleton className='h-4 w-14 rounded-full bg-muted/50' />
            </div>
            <Skeleton className='h-3 w-3 rounded-full shrink-0 bg-muted/40' />
          </div>
        </div>
      ))}
    </div>
  )
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
  groups = [],
  onSelectGroup,
  onRefreshContactsAndGroups,
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
  onSelectAiAssistantTab,
  sectionMode = 'mail',
  onSectionModeChange,
  isComposing,
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
  const router = useRouter()
  const { notifications, unreadCount } = useNotificationStore()
  const selectedVoucher = useVoucherStore((state) => state.selectedVoucher)
  const storeVouchers = useVoucherStore((state) => state.vouchers)
  const [dbVouchers, setDbVouchers] = useState<SavedVoucher[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<'mail' | 'chat' | 'vouchers' | 'ai' | 'ai-assistant' | 'tasks' | 'notification'>('mail')
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

  // setSectionMode proxies to parent-controlled prop so all EmailList instances share one sectionMode
  const setSectionMode = (mode: 'mail' | 'chat') => onSectionModeChange?.(mode)

  const startRange = total > 0 ? (page - 1) * limit + 1 : 0
  const endRange = Math.min(page * limit, total)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - (scrollTop + clientHeight) < 80 && hasMore && !isLoadingMore && !isEmailsLoading) {
      onLoadMore?.()
    }
  }

  const filteredNotifications = React.useMemo(() => {
    if (!searchQuery.trim()) return notifications
    const q = searchQuery.trim().toLowerCase()
    return notifications.filter((notif) => {
      const senderName = notif.message_text.split(' send you a msg')[0] || 'Someone'
      return (
        senderName.toLowerCase().includes(q) ||
        notif.message_text.toLowerCase().includes(q)
      )
    })
  }, [notifications, searchQuery])

  const isSearchingFolders = categoryFilter === 'vouchers' && Boolean(searchQuery && searchQuery.trim())
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
    const map = new Map<string, SavedVoucher>()
    const getFileKey = (v: SavedVoucher) => {
      const name = (v.fileName || '').toLowerCase().trim()
      const url = (v.originalFileUrl || v.editedFileUrl || v.pdfUrl || '').trim()
      if (name && url) return `${name}_${url}`
      if (name) return name
      return v.id
    }

    for (const v of dbVouchers) {
      const key = getFileKey(v)
      if (key) map.set(key, v)
    }
    for (const v of storeVouchers) {
      const key = getFileKey(v)
      if (key && !map.has(key)) map.set(key, v)
    }

    return Array.from(map.values()).sort((a, b) => {
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
        {/* 1. Header: Messages title + Settings + Bell (Desktop only to prevent mobile duplicate) */}
        <div className='hidden md:flex items-center justify-between pb-0.5 border-b border-border/40'>
          <h1 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
            Messages
          </h1>
          <div className='flex items-center gap-1 sm:gap-1.5'>
            <Button
              variant='ghost'
              size='icon'
              className={cn(
                'relative size-7 shrink-0 transition-colors',
                isEmailSettingsSelected && 'bg-accent text-accent-foreground'
              )}
              aria-label='Settings'
              title='Email Settings'
              onClick={() => {
                onSelectEmailSettings?.()
              }}
            >
              <Settings className='size-4' />
            </Button>

            <Button
              variant='ghost'
              size='icon'
              className={cn(
                'relative size-7 shrink-0 transition-colors',
                (categoryFilter === 'notification' || isNotificationSelected) && 'bg-accent text-accent-foreground'
              )}
              aria-label='Notifications'
              title='Notifications'
              onClick={() => {
                setCategoryFilter((prev) => (prev === 'notification' ? 'mail' : 'notification'))
                onSelectNotificationMode?.()
              }}
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
        <div className='rounded-xl bg-muted/20 p-1 flex items-center justify-between gap-1 border-0'>
          {/* 1st Icon: Task / Kanban (visually Calendar icon) */}
          <button
            onClick={() => {
              setCategoryFilter('tasks')
              setSectionMode('mail')
              onSelectMailTab?.()
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0',
              categoryFilter === 'tasks' && 'bg-purple-500/15 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 font-semibold shadow-2xs'
            )}
            title='Tasks / Kanban Board'
          >
            <Calendar className='h-4 w-4' />
          </button>

          {/* 2nd Icon: Email */}
          <button
            onClick={() => {
              setCategoryFilter('mail')
              setSectionMode('mail')
              onSelectMailTab?.()
              if (activeTab === 'chats' || activeTab === 'contact' || activeTab === 'groups' || activeTab === 'folder' ||
                  activeTab === 'chat-contact' || activeTab === 'chat-groups' || activeTab === 'chat-folder' ||
                  activeTab === 'ai-chat' || activeTab === 'ai-recent' || activeTab === 'ai-prompts') {
                onTabChange?.('inbox')
                setMode('inbox')
              }
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0',
              categoryFilter === 'mail' &&
              'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
            )}
            title='Mail Items'
          >
            <Mail className='h-4 w-4' />
          </button>

          {/* 3rd Icon: Chat */}
          <button
            onClick={() => {
              setCategoryFilter('chat')
              setSectionMode('chat')
              onSelectChatTab?.()
              onTabChange?.('chats')
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0',
              categoryFilter === 'chat' &&
              'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold shadow-2xs'
            )}
            title='Chats & Direct Messages'
          >
            <MessageSquare className='h-4 w-4' />
          </button>

          {/* 4th Icon: AI Chat */}
          <button
            onClick={() => {
              setCategoryFilter('ai')
              setSectionMode('mail')
              onSelectMailTab?.()
              onTabChange?.('ai-chat')
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0',
              categoryFilter === 'ai' && 'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
            )}
            title='AI Chat'
          >
            <Sparkles className='h-4 w-4' />
          </button>

          {/* 5th Icon: AI Assistant */}
          <button
            onClick={() => {
              setCategoryFilter('ai-assistant')
              setSectionMode('mail')
              onSelectMailTab?.()
              onTabChange?.('ai-chat')
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0',
              categoryFilter === 'ai-assistant' && 'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
            )}
            title='AI Assistant'
          >
            <Bot className='h-4 w-4' />
          </button>

          {/* 6th Icon: Vouchers / Files */}
          <button
            onClick={() => {
              setCategoryFilter('vouchers')
              setSectionMode('mail')
              onSelectMailTab?.()
              onTabChange?.('vouchers')
            }}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 border-0',
              categoryFilter === 'vouchers' && 'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold shadow-2xs'
            )}
            title='Vouchers'
          >
            <FileText className='h-4 w-4' />
          </button>
        </div>

        {/* Sub-Tabs Bar: Shown for Mail, Chat, AI Chat, AI Assistant, and Vouchers */}
        {!isCollapsed && (categoryFilter === 'mail' || categoryFilter === 'chat' || categoryFilter === 'ai' || categoryFilter === 'ai-assistant' || categoryFilter === 'vouchers') && (
          <div className="w-full py-1 border-b border-border/60 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            {categoryFilter === 'chat' ? (
              <div className="flex items-center gap-3.5 sm:gap-4 text-xs font-medium px-0.5 whitespace-nowrap min-w-max">
                <button
                  onClick={() => {
                    setCategoryFilter('chat')
                    setSectionMode('chat')
                    onTabChange?.('chats')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    (activeTab === 'chats' || !activeTab)
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  Chats
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('chat')
                    setSectionMode('chat')
                    onTabChange?.('chat-contact')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    activeTab === 'chat-contact'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  Contact
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('chat')
                    setSectionMode('chat')
                    onTabChange?.('chat-groups')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    activeTab === 'chat-groups'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  Groups
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('chat')
                    setSectionMode('chat')
                    onTabChange?.('chat-folder')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    activeTab === 'chat-folder'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  Folder
                </button>
              </div>
            ) : (categoryFilter === 'ai' || categoryFilter === 'ai-assistant') ? (
              <div className="flex items-center gap-3.5 sm:gap-4 text-xs font-medium px-0.5 whitespace-nowrap min-w-max">
                <button
                  onClick={() => {
                    onTabChange?.('ai-chat')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    (activeTab === 'ai-chat' || !activeTab || activeTab === 'inbox' || activeTab === 'chats')
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  AI Chat
                </button>
                <button
                  onClick={() => {
                    onTabChange?.('ai-recent')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    activeTab === 'ai-recent'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  Recent
                </button>
                <button
                  onClick={() => {
                    onTabChange?.('ai-prompts')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    activeTab === 'ai-prompts'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  My Prompts
                </button>
              </div>
            ) : categoryFilter === 'vouchers' ? (
              <div className="flex items-center gap-3.5 sm:gap-4 text-xs font-medium px-0.5 whitespace-nowrap min-w-max">
                <button
                  onClick={() => {
                    onTabChange?.('vouchers')
                    onSelectFile?.()
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    (activeTab === 'vouchers' || activeTab === 'file-list' || !activeTab || activeTab === 'inbox' || activeTab === 'chats')
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  File
                </button>
                <button
                  onClick={() => {
                    onTabChange?.('file-recent')
                  }}
                  className={cn(
                    'pb-1 border-b-2 transition-all cursor-pointer select-none',
                    activeTab === 'file-recent'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  Recent
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-3 sm:gap-3.5 text-xs font-medium px-0.5 whitespace-nowrap shrink-0 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => {
                      setCategoryFilter('mail')
                      setSectionMode('mail')
                      onTabChange?.('inbox')
                      setMode('inbox')
                    }}
                    className={cn(
                      'pb-1 border-b-2 transition-all cursor-pointer select-none',
                      (activeTab === 'inbox' || !activeTab)
                        ? 'border-primary text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Inbox
                  </button>
                  <button
                    onClick={() => {
                      setCategoryFilter('mail')
                      setSectionMode('mail')
                      onTabChange?.('send')
                      setMode('done')
                    }}
                    className={cn(
                      'pb-1 border-b-2 transition-all cursor-pointer select-none',
                      activeTab === 'send'
                        ? 'border-primary text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Sent
                  </button>
                  <button
                    onClick={() => {
                      setCategoryFilter('mail')
                      onTabChange?.('folder')
                    }}
                    className={cn(
                      'pb-1 border-b-2 transition-all cursor-pointer select-none',
                      activeTab === 'folder'
                        ? 'border-primary text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Folder
                  </button>
                  <button
                    onClick={() => {
                      setCategoryFilter('mail')
                      onTabChange?.('contact')
                    }}
                    className={cn(
                      'pb-1 border-b-2 transition-all cursor-pointer select-none',
                      activeTab === 'contact'
                        ? 'border-primary text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => {
                      setCategoryFilter('mail')
                      onTabChange?.('groups')
                    }}
                    className={cn(
                      'pb-1 border-b-2 transition-all cursor-pointer select-none',
                      activeTab === 'groups'
                        ? 'border-primary text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Groups
                  </button>
                </div>

                {/* Pagination Range & Arrow Controls (1-20 of 152 < >) strictly right-aligned */}
                {(activeTab === 'inbox' || activeTab === 'send' || !activeTab) && total > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 select-none pr-0.5 ml-auto">
                    <span className="text-[11px] font-medium text-muted-foreground/80 whitespace-nowrap">
                      {startRange}–{endRange} of {total}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={onPrevPage}
                        disabled={page <= 1 || isEmailsLoading}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={onNextPage}
                        disabled={!hasMore || endRange >= total || isEmailsLoading}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Search input (placed below toolbar icons & tabs) + New Button */}
        {!isCollapsed ? (
          <div className='flex items-center gap-1.5 w-full'>
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

            {/* Mail Section: New Compose Email Button */}
            {(categoryFilter === 'mail' || (!categoryFilter && sectionMode === 'mail')) && (
              <button
                onClick={() => onComposeChange?.(true)}
                className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
                title='Compose New Email'
              >
                <Mail className='h-3.5 w-3.5' />
                <span>New</span>
                <Plus className='h-3 w-3' />
              </button>
            )}

            {/* File Section: Upload File Button */}
            {categoryFilter === 'vouchers' && (
              <button
                onClick={() => onUploadFileClick?.()}
                className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
                title='Upload New File'
              >
                <Upload className='h-3.5 w-3.5' />
                <span>Upload</span>
                <Plus className='h-3 w-3' />
              </button>
            )}
          </div>
        ) : (
          <div className='flex justify-center w-full'>
            {(categoryFilter === 'mail' || (!categoryFilter && sectionMode === 'mail')) && (
              <button
                onClick={() => onComposeChange?.(true)}
                className='flex items-center justify-center p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
                title='Compose New Email'
              >
                <Mail className='h-3.5 w-3.5' />
              </button>
            )}
            {categoryFilter === 'vouchers' && (
              <button
                onClick={() => onUploadFileClick?.()}
                className='flex items-center justify-center p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-md shadow-primary/20 border border-transparent'
                title='Upload New File'
              >
                <Upload className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        )}
      </div>

      <div onScroll={handleScroll} className='min-h-0 flex-1 scrollbar-thin overflow-y-auto bg-background'>
        <div className='flex flex-col gap-0 py-0.5'>
          {isEmailsLoading ? (
            <EmailSkeletonList />
          ) : emailsError ? (
            <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-1.5'>
              <span className='text-sm font-semibold text-destructive'>Unable to load emails</span>
              <span className='text-xs text-muted-foreground/60 max-w-[200px] break-words'>{emailsError}</span>
            </div>
          ) : filtered.length === 0 && contacts.length === 0 ? (
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
                          {email.avatarInitials || cleanSenderName(email.name).charAt(0).toUpperCase()}
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
                              {cleanSenderName(email.name)}
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
                  {/* Mail section */}
                  {categoryFilter === 'mail' && (
                    <>
                      {!isCollapsed && mailItems.length > 0 && (
                        <div className='flex items-center gap-2 px-3 pt-1.5 pb-0.5'>
                          <Mail className='h-3 w-3 shrink-0 text-indigo-500' />
                          <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                            {activeTab === 'send' || mode === 'done' ? 'Sent Mails' : 'Inbox Mails'}
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
                        mailItems.map(renderCard)
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
                        chatItems.map(renderCard)
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
                          <p className='font-semibold text-foreground/80'>No notifications</p>
                          <p className='text-[11px] opacity-70 mt-0.5'>
                            {searchQuery ? `No notifications matching "${searchQuery}"` : 'You have no notifications at this time.'}
                          </p>
                        </div>
                      ) : (
                        filteredNotifications.map((notif) => {
                          const isSelected = isNotificationSelected && selectedNotificationId === notif.id
                          const senderName = notif.message_text.split(' send you a msg')[0] || 'Someone'

                          return (
                            <div
                              key={notif.id}
                              id={`notification-card-${notif.id}`}
                              onClick={() => {
                                setCategoryFilter('notification')
                                onSelectNotification(notif)
                              }}
                              className={cn(
                                'group relative mx-3 my-0.5 flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2 transition-all duration-200 select-none border',
                                isSelected
                                  ? 'border-indigo-200/50 bg-indigo-500/10 dark:border-indigo-900/30 dark:bg-indigo-950/20'
                                  : 'border-transparent bg-background hover:bg-muted/30',
                                !notif.read && 'bg-primary/5'
                              )}
                            >
                              {isSelected && (
                                <div className='absolute top-1 bottom-1 left-0 w-0.5 rounded-l-full bg-indigo-600' />
                              )}
                              <div className='flex items-center justify-between'>
                                <div className='flex min-w-0 items-center gap-1.5'>
                                  <span className={cn('truncate text-sm font-medium text-foreground', !notif.read && 'font-semibold')}>
                                    {senderName}
                                  </span>
                                  {!notif.read && (
                                    <span className='inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600' />
                                  )}
                                  <Badge className='h-4 rounded border-indigo-200/30 bg-indigo-500/10 px-1.5 py-0 text-[9px] font-medium text-indigo-600 dark:text-indigo-400'>
                                    Notification
                                  </Badge>
                                </div>
                                <span className='ml-2 shrink-0 text-[10px] whitespace-nowrap text-muted-foreground'>
                                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className='line-clamp-1 text-xs text-muted-foreground/70'>
                                {notif.message_text}
                              </p>
                            </div>
                          )
                        })
                      )}
                    </>
                  )}

                  {/* AI Chat & AI Assistant section (4th & 5th Icons with sub-tabs) */}
                  {(categoryFilter === 'ai' || categoryFilter === 'ai-assistant') && onSelectAiChat && (
                    <>
                      {!isCollapsed && (
                        <div className='flex items-center gap-2 px-3 pt-2 pb-0.5'>
                          {categoryFilter === 'ai' ? (
                            <Sparkles className='h-3 w-3 shrink-0 text-indigo-500' />
                          ) : (
                            <Bot className='h-3 w-3 shrink-0 text-indigo-500' />
                          )}
                          <span className='text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase'>
                            {categoryFilter === 'ai' ? 'AI Chat' : 'AI Assistant'}
                          </span>
                          <div className='h-px flex-1 bg-border' />
                        </div>
                      )}

                      {activeTab === 'ai-recent' ? (
                        <div className='mx-3 my-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
                          <Bot className='mx-auto h-7 w-7 opacity-30 mb-2 text-indigo-500' />
                          <p className='font-semibold text-foreground/80'>Recent AI Chats</p>
                          <p className='text-[11px] opacity-70 mt-0.5'>Coming Soon</p>
                        </div>
                      ) : activeTab === 'ai-prompts' ? (
                        <div className='mx-3 my-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground'>
                          <Sparkles className='mx-auto h-7 w-7 opacity-30 mb-2 text-indigo-500' />
                          <p className='font-semibold text-foreground/80'>My Prompts</p>
                          <p className='text-[11px] opacity-70 mt-0.5'>Coming Soon</p>
                        </div>
                      ) : (
                        <div
                          id='ai-assistant-chat-card'
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
                              Project Roadmap & Tasks
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

                  {/* Storage Folders List for File Tab (File Explorer Nested Tree) */}
                  {categoryFilter === 'vouchers' && onSelectFile && (
                    <>
                      {!isCollapsed && (
                        <div className='flex items-center justify-between px-3 pt-2 pb-0.5'>
                          <div className='flex items-center gap-1.5'>
                            <FolderOpen className='h-3 w-3 shrink-0 text-indigo-500' />
                            <span className='text-[10px] font-semibold  text-muted-foreground/60 uppercase'>
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
                          <p className='font-semibold text-foreground/80'>Recent Files</p>
                          <p className='text-[11px] opacity-70 mt-0.5'>Coming Soon</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5 px-2 py-1">
                          {filteredUserFolders.length === 0 && isSearchingFolders ? (
                            <div className="py-4 px-3 text-center text-xs text-muted-foreground">
                              No folders matching "{searchQuery}"
                            </div>
                          ) : (
                            filteredUserFolders.map((folder) => {
                              const isFolderActive = selectedFolderId === folder.id
                              const isLevel0 = folder.level === 0
                              const isLevel1 = folder.level === 1
                              const isLevel2 = folder.level === 2

                              // Expand/Collapse visibility check (bypassed if user is searching)
                              const isExpanded = expandedFolderIds.has(folder.id)
                              const isVisible =
                                isSearchingFolders ||
                                isLevel0 ||
                                (isLevel1 && expandedFolderIds.has('Chat')) ||
                                (isLevel2 && expandedFolderIds.has('Chat') && expandedFolderIds.has(folder.parentId || ''))

                              if (!isVisible) return null

                            const hasChildren = isLevel0 || isLevel1

                            return (
                              <div
                                key={folder.id}
                                id={`folder-card-${folder.id}`}
                                onClick={() => {
                                  if (hasChildren) {
                                    toggleFolderExpand(folder.id)
                                  } else {
                                    onSelectFolder?.(folder)
                                    onSelectFile?.()
                                  }
                                }}
                                className={cn(
                                  'group relative flex cursor-pointer items-center justify-between gap-2 rounded-xl py-1.5 px-2 transition-all duration-200 select-none border',
                                  isLevel0 && 'font-bold bg-muted/20 border-border/50 my-1',
                                  isLevel1 && 'ml-3 border-border/40 my-0.5',
                                  isLevel2 && 'ml-6 border-transparent hover:bg-muted/40 my-0.5',
                                  isFolderActive
                                    ? 'border-indigo-300 bg-indigo-500/15 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold shadow-2xs'
                                    : 'bg-card hover:bg-indigo-500/5 hover:border-indigo-200/40'
                                )}
                              >
                                {isFolderActive && (
                                  <div className='absolute top-1 bottom-1 left-0 w-1 rounded-l-full bg-indigo-600' />
                                )}
                                <div className='flex items-center gap-1.5 min-w-0 flex-1'>
                                  {hasChildren && (
                                    <button
                                      type="button"
                                      onClick={(e) => toggleFolderExpand(folder.id, e)}
                                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </button>
                                  )}
                                  <div
                                    className={cn(
                                      'flex shrink-0 items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors',
                                      isLevel0 ? 'h-6 w-6 border border-indigo-200/40 bg-indigo-500/10' :
                                      isLevel1 ? 'h-5.5 w-5.5 border border-indigo-200/30 bg-indigo-500/5' :
                                      'h-5 w-5'
                                    )}
                                  >
                                    <FolderOpen className={isLevel0 ? 'h-3.5 w-3.5' : isLevel1 ? 'h-3 w-3' : 'h-3 w-3 text-indigo-500'} />
                                  </div>
                                  <span
                                    className={cn(
                                      'truncate text-foreground',
                                      isLevel0 ? 'text-xs font-bold' : isLevel1 ? 'text-[11px] font-semibold' : 'text-[11px] font-medium',
                                      isFolderActive && 'text-indigo-600 dark:text-indigo-400'
                                    )}
                                  >
                                    {folder.name}
                                  </span>
                                </div>

                                <Badge
                                  variant={isFolderActive ? 'default' : 'secondary'}
                                  className={cn('px-1.5 font-bold shrink-0', isLevel0 ? 'h-4 text-[9px]' : 'h-3.5 text-[8px]')}
                                >
                                  {folder.fileCount}
                                </Badge>
                              </div>
                            )
                          }))}
                        </div>
                      )}
                    </>
                  )}

                </>
              )
            })()
          )}
          {isLoadingMore && (
            <div className='p-2.5 space-y-2 animate-pulse'>
              <div className='flex flex-col rounded-xl border border-border/40 bg-card/60 p-3.5 space-y-2 shadow-2xs'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                    <Skeleton className='h-6 w-6 rounded-full shrink-0 bg-muted/70' />
                    <Skeleton className='h-3 w-28 rounded-sm bg-muted/70' />
                  </div>
                  <Skeleton className='h-2.5 w-10 rounded-xs shrink-0 bg-muted/50' />
                </div>
                <Skeleton className='h-3 w-2/3 rounded-sm bg-muted/80' />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
