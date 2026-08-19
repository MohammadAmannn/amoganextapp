/**
 * Mock data for Message Component Gallery
 * Notification mocks
 */
import { DbNotification } from '@/stores/notification-store'

export const mockNotifications: DbNotification[] = [
  {
    id: 'demo-notif-001',
    user_id: 'preview-user',
    message_text: 'Alex Johnson send you a msg: "Hey, are the designs ready?"',
    read: false,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    sender_id: 'user-preview-alex',
    message_id: null,
  },
  {
    id: 'demo-notif-002',
    user_id: 'preview-user',
    message_text: 'Sam Rivera send you a msg: "Q3-Report-2026.pdf shared"',
    read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sender_id: 'user-preview-sam',
    message_id: null,
  },
  {
    id: 'demo-notif-003',
    user_id: 'preview-user',
    message_text: 'Jordan Lee send you a msg: "Please review the Q3 update"',
    read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sender_id: 'user-preview-jordan',
    message_id: null,
  },
]
