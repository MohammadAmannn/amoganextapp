import { Message } from '../types/chat.types'
import * as messagesApi from '../api/messages.api'

export async function getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
  return messagesApi.getConversationMessages(conversationId, userId)
}

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
  return messagesApi.createMessage(msg)
}

export async function updateMessageBooleanAction(
  messageId: string,
  action: 'thumb' | 'favorite' | 'flag' | 'star' | 'pin' | 'archive' | 'action_this',
  value: boolean
): Promise<boolean> {
  return messagesApi.updateMessageBooleanAction(messageId, action, value)
}

export async function deleteMessageForMe(messageId: string): Promise<boolean> {
  return messagesApi.deleteMessageForMe(messageId)
}

export async function deleteMessageForEveryone(messageId: string, senderId: string): Promise<boolean> {
  return messagesApi.deleteMessageForEveryone(messageId, senderId)
}

export async function forwardMessage(
  messageId: string,
  targetConversationIds: string[],
  senderId: string
): Promise<boolean> {
  return messagesApi.forwardMessage(messageId, targetConversationIds, senderId)
}
