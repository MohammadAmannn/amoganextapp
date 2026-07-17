import * as deliveryApi from '../api/delivery.api'

export async function markMessagesAsDelivered(conversationId: string, userId: string): Promise<void> {
  return deliveryApi.markMessagesAsDelivered(conversationId, userId)
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  return deliveryApi.markMessagesAsRead(conversationId, userId)
}
