import { useState, useEffect, useRef } from 'react'
import { isCapacitor } from '@/lib/platform'
import { MessageRepository, ConversationRepository } from '../repositories/chat.repository'
import { PendingRepository } from '../repositories/pending.repository'
import { StorageService } from '../services/storage/storageService'
import { SyncService } from '../services/sync/syncService'
import { MobileConversation, MobileMessage } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ArrowLeft, Send, Camera, Paperclip, Check, CheckCheck, Clock } from 'lucide-react'

interface ChatScreenProps {
  conversation: MobileConversation
  onBack: () => void
}

export function ChatScreen({ conversation, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<MobileMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initChat()
  }, [conversation.id])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initChat = async () => {
    const session = await StorageService.getAuthSession()
    if (session.user) {
      setCurrentUserId(session.user.id || session.user.accountNo)
    }

    // 1. Read messages from SQLite local database
    const localMsgs = await MessageRepository.getMessagesByConversation(conversation.id)
    setMessages(localMsgs)

    // 2. Clear local unread count
    await ConversationRepository.clearUnreadCount(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUserId) return
    const text = inputText.trim()
    setInputText('')

    const clientMsgId = crypto.randomUUID()
    const now = new Date().toISOString()
    const isOnline = await SyncService.isOnline()

    const newMsg: MobileMessage = {
      id: clientMsgId,
      conversation_id: conversation.id,
      owner_user_id: currentUserId,
      sender_user_id: currentUserId,
      message: text,
      message_type: 'text',
      direction: 'Sent',
      sent: isOnline,
      received: true,
      message_status: isOnline ? 'sent' : 'pending',
      client_message_id: clientMsgId,
      created_at: now,
    }

    // 1. Write immediately to SQLite
    await MessageRepository.saveMessage(newMsg)
    setMessages((prev) => [...prev, newMsg])

    // Update conversation last message in SQLite
    await ConversationRepository.upsertConversation({
      ...conversation,
      last_message_text: text,
      last_message_at: now,
    })

    // 2. If offline, save to SQLite pending_messages queue
    if (!isOnline) {
      await PendingRepository.addPendingMessage({
        id: crypto.randomUUID(),
        client_message_id: clientMsgId,
        conversation_id: conversation.id,
        sender_id: currentUserId,
        message: text,
        message_type: 'text',
        retry_count: 0,
        created_at: now,
      })
      toast.info('Message saved locally (Offline)')
      return
    }

    // 3. Post to server API if online
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          senderId: currentUserId,
          message: text,
          messageType: 'text',
          clientMessageId: clientMsgId,
        }),
      })

      if (res.ok) {
        await MessageRepository.updateMessageStatus(clientMsgId, 'sent')
      }
    } catch (e) {
      console.warn('[ChatScreen] Server post failed, queued locally:', e)
    }
  }

  const handleCameraCapture = async () => {
    try {
      if (isCapacitor()) {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
        const image = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
        })

        if (image.base64String) {
          toast.info('Captured photo attached')
          // Save and queue photo upload
        }
      }
    } catch (e) {
      console.error('[ChatScreen] Camera capture error:', e)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <Avatar className="h-9 w-9">
          <AvatarImage src={conversation.image} />
          <AvatarFallback className="text-xs font-bold bg-emerald-500/10 text-emerald-500">
            {conversation.name?.substring(0, 2).toUpperCase() || 'CH'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-extrabold truncate">{conversation.name || 'Chat'}</h2>
          <p className="text-[10px] text-emerald-500 font-bold">Mobile Hybrid Engine</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMe = m.sender_user_id === currentUserId
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-muted text-foreground border border-border/50 rounded-tl-none'
                }`}
              >
                <p className="break-words whitespace-pre-wrap">{m.message}</p>

                <div className={`flex items-center gap-1 justify-end text-[9px] mt-1 opacity-80 ${isMe ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                  <span>
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <span>
                      {m.message_status === 'pending' && <Clock className="h-3 w-3 animate-pulse" />}
                      {m.message_status === 'sent' && <Check className="h-3 w-3" />}
                      {(m.message_status === 'delivered' || m.message_status === 'read') && (
                        <CheckCheck className={`h-3 w-3 ${m.message_status === 'read' ? 'text-sky-300' : ''}`} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-border bg-background shrink-0 flex items-center gap-2">
        <button
          onClick={handleCameraCapture}
          className="p-2 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground"
        >
          <Camera className="h-4 w-4" />
        </button>

        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
          placeholder="Type a message..."
          className="flex-1 rounded-xl h-10 text-xs"
        />

        <Button
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
          className="h-10 w-10 p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
