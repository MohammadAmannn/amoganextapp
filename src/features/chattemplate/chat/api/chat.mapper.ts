/**
 * Placeholder mapper for future chat/message migrations.
 */
export function mapToMessage(dbRecord: any) {
  return {
    id: dbRecord.id,
    conversationId: dbRecord.conversation_id,
    senderId: dbRecord.sender_id,
    messageText: dbRecord.message_text,
    createdAt: dbRecord.created_at,
    type: dbRecord.type,
    status: dbRecord.status,
  }
}
