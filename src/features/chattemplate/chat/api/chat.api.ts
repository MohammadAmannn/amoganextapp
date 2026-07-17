import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'

/**
 * Placeholder API class for future message migration.
 */
export async function getMessages(conversationId: string): Promise<any[]> {
  try {
    const query = createQuery()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    return await apiClient.get<any[]>(`/rest/v1/chat_messages${query.toString()}`)
  } catch (error) {
    console.error('[Chat API] Failed to get messages:', error)
    return []
  }
}
