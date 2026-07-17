import { Conversation } from '../types/chat.types'
import * as conversationsApi from '../api/conversations.api'

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  return conversationsApi.getUserConversations(userId)
}

export async function getOrCreateDirectConversation(userAId: string, userBId: string): Promise<string | null> {
  return conversationsApi.getOrCreateDirectConversation(userAId, userBId)
}

export async function createGroupConversation(
  groupName: string,
  groupImage: string | null,
  memberIds: string[],
  creatorId: string,
  type: 'group' | 'channel_group' | 'message_group' = 'group'
): Promise<Conversation | null> {
  return conversationsApi.createGroupConversation(groupName, groupImage, memberIds, creatorId, type)
}

export async function clearConversationUnreadCount(conversationId: string, userId: string): Promise<boolean> {
  return conversationsApi.clearConversationUnreadCount(conversationId, userId)
}