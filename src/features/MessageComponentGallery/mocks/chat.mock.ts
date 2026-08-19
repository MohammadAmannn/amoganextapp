/**
 * Mock data for Message Component Gallery
 * Chat & Chat Card mocks
 */
import { Email } from '@/features/Message/data/emails'
import { ChatMessage } from '@/features/Message/types/chat.types'

// ─── Mock Chat Emails (Email.isChat = true) ──────────────────────────────────

export const mockChatEmails: Email[] = [
  {
    id: 'demo-chat-001',
    name: 'Alex Johnson',
    email: 'alex@demo.com',
    replyTo: 'alex@demo.com',
    subject: '',
    preview: 'Hey, are the designs ready?',
    body: '',
    date: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    labels: ['chat'],
    avatarInitials: 'AJ',
    from: undefined,
    isChat: true,
    chatData: {
      name: 'Alex Johnson',
      avatar: '',
      membersCount: 2,
      onlineCount: 1,
      messages: [
        {
          id: 'msg-c1',
          sender: 'Alex',
          content: 'Hey, are the designs ready?',
          time: new Date(Date.now() - 2 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'AJ',
        },
      ],
    },
  },
  {
    id: 'demo-chat-002',
    name: 'Design Squad',
    email: '',
    replyTo: '',
    subject: '',
    preview: 'Sam: Pushed the latest Figma link 🎨',
    body: '',
    date: new Date(Date.now() - 25 * 60 * 1000),
    read: true,
    labels: ['chat'],
    avatarInitials: 'DS',
    from: undefined,
    isChat: true,
    chatData: {
      name: 'Design Squad',
      avatar: '',
      membersCount: 5,
      onlineCount: 3,
      messages: [
        {
          id: 'msg-c2',
          sender: 'Sam',
          content: 'Pushed the latest Figma link 🎨',
          time: new Date(Date.now() - 25 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'SR',
        },
      ],
    },
  },
  {
    id: 'demo-chat-003',
    name: 'Priya Menon',
    email: 'priya@demo.com',
    replyTo: 'priya@demo.com',
    subject: '',
    preview: 'Will send the report by EOD!',
    body: '',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    labels: ['chat'],
    avatarInitials: 'PM',
    from: undefined,
    isChat: true,
    chatData: {
      name: 'Priya Menon',
      avatar: '',
      membersCount: 2,
      onlineCount: 0,
      messages: [
        {
          id: 'msg-c3',
          sender: 'Priya',
          content: 'Will send the report by EOD!',
          time: new Date(Date.now() - 3 * 60 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'PM',
        },
      ],
    },
  },
]

// ─── Mock ChatMessage[] for ChatView preview ──────────────────────────────────

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    sender: 'Alex Johnson',
    content: 'Hey! Have you checked the new component refactor?',
    time: new Date(Date.now() - 20 * 60 * 1000),
    isOwn: false,
    avatarInitials: 'AJ',
    messageStatus: 'read',
  },
  {
    id: 'msg-002',
    sender: 'You',
    content: 'Yes! Looks clean. The sidebar is much more modular now.',
    time: new Date(Date.now() - 18 * 60 * 1000),
    isOwn: true,
    avatarInitials: 'ME',
    messageStatus: 'read',
  },
  {
    id: 'msg-003',
    sender: 'Alex Johnson',
    content: 'Exactly. The EmailCardItem and ChatCardItem are now fully reusable.',
    time: new Date(Date.now() - 15 * 60 * 1000),
    isOwn: false,
    avatarInitials: 'AJ',
    messageStatus: 'read',
  },
  {
    id: 'msg-004',
    sender: 'You',
    content: 'Agreed. I am reviewing the mock data layer next.',
    time: new Date(Date.now() - 10 * 60 * 1000),
    isOwn: true,
    avatarInitials: 'ME',
    messageStatus: 'delivered',
  },
  {
    id: 'msg-005',
    sender: 'Alex Johnson',
    content: 'Great. Let me know if you need any help!',
    time: new Date(Date.now() - 3 * 60 * 1000),
    isOwn: false,
    avatarInitials: 'AJ',
    messageStatus: 'sent',
  },
]

export const mockChatMessageWithDoc: ChatMessage = {
  id: 'msg-doc-001',
  sender: 'Sam Rivera',
  content: '',
  time: new Date(Date.now() - 5 * 60 * 1000),
  isOwn: false,
  avatarInitials: 'SR',
  messageStatus: 'read',
  attachment: {
    type: 'document',
    name: 'Q3-Report-2026.pdf',
    size: 1240000,
    url: '#',
    mimeType: 'application/pdf',
  },
}

export const mockChatMessageReply: ChatMessage = {
  id: 'msg-reply-001',
  sender: 'You',
  content: 'Thanks! Will review it now.',
  time: new Date(Date.now() - 4 * 60 * 1000),
  isOwn: true,
  avatarInitials: 'ME',
  messageStatus: 'delivered',
  replyTo: {
    id: 'msg-doc-001',
    sender: 'Sam Rivera',
    content: 'Q3-Report-2026.pdf',
  },
}

export const mockCurrentUser = {
  accountNo: 'user-preview-001',
  name: 'You (Preview)',
  email: 'preview@demo.com',
}
