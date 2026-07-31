// ============================================================================
// Message Feature Components Index
// Clean structure: chat/, emails/, tabs/, panels/
// ============================================================================

// Chat Views & Components
export { ChatView } from './chat/chat-view'
export type { ChatMessage, ChatAttachment } from './chat/chat-view'
export { RealtimeChatView } from './chat/realtime-chat-view'
export { HeaderActions } from './chat/header-actions'
export { FileUploadProgress } from './chat/file-upload-progress'

// Email Views & Components
export { EmailList } from './emails/email-list'
export { EmailView } from './emails/email-view'
export { EmailDetail } from './emails/email-detail'
export { EmailEditor } from './emails/email-editor'
export { NewEmail } from './emails/new-email'

// Management Tabs (Link / Account Manager Style UI)
export { ContactManagerTab, ContactManagerTab as MsgContactTab } from './tabs/contact-manager-tab'
export { GroupManagerTab, GroupManagerTab as MsgGroupTab } from './tabs/group-manager-tab'

// Embedded Side Panels
export { AiChatPanel } from './panels/ai-chat-panel'
export { DocViewerPanel } from './panels/doc-viewer-panel'
