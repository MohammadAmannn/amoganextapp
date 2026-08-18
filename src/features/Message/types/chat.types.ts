import { Message, Conversation } from '@/features/chattemplate/chat/types/chat.types'

export interface ChatAttachment {
  type: 'image' | 'video' | 'document' | 'audio'
  name: string
  size: number
  url: string
  mimeType: string
  file?: File
  duration?: number
  fileContentText?: string
  fileContentJson?: any
}

export interface ChatLocation {
  latitude: number
  longitude: number
  address?: string
  type?: 'current' | 'live'
}

export interface ChatMessage {
  id: string
  sender: string
  content: string
  time: Date
  isOwn: boolean
  avatarInitials?: string
  attachment?: ChatAttachment
  location?: ChatLocation
  senderUserId?: string
  pin?: boolean
  star?: boolean
  favorite?: boolean
  flag?: boolean
  archive?: boolean
  actionThis?: boolean
  thumb?: boolean
  forwarded?: boolean
  messageStatus?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed' | null
  replyTo?: {
    id?: string
    sender: string
    content: string
    unavailable?: boolean
  }
}

export type MessageActionType =
  | 'reply'
  | 'forward'
  | 'edit'
  | 'thumb'
  | 'pin'
  | 'star'
  | 'favorite'
  | 'flag'
  | 'archive'
  | 'action_this'
  | 'delete'
  | 'deleteForEveryone'

export interface ChatViewProps {
  chatName: string
  chatAvatar?: string
  membersCount?: number
  onlineCount?: number
  messages: ChatMessage[]
  onBack: () => void
  onSendMessage: (
    content: string,
    attachment?: ChatAttachment,
    replyTo?: ChatMessage
  ) => void
  onShareLocation?: () => void
  typingText?: string
  onTypingChange?: (value: string) => void
  onRecordingChange?: (recording: boolean) => void
  onLoadOlder?: () => Promise<void> | void
  hasMoreMessages?: boolean
  isLoadingOlder?: boolean
  onMessageAction?: (
    action: MessageActionType,
    message: ChatMessage,
    value?: boolean
  ) => void
  onReply?: (message: ChatMessage) => void
  rawMessages?: Message[]
  currentUser?: { accountNo: string; name?: string; email?: string } | null
  conversation?: Conversation | null
}
