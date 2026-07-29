import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Search,
  X,
  PanelLeft,
  MoreHorizontal,
  CornerUpLeft,
  CornerUpRight,
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Conversation } from '@/features/chattemplate/chat/types/chat.types'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { Email } from '../data/emails'

interface EmailListProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (email: Email) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  mode: 'inbox' | 'done'
  setMode: (mode: 'inbox' | 'done') => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  contacts?: Contact[]
  selectedContactId?: string | null
  onSelectContact?: (contact: Contact) => void
  conversations?: Conversation[]
  onSelectConversation?: (conversation: Conversation) => void
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
}: EmailListProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

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

  return (
    <div className='flex h-full w-full shrink-0 flex-col overflow-hidden bg-background'>
      {!isCollapsed && (
        <div className='shrink-0 border-b border-border bg-background px-3 pt-3 pb-2'>
          <div className='relative mb-2'>
            <select
              className='h-8 w-full cursor-pointer appearance-none rounded-md border border-border bg-muted/10 px-3 text-xs font-medium text-foreground transition-colors outline-none hover:bg-muted/20 focus:ring-1 focus:ring-primary/30'
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.2em 1.2em',
                paddingRight: '2.5rem',
              }}
            >
              <option value='all'>Select Accounts</option>
              {emailAccounts.map((account) => (
                <option key={account.email} value={account.email}>
                  {account.avatarInitials} {account.name} &lt;{account.email}
                  &gt;
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <div className='relative min-w-0 flex-1'>
              <Search className='absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60' />
              <Input
                placeholder='Search Emails...'
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

            <button
              onClick={onToggleCollapse}
              className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              title={isCollapsed ? 'Expand list' : 'Collapse list'}
            >
              <PanelLeft
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  isCollapsed ? 'rotate-180' : ''
                )}
              />
            </button>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className='flex shrink-0 justify-center border-b border-border bg-background px-3 pt-3 pb-2'>
          <button
            onClick={onToggleCollapse}
            className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            title={isCollapsed ? 'Expand list' : 'Collapse list'}
          >
            <PanelLeft
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                isCollapsed ? 'rotate-180' : ''
              )}
            />
          </button>
        </div>
      )}

      <div className='min-h-0 flex-1 scrollbar-thin overflow-y-auto bg-background'>
        <div className='flex flex-col gap-0.5 py-1'>
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
                        ? 'mx-1.5 my-0.5 justify-center rounded-lg p-2 hover:bg-muted/30'
                        : 'mx-1.5 my-0.5 flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-muted/40 hover:shadow-xs',
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
                  {mailItems.length > 0 && (
                    <>
                      {!isCollapsed && (
                        <div className='flex items-center gap-2 px-3 pt-2 pb-1'>
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

                  {chatItems.length > 0 && (
                    <>
                      {!isCollapsed && (
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
                      {chatItems.map(renderCard)}
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
