export type CategoryFilterType =
  | 'mail'
  | 'chat'
  | 'vouchers'
  | 'ai'
  | 'ai-assistant'
  | 'tasks'
  | 'notification'

export type SectionMode = 'mail' | 'chat'

export type InboxMode = 'inbox' | 'done'

export interface DirectoryChat {
  id: string
  conversationId?: string
  kind: 'contact' | 'group'
  name: string
  avatar?: string
  membersCount?: number
  onlineCount?: number
}
