'use client'

/**
 * Message Component Gallery — Registry
 *
 * Central registry of all Message Page components and full section layout views.
 * 100% mock data, zero Supabase calls, zero production modifications.
 */

import React from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  X,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
  MoreHorizontal,
} from 'lucide-react'

// ─── Existing Message Page Components (unchanged) ────────────────────────────
import { ChatCardItem } from '@/features/Message/components/sidebar/chat-card-item'
import { ChatHeader } from '@/features/Message/components/chat/chat-header'
import { ChatView } from '@/features/Message/components/chat/chat-view'
import { MessageBubble } from '@/features/Message/components/chat/message-bubble'
import { MessageInput } from '@/features/Message/components/chat/message-input'
import { FileUploadProgress } from '@/features/Message/components/chat/file-upload-progress'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { ThreeDotMenu } from '@/features/Message/components/chat/three-dot-menu'
import { AttachmentCardUploader } from '@/features/Message/components/shared/attachment-card-uploader'
import { EmailCardItem } from '@/features/Message/components/sidebar/email-card-item'
import { EmailListSkeleton } from '@/features/Message/components/sidebar/email-list-skeleton'
import { AiCardItem } from '@/features/Message/components/sidebar/ai-card-item'
import { TaskCardItem } from '@/features/Message/components/sidebar/task-card-item'
import { NotificationCardItem } from '@/features/Message/components/sidebar/notification-card-item'
import { FolderTreeItem } from '@/features/Message/components/sidebar/folder-tree-item'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SubTabsBar } from '@/features/Message/components/sidebar/sub-tabs-bar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { SidebarPagination } from '@/features/Message/components/sidebar/sidebar-pagination'

// ─── Rich Full-View Section Previews ─────────────────────────────────────────
import {
  CompleteTaskPagePreview,
  CompleteMailPagePreview,
  CompleteNotificationPagePreview,
  CompleteFilesPagePreview,
  CompleteChatPagePreview,
  CompleteAiPagePreview,
  MailViewPreview,
  EmailEditorPreview,
  NewEmailPreview,
  AiChatWindowPreview,
  EmailDetailPreview,
} from '../previews'

// ─── Mock Data ────────────────────────────────────────────────────────────────
import {
  mockChatEmails,
  mockChatMessages,
  mockChatMessageWithDoc,
  mockChatMessageReply,
  mockCurrentUser,
  mockEmails,
  mockNotifications,
  mockFolders,
  mockAiMessages,
} from '../mocks'

// ─── Types ────────────────────────────────────────────────────────────────────
export type GalleryCategory =
  | 'All'
  | 'Task'
  | 'Mail'
  | 'Notifications'
  | 'Files'
  | 'Chat'
  | 'AI'
  | 'Shared'

export interface ComponentState {
  label: string
  description?: string
}

export interface GalleryEntry {
  id: string
  name: string
  category: GalleryCategory
  description: string
  filePath: string
  states: ComponentState[]
  renderPreview: (stateIndex: number) => React.ReactNode
  usageCode: (stateIndex: number) => string
}

// ─── Shared no-op helpers ─────────────────────────────────────────────────────
const noop = () => {}

