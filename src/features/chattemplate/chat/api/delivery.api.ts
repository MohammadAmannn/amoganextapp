import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'

/**
 * Marks messages in a conversation as delivered for a specific user.
 */
export async function markMessagesAsDelivered(conversationId: string, userId: string): Promise<void> {
  try {
    const query = createQuery()
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)
      .eq('direction', 'Received')
      .eq('message_status', 'sent')

    await apiClient.patch(`/rest/v1/chat_messages${query.toString()}`, {
      message_status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Delivery API] Failed to mark messages as delivered:', err)
  }
}

/**
 * Marks messages in a conversation as read for a specific user.
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    const query = createQuery()
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)
      .eq('direction', 'Received')
      .in('message_status', ['sent', 'delivered'])

    await apiClient.patch(`/rest/v1/chat_messages${query.toString()}`, {
      message_status: 'read',
      read_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Delivery API] Failed to mark messages as read:', err)
  }
}
