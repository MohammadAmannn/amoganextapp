import { isCapacitor } from '@/lib/platform'
import { PendingRepository } from '../../repositories/pending.repository'
import { MessageRepository, ConversationRepository } from '../../repositories/chat.repository'
import { ProfileRepository } from '../../repositories/profile.repository'
import { StorageService } from '../storage/storageService'
import { toast } from 'sonner'

export class SyncService {
  private static isSyncing = false
  private static networkListenerRegistered = false

  public static async initNetworkListener() {
    if (this.networkListenerRegistered) return
    this.networkListenerRegistered = true

    if (isCapacitor()) {
      try {
        const { Network } = await import('@capacitor/network')
        Network.addListener('networkStatusChange', (status) => {
          console.log('[SyncService] Network status changed:', status.connected)
          if (status.connected) {
            toast.info('Connection restored. Synchronizing data...')
            this.syncAll()
          } else {
            toast.warning('Offline mode active. Changes will be saved locally.')
          }
        })
      } catch (err) {
        console.warn('[SyncService] Failed to register Capacitor Network listener:', err)
      }
    } else if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        toast.info('Connection restored. Synchronizing data...')
        this.syncAll()
      })
      window.addEventListener('offline', () => {
        toast.warning('Offline mode active. Changes will be saved locally.')
      })
    }
  }

  public static async isOnline(): Promise<boolean> {
    if (isCapacitor()) {
      try {
        const { Network } = await import('@capacitor/network')
        const status = await Network.getStatus()
        return status.connected
      } catch (e) {
        // Fallback to browser navigator
      }
    }
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  public static async syncAll(): Promise<void> {
    if (this.isSyncing) return
    const online = await this.isOnline()
    if (!online) return

    this.isSyncing = true
    try {
      console.log('[SyncService] Starting automatic data synchronization...')

      // 1. Sync pending uploads
      await this.syncPendingUploads()

      // 2. Sync pending messages
      await this.syncPendingMessages()

      // 3. Download server updates (conversations & messages)
      await this.downloadServerUpdates()

      console.log('[SyncService] Synchronization finished cleanly.')
    } catch (err) {
      console.error('[SyncService] Sync error:', err)
    } finally {
      this.isSyncing = false
    }
  }

  private static async syncPendingMessages(): Promise<void> {
    const pendingMsgs = await PendingRepository.getPendingMessages()
    if (pendingMsgs.length === 0) return

    const session = await StorageService.getAuthSession()
    if (!session.user?.id && !session.user?.accountNo) return
    const userId = session.user.id || session.user.accountNo

    for (const p of pendingMsgs) {
      try {
        const replyMeta = p.reply_metadata ? JSON.parse(p.reply_metadata) : undefined

        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: p.conversation_id,
            senderId: userId,
            message: p.message,
            messageType: p.message_type,
            fileUrl: p.file_url,
            fileName: p.file_name,
            fileSize: p.file_size,
            mimeType: p.mime_type,
            replyMetadata: replyMeta,
            clientMessageId: p.client_message_id,
          }),
        })

        if (res.ok) {
          const savedMsg = await res.json()
          await MessageRepository.updateMessageStatus(p.client_message_id, 'sent')
          await PendingRepository.removePendingMessage(p.id)
        }
      } catch (e) {
        console.warn(`[SyncService] Failed to sync message ${p.client_message_id}:`, e)
      }
    }
  }

  private static async syncPendingUploads(): Promise<void> {
    const pendingUploads = await PendingRepository.getPendingUploads()
    if (pendingUploads.length === 0) return

    for (const u of pendingUploads) {
      try {
        // Read file using Capacitor Filesystem or Blob fetch
        let fileBlob: Blob | null = null
        if (isCapacitor()) {
          const { Filesystem } = await import('@capacitor/filesystem')
          const fileData = await Filesystem.readFile({ path: u.local_path })
          fileBlob = new Blob([fileData.data], { type: 'image/jpeg' })
        }

        if (fileBlob) {
          const formData = new FormData()
          formData.append('file', fileBlob, `upload-${Date.now()}.jpg`)
          formData.append('folder', u.folder)

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (res.ok) {
            const data = await res.json()
            if (u.target_type === 'avatar') {
              await ProfileRepository.upsertProfile({
                id: u.target_id,
                avatar_url: data.publicUrl,
                name: '',
                email: '',
              })
            }
            await PendingRepository.removePendingUpload(u.id)
          }
        }
      } catch (e) {
        console.warn(`[SyncService] Failed to upload pending file ${u.local_path}:`, e)
      }
    }
  }

  private static async downloadServerUpdates(): Promise<void> {
    const session = await StorageService.getAuthSession()
    if (!session.user?.id && !session.user?.accountNo) return
    const userId = session.user.id || session.user.accountNo

    try {
      const res = await fetch(`/api/conversations?userId=${userId}`)
      if (res.ok) {
        const convos = await res.json()
        for (const c of convos) {
          await ConversationRepository.upsertConversation({
            id: c.id,
            type: c.type || 'direct',
            name: c.name,
            image: c.image,
            unread_count: c.unreadCount || 0,
            last_message_text: c.lastMessage?.message || '',
            last_message_at: c.lastMessage?.created_at || c.created_at,
            created_by: c.created_by,
          })
        }
      }
    } catch (e) {
      console.warn('[SyncService] Failed to download server conversations:', e)
    }
  }
}