// ─── Registry Definition ──────────────────────────────────────────────────────
export const galleryRegistry: GalleryEntry[] = [
  // ───────────────────────── TASK SECTION ───────────────────────────────────

  {
    id: 'complete-task-page',
    name: 'Complete Task Page (Sprint Board & Kanban)',
    category: 'Task',
    description: 'Exact full-view dual pane layout matching the Task section: Left sidebar with active Task card + Right main Sprint Board with draggable Kanban columns (To Do, In Progress, Under Review, Completed), priority badges, avatars, and task actions.',
    filePath: 'src/features/kanbantemplate/index.tsx',
    states: [
      { label: 'Live Sprint Board Layout', description: 'Full responsive dual-pane layout with interactive Kanban board' },
    ],
    renderPreview: (_si) => <CompleteTaskPagePreview />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  {/* Left Sidebar */}
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="tasks" />
    <SidebarSearchBar categoryFilter="tasks" />
    <div className="px-4 py-1 text-xs font-bold uppercase">Tasks</div>
    <TaskCardItem isSelected={true} onSelect={() => {}} />
  </div>

  {/* Right Main Stage */}
  <div className="flex-1 overflow-y-auto">
    <KanbanTemplate embedded={true} />
  </div>
</div>`,
  },

  {
    id: 'task-card-item',
    name: 'Task Card Item',
    category: 'Task',
    description: 'Sidebar card representing the Tasks / Kanban Board section. Shows project title, date range badge, and Kanban label.',
    filePath: 'src/features/Message/components/sidebar/task-card-item.tsx',
    states: [
      { label: 'Selected (Active)', description: 'Active selected state with purple indicator' },
      { label: 'Default', description: 'Normal unselected state' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <TaskCardItem isSelected={si === 0} onSelect={noop} />
      </div>
    ),
    usageCode: (si) => `<TaskCardItem
  isSelected={${si === 0}}
  onSelect={() => setSelectedView('tasks')}
/>`,
  },

  // ───────────────────────── NOTIFICATIONS SECTION ────────────────────────────

  {
    id: 'complete-notification-page',
    name: 'Complete Notifications Page (Layout)',
    category: 'Notifications',
    description: 'Full-view layout for Notifications: Left sidebar showing notification cards with unread badges + Right panel displaying detailed notification context, sender info, action triggers, and quick response options.',
    filePath: 'src/features/Message/components/panels/notification-detail-panel.tsx',
    states: [
      { label: 'Interactive Notifications View', description: 'Dual-pane notification management experience' },
    ],
    renderPreview: (_si) => <CompleteNotificationPagePreview />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader isNotificationSelected={true} />
    <CategoryToolbar />
    <SidebarSearchBar />
    {notifications.map(n => (
      <NotificationCardItem key={n.id} notification={n} isSelected={selectedId === n.id} onSelect={setSelected} />
    ))}
  </div>

  <div className="flex-1">
    <NotificationDetailPanel notification={selected} messageDetail={detail} isLoadingMessage={false} onClose={handleClose} />
  </div>
</div>`,
  },

  {
    id: 'notification-card-item',
    name: 'Notification Card Item',
    category: 'Notifications',
    description: 'Sidebar notification item card. Shows sender name, message text, unread dot, timestamp, and Notification badge.',
    filePath: 'src/features/Message/components/sidebar/notification-card-item.tsx',
    states: [
      { label: 'Unread', description: 'Unread notification with bold styling' },
      { label: 'Read', description: 'Read notification, lighter styling' },
      { label: 'Selected', description: 'Active / selected state' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <NotificationCardItem
          notification={si === 1 ? mockNotifications[2] : mockNotifications[0]}
          isSelected={si === 2}
          onSelect={noop}
        />
      </div>
    ),
    usageCode: (si) => `<NotificationCardItem
  notification={mockNotification}
  isSelected={${si === 2}}
  onSelect={(notification) => openNotificationPanel(notification)}
/>`,
  },

  // ───────────────────────── FILES SECTION ───────────────────────────────────

  {
    id: 'complete-files-page',
    name: 'Complete Files Page (Storage Explorer)',
    category: 'Files',
    description: 'Full-view layout for Storage Files: Left sidebar showing the 3-level folder tree (Root -> User -> Subfolders) + Right area rendering the categorized file cards grid (PDF, Images, Word, Spreadsheets) with search, filter, and upload triggers.',
    filePath: 'src/features/Message/components/files/user-file-cards-view.tsx',
    states: [
      { label: 'Interactive Storage Explorer', description: 'Dual-pane storage and file explorer view' },
    ],
    renderPreview: (_si) => <CompleteFilesPagePreview />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="vouchers" />
    <SubTabsBar categoryFilter="vouchers" />
    <SidebarSearchBar categoryFilter="vouchers" onUploadFileClick={openUpload} />
    {folders.map(folder => (
      <FolderTreeItem key={folder.id} folder={folder} isFolderActive={selectedFolder.id === folder.id} onSelectFolder={setSelectedFolder} />
    ))}
  </div>

  <div className="flex-1 overflow-y-auto">
    <UserFileCardsView folder={selectedFolder} files={storageFiles} onSelectFileForPreview={previewFile} />
  </div>
</div>`,
  },

  {
    id: 'folder-tree-item',
    name: 'Folder Tree Item',
    category: 'Files',
    description: 'Collapsible folder tree node. Supports 3-level nesting (root → user email → category), file count badge, active/expanded states.',
    filePath: 'src/features/Message/components/sidebar/folder-tree-item.tsx',
    states: [
      { label: 'Root Level (L0)', description: 'Top-level folder' },
      { label: 'User Level (L1)', description: 'User email folder' },
      { label: 'Category Level (L2)', description: 'Sub-category folder' },
      { label: 'Active', description: 'Currently selected folder' },
    ],
    renderPreview: (si) => {
      const folder = mockFolders[si === 3 ? 2 : Math.min(si, 2)]
      return (
        <div className='w-72 p-2 space-y-1'>
          <FolderTreeItem
            folder={folder}
            isFolderActive={si === 3}
            isExpanded={si === 1}
            onToggleExpand={noop}
            onSelectFolder={() => toast.info(`Selected: ${folder.name} (preview only)`)}
          />
        </div>
      )
    },
    usageCode: (si) => `<FolderTreeItem
  folder={userFolder}
  isFolderActive={${si === 3}}
  isExpanded={${si === 1}}
  onToggleExpand={(id, e) => toggleFolder(id)}
  onSelectFolder={(folder) => setSelectedFolder(folder)}
/>`,
  },

  // ───────────────────────── MAIL SECTION ───────────────────────────────────

  {
    id: 'complete-mail-page',
    name: 'Complete Mail Page (Layout)',
    category: 'Mail',
    description: 'Full split-screen Mail Page layout showing the interactive left sidebar (Inbox/Sent tabs, search bar, email cards, pagination) combined with the active email reader and composer.',
    filePath: 'src/features/Message/index.tsx',
    states: [
      { label: 'Interactive Live Mail Page', description: 'Full responsive dual-pane layout with email switching and compose mode' },
    ],
    renderPreview: (_si) => <CompleteMailPagePreview />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader unreadCount={unreadCount} />
    <CategoryToolbar categoryFilter="mail" />
    <SubTabsBar categoryFilter="mail" activeTab={activeTab} onTabChange={setActiveTab} />
    <SidebarSearchBar searchQuery={query} setSearchQuery={setQuery} categoryFilter="mail" />
    <div className="overflow-y-auto">
      {emails.map(email => (
        <EmailCardItem key={email.id} email={email} isSelected={selectedId === email.id} onSelect={setSelectedEmail} />
      ))}
    </div>
    <SidebarPagination page={page} limit={20} total={total} />
  </div>

  <div className="flex-1">
    {isComposing ? (
      <NewEmail onCancel={() => setIsComposing(false)} onSend={handleSend} onSaveDraft={handleDraft} />
    ) : selectedEmail ? (
      <EmailView email={selectedEmail} onBack={handleBack} onDelete={handleDelete} />
    ) : null}
  </div>
</div>`,
  },

  {
    id: 'email-view',
    name: 'Email View (Full Reader)',
    category: 'Mail',
    description: 'Complete email viewing screen with sender information, recipient badges, CC/BCC display, sanitized HTML body, download buttons, attachments grid, and reply composer.',
    filePath: 'src/features/Message/components/emails/email-view.tsx',
    states: [
      { label: 'Default', description: 'Full email reader with attachments' },
    ],
    renderPreview: (_si) => <MailViewPreview />,
    usageCode: (_si) => `<EmailView
  email={mockEmail}
  onBack={() => navigateBack()}
  onDelete={(id) => deleteEmail(id)}
  onStartChat={() => startChatWithSender()}
  onPreviewAttachment={(attachment) => previewDocument(attachment)}
/>`,
  },

  {
    id: 'new-email',
    name: 'New Email (Composer Modal)',
    category: 'Mail',
    description: 'Full-featured email composer with To/CC/BCC recipient fields, Subject input, Template dropdown, Priority flags, Attachment picker with upload progress, and Rich text editor.',
    filePath: 'src/features/Message/components/emails/new-email.tsx',
    states: [
      { label: 'Default Composer', description: 'Full new email creation screen' },
    ],
    renderPreview: (_si) => <NewEmailPreview />,
    usageCode: (_si) => `<NewEmail
  onCancel={() => setIsComposing(false)}
  onSend={(emailData) => handleSendEmail(emailData)}
  onSaveDraft={(emailData) => handleSaveDraft(emailData)}
  onPreviewAttachment={(attachment) => handlePreviewAttachment(attachment)}
/>`,
  },

  {
    id: 'email-editor',
    name: 'Email Editor (Inline Reply)',
    category: 'Mail',
    description: 'Inline quick reply editor with rich text toolbar (Bold, Italic, Strikethrough, Code, H1-H6 headings, Lists, Links, Undo/Redo), Cmd+J AI autocomplete tip, and send button.',
    filePath: 'src/features/Message/components/emails/email-editor.tsx',
    states: [
      { label: 'Default Reply Editor', description: 'Inline reply box with toolbar' },
    ],
    renderPreview: (_si) => <EmailEditorPreview />,
    usageCode: (_si) => `<EmailEditor
  recipientName="Jordan Lee"
  recipientEmail="jordan@demo.com"
  onSend={(content) => handleSendReply(content)}
/>`,
  },

  {
    id: 'email-detail',
    name: 'Email Detail View',
    category: 'Mail',
    description: 'Structured email reader displaying sender avatar, timestamp, sanitized HTML email body or newsletter deal mockup, action icons, and reply composer.',
    filePath: 'src/features/Message/components/emails/email-detail.tsx',
    states: [
      { label: 'Email 1', description: 'Project update email' },
      { label: 'Email 2', description: 'Meeting notes' },
    ],
    renderPreview: (_si) => <EmailDetailPreview />,
    usageCode: (_si) => `<EmailDetail
  email={mockEmail}
  onSendReply={(content) => handleSendReply(content)}
  onDelete={(id) => handleDelete(id)}
  onArchive={(id) => handleArchive(id)}
/>`,
  },

  {
    id: 'email-card-item',
    name: 'Email Card Item',
    category: 'Mail',
    description: 'Email list item card. Shows sender avatar, name, subject, preview snippet, labels, unread dot, timestamp, and 10-action dropdown menu.',
    filePath: 'src/features/Message/components/sidebar/email-card-item.tsx',
    states: [
      { label: 'Unread', description: 'Unread email with bold styling' },
      { label: 'Read', description: 'Read email, lighter styling' },
      { label: 'Selected', description: 'Active / selected state' },
      { label: 'With Attachment', description: 'Email with file attachment' },
    ],
    renderPreview: (si) => {
      const email = si === 3 ? mockEmails[0] : si === 1 ? mockEmails[1] : si === 2 ? { ...mockEmails[0], read: false } : mockEmails[2]
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <EmailCardItem
            email={email}
            isSelected={si === 2}
            isCollapsed={false}
            onSelect={noop}
          />
        </div>
      )
    },
    usageCode: (si) => `<EmailCardItem
  email={mockEmail}
  isSelected={${si === 2}}
  isCollapsed={false}
  onSelect={(email) => setSelectedEmail(email)}
/>`,
  },

  {
    id: 'email-list-skeleton',
    name: 'Email List Skeleton',
    category: 'Mail',
    description: 'Animated loading skeleton displayed in the sidebar while emails are being fetched.',
    filePath: 'src/features/Message/components/sidebar/email-list-skeleton.tsx',
    states: [
      { label: 'Default', description: 'Loading placeholder' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <EmailListSkeleton />
      </div>
    ),
    usageCode: (_si) => `// Show during email fetch
{isEmailsLoading && <EmailListSkeleton />}`,
  },

  // ───────────────────────── CHAT SECTION ───────────────────────────────────

  {
    id: 'complete-chat-page',
    name: 'Complete Chat Page (Layout)',
    category: 'Chat',
    description: 'Full-view dual-pane layout for Chat: Left sidebar with subtabs (Chats, Contacts, Groups, Folders) and conversation cards + Right area with active chat view, header, reactions, file progress, and composer.',
    filePath: 'src/features/Message/components/chat/chat-view.tsx',
    states: [
      { label: 'Interactive Live Chat Page', description: 'Full dual-pane chat conversation view' },
    ],
    renderPreview: (_si) => <CompleteChatPagePreview />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="chat" />
    <SubTabsBar categoryFilter="chat" activeTab="chats" />
    <SidebarSearchBar categoryFilter="chat" />
    {chats.map(c => (
      <ChatCardItem key={c.id} email={c} isSelected={selectedId === c.id} onSelect={setSelected} />
    ))}
  </div>

  <div className="flex-1">
    <ChatView chatName="Alex Johnson" messages={messages} onSendMessage={handleSend} currentUser={currentUser} />
  </div>
</div>`,
  },

  {
    id: 'chat-view',
    name: 'Chat View (Full Screen)',
    category: 'Chat',
    description: 'Complete chat conversation view. Includes header, scrollable message stream with multi-type bubbles (text, media, doc, reply), file upload progress, and message composer.',
    filePath: 'src/features/Message/components/chat/chat-view.tsx',
    states: [
      { label: 'With Messages', description: 'Conversation with mock messages' },
      { label: 'Empty', description: 'No messages yet state' },
    ],
    renderPreview: (si) => (
      <div className='w-full h-[540px] rounded-xl overflow-hidden border border-border relative'>
        <ChatView
          chatName='Alex Johnson'
          chatAvatar=''
          membersCount={2}
          onlineCount={1}
          messages={si === 1 ? [] : mockChatMessages}
          onBack={() => toast.info('Back (preview only)')}
          onSendMessage={() => toast.info('Send (preview only)')}
          currentUser={mockCurrentUser}
        />
      </div>
    ),
    usageCode: (si) => `<ChatView
  chatName="Alex Johnson"
  membersCount={2}
  onlineCount={1}
  messages={${si === 1 ? '[]' : 'mockChatMessages'}}
  onBack={() => {}}
  onSendMessage={(content, attachment, replyTo) => {}}
  currentUser={currentUser}
/>`,
  },

  {
    id: 'chat-card-item',
    name: 'Chat Card Item',
    category: 'Chat',
    description: 'Sidebar list card for a chat conversation or contact. Shows name, member count, last message snippet, and unread indicator.',
    filePath: 'src/features/Message/components/sidebar/chat-card-item.tsx',
    states: [
      { label: 'Default', description: 'Standard group chat card' },
      { label: 'Unread', description: 'Card with unread indicator' },
      { label: 'Selected', description: 'Active / selected state' },
      { label: 'Collapsed', description: 'Icon-only collapsed mode' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <ChatCardItem
          email={si === 1 ? { ...mockChatEmails[2], read: false } : si === 2 ? mockChatEmails[0] : mockChatEmails[1]}
          isSelected={si === 2}
          isCollapsed={si === 3}
          onSelect={noop}
        />
      </div>
    ),
    usageCode: (si) => `<ChatCardItem
  email={mockChatEmail}
  isSelected={${si === 2}}
  isCollapsed={${si === 3}}
  onSelect={(email) => console.log('selected', email.id)}
/>`,
  },

  {
    id: 'chat-header',
    name: 'Chat Header',
    category: 'Chat',
    description: 'Top bar of a chat conversation. Shows avatar, name, member/online count, typing indicator, back button (mobile), and action menu.',
    filePath: 'src/features/Message/components/chat/chat-header.tsx',
    states: [
      { label: 'Default', description: 'Standard header' },
      { label: 'Typing', description: 'Shows typing indicator' },
      { label: 'Group Chat', description: 'Group with member count' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <ChatHeader
          chatName={si === 2 ? 'Design Squad' : 'Alex Johnson'}
          subtitle={si === 2 ? '5 members, 3 online' : 'Last seen 2 mins ago'}
          typingText={si === 1 ? 'Alex is typing...' : undefined}
          onBack={noop}
          onShowProfile={noop}
        />
      </div>
    ),
    usageCode: (si) => `<ChatHeader
  chatName="${si === 2 ? 'Design Squad' : 'Alex Johnson'}"
  subtitle="${si === 2 ? '5 members, 3 online' : 'Last seen 2 mins ago'}"
  ${si === 1 ? 'typingText="Alex is typing..."' : ''}
  onBack={() => {}}
  onShowProfile={() => {}}
/>`,
  },

  {
    id: 'message-bubble',
    name: 'Message Bubble',
    category: 'Chat',
    description: 'Individual message bubble. Supports text, image, video, document, voice, location, reply-to, forward, and action toolbar on hover.',
    filePath: 'src/features/Message/components/chat/message-bubble.tsx',
    states: [
      { label: 'Text Message', description: 'Plain text bubble' },
      { label: 'Own Message', description: 'Sent by current user' },
      { label: 'With Document', description: 'PDF/document attachment' },
      { label: 'With Reply', description: 'Reply-to reference' },
    ],
    renderPreview: (si) => {
      const msgs = [mockChatMessages[0], mockChatMessages[1], mockChatMessageWithDoc, mockChatMessageReply]
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <MessageBubble
            msg={msgs[si] || msgs[0]}
            isHighlighted={false}
            activeToolbarMessageId={null}
            setActiveToolbarMessageId={noop as any}
            onScrollToReply={noop}
            onPreviewDoc={noop}
            onPreviewImage={noop}
            onPreviewMap={noop}
            onRetryPdf={noop}
            formatTime={(d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            formatFileSize={(b) => b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`}
            getFileType={(n) => n.split('.').pop()?.toLowerCase()}
          />
        </div>
      )
    },
    usageCode: (si) => `<MessageBubble
  msg={mockChatMessage}
  isHighlighted={false}
  activeToolbarMessageId={null}
  setActiveToolbarMessageId={() => {}}
  onScrollToReply={() => {}}
  onPreviewDoc={(attachment) => {}}
  onPreviewImage={(attachment) => {}}
  onPreviewMap={(location) => {}}
  onRetryPdf={(id) => {}}
  formatTime={(date) => date.toLocaleTimeString()}
  formatFileSize={(bytes) => \`\${Math.round(bytes/1024)} KB\`}
  getFileType={(name) => name.split('.').pop()}
/>`,
  },

  {
    id: 'file-upload-progress',
    name: 'File Upload Progress',
    category: 'Chat',
    description: 'Animated file upload progress bar shown inside the chat and composer while a file is being uploaded.',
    filePath: 'src/features/Message/components/chat/file-upload-progress.tsx',
    states: [
      { label: 'Uploading 45%', description: 'Mid-upload state' },
      { label: 'Uploading 90%', description: 'Nearly complete' },
      { label: 'Completed', description: 'Upload finished' },
    ],
    renderPreview: (si) => {
      const progress = si === 0 ? 45 : si === 1 ? 90 : 100
      const status: 'uploading' | 'completed' | 'error' = si === 2 ? 'completed' : 'uploading'
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <FileUploadProgress
            fileName='Q3-Report-2026.pdf'
            fileSize={1240000}
            progress={progress}
            status={status}
            onCancel={() => toast.info('Cancel clicked (preview only)')}
          />
        </div>
      )
    },
    usageCode: (si) => `<FileUploadProgress
  fileName="Q3-Report-2026.pdf"
  fileSize={1240000}
  progress={${si === 0 ? 45 : si === 1 ? 90 : 100}}
  status="${si === 2 ? 'completed' : 'uploading'}"
  onCancel={() => {}}
/>`,
  },

  // ───────────────────────── AI ASSISTANT SECTION ───────────────────────────

  {
    id: 'complete-ai-page',
    name: 'Complete AI Page (Layout)',
    category: 'AI',
    description: 'Full dual-pane layout for AI Assistant: Left sidebar with subtabs (AI Chat, Recent, Prompts) + Right area hosting the multi-model AI Assistant window with tool switcher and conversation stream.',
    filePath: 'src/features/Message/components/panels/ai-chat-panel.tsx',
    states: [
      { label: 'Interactive AI Assistant Page', description: 'Full dual-pane AI assistant workspace' },
    ],
    renderPreview: (_si) => <CompleteAiPagePreview />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="ai" />
    <SubTabsBar categoryFilter="ai" activeTab="ai-chat" />
    <SidebarSearchBar categoryFilter="ai" />
    <AiCardItem isSelected={true} onSelect={() => {}} />
  </div>

  <div className="flex-1">
    <AiChatPanel onBack={() => {}} />
  </div>
</div>`,
  },

  {
    id: 'ai-chat-panel',
    name: 'AI Chat Window (Assistant)',
    category: 'AI',
    description: 'Full AI Assistant chat window featuring multi-model selection (Gemini 2.5, Claude 3.5, GPT-4o, DeepSeek R1), tool switches (Chat, Web Search, Code), suggestion pills, rich markdown code syntax highlighting, citations/sources, voice input, and document analysis.',
    filePath: 'src/features/Message/components/panels/ai-chat-panel.tsx',
    states: [
      { label: 'Active Conversation (Code & Sources)', description: 'Shows response with syntax highlighting, bullet points, and citations' },
      { label: 'Empty State (Suggestions & Tools)', description: 'Initial prompt recommendation cards' },
    ],
    renderPreview: (si) => <AiChatWindowPreview initialState={si === 1 ? 'empty' : 'conversation'} />,
    usageCode: (si) => `<AiChatPanel
  onBack={() => handleClosePanel()}
/>`,
  },

  {
    id: 'ai-card-item',
    name: 'AI Card Item',
    category: 'AI',
    description: 'Sidebar card for the AI Assistant entry point. Shows Bot icon, AI badge, and last prompt preview.',
    filePath: 'src/features/Message/components/sidebar/ai-card-item.tsx',
    states: [
      { label: 'Default', description: 'Normal unselected state' },
      { label: 'Selected', description: 'Active / selected state' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <AiCardItem isSelected={si === 1} onSelect={noop} />
      </div>
    ),
    usageCode: (si) => `<AiCardItem
  isSelected={${si === 1}}
  onSelect={() => setSelectedView('ai')}
/>`,
  },

  // ─────────────────────── SHARED / TOOLBARS SECTION ────────────────────────

  {
    id: 'sidebar-header',
    name: 'Sidebar Header',
    category: 'Shared',
    description: 'Desktop-only sidebar top bar with "Messages" title, email settings icon, and notification bell with unread badge.',
    filePath: 'src/features/Message/components/sidebar/sidebar-header.tsx',
    states: [
      { label: 'Default', description: 'No notifications' },
      { label: 'With Notifications', description: '3 unread notifications' },
      { label: 'Settings Active', description: 'Settings icon highlighted' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <SidebarHeader
          unreadCount={si === 1 ? 3 : 0}
          isEmailSettingsSelected={si === 2}
          isNotificationSelected={false}
          onSelectEmailSettings={() => toast.info('Settings (preview only)')}
          onSelectNotification={() => toast.info('Notifications (preview only)')}
        />
      </div>
    ),
    usageCode: (si) => `<SidebarHeader
  unreadCount={${si === 1 ? 3 : 0}}
  isEmailSettingsSelected={${si === 2}}
  isNotificationSelected={false}
  onSelectEmailSettings={() => setView('settings')}
  onSelectNotification={() => setView('notifications')}
/>`,
  },

  {
    id: 'category-toolbar',
    name: 'Category Toolbar',
    category: 'Shared',
    description: 'Horizontal icon toolbar with 6 category buttons: Tasks, Mail, Chat, AI Chat, AI Assistant, Files/Vouchers.',
    filePath: 'src/features/Message/components/sidebar/category-toolbar.tsx',
    states: [
      { label: 'Tasks Active', description: 'Tasks / Kanban icon selected (purple)' },
      { label: 'Mail Active', description: 'Mail category selected' },
      { label: 'Chat Active', description: 'Chat category selected' },
      { label: 'AI Active', description: 'AI Chat selected' },
    ],
    renderPreview: (si) => {
      const filters = ['tasks', 'mail', 'chat', 'ai'] as const
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <CategoryToolbar
            categoryFilter={filters[si]}
            onSelectTasks={() => toast.info('Tasks (preview only)')}
            onSelectMail={() => toast.info('Mail (preview only)')}
            onSelectChat={() => toast.info('Chat (preview only)')}
            onSelectAi={() => toast.info('AI Chat (preview only)')}
            onSelectAiAssistant={() => toast.info('AI Assistant (preview only)')}
            onSelectVouchers={() => toast.info('Files (preview only)')}
          />
        </div>
      )
    },
    usageCode: (si) => {
      const filters = ['tasks', 'mail', 'chat', 'ai']
      return `<CategoryToolbar
  categoryFilter="${filters[si]}"
  onSelectTasks={() => {}}
  onSelectMail={() => {}}
  onSelectChat={() => {}}
  onSelectAi={() => {}}
  onSelectAiAssistant={() => {}}
  onSelectVouchers={() => {}}
/>`
    },
  },

  {
    id: 'sub-tabs-bar',
    name: 'Sub Tabs Bar',
    category: 'Shared',
    description: 'Dynamic tab bar below the category toolbar. Shows context-specific tabs: Inbox/Sent/Folder for mail, Chats/Contact/Groups for chat, etc.',
    filePath: 'src/features/Message/components/sidebar/sub-tabs-bar.tsx',
    states: [
      { label: 'Mail Tabs', description: 'Inbox, Sent, Folder, Contact, Groups' },
      { label: 'Chat Tabs', description: 'Chats, Contact, Groups, Folder' },
      { label: 'AI Tabs', description: 'AI Chat, Recent, Prompts' },
      { label: 'File Tabs', description: 'File, Recent' },
    ],
    renderPreview: (si) => {
      const filters = ['mail', 'chat', 'ai', 'vouchers'] as const
      const tabs = ['inbox', 'chats', 'ai-chat', 'file'] as const
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <SubTabsBar
            categoryFilter={filters[si]}
            activeTab={tabs[si]}
            total={si === 0 ? 48 : 0}
            page={1}
            limit={20}
            hasMore={si === 0}
            onTabChange={(tab) => toast.info(`Tab: ${tab} (preview only)`)}
          />
        </div>
      )
    },
    usageCode: (si) => {
      const filters = ['mail', 'chat', 'ai', 'vouchers']
      return `<SubTabsBar
  categoryFilter="${filters[si]}"
  activeTab="inbox"
  total={48}
  page={1}
  limit={20}
  hasMore={true}
  onTabChange={(tab) => setActiveTab(tab)}
  onModeChange={(mode) => setMode(mode)}
/>`
    },
  },

  {
    id: 'sidebar-search-bar',
    name: 'Sidebar Search Bar',
    category: 'Shared',
    description: 'Search input with clear button. Shows a "New Email" compose button for mail mode or "Upload" button for file mode.',
    filePath: 'src/features/Message/components/sidebar/sidebar-search-bar.tsx',
    states: [
      { label: 'Mail Mode', description: 'With compose button' },
      { label: 'File Mode', description: 'With upload button' },
      { label: 'Chat Mode', description: 'Search only' },
    ],
    renderPreview: (si) => {
      const cats = ['mail', 'vouchers', 'chat'] as const
      const modes = ['mail', 'mail', 'chat'] as const
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <SidebarSearchBar
            searchQuery=''
            setSearchQuery={noop}
            categoryFilter={cats[si]}
            sectionMode={modes[si]}
            onComposeChange={() => toast.info('Compose (preview only)')}
            onUploadFileClick={() => toast.info('Upload (preview only)')}
          />
        </div>
      )
    },
    usageCode: (si) => {
      const cats = ['mail', 'vouchers', 'chat']
      return `<SidebarSearchBar
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  categoryFilter="${cats[si]}"
  sectionMode="mail"
  onComposeChange={(composing) => setIsComposing(composing)}
  onUploadFileClick={() => openFileUpload()}
/>`
    },
  },

  {
    id: 'sidebar-pagination',
    name: 'Sidebar Pagination',
    category: 'Shared',
    description: 'Compact pagination controls showing "1–20 of 48" with prev/next buttons. Used in the mail sidebar.',
    filePath: 'src/features/Message/components/sidebar/sidebar-pagination.tsx',
    states: [
      { label: 'Page 1', description: 'First page, prev disabled' },
      { label: 'Page 2', description: 'Middle page, both enabled' },
      { label: 'Last Page', description: 'Next disabled' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <SidebarPagination
          page={si + 1}
          limit={20}
          total={48}
          hasMore={si < 2}
          onPrevPage={() => toast.info('Prev page (preview only)')}
          onNextPage={() => toast.info('Next page (preview only)')}
        />
      </div>
    ),
    usageCode: (si) => `<SidebarPagination
  page={${si + 1}}
  limit={20}
  total={48}
  hasMore={${si < 2}}
  onPrevPage={() => setPage(p => p - 1)}
  onNextPage={() => setPage(p => p + 1)}
/>`,
  },

  {
    id: 'header-actions',
    name: 'Header Actions Dropdown',
    category: 'Shared',
    description: 'Header action button group featuring "Act on this" button (Bell icon left of Flag), Quick Flag button, and a 3-dot "More" dropdown menu with exact items: Reply, Forward, Pin Message, Star, Favorite, Flag, Archive, Action This >, and Delete >.',
    filePath: 'src/features/Message/components/chat/header-actions.tsx',
    states: [
      { label: 'Default Header Actions', description: 'Act on this + Quick Flag action + 3-Dot More options dropdown menu' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center justify-between p-3 border border-border rounded-xl bg-card w-full'>
          <span className='text-sm font-semibold text-muted-foreground mr-auto'>Header Actions →</span>
          <HeaderActions
            onDelete={() => toast.info('Delete clicked (preview only)')}
            onReply={() => toast.info('Reply clicked')}
            onForward={() => toast.info('Forward clicked')}
          />
        </div>
      </div>
    ),
    usageCode: (_si) => `<HeaderActions
  onActionThis={() => handleActionThis()}
  onReply={() => handleReply()}
  onForward={() => handleForward()}
  onPin={() => handlePin()}
  onStar={() => handleStar()}
  onFavorite={() => handleFavorite()}
  onArchive={() => handleArchive()}
  onDelete={() => handleDelete()}
/>`,
  },

  {
    id: 'email-header',
    name: 'Email View Header',
    category: 'Shared',
    description: 'Complete top bar for the Email View component. Displays sender avatar, "From: Name", email address, HeaderActions (with exact 9 dropdown options: Reply, Forward, Pin Message, Star, Favorite, Flag, Archive, Action This >, Delete >), and close button without the Back button.',
    filePath: 'src/features/Message/components/emails/email-view.tsx',
    states: [
      { label: 'Default Header', description: 'Clean email header with sender info, exact 3-dot menu items, and close trigger' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center justify-between gap-3 border-b border-border pb-3 w-full'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <div className='w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-border shrink-0 bg-pink-200 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200'>
              JL
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-bold text-foreground truncate'>
                From: Jordan Lee
              </span>
              <span className='text-xs text-muted-foreground truncate'>
                jordan@demo.com
              </span>
            </div>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
            <HeaderActions
              onDelete={() => toast.info('Delete email (preview only)')}
              onReply={() => toast.info('Reply email (preview only)')}
            />
            <button
              type='button'
              onClick={() => toast.info('Close email (preview only)')}
              className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              title='Close'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>
      </div>
    ),
    usageCode: (_si) => `<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
  <div className="flex items-center gap-3 min-w-0">
    <Avatar className="w-9 h-9">
      <AvatarFallback>JL</AvatarFallback>
    </Avatar>
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-bold truncate">From: Jordan Lee</span>
      <span className="text-xs text-muted-foreground truncate">jordan@demo.com</span>
    </div>
  </div>

  <div className="flex items-center gap-2 shrink-0">
    <HeaderActions onDelete={handleDelete} onReply={handleReply} />
    <Button variant="ghost" size="icon" onClick={handleClose}>
      <X className="h-5 w-5" />
    </Button>
  </div>
</div>`,
  },
  {
    id: 'chat-icon-bar',
    name: 'Chat Icon Bar',
    category: 'Shared',
    description: 'Floating action toolbar pill for chat & AI responses. Displays Audio icon (Volume2 on the left), ThumbsUp, ThumbsDown, Copy, Share, and 3-Dot More menu trigger.',
    filePath: 'src/features/Message/components/chat/chat-icon-bar.tsx',
    states: [
      { label: 'Default Toolbar Pill', description: 'Rounded floating pill with audio trigger & message actions' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center gap-1 rounded-full border border-border/80 bg-background/95 px-3 py-1.5 shadow-md text-muted-foreground select-none backdrop-blur-xs'>
          <button
            type='button'
            onClick={() => toast.info('Playing audio...')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Listen Audio'
          >
            <Volume2 className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.success('Liked response')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Good response'
          >
            <ThumbsUp className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.info('Disliked response')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Bad response'
          >
            <ThumbsDown className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.success('Copied text to clipboard')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Copy text'
          >
            <Copy className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.info('Share link copied')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Share response'
          >
            <Share2 className='h-4 w-4' />
          </button>
          <ThreeDotMenu />
        </div>
      </div>
    ),
    usageCode: (_si) => `<div className="flex items-center gap-1 rounded-full border border-border bg-background/95 px-3 py-1.5 shadow-md">
  <button title="Audio"><Volume2 className="h-4 w-4" /></button>
  <button title="Like"><ThumbsUp className="h-4 w-4" /></button>
  <button title="Dislike"><ThumbsDown className="h-4 w-4" /></button>
  <button title="Copy"><Copy className="h-4 w-4" /></button>
  <button title="Share"><Share2 className="h-4 w-4" /></button>
  <ThreeDotMenu />
</div>`,
  },

  {
    id: 'three-dot-menu',
    name: '3-Dot Menu',
    category: 'Shared',
    description: 'Standalone 3-Dot More options dropdown menu component. Displays ONLY the 3-Dot button trigger which opens the full 9 action options: Reply, Forward, Pin Message, Star, Favorite, Flag, Archive, Action This >, and Delete >.',
    filePath: 'src/features/Message/components/chat/three-dot-menu.tsx',
    states: [
      { label: 'Default Menu', description: 'Clickable standalone 3-Dot trigger opening full 9-item menu' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center gap-3 p-2.5 border border-border rounded-xl bg-background shadow-xs'>
          <span className='text-xs text-muted-foreground font-medium'>Click 3-Dot Menu →</span>
          <ThreeDotMenu />
        </div>
      </div>
    ),
    usageCode: (_si) => `<ThreeDotMenu
  onReply={handleReply}
  onForward={handleForward}
  onPin={handlePin}
  onStar={handleStar}
  onFavorite={handleFavorite}
  onArchive={handleArchive}
  onActionThis={handleActionThis}
  onDelete={handleDelete}
/>`,
  },

  {
    id: 'side-list-card',
    name: 'Side List Card',
    category: 'Shared',
    description: 'Purple/indigo tinted item card with left accent bar, clean top timestamp ("18 aug 26 14.41 / about 2 hours ago"), demo sender name ("Jordan Lee"), and on mouse hover displays the Chat Icon Bar at the bottom.',
    filePath: 'src/features/Message/components/sidebar/side-list-card.tsx',
    states: [
      { label: 'Default Card', description: 'Clean card with top timestamp & hover Chat Icon Bar on bottom' },
      { label: 'Selected State', description: 'Active selected state with prominent left border' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start select-none font-sans'>
        <div
          className={cn(
            'group relative flex flex-col gap-1.5 rounded-xl p-4 transition-all duration-200 cursor-pointer border w-full',
            si === 1
              ? 'border-purple-300 dark:border-purple-700 bg-purple-500/15 shadow-sm'
              : 'border-purple-200/60 dark:border-purple-900/40 bg-purple-500/10 hover:bg-purple-500/15'
          )}
        >
          {/* Left accent bar */}
          <div className='absolute top-0 bottom-0 left-0 w-1 bg-purple-600 rounded-l-xl' />

          {/* Top Row: Sender Name & Clean Aligned Timestamp */}
          <div className='flex items-start justify-between gap-3 pl-1 pr-1'>
            <span className='font-bold text-sm text-foreground truncate'>
              Jordan Lee
            </span>
            <div className='text-right text-xs text-muted-foreground shrink-0 font-medium leading-tight'>
              <div>18 aug 26 14.41</div>
              <div className='text-[10px] text-muted-foreground/70 font-normal'>about 2 hours ago</div>
            </div>
          </div>

          {/* Subject & Body */}
          <div className='pl-1 pr-1 space-y-0.5 pb-2'>
            <p className='text-xs font-semibold text-foreground/90 line-clamp-1'>
              test to check auto sync aug 18 2.40
            </p>
            <p className='text-xs text-muted-foreground/80 line-clamp-1'>
              test to check auto sync aug 18 2.40
            </p>
          </div>

          {/* Mouse Hover Floating Chat Icon Bar at Bottom */}
          <div className='absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-10'>
            <div className='flex items-center gap-1 rounded-full border border-border/80 bg-background/95 px-2.5 py-1 shadow-lg text-muted-foreground text-xs backdrop-blur-xs'>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  toast.info('Playing audio...')
                }}
                className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                title='Audio'
              >
                <Volume2 className='h-3.5 w-3.5' />
              </button>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  toast.success('Liked')
                }}
                className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                title='Like'
              >
                <ThumbsUp className='h-3.5 w-3.5' />
              </button>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  toast.info('Disliked')
                }}
                className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                title='Dislike'
              >
                <ThumbsDown className='h-3.5 w-3.5' />
              </button>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  toast.success('Copied text')
                }}
                className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                title='Copy'
              >
                <Copy className='h-3.5 w-3.5' />
              </button>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  toast.info('Shared link')
                }}
                className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                title='Share'
              >
                <Share2 className='h-3.5 w-3.5' />
              </button>
              <ThreeDotMenu />
            </div>
          </div>
        </div>
      </div>
    ),
    usageCode: (si) => `<div className="group relative flex flex-col gap-1.5 rounded-xl p-4 bg-purple-500/10 border border-purple-200/60">
  <div className="absolute top-0 bottom-0 left-0 w-1 bg-purple-600 rounded-l-xl" />

  {/* Clean Top Timestamp */}
  <div className="flex items-start justify-between">
    <span className="font-bold text-sm">Jordan Lee</span>
    <div className="text-right text-xs text-muted-foreground">
      <div>18 aug 26 14.41</div>
      <div>about 2 hours ago</div>
    </div>
  </div>

  <p className="text-xs text-muted-foreground">test to check auto sync aug 18 2.40</p>

  {/* Hover Chat Icon Bar at Bottom */}
  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <ChatIconBar />
  </div>
</div>`,
  },

  {
    id: 'attachment-card-uploader',
    name: 'Attachment Card & Uploader',
    category: 'Shared',
    description: 'File attachment card displaying title ("Attachments (1)"), file item with badge, name ("Q3-Update.pdf"), size ("2.4 MB"), download & view buttons, and an interactive "Attach Files" trigger with live upload progress bar animation.',
    filePath: 'src/features/Message/components/shared/attachment-card-uploader.tsx',
    states: [
      { label: 'Default View', description: 'Attachment list with Q3-Update.pdf card & Attach Files button' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <AttachmentCardUploader />
      </div>
    ),
    usageCode: (_si) => `<AttachmentCardUploader
  initialAttachments={[
    {
      id: 'att-1',
      name: 'Q3-Update.pdf',
      size: '2.4 MB',
      type: 'PDF',
    },
  ]}
/>`,
  },
]

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'All',
  'Task',
  'Mail',
  'Notifications',
  'Files',
  'Chat',
  'AI',
  'Shared',
]
