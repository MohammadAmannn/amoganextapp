export interface MobileUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface MobileProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  phone?: string
  bio?: string
  status?: string
  last_seen?: string
  created_at?: string
  updated_at?: string
}

export interface MobileConversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  image?: string
  unread_count: number
  last_message_text?: string
  last_message_at?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface MobileMessage {
  id: string
  conversation_id: string
  owner_user_id: string
  sender_user_id: string
  message?: string
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'system' | 'other'
  direction: 'Sent' | 'Received'
  sent: boolean
  received: boolean
  message_status: 'pending' | 'sent' | 'delivered' | 'read'
  client_message_id?: string
  file_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  duration?: number
  replyto_message_id?: string
  created_at: string
}

export interface PendingMessage {
  id: string
  client_message_id: string
  conversation_id: string
  sender_id: string
  message: string
  message_type: string
  file_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  reply_metadata?: string
  retry_count: number
  created_at: string
}

export interface PendingUpload {
  id: string
  local_path: string
  folder: 'images' | 'videos' | 'documents' | 'audio'
  target_type: 'message' | 'avatar'
  target_id: string
  status: 'pending' | 'uploading' | 'failed'
  retry_count: number
  created_at: string
}

export interface MobileSetting {
  key: string
  value: string
  updated_at: string
}
