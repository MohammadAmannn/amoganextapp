import { useState, useCallback } from 'react'
import { getOfflineMessages } from '../managers/message-queue'
import { getConversationMessages } from '../repositories/message-repository'
import { Message } from '../types/chat.types'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 50

  const loadMessages = useCallback(
    async (conversationId: string, userId: string) => {
      setIsLoading(true)
      try {
        const page = await getConversationMessages(conversationId, userId, {
          limit: pageSize + 1,
        })
        setHasMore(page.length > pageSize)
        const dbMessages = page.slice(-pageSize)

        // Load offline queued messages from IndexedDB
        const queuedData = await getOfflineMessages()
        const queuedMessagesForConvo: Message[] = queuedData
          .filter((q) => q.conversation_id === conversationId)
          .map((q) => ({
            id: q.client_message_id,
            conversation_id: q.conversation_id,
            owner_user_id: q.sender_id,
            sender_user_id: q.sender_id,
            message: q.message,
            message_type: q.message_type,
            direction: 'Sent',
            sent: false,
            received: false,
            created_at: q.created_at,
            message_status: 'pending',
            client_message_id: q.client_message_id,
            replyto_message_id: q.reply_metadata?.replyto_message_id,
            replyto_user_id: q.reply_metadata?.replyto_user_id,
            parent_message_id: q.reply_metadata?.parent_message_id,

            file_name: q.attachment_metadata?.fileName,
            file_size: q.attachment_metadata?.fileSize,
            mime_type: q.attachment_metadata?.mimeType,
            duration: q.attachment_metadata?.duration,

            thumb: false,
            favorite: false,
            flag: false,
            star: false,
            pin: false,
            archive: false,
            deleted: false,
            action_this: false,
            reply: !!q.reply_metadata,
            forward: false,
          }))

        setMessages([...dbMessages, ...queuedMessagesForConvo])
      } catch (e) {
        console.error('Failed to load conversation messages:', e)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const loadOlderMessages = useCallback(
    async (conversationId: string, userId: string) => {
      if (isLoadingOlder || !hasMore) return
      const firstPersisted = messages.find(
        (message) => message.message_status !== 'pending'
      )
      if (!firstPersisted) return

      setIsLoadingOlder(true)
      try {
        const page = await getConversationMessages(conversationId, userId, {
          limit: pageSize + 1,
          before: firstPersisted.created_at,
        })
        setHasMore(page.length > pageSize)
        const older = page.slice(-pageSize)
        setMessages((previous) => {
          const existingIds = new Set(previous.map((message) => message.id))
          return [
            ...older.filter((message) => !existingIds.has(message.id)),
            ...previous,
          ]
        })
      } finally {
        setIsLoadingOlder(false)
      }
    },
    [hasMore, isLoadingOlder, messages]
  )

  return {
    messages,
    setMessages,
    isLoading,
    isLoadingOlder,
    hasMore,
    loadMessages,
    loadOlderMessages,
  }
}
export default useMessages
