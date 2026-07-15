import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface DbNotification {
  id: string
  user_id: string
  sender_id: string | null
  message_id: string | null
  message_text: string
  read: boolean
  created_at: string
}

interface NotificationState {
  notifications: DbNotification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  subscribeToNotifications: (userId: string) => void
  unsubscribe: () => void
}

let activeChannel: RealtimeChannel | null = null

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true })
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const notifications = data || []
      const unreadCount = notifications.filter((n) => !n.read).length
      set({ notifications, unreadCount })
    } catch (e) {
      console.error('[NotificationStore] Failed to fetch notifications:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  markAsRead: async (notificationId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
        const unreadCount = updated.filter((n) => !n.read).length
        return { notifications: updated, unreadCount }
      })
    } catch (e) {
      console.error('[NotificationStore] Failed to mark notification as read:', e)
    }
  },

  markAllAsRead: async (userId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error

      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, read: true }))
        return { notifications: updated, unreadCount: 0 }
      })
    } catch (e) {
      console.error('[NotificationStore] Failed to mark all notifications as read:', e)
    }
  },

  deleteNotification: async (notificationId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      set((state) => {
        const updated = state.notifications.filter((n) => n.id !== notificationId)
        const unreadCount = updated.filter((n) => !n.read).length
        return { notifications: updated, unreadCount }
      })
    } catch (e) {
      console.error('[NotificationStore] Failed to delete notification:', e)
    }
  },

  subscribeToNotifications: (userId: string) => {
    // Prevent duplicate subscriptions
    if (activeChannel) {
      return
    }

    const supabase = createClient()
    activeChannel = supabase
      .channel(`notifications-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === 'INSERT') {
            const inserted = newRecord as DbNotification
            set((state) => {
              // Add only if not already present
              if (state.notifications.some((n) => n.id === inserted.id)) {
                return {}
              }
              const updated = [inserted, ...state.notifications]
              const unreadCount = updated.filter((n) => !n.read).length
              return { notifications: updated, unreadCount }
            })
          } else if (eventType === 'UPDATE') {
            const updatedRecord = newRecord as DbNotification
            set((state) => {
              const updated = state.notifications.map((n) =>
                n.id === updatedRecord.id ? updatedRecord : n
              )
              const unreadCount = updated.filter((n) => !n.read).length
              return { notifications: updated, unreadCount }
            })
          } else if (eventType === 'DELETE') {
            const deletedId = oldRecord.id
            set((state) => {
              const updated = state.notifications.filter((n) => n.id !== deletedId)
              const unreadCount = updated.filter((n) => !n.read).length
              return { notifications: updated, unreadCount }
            })
          }
        }
      )
      .subscribe()
  },

  unsubscribe: () => {
    if (activeChannel) {
      activeChannel.unsubscribe()
      activeChannel = null
    }
  },
}))
