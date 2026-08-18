// ============================================================================
// Message Feature Components Index
// Clean structure: chat/, emails/, sidebar/, tabs/, panels/, files/
// ============================================================================

// Chat Views & Components
export { ChatView } from './chat/chat-view'
export type { ChatMessage, ChatAttachment, ChatLocation, ChatViewProps, MessageActionType } from '../types/chat.types'
export { RealtimeChatView } from './chat/realtime-chat-view'
export { ChatHeader } from './chat/chat-header'
export { MessageBubble } from './chat/message-bubble'
export { MessageInput } from './chat/message-input'
export { ChatEmptyState } from './chat/chat-empty-state'
export { HeaderActions } from './chat/header-actions'
export { FileUploadProgress } from './chat/file-upload-progress'

// Email Views & Components
export { EmailList } from './emails/email-list'
export { EmailView } from './emails/email-view'
export { EmailDetail } from './emails/email-detail'
export { EmailEditor } from './emails/email-editor'
export { NewEmail } from './emails/new-email'
export type { Email, EmailAttachment, EmailRecipient, EmailFormData } from '../types/email.types'

// Sidebar Components
export {
  SidebarHeader,
  CategoryToolbar,
  SubTabsBar,
  SidebarSearchBar,
  EmailListSkeleton,
  EmailCardItem,
  ChatCardItem,
  NotificationCardItem,
  AiCardItem,
  TaskCardItem,
  FolderTreeItem,
  SidebarPagination,
} from './sidebar'

// Management Tabs (Link / Account Manager Style UI)
export { ContactManagerTab, ContactManagerTab as MsgContactTab } from './tabs/contact-manager-tab'
export { GroupManagerTab, GroupManagerTab as MsgGroupTab } from './tabs/group-manager-tab'

// Embedded Side Panels
export { AiChatPanel } from './panels/ai-chat-panel'
export { DocViewerPanel } from './panels/doc-viewer-panel'
export { NotificationDetailPanel } from './panels/notification-detail-panel'
export { MessageEmailSettings } from './panels/message-email-settings'

// Files Views
export { UserFileCardsView } from './files/user-file-cards-view'
export { FileUploadForm } from './files/file-upload-form'
