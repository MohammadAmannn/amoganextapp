import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'
import { Message } from '../types/chat.types'

/**
 * Fetch all messages for a specific conversation and user copy.
 */
export async function getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
  try {
    const query = createQuery()
      .select(`
        *,
        sender:profiles!sender_user_id (
          id,
          name,
          email,
          avatar
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)
      .or('deleted.eq.false,deleted_by.not.is.null')
      .order('created_at', { ascending: true })

    const data = await apiClient.get<any[]>(`/rest/v1/chat_messages${query.toString()}`)
    if (!data) return []

    const messages: Message[] = data.map((d: any) => ({
      id: d.id,
      conversation_id: d.conversation_id,
      owner_user_id: d.owner_user_id,
      sender_user_id: d.sender_user_id,
      message: d.message,
      message_type: d.message_type,
      direction: d.direction,
      sent: d.sent,
      received: d.received,
      created_at: d.created_at,
      
      message_status: d.message_status || undefined,
      client_message_id: d.client_message_id || undefined,
      queued_at: d.queued_at || undefined,
      delivered_at: d.delivered_at || undefined,
      read_at: d.read_at || undefined,
      retry_count: d.retry_count ? Number(d.retry_count) : undefined,

      file_url: d.file_url || undefined,
      file_name: d.file_name || undefined,
      file_size: d.file_size ? Number(d.file_size) : undefined,
      mime_type: d.mime_type || undefined,
      duration: d.duration ? Number(d.duration) : undefined,
      thumbnail: d.thumbnail || undefined,

      thumb: !!d.thumb,
      favorite: !!d.favorite,
      flag: !!d.flag,
      star: !!d.star,
      pin: !!d.pin,
      archive: !!d.archive,
      deleted: !!d.deleted,
      action_this: !!d.action_this,
      reply: !!d.reply,
      forward: !!d.forward,

      deleted_at: d.deleted_at || undefined,
      deleted_by: d.deleted_by || undefined,

      replyemoji: d.replyemoji || undefined,
      replyto_message_id: d.replyto_message_id || undefined,
      replyto_user_id: d.replyto_user_id || undefined,
      parent_message_id: d.parent_message_id || undefined,

      forwardemoji: d.forwardemoji || undefined,
      forwardto_message_id: d.forwardto_message_id || undefined,
      forwardto_user_id: d.forwardto_user_id || undefined,

      sender_message_id: d.sender_message_id || undefined,

      sender: d.sender ? {
        id: d.sender.id,
        name: d.sender.name,
        email: d.sender.email,
        avatar_url: d.sender.avatar || undefined,
      } : undefined,
      location_data: d.location_data || undefined,
      location_type: d.location_type || undefined,
    }))

    // Load reply references for UI display
    for (const msg of messages) {
      if (msg.reply && msg.replyto_message_id) {
        // 1. Try finding parent message directly from loaded messages list in memory
        const parentInList = messages.find(
          (m) => m.id === msg.replyto_message_id || m.sender_message_id === msg.replyto_message_id || (m.client_message_id && m.client_message_id === msg.replyto_message_id)
        )

        if (parentInList) {
          msg.replyto_message = parentInList
          msg.replyMetadata = {
            replyemoji: msg.replyemoji || null,
            replyto_message_id: msg.replyto_message_id,
            replyto_user_id: msg.replyto_user_id || null,
            parent_message_id: msg.parent_message_id || null,
            replyMessageText: parentInList.message_type === 'text' ? (parentInList.message || '') : `Attachment: ${parentInList.file_name || 'File'}`,
            replySenderName: parentInList.sender?.name || 'User',
          }
          continue
        }

        // 2. Fallback: Query database for parent message details
        const replyQuery = createQuery()
          .select(`
            id,
            message,
            message_type,
            file_name,
            sender_user_id,
            deleted,
            sender:profiles!sender_user_id(id, name, email, avatar)
          `)
          .or(`id.eq.${msg.replyto_message_id},sender_message_id.eq.${msg.replyto_message_id}`)
          .limit(1)

        try {
          const replyMsgs = await apiClient.get<any[]>(`/rest/v1/chat_messages${replyQuery.toString()}`)
          const replyMsg = replyMsgs[0] || null

          if (replyMsg) {
            const replySender = replyMsg.sender ? {
              id: replyMsg.sender.id,
              name: replyMsg.sender.name,
              email: replyMsg.sender.email,
              avatar_url: replyMsg.sender.avatar || undefined,
            } : undefined

            msg.replyto_message = {
              id: replyMsg.id,
              conversation_id: msg.conversation_id,
              owner_user_id: msg.owner_user_id,
              sender_user_id: replyMsg.sender_user_id,
              message: replyMsg.message,
              message_type: replyMsg.message_type,
              direction: 'Received',
              sent: true,
              received: true,
              created_at: msg.created_at,
              file_name: replyMsg.file_name,
              sender: replySender,
              deleted: !!replyMsg.deleted,
            }

            msg.replyMetadata = {
              replyemoji: msg.replyemoji || null,
              replyto_message_id: msg.replyto_message_id,
              replyto_user_id: msg.replyto_user_id || null,
              parent_message_id: msg.parent_message_id || null,
              replyMessageText: replyMsg.message_type === 'text' ? replyMsg.message : `Attachment: ${replyMsg.file_name || 'File'}`,
              replySenderName: replySender?.name || 'User',
            }
          }
        } catch (e) {
          console.warn('[Messages API] Failed to fetch reply message details:', e)
        }
      }
    }

    return messages
  } catch (e) {
    console.error('[Messages API] Failed to get conversation messages:', e)
    return []
  }
}

/**
 * Creates individual message copies for all conversation members.
 */
export async function createMessage(msg: {
  id?: string
  conversationId: string
  senderId: string
  message: string
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system' | 'other' | 'location'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  duration?: number
  thumbnail?: string
  replyMetadata?: {
    replyemoji?: string | null
    replyto_message_id: string
    replyto_user_id: string | null
    parent_message_id: string | null
  }
  clientMessageId?: string
  systemMetadata?: {
    type: 'group_created' | 'members_added'
    groupName?: string
    creatorName?: string
  }
  locationData?: any
  locationType?: 'current' | 'live'
}): Promise<Message | null> {
  try {
    // 1. Get conversation members
    const memberQuery = createQuery().select('user_id').eq('conversation_id', msg.conversationId)
    const members = await apiClient.get<any[]>(`/rest/v1/conversation_members${memberQuery.toString()}`)

    if (!members || members.length === 0) {
      throw new Error('No members found in conversation')
    }

    const senderMsgId = msg.id || crypto.randomUUID()
    const now = new Date().toISOString()

    // Resolve reply parent message ID if replying
    let resolvedReplyToId: string | null = null
    if (msg.replyMetadata?.replyto_message_id) {
      const parentMsgQuery = createQuery()
        .select('id, sender_message_id')
        .eq('id', msg.replyMetadata.replyto_message_id)
        .limit(1)

      const replyMsgs = await apiClient.get<any[]>(`/rest/v1/chat_messages${parentMsgQuery.toString()}`)
      const replyMsg = replyMsgs[0] || null
      resolvedReplyToId = replyMsg ? (replyMsg.sender_message_id || replyMsg.id) : msg.replyMetadata.replyto_message_id
    }

    // 2. Map copies for all conversation members
    const records: any[] = []
    for (const member of members) {
      const isSender = member.user_id === msg.senderId
      const msgId = isSender ? senderMsgId : crypto.randomUUID()

      let finalMessage = msg.message

      // Customize system message copies based on the recipient's copy context
      if (msg.messageType === 'system' && msg.systemMetadata) {
        const { type: sysType, groupName, creatorName } = msg.systemMetadata
        if (sysType === 'group_created') {
          finalMessage = isSender
            ? `You created group "${groupName}"`
            : `${creatorName} created group "${groupName}"`
        } else if (sysType === 'members_added') {
          if (isSender) {
            continue
          }
          finalMessage = `${creatorName} added you`
        }
      }

      records.push({
        id: msgId,
        conversation_id: msg.conversationId,
        owner_user_id: member.user_id,
        sender_user_id: msg.senderId,
        message: finalMessage,
        message_type: msg.messageType,
        direction: isSender ? 'Sent' : 'Received',
        sent: true,
        received: isSender,
        created_at: now,

        file_url: msg.fileUrl || null,
        file_name: msg.fileName || null,
        file_size: msg.fileSize || null,
        mime_type: msg.mimeType || null,
        duration: msg.duration || null,
        thumbnail: msg.thumbnail || null,

        thumb: false,
        favorite: false,
        flag: false,
        star: false,
        pin: false,
        archive: false,
        deleted: false,
        action_this: false,
        reply: !!msg.replyMetadata,
        forward: false,

        replyemoji: msg.replyMetadata?.replyemoji || null,
        replyto_message_id: resolvedReplyToId,
        replyto_user_id: msg.replyMetadata?.replyto_user_id || null,
        parent_message_id: msg.replyMetadata?.parent_message_id || null,

        sender_message_id: isSender ? null : senderMsgId,
        client_message_id: msg.clientMessageId || null,
        message_status: 'sent',
        location_data: msg.locationData || null,
        location_type: msg.locationType || null,
      })
    }

    // 3. Bulk insert copies into the DB
    if (records.length > 0) {
      await apiClient.post('/rest/v1/chat_messages', records)
    }

    // 4. Return the sender's own copy of the message, constructed locally
    const senderRecord = records.find((r: any) => r.owner_user_id === msg.senderId)
    if (!senderRecord) return null

    // Load sender details from profiles table to attach to the returned copy
    const profileQuery = createQuery().select('id, name, email, avatar').eq('id', msg.senderId).limit(1)
    const profiles = await apiClient.get<any[]>(`/rest/v1/profiles${profileQuery.toString()}`)
    const profile = profiles[0] || null

    return {
      id: senderRecord.id,
      conversation_id: senderRecord.conversation_id,
      owner_user_id: senderRecord.owner_user_id,
      sender_user_id: senderRecord.sender_user_id,
      message: senderRecord.message,
      message_type: senderRecord.message_type,
      direction: senderRecord.direction,
      sent: senderRecord.sent,
      received: senderRecord.received,
      created_at: senderRecord.created_at,
      file_url: senderRecord.file_url || undefined,
      file_name: senderRecord.file_name || undefined,
      file_size: senderRecord.file_size ? Number(senderRecord.file_size) : undefined,
      mime_type: senderRecord.mime_type || undefined,
      duration: senderRecord.duration ? Number(senderRecord.duration) : undefined,
      thumbnail: senderRecord.thumbnail || undefined,
      thumb: senderRecord.thumb,
      favorite: senderRecord.favorite,
      flag: senderRecord.flag,
      star: senderRecord.star,
      pin: senderRecord.pin,
      archive: senderRecord.archive,
      deleted: senderRecord.deleted,
      action_this: senderRecord.action_this,
      reply: senderRecord.reply,
      forward: senderRecord.forward,
      replyemoji: senderRecord.replyemoji || undefined,
      replyto_message_id: senderRecord.replyto_message_id || undefined,
      replyto_user_id: senderRecord.replyto_user_id || undefined,
      parent_message_id: senderRecord.parent_message_id || undefined,
      message_status: senderRecord.message_status,
      client_message_id: senderRecord.client_message_id || undefined,
      location_data: senderRecord.location_data || undefined,
      location_type: senderRecord.location_type || undefined,
      sender: profile ? {
        id: profile.id,
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        avatar_url: profile.avatar || undefined,
      } : undefined,
    }
  } catch (err) {
    console.error('[Messages API] Failed to create message copies:', err)
    return null
  }
}

/**
 * Updates Boolean flags (likes, flags, stars, pin, archive) of a message copy.
 */
export async function updateMessageBooleanAction(
  messageId: string,
  action: 'thumb' | 'favorite' | 'flag' | 'star' | 'pin' | 'archive' | 'action_this',
  value: boolean
): Promise<boolean> {
  try {
    const query = createQuery().eq('id', messageId)
    await apiClient.patch(`/rest/v1/chat_messages${query.toString()}`, { [action]: value })
    return true
  } catch (err) {
    console.error(`[Messages API] Failed to update message action ${action}:`, err)
    return false
  }
}

/**
 * Soft deletes a message copy for a specific user (delete for me).
 */
export async function deleteMessageForMe(messageId: string): Promise<boolean> {
  try {
    const query = createQuery().eq('id', messageId)
    await apiClient.patch(`/rest/v1/chat_messages${query.toString()}`, { deleted: true })
    return true
  } catch (err) {
    console.error('[Messages API] Failed to delete message for me:', err)
    return false
  }
}

/**
 * Deletes a message and all its member copies for everyone in a conversation.
 */
export async function deleteMessageForEveryone(messageId: string, senderId: string): Promise<boolean> {
  try {
    // 1. Fetch message details to find sender_message_id
    const fetchQuery = createQuery().select('id, sender_user_id, sender_message_id').eq('id', messageId).limit(1)
    const msgs = await apiClient.get<any[]>(`/rest/v1/chat_messages${fetchQuery.toString()}`)
    const msg = msgs[0] || null

    if (!msg) return false
    if (msg.sender_user_id !== senderId) {
      console.error('[Messages API] Only the sender can delete a message for everyone')
      return false
    }

    const senderMsgId = msg.sender_message_id || msg.id

    // 2. Update all message copies associated with this message
    const updateQuery = createQuery().or(`id.eq.${senderMsgId},sender_message_id.eq.${senderMsgId}`)
    await apiClient.patch(`/rest/v1/chat_messages${updateQuery.toString()}`, {
      message: 'This message was deleted.',
      deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: senderId
    })

    return true
  } catch (err) {
    console.error('[Messages API] Failed to delete message for everyone:', err)
    return false
  }
}

/**
 * Forwards a message to multiple conversations.
 */
export async function forwardMessage(
  messageId: string,
  targetConversationIds: string[],
  senderId: string
): Promise<boolean> {
  try {
    // 1. Fetch the original message copy
    const fetchQuery = createQuery().select('*').eq('id', messageId).limit(1)
    const msgs = await apiClient.get<any[]>(`/rest/v1/chat_messages${fetchQuery.toString()}`)
    const original = msgs[0] || null

    if (!original) return false

    // 2. Loop and duplicate message copies for target conversations
    for (const conversationId of targetConversationIds) {
      const memberQuery = createQuery().select('user_id').eq('conversation_id', conversationId)
      const members = await apiClient.get<any[]>(`/rest/v1/conversation_members${memberQuery.toString()}`)

      if (!members || members.length === 0) continue

      const senderMsgId = crypto.randomUUID()
      const now = new Date().toISOString()

      const records = members.map((member: any) => {
        const isSender = member.user_id === senderId
        const msgId = isSender ? senderMsgId : crypto.randomUUID()
        return {
          id: msgId,
          conversation_id: conversationId,
          owner_user_id: member.user_id,
          sender_user_id: senderId,
          message: original.message,
          message_type: original.message_type,
          direction: isSender ? 'Sent' : 'Received',
          sent: true,
          received: isSender,
          created_at: now,

          file_url: original.file_url || null,
          file_name: original.file_name || null,
          file_size: original.file_size || null,
          mime_type: original.mime_type || null,
          duration: original.duration || null,
          thumbnail: original.thumbnail || null,

          thumb: false,
          favorite: false,
          flag: false,
          star: false,
          pin: false,
          archive: false,
          deleted: false,
          action_this: false,
          reply: false,
          forward: true,

          forwardto_message_id: original.id,
          forwardto_user_id: original.sender_user_id,

          sender_message_id: isSender ? null : senderMsgId
        }
      })

      await apiClient.post('/rest/v1/chat_messages', records)
    }

    return true
  } catch (err) {
    console.error('[Messages API] Failed to forward message:', err)
    return false
  }
}
