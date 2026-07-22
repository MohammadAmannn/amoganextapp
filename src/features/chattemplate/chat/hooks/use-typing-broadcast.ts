import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TypingStatus, TypingBroadcastPayload, UserTypingState } from '../types/typing.types'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useTypingBroadcast(
  userId: string | undefined,
  userName: string | undefined
) {
  const [conversationTypingMap, setConversationTypingMap] = useState<Record<string, UserTypingState[]>>({})
  const channelRef = useRef<RealtimeChannel | null>(null)
  const autoCleanupTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Supabase Broadcast channel
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase.channel('chat-typing-room')

    channel
      .on('broadcast', { event: 'typing_status' }, ({ payload }: { payload: TypingBroadcastPayload }) => {
        // Ignore self events
        if (payload.userId === userId) return

        const { conversationId, userId: senderId, userName: senderName, status, timestamp } = payload

        setConversationTypingMap(prevMap => {
          const existingList = prevMap[conversationId] || []
          
          if (status === 'idle') {
            // Remove user from typing list for this conversation
            const filtered = existingList.filter(u => u.userId !== senderId)
            if (filtered.length === 0) {
              const newMap = { ...prevMap }
              delete newMap[conversationId]
              return newMap
            }
            return { ...prevMap, [conversationId]: filtered }
          } else {
            // Add or update typing/recording user
            const otherUsers = existingList.filter(u => u.userId !== senderId)
            const updatedUserState: UserTypingState = {
              userId: senderId,
              userName: senderName || 'Someone',
              status,
              timestamp,
            }
            return {
              ...prevMap,
              [conversationId]: [...otherUsers, updatedUserState],
            }
          }
        })
      })
      .subscribe()

    channelRef.current = channel

    // Periodic cleanup for stale typing/recording states (stale after 4 seconds)
    autoCleanupTimerRef.current = setInterval(() => {
      const now = Date.now()
      setConversationTypingMap(prevMap => {
        let hasChanges = false
        const nextMap: Record<string, UserTypingState[]> = {}

        Object.entries(prevMap).forEach(([convoId, users]) => {
          const freshUsers = users.filter(u => now - u.timestamp < 4000)
          if (freshUsers.length !== users.length) {
            hasChanges = true
          }
          if (freshUsers.length > 0) {
            nextMap[convoId] = freshUsers
          }
        })

        return hasChanges ? nextMap : prevMap
      })
    }, 1500)

    return () => {
      if (autoCleanupTimerRef.current) clearInterval(autoCleanupTimerRef.current)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId])

  // Broadcast typing status
  const sendTypingStatus = useCallback(
    (conversationId: string | undefined, status: TypingStatus) => {
      if (!userId || !conversationId || !channelRef.current) return

      const payload: TypingBroadcastPayload = {
        userId,
        userName: userName || 'User',
        conversationId,
        status,
        timestamp: Date.now(),
      }

      channelRef.current.send({
        type: 'broadcast',
        event: 'typing_status',
        payload,
      })
    },
    [userId, userName]
  )

  // Get active typing/recording users for a specific conversation
  const getTypingUsersForConversation = useCallback(
    (conversationId: string | undefined): UserTypingState[] => {
      if (!conversationId) return []
      return conversationTypingMap[conversationId] || []
    },
    [conversationTypingMap]
  )

  return {
    sendTypingStatus,
    getTypingUsersForConversation,
    conversationTypingMap,
  }
}

export default useTypingBroadcast
