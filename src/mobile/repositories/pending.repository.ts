import { sqliteManager } from '../database/sqlite/connection'
import { PendingMessage, PendingUpload, MobileSetting } from '../types'

export class PendingRepository {
  public static async getPendingMessages(): Promise<PendingMessage[]> {
    return sqliteManager.query<PendingMessage>('SELECT * FROM pending_messages ORDER BY created_at ASC')
  }

  public static async addPendingMessage(msg: PendingMessage): Promise<void> {
    const sql = `
      INSERT INTO pending_messages (
        id, client_message_id, conversation_id, sender_id, message, message_type,
        file_url, file_name, file_size, mime_type, reply_metadata, retry_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await sqliteManager.run(sql, [
      msg.id,
      msg.client_message_id,
      msg.conversation_id,
      msg.sender_id,
      msg.message || null,
      msg.message_type,
      msg.file_url || null,
      msg.file_name || null,
      msg.file_size || null,
      msg.mime_type || null,
      msg.reply_metadata || null,
      msg.retry_count || 0,
      msg.created_at,
    ])
  }

  public static async removePendingMessage(id: string): Promise<void> {
    await sqliteManager.run('DELETE FROM pending_messages WHERE id = ?', [id])
  }

  public static async getPendingUploads(): Promise<PendingUpload[]> {
    return sqliteManager.query<PendingUpload>('SELECT * FROM pending_uploads WHERE status = ?', ['pending'])
  }

  public static async addPendingUpload(upload: PendingUpload): Promise<void> {
    const sql = `
      INSERT INTO pending_uploads (id, local_path, folder, target_type, target_id, status, retry_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    await sqliteManager.run(sql, [
      upload.id,
      upload.local_path,
      upload.folder,
      upload.target_type,
      upload.target_id,
      upload.status || 'pending',
      upload.retry_count || 0,
      upload.created_at,
    ])
  }

  public static async removePendingUpload(id: string): Promise<void> {
    await sqliteManager.run('DELETE FROM pending_uploads WHERE id = ?', [id])
  }
}

export class SettingsRepository {
  public static async getSetting(key: string): Promise<string | null> {
    const rows = await sqliteManager.query<MobileSetting>('SELECT * FROM settings WHERE key = ?', [key])
    return rows[0]?.value || null
  }

  public static async setSetting(key: string, value: string): Promise<void> {
    const sql = `
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
    `
    await sqliteManager.run(sql, [key, value, new Date().toISOString()])
  }
}
