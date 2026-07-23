import { sqliteManager } from '../database/sqlite/connection'
import { MobileConversation, MobileMessage } from '../types'

export class ConversationRepository {
  public static async getAllConversations(): Promise<MobileConversation[]> {
    const rows = await sqliteManager.query<MobileConversation>(
      'SELECT * FROM conversations ORDER BY last_message_at DESC'
    )
    return rows
  }

  public static async getConversationById(id: string): Promise<MobileConversation | null> {
    const rows = await sqliteManager.query<MobileConversation>(
      'SELECT * FROM conversations WHERE id = ?',
      [id]
    )
    return rows[0] || null
  }

  public static async upsertConversation(convo: MobileConversation): Promise<void> {
    const sql = `
      INSERT INTO conversations (id, type, name, image, unread_count, last_message_text, last_message_at, created_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await sqliteManager.run(sql, [
      convo.id,
      convo.type,
      convo.name || null,
      convo.image || null,
      convo.unread_count || 0,
      convo.last_message_text || null,
      convo.last_message_at || new Date().toISOString(),
      convo.created_by || null,
      new Date().toISOString(),
    ])
  }

  public static async clearUnreadCount(id: string): Promise<void> {
    await sqliteManager.run('UPDATE conversations SET unread_count = 0 WHERE id = ?', [id])
  }
}

export class MessageRepository {
  public static async getMessagesByConversation(conversationId: string): Promise<MobileMessage[]> {
    const rows = await sqliteManager.query<MobileMessage>(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    )
    return rows
  }

  public static async saveMessage(msg: MobileMessage): Promise<void> {
    const sql = `
      INSERT INTO messages (
        id, conversation_id, owner_user_id, sender_user_id, message, message_type,
        direction, sent, received, message_status, client_message_id, file_url,
        file_name, file_size, mime_type, duration, replyto_message_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await sqliteManager.run(sql, [
      msg.id,
      msg.conversation_id,
      msg.owner_user_id,
      msg.sender_user_id,
      msg.message || null,
      msg.message_type,
      msg.direction,
      msg.sent ? 1 : 0,
      msg.received ? 1 : 0,
      msg.message_status || 'sent',
      msg.client_message_id || null,
      msg.file_url || null,
      msg.file_name || null,
      msg.file_size || null,
      msg.mime_type || null,
      msg.duration || null,
      msg.replyto_message_id || null,
      msg.created_at,
    ])
  }

  public static async updateMessageStatus(id: string, status: 'pending' | 'sent' | 'delivered' | 'read'): Promise<void> {
    await sqliteManager.run('UPDATE messages SET message_status = ? WHERE id = ?', [status, id])
  }
}
