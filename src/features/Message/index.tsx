'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Mail, MessageSquare, Plus, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ComingSoon } from '@/components/coming-soon'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { useConversation } from '@/features/chattemplate/chat/hooks/use-conversation'
import { useRealtime } from '@/features/chattemplate/chat/hooks/use-realtime'
import {
  createGroupConversation,
  getOrCreateDirectConversation,
  getUserConversations,
} from '@/features/chattemplate/chat/repositories/conversation-repository'
import { getOrCreateProfileForContact } from '@/features/chattemplate/chat/repositories/profile-repository'
import { ensureProfileExists } from '@/features/chattemplate/chat/repositories/profile-repository'
import {
  Conversation,
  Message,
} from '@/features/chattemplate/chat/types/chat.types'
import { ContactList } from '@/features/chattemplate/contacts/components/contact-list'
import { NewContactForm } from '@/features/chattemplate/contacts/components/new-contact-form'
import { getUserContacts } from '@/features/chattemplate/contacts/repositories/contact-repository'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { GroupList } from '@/features/chattemplate/groups/components/group-list'
import { NewGroupForm } from '@/features/chattemplate/groups/components/new-group-form'
import { Group } from '@/features/chattemplate/groups/types/group.types'
import { ChatAttachment, ChatMessage, ChatView } from './components/chat-view'
import { EmailList } from './components/email-list'
import { EmailView } from './components/email-view'
import { NewEmail } from './components/new-email'
import { AiChatPanel } from './components/ai-chat-panel'
import { DocViewerPanel } from './components/doc-viewer-panel'
import { RealtimeChatView } from './components/realtime-chat-view'
import CalendarTemplate from '@/features/calendartemplate'
import KanbanTemplate from '@/features/kanbantemplate'
import { emails as initialEmails, Email } from './data/emails'

interface DirectoryChat {
  id: string
  conversationId?: string
  kind: 'contact' | 'group'
  name: string
  avatar?: string
  membersCount?: number
  onlineCount?: number
}

