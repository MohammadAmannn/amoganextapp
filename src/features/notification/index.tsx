'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  Mail, 
  Search as SearchIcon, 
  Trash2, 
  X, 
  ChevronRight, 
  MessageSquare, 
  CheckCheck, 
  Inbox as InboxIcon,
  Download,
  FileText,
  Filter,
  ChevronDown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Main } from '@/components/layout/main'
import { AppHeader } from '@/components/layout/app-header'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore, DbNotification } from '@/stores/notification-store'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ComingSoon } from '@/components/coming-soon'

interface ChatMessageDetail {
  id: string
  conversation_id: string
  sender_user_id: string | null
  message: string
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'system'
  created_at: string
  file_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  sender?: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export function Notifications() {
  const currentUser = useAuthStore((state) => state.auth.user)
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [activeMenuTab, setActiveMenuTab] = useState('new')
  const [selectedNotification, setSelectedNotification] = useState<DbNotification | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessageDetail | null>(null)
  const [isFetchingMessage, setIsFetchingMessage] = useState(false)

  // Load and refresh notifications list
  useEffect(() => {
    if (currentUser) {
      fetchNotifications(currentUser.accountNo)
    }
  }, [currentUser, fetchNotifications])

  // Filter notifications list
  const filteredNotifications = notifications.filter((notif) => {
    const senderName = notif.message_text.split(' send you a msg')[0] || 'Someone'
    const matchesSearch =
      senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message_text.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = tab === 'all' || !notif.read
    return matchesSearch && matchesTab
  })

  // Format relative time safely
  const formatTime = (timeString: string) => {
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true })
    } catch {
      return 'just now'
    }
  }

  const handleSelectNotification = async (notif: DbNotification) => {
    setSelectedNotification(notif)
    setSelectedMessage(null)

    // Mark as read in database
    if (!notif.read) {
      await markAsRead(notif.id)
    }

    if (notif.message_id) {
      setIsFetchingMessage(true)
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
          setSelectedMessage(data as ChatMessageDetail)
        }
      } catch (err) {
        console.error('Error fetching message details:', err)
      } finally {
        setIsFetchingMessage(false)
      }
    }
  }

  const handleCloseMessage = () => {
    setSelectedNotification(null)
    setSelectedMessage(null)
  }

  return (
    <>
      <AppHeader title='Notifications' />

      <Main className='flex flex-1 flex-col p-4 sm:p-6 pt-3 sm:pt-3 bg-background overflow-hidden'>
        {selectedNotification ? (
          /* Full Page Selected Message View */
          <div className='flex flex-col h-full w-full bg-background border border-border rounded-2xl overflow-hidden shadow-sm'>
            {/* Header with Close Action */}
            <div className='flex items-center gap-3 p-4 border-b border-border shrink-0 bg-background'>
              {/* CROSS ICON at Left to close message view */}
              <Button
                variant='ghost'
                size='icon'
                onClick={handleCloseMessage}
                className='h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0'
                title='Close message'
              >
                <X className='h-5 w-5' />
              </Button>

              <div className='h-6 w-px bg-border' />

              {/* Sender Profile Header */}
              {selectedMessage?.sender ? (
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar className='h-9 w-9'>
                    <AvatarImage 
                      src={selectedMessage.sender.avatar || undefined} 
                      alt={selectedMessage.sender.name} 
                    />
                    <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
                      {selectedMessage.sender.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <h3 className='text-sm font-semibold text-foreground truncate'>
                      {selectedMessage.sender.name}
                    </h3>
                    <p className='text-xs text-muted-foreground truncate'>
                      {selectedMessage.sender.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='min-w-0'>
                  <h3 className='text-sm font-semibold text-foreground truncate'>
                    System Alert / Chat Update
                  </h3>
                  <p className='text-xs text-muted-foreground truncate'>
                    {formatTime(selectedNotification.created_at)}
                  </p>
                </div>
              )}
            </div>

            {/* Message Details Body */}
            <ScrollArea className='flex-1 p-6 bg-muted/10'>
              <div className='max-w-2xl mx-auto space-y-6'>
                {isFetchingMessage ? (
                  <div className='flex flex-col items-center justify-center py-20 gap-3'>
                    <div className='h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full' />
                    <p className='text-sm text-muted-foreground'>Loading message details...</p>
                  </div>
                ) : selectedMessage ? (
                  <div className='space-y-4'>
                    <div className='bg-background border border-border shadow-sm rounded-2xl p-6 space-y-4'>
                      <div className='flex items-center justify-between border-b pb-3 border-border/60'>
                        <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          Message Content
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          Sent {formatTime(selectedMessage.created_at)}
                        </span>
                      </div>
                      
                      {/* Text Message */}
                      <div className='text-sm text-foreground leading-relaxed whitespace-pre-wrap select-text'>
                        {selectedMessage.message}
                      </div>

                      {/* File Attachment Details */}
                      {selectedMessage.file_url && (
                        <div className='mt-4 flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 border-dashed border-muted/55 bg-muted/10 hover:bg-muted/20 transition-colors'>
                          <div className='flex items-center gap-3 min-w-0'>
                            <div className='p-2 bg-primary/10 text-primary rounded-lg shrink-0'>
                              <FileText className='h-5 w-5' />
                            </div>
                            <div className='min-w-0 space-y-0.5'>
                              <p className='text-sm font-medium text-foreground truncate'>
                                {selectedMessage.file_name || 'Attached File'}
                              </p>
                              {selectedMessage.file_size && (
                                <p className='text-xs text-muted-foreground'>
                                  {(selectedMessage.file_size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant='ghost' 
                            size='icon' 
                            asChild
                            className='h-8 w-8 shrink-0 hover:bg-background shadow-sm'
                          >
                            <a href={selectedMessage.file_url} download={selectedMessage.file_name} target='_blank' rel='noopener noreferrer'>
                              <Download className='h-4 w-4' />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='bg-background border border-border shadow-sm rounded-2xl p-6 text-center space-y-3'>
                    <Mail className='h-8 w-8 text-muted-foreground opacity-40 mx-auto' />
                    <p className='text-sm font-semibold'>Message Preview Unavailable</p>
                    <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
                      The message content could not be retrieved from the database. It might have been deleted or the sender account was archived.
                    </p>
                    <div className='pt-2'>
                      <div className='bg-muted/20 text-xs p-3 rounded-lg border text-left font-mono break-all text-muted-foreground'>
                        {selectedNotification.message_text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Reverted Layout matches standard list mockup screen */
          <Tabs
            value={activeMenuTab}
            onValueChange={setActiveMenuTab}
            className='flex flex-1 flex-col overflow-hidden space-y-4'
          >
            <div className='w-full overflow-x-auto pb-2 shrink-0 border-b border-border px-4 sm:px-0'>
              <TabsList className='h-auto gap-6 border-0 bg-transparent p-0 shadow-none rounded-none'>
                <TabsTrigger
                  value='new'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  New
                </TabsTrigger>
                <TabsTrigger
                  value='important'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Important
                </TabsTrigger>
                <TabsTrigger
                  value='flow'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Flow
                </TabsTrigger>
                <TabsTrigger
                  value='read'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Read
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value='new'
              className='flex-1 flex flex-col gap-4 sm:gap-6 overflow-hidden mt-0 focus-visible:outline-none'
            >
              {/* Search Bar - Centered */}
              <div className='flex flex-col items-center justify-center w-full max-w-3xl mx-auto gap-4 shrink-0'>
                <div className='relative w-full'>
                  <SearchIcon className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='inbox-search'
                    placeholder='Search notifications...'
                    className='pl-11 pr-4 py-6 text-base rounded-2xl border-2 border-muted/30 bg-background shadow-sm hover:shadow-md transition-all duration-200 focus:border-primary/50 focus:shadow-lg'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2'>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                      >
                        Clear
                      </button>
                    )}
                    <Badge variant='outline' className='hidden sm:flex text-xs px-2 py-0.5 bg-muted/20'>
                      {filteredNotifications.length} {filteredNotifications.length === 1 ? 'result' : 'results'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 shrink-0'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <InboxIcon className='h-5 w-5 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      {filteredNotifications.length} {filteredNotifications.length === 1 ? 'conversation' : 'conversations'}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant='default' className='rounded-full px-3 py-1 text-xs font-medium'>
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>

                <div className='flex items-center gap-2 w-full sm:w-auto'>
                  <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'unread')} className='w-full sm:w-auto'>
                    <TabsList className='h-9 w-full sm:w-auto bg-muted/30'>
                      <TabsTrigger value='all' className='text-xs px-4 flex-1 sm:flex-none'>
                        All
                      </TabsTrigger>
                      <TabsTrigger value='unread' className='text-xs px-4 flex-1 sm:flex-none'>
                        Unread
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <button className='hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition-colors text-xs font-medium'>
                    <Filter className='h-3.5 w-3.5' />
                    Filter
                  </button>
                </div>
              </div>

              {/* Live Notifications Feed List */}
              <ScrollArea className='flex-1 overflow-y-auto'>
                <div className='flex flex-col gap-2 pb-4'>
                  {filteredNotifications.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
                      <div className='rounded-full bg-muted/20 p-6 mb-4'>
                        <Mail className='h-10 w-10 opacity-30' />
                      </div>
                      <p className='text-sm font-medium'>No notifications found</p>
                      <p className='text-xs text-muted-foreground/60 mt-1'>Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif, index) => {
                      const senderName = notif.message_text.split(' send you a msg')[0] || 'Someone'
                      
                      return (
                        <div
                          key={notif.id}
                          id={`email-item-${notif.id}`}
                          onClick={() => handleSelectNotification(notif)}
                          className={cn(
                            'group relative flex flex-col gap-2 rounded-xl p-4 transition-all duration-200 cursor-pointer',
                            'hover:bg-muted/50 hover:shadow-sm border border-border/45',
                            !notif.read 
                              ? 'bg-primary/5 border-l-4 border-l-primary' 
                              : 'bg-background hover:bg-muted/30'
                          )}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2.5 mb-1 flex-wrap'>
                                <span className={cn(
                                  'text-sm font-medium truncate',
                                  !notif.read && 'font-semibold'
                                )}>
                                  {senderName}
                                </span>
                                {!notif.read && (
                                  <span className='inline-flex h-2 w-2 rounded-full bg-primary flex-shrink-0' />
                                )}
                                <div className='flex flex-wrap gap-1'>
                                  <Badge
                                    variant='outline'
                                    className='rounded-md px-2 py-0 text-[10px] font-medium'
                                  >
                                    notification
                                  </Badge>
                                </div>
                              </div>
                              <p className={cn(
                                'text-sm truncate',
                                !notif.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                              )}>
                                New Chat Notification
                              </p>
                              <p className='text-xs text-muted-foreground/70 line-clamp-2 mt-1.5 leading-relaxed'>
                                {notif.message_text}
                              </p>
                            </div>
                            <div className='flex flex-col items-end gap-2 flex-shrink-0'>
                              <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                                {formatTime(notif.created_at)}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notif.id)
                                }}
                                className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 p-1 rounded hover:bg-muted/50'
                              >
                                <span className='sr-only'>Delete</span>
                                <Trash2 className='h-3.5 w-3.5' />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value='important'
              className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
            >
              <ComingSoon />
            </TabsContent>

            <TabsContent
              value='flow'
              className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
            >
              <ComingSoon />
            </TabsContent>

            <TabsContent
              value='read'
              className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
            >
              <ComingSoon />
            </TabsContent>
          </Tabs>
        )}
      </Main>
    </>
  )
}
