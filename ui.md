# UI Component File Mapping Guide (`ui.md`)

This document provides a complete guide for developers (from beginner to expert) detailing which file controls which exact UI component across the **Message Feature** and **Chat Template Feature**.

---

## 1. Message Feature (`src/features/Message/`)

### Main Architecture
- **Root Page / Controller**: [`src/features/Message/index.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/index.tsx)
  - Controls overall page header ("Messages"), top desktop tab navigation bar (`Inbox`, `Send`, `Folder`, `Contact`, `Groups`), mobile top tab bar + 3-dot dropdown menu, and active tab content routing.

---

### UI Subdirectories Breakdown

#### A. Chat Components (`src/features/Message/components/chat/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **Main Chat Window** | [`chat/chat-view.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/chat-view.tsx) | Renders the 1-on-1 / Group conversation interface (header with avatar & actions, scrollable message list, reply bubbles, attachment preview bar, text input area, send button). |
| **Realtime Chat View** | [`chat/realtime-chat-view.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/realtime-chat-view.tsx) | Live chat wrapper integrating Supabase Realtime messaging state. |
| **Header Actions** | [`chat/header-actions.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/header-actions.tsx) | Top-right header control bar containing the Search toggle, Options button, and 3-dot dropdown menu. |
| **File Upload Progress Bar** | [`chat/file-upload-progress.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/file-upload-progress.tsx) | Reusable animated black progress bar indicator shown when uploading attachments in chat or email. |

#### B. Email Components (`src/features/Message/components/emails/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **Message / Email Sidebar List** | [`emails/email-list.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-list.tsx) | Left sidebar list containing search bar, Inbox/Done mode toggles, email message cards, direct contact cards, and shortcut cards for AI Chat, Calendar, Tasks/Kanban, and Files. |
| **Email Reader View** | [`emails/email-view.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-view.tsx) | Full screen reading view when an email message is selected from the inbox. |
| **Email Content Detail** | [`emails/email-detail.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-detail.tsx) | Displays sender details, timestamp, email body text, attachment links, and quick reply action triggers. |
| **Email Reply Editor** | [`emails/email-editor.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-editor.tsx) | Rich text editor area for typing and formatting email replies. |
| **New Email Composer** | [`emails/new-email.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/new-email.tsx) | Full compose screen for drafting new emails with recipient inputs, subject, body, attachment manager, and upload progress bar. |

#### C. Management Tabs (`src/features/Message/components/tabs/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **Email Accounts Manager (Folder Tab)** | [`src/features/email-settings/components/accounts-tab.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/email-settings/components/accounts-tab.tsx) | Mounted inside the `Folder` tab. Manages connected email accounts, incoming IMAP/POP3 & SMTP server configurations, SSL/TLS toggles, and account credentials. |
| **Contact Manager Tab** | [`tabs/contact-manager-tab.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/tabs/contact-manager-tab.tsx) | Mounted in `Contact` tab. Displays contacts in Email Account Manager row card layout with **Chat Icon** (left of toggle), active status switch, edit/delete buttons, **"Add New Contact"** button at bottom, and popup dialog modals. |
| **Group Manager Tab** | [`tabs/group-manager-tab.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/tabs/group-manager-tab.tsx) | Mounted in `Groups` tab. Displays group channels in Email Account Manager row card layout with **Chat Icon** (left of toggle), active status switch, edit/delete buttons, **"Add New Group"** button at bottom, and popup dialog modals. |

#### D. Embedded Side Panels (`src/features/Message/components/panels/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **AI Assistant Chat Panel** | [`panels/ai-chat-panel.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/panels/ai-chat-panel.tsx) | AI Assistant chat interface supporting web search integration, code execution, image viewing, and attachment progress bar. |
| **Document / PDF Viewer Panel** | [`panels/doc-viewer-panel.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/panels/doc-viewer-panel.tsx) | Document & PDF reader panel featuring dynamic rendering, download triggers, and navigation controls. |

---

## 2. Chat Template Feature (`src/features/chattemplate/`)

### Architecture Overview
The `chattemplate` feature is a standalone, full-featured messaging system module divided by domain modules (`chat`, `contacts`, `groups`, `files`).

---

### UI Component Mapping

#### A. Main Chat Module (`src/features/chattemplate/chat/components/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **Chat Layout** | [`chat/components/chat-layout.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-layout.tsx) | Main split-view container assembling `ChatSidebar`, `ChatWindow`, and `ChatProfileDrawer`. |
| **Chat Sidebar** | [`chat/components/chat-sidebar.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-sidebar.tsx) | Conversation list panel featuring search bar, direct message cards, group channel cards, unread badges, and user status indicators. |
| **Active Chat Window** | [`chat/components/chat-window.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-window.tsx) | Primary conversation screen displaying active chat header (avatar, status, search, options), message history stream, and message input toolbar. |
| **Message Toolbar (Input Bar)** | [`chat/components/message-toolbar.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/message-toolbar.tsx) | Input dock containing text input area, file attachment button, emoji picker trigger, voice note recorder, location pin share, and send button. |
| **Message Bubble** | [`chat/components/message-bubble.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/message-bubble.tsx) | Individual message bubble renderer supporting text formatting, timestamps, delivery checkmarks, voice note player, and attachment rendering. |
| **Message Action Menu** | [`chat/components/message-actions.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/message-actions.tsx) | Floating action bar on message hover providing Reply, Emoji Reaction, Copy, Edit, and Delete options. |
| **Emoji Picker** | [`chat/components/emoji-picker.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/emoji-picker.tsx) | Categorized emoji selector popover. |
| **Location Share Picker** | [`chat/components/locationpicker.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/locationpicker.tsx) | Interactive location selection modal for sharing GPS coordinates / map pin in chat. |
| **Reply Bar Preview** | [`chat/components/reply-preview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/reply-preview.tsx) | Quoted message banner shown above the input box when replying to a message. |
| **Typing Indicator** | [`chat/components/typing-indicator.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/typing-indicator.tsx) | Animated indicator dots showing when a user is typing a response. |
| **Chat Welcome Screen** | [`chat/components/chat-welcome.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-welcome.tsx) | Placeholder welcome screen displayed when no conversation is actively selected. |
| **Profile Drawer / Right Sidebar** | [`chat/components/chat-profile-drawer.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-profile-drawer.tsx) | Right-hand slide-out info panel displaying user/group profile info, shared media gallery, shared links & files tabs, group member list, and notification settings. |

#### B. Contacts Module (`src/features/chattemplate/contacts/components/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **Contact List Directory** | [`contacts/components/contact-list.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/contacts/components/contact-list.tsx) | Full contacts directory grid displaying contact cards, search bar, active status badges, nickname edit modal, and delete confirmation dialog. |
| **Add New Contact Form** | [`contacts/components/new-contact-form.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/contacts/components/new-contact-form.tsx) | Standalone form card for adding new contacts by email and display nickname. |

#### C. Groups Module (`src/features/chattemplate/groups/components/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **Group List Directory** | [`groups/components/group-list.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/groups/components/group-list.tsx) | Group channel directory grid showing group cards, member rosters, group email, edit group dialog modal, and delete group confirm modal. |
| **Add New Group Form** | [`groups/components/new-group-form.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/groups/components/new-group-form.tsx) | Standalone form card for creating new group channels with searchable contact selector chips. |
| **Create Group Dialog** | [`groups/components/create-group-dialog.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/groups/components/create-group-dialog.tsx) | Quick pop-up modal dialog for creating a group conversation. |

#### D. Files & Media Renderers (`src/features/chattemplate/files/components/`)
| UI Component / Screen | File Path | Description |
| :--- | :--- | :--- |
| **File Attachment Card** | [`files/components/file-card.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/files/components/file-card.tsx) | Renders document attachment cards (PDF, DOCX, ZIP) with file size, icon, and download button. |
| **Image Viewer** | [`files/components/image-viewer.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/files/components/image-viewer.tsx) | Lightbox modal viewer for high-resolution image attachments. |
| **Voice Message Player** | [`files/components/voice-message-player.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/files/components/voice-message-player.tsx) | Custom audio player for voice notes with play/pause, duration counter, and playback speed toggles. |
| **Audio Waveform Visualizer** | [`files/components/audio-visualizer.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/files/components/audio-visualizer.tsx) | Dynamic audio waveform visualizer for voice notes and audio clips. |
| **Video Player** | [`files/components/video-player.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/files/components/video-player.tsx) | Embedded media player for video attachments. |
| **Attachment Router** | [`files/components/attachment-renderer.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/files/components/attachment-renderer.tsx) | Router component selecting appropriate file renderer based on mime type. |

---

## 3. Quick Reference: File Re-Exporter (`src/features/Message/components/index.ts`)
To import any `Message` component cleanly without worrying about relative paths, use:
```tsx
import { 
  ChatView, 
  RealtimeChatView, 
  EmailList, 
  EmailView, 
  NewEmail, 
  ContactManagerTab, 
  GroupManagerTab, 
  AiChatPanel, 
  DocViewerPanel,
  FileUploadProgress 
} from '@/features/Message/components'
```
src/features/Message/components/
├── chat/
│   ├── chat-view.tsx             # Main chat window (Static/mock messages & inputs)
│   ├── realtime-chat-view.tsx    # Supabase Realtime live chat integration
│   ├── header-actions.tsx        # Top-right header actions (Search, 3-dot dropdown menu)
│   └── file-upload-progress.tsx  # Universal animated black file upload progress bar
├── emails/
│   ├── email-list.tsx            # Left sidebar list (inbox emails, contacts, shortcuts)
│   ├── email-view.tsx            # Email reader view
│   ├── email-detail.tsx          # Email detail view
│   ├── email-editor.tsx          # Email reply editor
│   └── new-email.tsx             # New email composer screen
├── tabs/
│   ├── contact-manager-tab.tsx   # Contact Manager tab (Link tab style UI + Add Contact popup)
│   └── group-manager-tab.tsx     # Group Manager tab (Link tab style UI + Add Group popup)
├── panels/
│   ├── ai-chat-panel.tsx         # AI Assistant chat panel
│   └── doc-viewer-panel.tsx      # Document & PDF viewer panel
└── index.ts                      # Universal re-exporter for clean component imports
 