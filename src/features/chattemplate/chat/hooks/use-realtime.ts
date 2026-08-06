import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Message } from '../types/chat.types'

interface RealtimeListener {
  onInsert: (message: Message) => void
  onUpdate?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

interface RealtimeHub {
  channel: RealtimeChannel
  client: ReturnType<typeof createClient>
  listeners: Set<RealtimeListener>
}

// A page can render several chat consumers (sidebar, active window, notification
// integration). Supabase does not allow adding postgres_changes handlers to an
// existing channel after subscribe(), so all consumers share one channel per user.
const realtimeHubs = new Map<string, RealtimeHub>()

async function mapRealtimeMessage(record: any): Promise<Message> {
  let senderProfile: Message['sender']

  if (record.sender_user_id) {
    try {
      const response = await fetch(`/api/profiles/${record.sender_user_id}`)
      if (response.ok) {
        const profile = await response.json()
        senderProfile = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar || undefined,
        }
      }
    } catch (error) {
      console.error(
        'Failed to load sender profile for realtime message:',
        error
      )
    }
  }

  return {
    id: record.id,
    conversation_id: record.conversation_id,
    owner_user_id: record.owner_user_id,
    sender_user_id: record.sender_user_id,
    message: record.message,
    message_type: record.message_type,
    direction: record.direction,
    sent: record.sent,
    received: record.received,
    created_at: record.created_at,

    message_status: record.message_status || undefined,
    client_message_id: record.client_message_id || undefined,
    queued_at: record.queued_at || undefined,
    delivered_at: record.delivered_at || undefined,
    read_at: record.read_at || undefined,
    retry_count: record.retry_count ? Number(record.retry_count) : undefined,

    file_url: record.file_url || undefined,
    file_name: record.file_name || undefined,
    file_size: record.file_size ? Number(record.file_size) : undefined,
    mime_type: record.mime_type || undefined,
    duration: record.duration ? Number(record.duration) : undefined,
    thumbnail: record.thumbnail || undefined,

    file_content_text: record.file_content_text || undefined,
    file_content_json: record.file_content_json || undefined,
    processing_status: record.processing_status || undefined,

    thumb: !!record.thumb,
    favorite: !!record.favorite,
    flag: !!record.flag,
    star: !!record.star,
    pin: !!record.pin,
    archive: !!record.archive,
    deleted: !!record.deleted,
    action_this: !!record.action_this,
    reply: !!record.reply,
    forward: !!record.forward,

    deleted_at: record.deleted_at || undefined,
    deleted_by: record.deleted_by || undefined,
    replyemoji: record.replyemoji || undefined,
    replyto_message_id: record.replyto_message_id || undefined,
    replyto_user_id: record.replyto_user_id || undefined,
    parent_message_id: record.parent_message_id || undefined,
    forwardemoji: record.forwardemoji || undefined,
    forwardto_message_id: record.forwardto_message_id || undefined,
    forwardto_user_id: record.forwardto_user_id || undefined,
    sender_message_id: record.sender_message_id || undefined,
    sender: senderProfile,
    location_data: record.location_data || undefined,
    location_type: record.location_type || undefined,
  }
}

function getOrCreateHub(userId: string): RealtimeHub {
  const existing = realtimeHubs.get(userId)
  if (existing) return existing

  const client = createClient()
  const listeners = new Set<RealtimeListener>()
  // The generation suffix also prevents a React Strict Mode cleanup/recreate
  // race from colliding with a channel that Supabase is still removing.
  const channel = client
    .channel(`user-chat-messages:${userId}:${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `owner_user_id=eq.${userId}`,
      },
      async (payload: any) => {
        const hub = realtimeHubs.get(userId)
        if (!hub) return
        const currentListeners = [...hub.listeners]

        if (payload.eventType === 'DELETE') {
          currentListeners.forEach((listener) =>
            listener.onDelete?.(payload.old.id)
          )
          return
        }

        const message = await mapRealtimeMessage(payload.new)
        if (payload.eventType === 'INSERT') {
          currentListeners.forEach((listener) => listener.onInsert(message))
        } else if (payload.eventType === 'UPDATE') {
          currentListeners.forEach((listener) =>
            listener.onUpdate
              ? listener.onUpdate(message)
              : listener.onInsert(message)
          )
        }
      }
    )
    .subscribe()

  const hub = { channel, client, listeners }
  realtimeHubs.set(userId, hub)
  return hub
}

export function useRealtime(
  userId: string | undefined,
  onNewMessage: (message: Message) => void,
  onUpdateMessage?: (message: Message) => void,
  onDeleteMessage?: (messageId: string) => void
) {
  const callbacksRef = useRef({
    onNewMessage,
    onUpdateMessage,
    onDeleteMessage,
  })
  callbacksRef.current = {
    onNewMessage,
    onUpdateMessage,
    onDeleteMessage,
  }

  useEffect(() => {
    if (!userId) return

    const hub = getOrCreateHub(userId)
    const listener: RealtimeListener = {
      onInsert: (message) => callbacksRef.current.onNewMessage(message),
      onUpdate: (message) => {
        if (callbacksRef.current.onUpdateMessage) {
          callbacksRef.current.onUpdateMessage(message)
        } else {
          callbacksRef.current.onNewMessage(message)
        }
      },
      onDelete: (messageId) =>
        callbacksRef.current.onDeleteMessage?.(messageId),
    }
    hub.listeners.add(listener)

    return () => {
      hub.listeners.delete(listener)
      if (hub.listeners.size === 0 && realtimeHubs.get(userId) === hub) {
        realtimeHubs.delete(userId)
        void hub.client.removeChannel(hub.channel)
      }
    }
  }, [userId])
}

export default useRealtime