export default function MessageFeature() {
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState<'inbox' | 'done'>('inbox')
  const [activeTab, setActiveTab] = useState('inbox')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedDirectoryChat, setSelectedDirectoryChat] =
    useState<DirectoryChat | null>(null)
  const [directoryMessages, setDirectoryMessages] = useState<
    Record<string, ChatMessage[]>
  >({})
  const [isAiChatOpen, setIsAiChatOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isKanbanOpen, setIsKanbanOpen] = useState(false)
  const [isFileOpen, setIsFileOpen] = useState(false)
  const currentUser = useAuthStore((state) => state.auth.user)
  const { conversations, setConversations, loadConversations } =
    useConversation()

  useEffect(() => {
    setIsSidebarCollapsed(
      localStorage.getItem('message_sidebar_collapsed') === 'true'
    )
  }, [])

  useEffect(() => {
    if (!currentUser) return
    void ensureProfileExists(currentUser).then(() =>
      loadConversations(currentUser.accountNo)
    )
  }, [currentUser, loadConversations])

  const handleGlobalMessageInsert = useCallback(
    (message: Message) => {
      setConversations((previous) => {
        const existing = previous.find(
          (conversation) => conversation.id === message.conversation_id
        )
        if (!existing) {
          if (currentUser) void loadConversations(currentUser.accountNo)
          return previous
        }
        const updated = {
          ...existing,
          lastMessage: message,
          unreadCount:
            selectedDirectoryChat?.conversationId === message.conversation_id ||
            message.sender_user_id === currentUser?.accountNo
              ? 0
              : (existing.unreadCount || 0) + 1,
        }
        return [
          updated,
          ...previous.filter(
            (conversation) => conversation.id !== message.conversation_id
          ),
        ]
      })
    },
    [
      currentUser,
      loadConversations,
      selectedDirectoryChat?.conversationId,
      setConversations,
    ]
  )

  const handleGlobalMessageUpdate = useCallback(
    (message: Message) => {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === message.conversation_id &&
          conversation.lastMessage?.id === message.id
            ? { ...conversation, lastMessage: message }
            : conversation
        )
      )
    },
    [setConversations]
  )

  useRealtime(
    currentUser?.accountNo,
    handleGlobalMessageInsert,
    handleGlobalMessageUpdate
  )

  const fetchContactsAndGroups = async () => {
    if (!currentUser) return

    try {
      const [contactsData, groupsResponse] = await Promise.all([
        getUserContacts(currentUser.accountNo),
        fetch(
          `/api/groups?email=${encodeURIComponent(currentUser.email || '')}`
        ),
      ])
      setContacts(contactsData)
      if (groupsResponse.ok) setGroups(await groupsResponse.json())
    } catch (error) {
      console.error('Failed to fetch contacts or groups:', error)
      toast.error('Failed to load contacts and groups.')
    }
  }

  useEffect(() => {
    void fetchContactsAndGroups()
  }, [currentUser?.accountNo, currentUser?.email])

  const handleSendDirectoryChatMessage = (
    content: string,
    attachment?: ChatAttachment
  ) => {
    if (!selectedDirectoryChat) return
    const newMessage: ChatMessage = {
      id: String(Date.now()),
      sender: 'You',
      content,
      time: new Date(),
      isOwn: true,
      avatarInitials: 'YU',
      attachment,
    }
    setDirectoryMessages((previous) => ({
      ...previous,
      [selectedDirectoryChat.id]: [
        ...(previous[selectedDirectoryChat.id] || []),
        newMessage,
      ],
    }))
  }

  const handleSelectContact = async (contact: Contact) => {
    if (!currentUser) return
    setSelectedEmail(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    const conversationId = await getOrCreateDirectConversation(
      currentUser.accountNo,
      contact.contactUserId
    )
    if (!conversationId) {
      toast.error('Unable to open this conversation.')
      return
    }
    setSelectedDirectoryChat({
      id: `conversation-${conversationId}`,
      conversationId,
      kind: 'contact',
      name: contact.nickname || contact.fullName,
      avatar: contact.avatarUrl,
    })
    // Switch to inbox tab so the split-panel chat view renders
    setActiveTab('inbox')
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedEmail(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setSelectedDirectoryChat({
      id: `conversation-${conversation.id}`,
      conversationId: conversation.id,
      kind: conversation.type === 'direct' ? 'contact' : 'group',
      name: conversation.name || 'Conversation',
      avatar: conversation.image,
      membersCount: conversation.members?.length,
      onlineCount: 0,
    })
  }

  const handleSelectGroup = async (group: Group) => {
    if (!currentUser) return
    let conversation = (await getUserConversations(currentUser.accountNo)).find(
      (item) =>
        item.type === 'group' &&
        item.name?.toLowerCase() === group.groupName.toLowerCase()
    )

    if (!conversation) {
      const members = await Promise.all(
        group.users.map((email) =>
          getOrCreateProfileForContact(email, email.split('@')[0])
        )
      )
      conversation =
        (await createGroupConversation(
          group.groupName,
          group.groupImage || null,
          members
            .filter((member): member is NonNullable<typeof member> =>
              Boolean(member)
            )
            .map((member) => member.id),
          currentUser.accountNo
        )) || undefined
    }

    if (!conversation) {
      toast.error('Unable to open this group conversation.')
      return
    }
    setSelectedDirectoryChat({
      id: `group-${group.id}`,
      conversationId: conversation.id,
      kind: 'group',
      name: group.groupName,
      avatar: group.groupImage,
      membersCount: group.users.length,
      onlineCount: 0,
    })
    setActiveTab('inbox')
  }

  const handleSelectEmail = (email: Email) => {
    setSelectedDirectoryChat(null)
    setIsAiChatOpen(false)
    setIsCalendarOpen(false)
    setIsKanbanOpen(false)
    setIsFileOpen(false)
    setSelectedEmail(email)
    if (!email.read) {
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
      )
    }
  }

  const handleDelete = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id))
    toast.success('Message deleted')
    if (selectedEmail?.id === id) setSelectedEmail(null)
  }

  const handleArchive = (id: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, done: true } : e))
    )
    toast.success('Message archived')
    if (selectedEmail?.id === id) setSelectedEmail(null)
  }

  const handleSendChatMessage = (
    content: string,
    attachment?: ChatAttachment
  ) => {
    if (!selectedEmail || !selectedEmail.chatData) return
    const newMsg = {
      id: String(Date.now()),
      sender: 'You',
      content,
      time: new Date(),
      isOwn: true,
      avatarInitials: 'YU',
      attachment,
    }
    setEmails((prev) =>
      prev.map((e) =>
        e.id === selectedEmail.id && e.chatData
          ? {
              ...e,
              chatData: {
                ...e.chatData,
                messages: [...e.chatData.messages, newMsg],
              },
            }
          : e
      )
    )
    // Keep selectedEmail in sync
    setSelectedEmail((prev) =>
      prev && prev.chatData
        ? {
            ...prev,
            chatData: {
              ...prev.chatData,
              messages: [...prev.chatData.messages, newMsg],
            },
          }
        : prev
    )
  }

  /* ── shared inbox panel ──────────────────────────────────── */
  const renderInboxPanel = (doneMode = false) => (
    <div className='flex h-full w-full flex-1 overflow-hidden'>
      {/* LEFT: message list */}
      <div
        className={cn(
          'flex h-full shrink-0 flex-col overflow-hidden border-r border-border transition-all duration-300 ease-in-out',
          (selectedEmail || selectedDirectoryChat || isAiChatOpen || isCalendarOpen || isKanbanOpen || isFileOpen) && 'hidden md:flex',
          isSidebarCollapsed ? 'w-20' : 'w-full md:w-[340px] lg:w-[380px]'
        )}
      >
        <EmailList
          emails={emails}
          selectedEmailId={selectedEmail?.id ?? null}
          onSelectEmail={handleSelectEmail}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          mode={doneMode ? 'done' : 'inbox'}
          setMode={setMode}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() =>
            setIsSidebarCollapsed((collapsed) => {
              const next = !collapsed
              localStorage.setItem('message_sidebar_collapsed', String(next))
              return next
            })
          }
          contacts={contacts}
          selectedContactId={
            selectedDirectoryChat ? selectedDirectoryChat.id : null
          }
          onSelectContact={handleSelectContact}
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onSelectAiChat={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsCalendarOpen(false)
            setIsKanbanOpen(false)
            setIsFileOpen(false)
            setIsAiChatOpen(true)
          } : undefined}
          isAiChatSelected={isAiChatOpen}
          onSelectCalendar={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsAiChatOpen(false)
            setIsKanbanOpen(false)
            setIsFileOpen(false)
            setIsCalendarOpen(true)
          } : undefined}
          isCalendarSelected={isCalendarOpen}
          onSelectTask={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsAiChatOpen(false)
            setIsCalendarOpen(false)
            setIsFileOpen(false)
            setIsKanbanOpen(true)
          } : undefined}
          isTaskSelected={isKanbanOpen}
          onSelectFile={!doneMode ? () => {
            setSelectedEmail(null)
            setSelectedDirectoryChat(null)
            setIsAiChatOpen(false)
            setIsCalendarOpen(false)
            setIsKanbanOpen(false)
            setIsFileOpen(true)
          } : undefined}
          isFileSelected={isFileOpen}
        />
      </div>

      {/* RIGHT: detail / chat view */}
      <div
        className={cn(
          'relative flex h-full flex-grow flex-col overflow-hidden',
          !selectedEmail && !selectedDirectoryChat && !isAiChatOpen && !isCalendarOpen && !isKanbanOpen && !isFileOpen && 'hidden md:flex'
        )}
      >
        {/* Mobile back button (only for email view — chat has its own) */}
        {selectedEmail && !selectedEmail.isChat && (
          <button
            onClick={() => setSelectedEmail(null)}
            className='absolute top-3 left-4 z-50 shrink-0 rounded-full border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted md:hidden'
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
        )}

        {isAiChatOpen ? (
          <AiChatPanel onBack={() => setIsAiChatOpen(false)} />
        ) : isCalendarOpen ? (
          <CalendarTemplate embedded onBack={() => setIsCalendarOpen(false)} />
        ) : isKanbanOpen ? (
          <KanbanTemplate embedded onBack={() => setIsKanbanOpen(false)} />
        ) : isFileOpen ? (
          <DocViewerPanel onBack={() => setIsFileOpen(false)} />
        ) : selectedDirectoryChat ? (
          selectedDirectoryChat.conversationId ? (
            <RealtimeChatView
              conversationId={selectedDirectoryChat.conversationId}
              chatName={selectedDirectoryChat.name}
              chatAvatar={selectedDirectoryChat.avatar}
              conversation={conversations.find(
                (c) => c.id === selectedDirectoryChat.conversationId
              )}
              onBack={() => setSelectedDirectoryChat(null)}
            />
          ) : (
            <ChatView
              chatName={selectedDirectoryChat.name}
              chatAvatar={selectedDirectoryChat.avatar}
              messages={directoryMessages[selectedDirectoryChat.id] || []}
              onBack={() => setSelectedDirectoryChat(null)}
              onSendMessage={handleSendDirectoryChatMessage}
              currentUser={currentUser}
            />
          )
        ) : selectedEmail && selectedEmail.isChat && selectedEmail.chatData ? (
          <ChatView
            chatName={selectedEmail.chatData.name}
            chatAvatar={selectedEmail.chatData.avatar}
            membersCount={selectedEmail.chatData.membersCount}
            onlineCount={selectedEmail.chatData.onlineCount}
            messages={selectedEmail.chatData.messages}
            onBack={() => setSelectedEmail(null)}
            onSendMessage={handleSendChatMessage}
            currentUser={currentUser}
          />
        ) : selectedEmail ? (
          <EmailView
            email={selectedEmail}
            onBack={() => setSelectedEmail(null)}
            onDelete={handleDelete}
          />
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-3 bg-background p-8 text-muted-foreground'>
            <MessageSquare className='h-10 w-10 opacity-20' />
            <p className='text-sm'>Select a message to view its content</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <AppHeader title='Messages' />

      <Main
        fixed
        className='flex min-h-0 flex-1 flex-col overflow-hidden bg-background p-0 sm:px-4 sm:py-1.5'
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex min-h-0 flex-1 flex-col overflow-hidden'
        >
          {/* ── Desktop Tab navigation bar ───────────────────────────── */}
          <div className='sticky top-0 z-10 hidden md:flex w-full shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-background pb-2'>
            <TabsList className='h-auto gap-6 rounded-none border-0 bg-transparent p-0 shadow-none'>
              {(
                [
                  'inbox',
                  'send',
                  'folder',
                  'contact',
                  'new-contact',
                  'groups',
                  'new-group',
                ] as const
              ).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 capitalize shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none'
                >
                  {tab === 'new-contact'
                    ? 'New Contact'
                    : tab === 'new-group'
                      ? 'New Group'
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Compose button */}
            <button
              onClick={() => setIsComposing(true)}
              className='ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition-all select-none hover:opacity-90 active:scale-95 dark:bg-primary dark:text-white'
              title='Compose New Message'
            >
              <Mail className='h-3.5 w-3.5' />
              <span>New</span>
              <Plus className='h-3 w-3' />
            </button>
          </div>

          {/* ── Mobile Tab navigation bar ────────────────────────────── */}
          <div
            className={cn(
              'sticky top-0 z-10 flex md:hidden w-full shrink-0 items-center justify-between border-b border-border bg-background px-3 pb-2 select-none',
              (selectedEmail ||
                selectedDirectoryChat ||
                isAiChatOpen ||
                isCalendarOpen ||
                isKanbanOpen ||
                isFileOpen) &&
                'hidden'
            )}
          >
            <TabsList className='flex-1 flex items-center justify-start gap-4.5 rounded-none border-0 bg-transparent p-0 shadow-none overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
              <TabsTrigger
                value='inbox'
                onClick={() => setIsComposing(false)}
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 capitalize shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
              >
                Inbox
              </TabsTrigger>
              <TabsTrigger
                value='send'
                onClick={() => setIsComposing(false)}
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 capitalize shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
              >
                Send
              </TabsTrigger>
              <TabsTrigger
                value='contact'
                onClick={() => setIsComposing(false)}
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 capitalize shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value='groups'
                onClick={() => setIsComposing(false)}
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 capitalize shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
              >
                Grp
              </TabsTrigger>
            </TabsList>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='ml-2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md shrink-0 cursor-pointer transition-colors'
                  aria-label='More tabs'
                >
                  <MoreVertical className='h-4.5 w-4.5' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-36 border border-border bg-background shadow-md'
              >
                <DropdownMenuItem
                  onClick={() => {
                    setIsComposing(true)
                  }}
                  className='cursor-pointer text-xs font-semibold'
                >
                  New
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsComposing(false)
                    setActiveTab('folder')
                  }}
                  className='cursor-pointer text-xs font-semibold'
                >
                  Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsComposing(false)
                    setActiveTab('new-contact')
                  }}
                  className='cursor-pointer text-xs font-semibold'
                >
                  New Contact
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsComposing(false)
                    setActiveTab('new-group')
                  }}
                  className='cursor-pointer text-xs font-semibold'
                >
                  New Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ── Compose view ──────────────────────────────────────────── */}
          {isComposing ? (
            <div className='mt-0 flex h-full flex-grow flex-col overflow-hidden bg-background'>
              <NewEmail
                onCancel={() => setIsComposing(false)}
                onSend={(emailData) => {
                  toast.success('Message sent successfully!')
                  const newEmail: Email = {
                    id: String(Date.now()),
                    from: undefined,
                    name: 'Me',
                    email: 'user@example.com',
                    replyTo: 'user@example.com',
                    subject: emailData.subject || '(No Subject)',
                    preview: emailData.body
                      ? emailData.body.replace(/<[^>]*>/g, '').substring(0, 100)
                      : '(No Content)',
                    body: emailData.body || '',
                    date: new Date(),
                    read: true,
                    labels: ['sent'],
                    avatarInitials: 'ME',
                    done: true,
                  }
                  setEmails((prev) => [newEmail, ...prev])
                  setIsComposing(false)
                }}
                onSaveDraft={() => {
                  toast.success('Draft saved!')
                  setIsComposing(false)
                }}
              />
            </div>
          ) : (
            <>
              <TabsContent
                value='inbox'
                className='mt-0 flex flex-1 flex-row overflow-hidden bg-background focus-visible:outline-none'
              >
                {renderInboxPanel()}
              </TabsContent>

              <TabsContent
                value='send'
                className='mt-0 flex flex-1 flex-row overflow-hidden bg-background focus-visible:outline-none'
              >
                {renderInboxPanel(true)}
              </TabsContent>

              <TabsContent
                value='folder'
                className='mt-0 flex min-h-[400px] flex-1 items-center justify-center rounded-xl border border-dashed bg-muted/5 focus-visible:outline-none'
              >
                <ComingSoon />
              </TabsContent>

              <TabsContent
                value='contact'
                className='mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent focus-visible:outline-none'
              >
                <ContactList
                  contacts={contacts}
                  onRefresh={fetchContactsAndGroups}
                  onAddContactClick={() => setActiveTab('new-contact')}
                  onSelectContact={handleSelectContact}
                />
              </TabsContent>

              <TabsContent
                value='new-contact'
                className='mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent focus-visible:outline-none'
              >
                <NewContactForm
                  onSuccess={() => {
                    void fetchContactsAndGroups()
                    setActiveTab('contact')
                  }}
                />
              </TabsContent>

              <TabsContent
                value='groups'
                className='mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent focus-visible:outline-none'
              >
                <GroupList
                  groups={groups}
                  contacts={contacts}
                  onRefresh={fetchContactsAndGroups}
                  onSelectGroup={handleSelectGroup}
                  onAddGroupClick={() => setActiveTab('new-group')}
                />
              </TabsContent>

              <TabsContent
                value='new-group'
                className='mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent focus-visible:outline-none'
              >
                <NewGroupForm
                  contacts={contacts}
                  onSuccess={() => {
                    void fetchContactsAndGroups()
                    setActiveTab('groups')
                  }}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </Main>
    </>
  )
}
