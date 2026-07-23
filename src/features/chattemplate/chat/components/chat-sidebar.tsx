import { useState } from 'react'
import { Search, Loader2, MessageSquare, PanelLeft, Check, CheckCheck, Clock, Mic, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getDisplayNameInitials } from '@/lib/utils'
import { Conversation } from '../types/chat.types'
import { UserTypingState } from '../types/typing.types'
import { isCapacitor } from '@/lib/platform'
import { Button } from '@/components/ui/button'
import { MyProfileDialog } from './my-profile-dialog'
import { useAuthStore } from '@/stores/auth-store'

interface ChatSidebarProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (convo: Conversation) => void
  isLoading?: boolean
  onNavigateToTab?: (tab: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  onlineUserIds?: Set<string>
  currentUserId?: string
  conversationTypingMap?: Record<string, UserTypingState[]>
  onDeleteConversation?: (conversationId: string) => void
}

export function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading = false,
  onNavigateToTab,
  isCollapsed,
  onToggleCollapse,
  onlineUserIds,
  currentUserId,
  conversationTypingMap = {},
  onDeleteConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const currentUser = useAuthStore((state) => state.auth.user)
  const isMobileApp = isCapacitor()

  // Filter conversations based on name query
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase()
    return c.name?.toLowerCase().includes(q)
  })

  // Helper to resolve preview text for different media types
  const getLastMessageText = (convo: Conversation) => {
    const msg = convo.lastMessage
    if (!msg) return 'No messages yet'
    if (msg.message_type === 'image') return '📷 Image'
    if (msg.message_type === 'video') return '🎥 Video'
    if (msg.message_type === 'document') return '📁 Document'
    if (msg.message_type === 'audio') return '🎤 Voice note'
    return msg.message || ''
  }

  // Format message time as short HH:MM string
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className='flex h-full w-full flex-col bg-card border-0 sm:border border-border rounded-none sm:rounded-xl shadow-xs overflow-hidden shrink-0'>
      {/* Search & Header Section */}
      <div className='p-3.5 border-b border-border bg-muted/10 shrink-0 flex items-center justify-between gap-2 h-[73px]'>
        {/* Render Profile Avatar button ONLY on Mobile APK (isCapacitor() === true) */}
        {isMobileApp && (
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex-shrink-0 p-0.5 rounded-full border border-border/80 hover:border-primary transition-all cursor-pointer"
            title="Open My Profile"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser?.picture} />
              <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                {getDisplayNameInitials(currentUser?.name || 'ME')}
              </AvatarFallback>
            </Avatar>
          </button>
        )}

        <div className={cn(
          'relative flex-grow flex-1 min-w-0 transition-all duration-300 animate-in fade-in duration-200',
          isCollapsed ? 'block lg:hidden' : 'block'
        )}>
          <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70' />
          <Input
            placeholder='Search chats...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9 rounded-xl border-border/80 bg-background/50 focus-visible:ring-primary/50 text-xs h-10 w-full'
          />
        </div>
        <Button
          size='icon'
          variant='ghost'
          onClick={onToggleCollapse}
          className={cn(
            'hidden lg:flex h-10 w-10 shrink-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer',
            isCollapsed ? 'mx-auto' : ''
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className={cn('h-5 w-5 transition-transform duration-200', isCollapsed ? 'rotate-180' : '')} />
        </Button>
      </div>

      {isMobileApp && (
        <MyProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      )}

      {/* Main List Scroll Area */}
      <div className='flex-grow overflow-y-auto p-2 scrollbar-thin'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-14 text-muted-foreground/80 space-y-2'>
            <Loader2 className='h-5 w-5 animate-spin text-primary' />
            <p className='text-[10px] font-medium'>Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-14 text-muted-foreground/80 space-y-2'>
            <MessageSquare className='h-8 w-8 stroke-1 text-muted-foreground/40' />
            <p className='text-xs font-medium'>No chats found</p>
          </div>
        ) : (
          <div className='space-y-1'>
            {filteredConversations.map((convo) => {
              const isSelected = selectedConversation?.id === convo.id
              const unreadCount = convo.unreadCount || 0
              const initials = getDisplayNameInitials(convo.name || 'Chat')

              // Check if user is online
              const otherUserObj = convo.members?.find(m => m.user_id !== currentUserId)
              const otherUserId = otherUserObj?.user_id || convo.id
              const isUserOnline = onlineUserIds?.has(otherUserId)

              // Check typing status
              const typingUsers = conversationTypingMap[convo.id] || []
              const activeTyping = typingUsers.find(u => u.userId !== currentUserId)

              return (
                <div
                  key={convo.id}
                  onClick={() => onSelectConversation(convo)}
                  className={cn(
                    'group relative flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-2xs font-medium'
                      : 'hover:bg-muted/60 text-foreground border border-transparent'
                  )}
                >
                  {/* User Avatar with Online status indicator */}
                  <div className='relative flex-shrink-0'>
                    <Avatar className='h-11 w-11 border border-border/60 transition-transform group-hover:scale-102'>
                      <AvatarImage src={convo.image} alt={convo.name || 'Chat'} />
                      <AvatarFallback className='text-xs font-bold bg-muted text-foreground'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isUserOnline && (
                      <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background shadow-2xs animate-in zoom-in duration-300' />
                    )}
                  </div>

                  {/* Text details */}
                  <div className={cn(
                    'flex flex-1 flex-col min-w-0 transition-all duration-300',
                    isCollapsed ? 'hidden lg:hidden' : 'flex'
                  )}>
                    <div className='flex items-center justify-between gap-1'>
                      <span className='text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors'>
                        {convo.name || 'Direct Chat'}
                      </span>
                      {convo.lastMessage?.created_at && (
                        <span className='text-[10px] text-muted-foreground/80 flex-shrink-0 font-normal'>
                          {formatTime(convo.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    <div className='flex items-center justify-between gap-1 mt-0.5'>
                      {activeTyping ? (
                        <span className='text-[11px] font-semibold text-emerald-500 animate-pulse flex items-center gap-1 truncate'>
                          {activeTyping.status === 'recording' ? (
                            <>
                              <Mic className='h-3 w-3 animate-bounce text-red-500' />
                              <span className='text-red-500'>recording audio...</span>
                            </>
                          ) : (
                            <>typing...</>
                          )}
                        </span>
                      ) : (
                        <p className='text-xs text-muted-foreground truncate font-normal'>
                          {getLastMessageText(convo)}
                        </p>
                      )}

                      {/* Unread badge & trash icon */}
                      <div className='flex items-center gap-1.5 flex-shrink-0'>
                        {unreadCount > 0 && (
                          <span className='h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-2xs'>
                            {unreadCount}
                          </span>
                        )}

                        {onDeleteConversation && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteConversation(convo.id)
                            }}
                            className='opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all cursor-pointer'
                            title='Delete conversation'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
