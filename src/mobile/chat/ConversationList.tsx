import { useState, useEffect } from 'react'
import { ConversationRepository } from '../repositories/chat.repository'
import { SyncService } from '../services/sync/syncService'
import { MobileConversation } from '../types'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare, WifiOff, RefreshCw } from 'lucide-react'

interface ConversationListProps {
  onSelectConversation: (convo: MobileConversation) => void
  onOpenProfile: () => void
}

export function ConversationList({ onSelectConversation, onOpenProfile }: ConversationListProps) {
  const [conversations, setConversations] = useState<MobileConversation[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadLocalConversations()
    checkNetwork()
  }, [])

  const checkNetwork = async () => {
    const online = await SyncService.isOnline()
    setIsOnline(online)
  }

  const loadLocalConversations = async () => {
    // Read directly from SQLite local database
    const convos = await ConversationRepository.getAllConversations()
    setConversations(convos)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await SyncService.syncAll()
    await loadLocalConversations()
    await checkNetwork()
    setIsRefreshing(false)
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h1 className="text-base font-extrabold tracking-tight">Chats</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-muted text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenProfile}
            className="p-1 rounded-full border border-border/80 hover:bg-muted"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                ME
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
          <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          <span>Offline Mode — Loading from Local SQLite Cache</span>
        </div>
      )}

      {/* Conversation List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-muted-foreground">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-bold">No Conversations Found</p>
            <p className="text-[11px] mt-1 opacity-70">
              Your conversations stored in local SQLite will appear here.
            </p>
          </div>
        ) : (
          conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => onSelectConversation(convo)}
              className="flex items-center gap-3 p-3.5 hover:bg-muted/50 cursor-pointer active:bg-muted/80 transition-colors"
            >
              <Avatar className="h-12 w-12 border border-border/60">
                <AvatarImage src={convo.image} />
                <AvatarFallback className="text-xs font-bold bg-emerald-500/10 text-emerald-500">
                  {convo.name?.substring(0, 2).toUpperCase() || 'CH'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold truncate text-foreground">
                    {convo.name || 'Conversation'}
                  </h3>
                  {convo.last_message_at && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(convo.last_message_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {convo.last_message_text || 'No messages yet'}
                  </p>
                  {convo.unread_count > 0 && (
                    <span className="h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
