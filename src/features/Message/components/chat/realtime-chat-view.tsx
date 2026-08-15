'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LocationPicker } from '@/features/chattemplate/chat/components/locationpicker'
import { useAttachments } from '@/features/chattemplate/chat/hooks/use-attachments'
import { useMessageQueue } from '@/features/chattemplate/chat/hooks/use-message-queue'
import { useMessages } from '@/features/chattemplate/chat/hooks/use-messages'
import { useOnlineStatus } from '@/features/chattemplate/chat/hooks/use-online-status'
import { usePresence } from '@/features/chattemplate/chat/hooks/use-presence'
import { useRealtime } from '@/features/chattemplate/chat/hooks/use-realtime'
import { useSendMessage } from '@/features/chattemplate/chat/hooks/use-send-message'
import { useTypingBroadcast } from '@/features/chattemplate/chat/hooks/use-typing-broadcast'
import {
  clearConversationUnreadCount,
  getUserConversations,
} from '@/features/chattemplate/chat/repositories/conversation-repository'
import {
  markMessagesAsDelivered,
  markMessagesAsRead,
} from '@/features/chattemplate/chat/repositories/delivery-repository'
import {
  deleteMessageForMe,
  deleteMessageForEveryone,
  editMessage,
  forwardMessage,
  updateMessageBooleanAction,
} from '@/features/chattemplate/chat/repositories/message-repository'
import {
  Conversation,
  Message,
} from '@/features/chattemplate/chat/types/chat.types'
import { ChatAttachment, ChatMessage, ChatView } from './chat-view'

interface RealtimeChatViewProps {
  conversationId: string
  chatName: string
  chatAvatar?: string
  membersCount?: number
  onlineCount?: number
  onBack: () => void
  conversation?: Conversation | null
}

export function RealtimeChatView({
  conversationId,
  chatName,
  chatAvatar,
  membersCount,
  onlineCount,
  onBack,
  conversation,
}: RealtimeChatViewProps) {
  const currentUser = useAuthStore((state) => state.auth.user)
  const {
    messages,
    setMessages,
    loadMessages,
    loadOlderMessages,
    hasMore,
    isLoadingOlder,
  } = useMessages()
  const { sendMessage } = useSendMessage()
  const { startUpload } = useAttachments()
  const isOnline = useOnlineStatus()
  const { onlineUserIds } = usePresence(currentUser?.accountNo)
  const { sendTypingStatus, getTypingUsersForConversation } =
    useTypingBroadcast(
      currentUser?.accountNo,
      currentUser?.name || currentUser?.email
    )
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [forwardingMessage, setForwardingMessage] =
    useState<ChatMessage | null>(null)
  const [forwardConversations, setForwardConversations] = useState<
    Conversation[]
  >([])
  const [selectedForwardTargets, setSelectedForwardTargets] = useState<
    string[]
  >([])
  const [isForwarding, setIsForwarding] = useState(false)

  const handleMessageSynced = useCallback(
    (clientMessageId: string, serverMessage: Message) => {
      if (serverMessage.conversation_id !== conversationId) return
      setMessages((previous) =>
        previous.map((item) =>
          item.id === clientMessageId ||
          item.client_message_id === clientMessageId
            ? serverMessage
            : item
        )
      )
    },
    [conversationId, setMessages]
  )
  const { enqueue } = useMessageQueue(handleMessageSynced)

  const refreshMessages = useCallback(() => {
    if (currentUser) void loadMessages(conversationId, currentUser.accountNo)
  }, [conversationId, currentUser, loadMessages])

  useEffect(() => {
    refreshMessages()
  }, [refreshMessages])

  useEffect(() => {
    if (!currentUser) return
    void clearConversationUnreadCount(conversationId, currentUser.accountNo)
    void markMessagesAsDelivered(conversationId, currentUser.accountNo)
    void markMessagesAsRead(conversationId, currentUser.accountNo)
  }, [conversationId, currentUser])

  const handleRealtimeInsert = useCallback(
    (message: Message) => {
      if (message.conversation_id !== conversationId) return
      if (message.reply && message.replyto_message_id) {
        // Reload through the shared message loader so canonical sender ids are
        // resolved to this user's local reply copy.
        refreshMessages()
      } else {
        setMessages((previous) =>
          previous.some(
            (item) =>
              item.id === message.id ||
              (item.client_message_id &&
                item.client_message_id === message.client_message_id)
          )
            ? previous
            : [...previous, message]
        )
      }
      if (currentUser && message.sender_user_id !== currentUser.accountNo) {
        void clearConversationUnreadCount(conversationId, currentUser.accountNo)
        void markMessagesAsRead(conversationId, currentUser.accountNo)
      }
    },
    [conversationId, currentUser, refreshMessages, setMessages]
  )

  const handleRealtimeUpdate = useCallback(
    (message: Message) => {
      if (message.conversation_id !== conversationId) return
      setMessages((previous) =>
        message.deleted && !message.deleted_by
          ? previous.filter((item) => item.id !== message.id)
          : previous.map((item) => (item.id === message.id ? message : item))
      )
    },
    [conversationId, setMessages]
  )

  const handleRealtimeDelete = useCallback(
    (messageId: string) =>
      setMessages((previous) =>
        previous.filter((item) => item.id !== messageId)
      ),
    [setMessages]
  )

  useRealtime(
    currentUser?.accountNo,
    handleRealtimeInsert,
    handleRealtimeUpdate,
    handleRealtimeDelete
  )

  const chatMessages: ChatMessage[] = useMemo(() => {
    const visibleMessages = messages.filter(
      (message) => !message.deleted || Boolean(message.deleted_by)
    )
    const mapped = visibleMessages.map((message) => ({
      id: message.id,
      sender:
        message.sender?.name ||
        (message.sender_user_id === currentUser?.accountNo ? 'You' : chatName),
      content: message.message || '',
      time: new Date(message.created_at),
      isOwn: message.sender_user_id === currentUser?.accountNo,
      senderUserId: message.sender_user_id || undefined,
      avatarInitials: (message.sender?.name || chatName)
        .slice(0, 2)
        .toUpperCase(),
      attachment: message.file_url
        ? {
            type:
              message.message_type === 'image' ||
              message.message_type === 'video' ||
              message.message_type === 'audio'
                ? message.message_type
                : 'document',
            name: message.file_name || 'Attachment',
            size: message.file_size || 0,
            url: message.file_url,
            mimeType: message.mime_type || '',
            duration: message.duration,
          }
        : undefined,
      pin: message.pin,
      star: message.star,
      favorite: message.favorite,
      flag: message.flag,
      archive: message.archive,
      actionThis: message.action_this,
      thumb: message.thumb,
      forwarded: message.forward,
      messageStatus: message.message_status,
      processingStatus: message.processing_status,
      location: message.location_data
        ? {
            latitude: message.location_data.latitude,
            longitude: message.location_data.longitude,
            address: message.location_data.address,
            type: message.location_type,
          }
        : undefined,
    })) satisfies ChatMessage[]

    return mapped.map((chatMessage, index) => {
      const source = visibleMessages[index]
      if (!source.reply) return chatMessage

      const original =
        source.replyto_message ||
        visibleMessages.find(
          (candidate) =>
            candidate.id === source.replyto_message_id ||
            candidate.sender_message_id === source.replyto_message_id
        )
      const metadata = source.replyMetadata
      return {
        ...chatMessage,
        replyTo: {
          id: original?.id,
          sender: original?.sender?.name || metadata?.replySenderName || 'User',
          content:
            original?.message ||
            metadata?.replyMessageText ||
            'Original message unavailable',
          unavailable:
            !original ||
            original.deleted ||
            metadata?.replyMessageText === 'Original message unavailable',
        },
      }
    })
  }, [chatName, currentUser?.accountNo, messages])

  const handleSend = async (
    content: string,
    attachment?: ChatAttachment,
    replyTo?: ChatMessage
  ) => {
    if (!currentUser) return
    const replyMetadata = replyTo
      ? {
          replyto_message_id: replyTo.id,
          replyto_user_id: replyTo.senderUserId,
          parent_message_id: replyTo.id,
        }
      : undefined

    if (!isOnline) {
      const optimisticId = crypto.randomUUID()
      const queuedMessage: Message = {
        id: optimisticId,
        client_message_id: optimisticId,
        conversation_id: conversationId,
        owner_user_id: currentUser.accountNo,
        sender_user_id: currentUser.accountNo,
        message: content || null,
        message_type: attachment?.type || 'text',
        direction: 'Sent',
        sent: false,
        received: false,
        created_at: new Date().toISOString(),
        message_status: 'pending',
        file_url: attachment?.url,
        file_name: attachment?.name,
        file_size: attachment?.size,
        mime_type: attachment?.mimeType,
        thumb: false,
        favorite: false,
        flag: false,
        star: false,
        pin: false,
        archive: false,
        deleted: false,
        action_this: false,
        reply: Boolean(replyTo),
        forward: false,
        ...replyMetadata,
      }
      setMessages((previous) => [...previous, queuedMessage])
      await enqueue({
        clientMessageId: optimisticId,
        conversationId,
        senderId: currentUser.accountNo,
        message: content,
        messageType: attachment?.type || 'text',
        attachmentFile: attachment?.file,
        attachmentMetadata: attachment
          ? {
              fileName: attachment.name,
              fileSize: attachment.size,
              mimeType: attachment.mimeType,
            }
          : undefined,
        replyMetadata,
      })
      setReplyingTo(null)
      toast.info('Waiting for connection… message queued.')
      return
    }

    if (!attachment?.file) {
      const attachmentPayload = attachment?.url
        ? {
            messageType: attachment.type,
            fileUrl: attachment.url,
            fileName: attachment.name,
            fileSize: attachment.size,
            mimeType: attachment.mimeType,
            fileContentText: attachment.fileContentText,
            fileContentJson: attachment.fileContentJson,
          }
        : undefined

      const savedMessage = await sendMessage(
        conversationId,
        currentUser.accountNo,
        content,
        attachmentPayload,
        replyMetadata
      )
      if (savedMessage) {
        if (replyTo) refreshMessages()
        else
          setMessages((previous) =>
            previous.some((item) => item.id === savedMessage.id)
              ? previous
              : [...previous, savedMessage]
          )
      } else {
        toast.error('Failed to send message.')
      }
      setReplyingTo(null)
      return
    }

    const senderEmail = currentUser?.email || ''
    const targetContactMember = conversation?.members?.find(
      (member: any) =>
        member.id !== currentUser?.accountNo &&
        member.id !== currentUser?.id &&
        member.user_id !== currentUser?.accountNo
    )
    const receiverEmail =
      (targetContactMember as any)?.email ||
      (targetContactMember as any)?.profile?.email ||
      (chatName?.includes('@') ? chatName : '')

    startUpload(
      attachment.file,
      { senderEmail, receiverEmail },
      (fileUrl, details) => {
        void sendMessage(
          conversationId,
          currentUser.accountNo,
          content,
          {
            messageType: attachment.type,
            fileUrl,
            fileName: details.name,
            fileSize: details.size,
            mimeType: details.type,
            fileContentText: attachment.fileContentText,
            fileContentJson: attachment.fileContentJson,
          },
          replyMetadata
        ).then((savedMessage) => {
          if (!savedMessage) toast.error('Failed to send message.')
          else if (replyTo) refreshMessages()
          else
            setMessages((previous) =>
              previous.some((item) => item.id === savedMessage.id)
                ? previous
                : [...previous, savedMessage]
            )
        })
        setReplyingTo(null)
      },
      () => toast.error('Failed to upload file.')
    )
  }

  const typingUsers = getTypingUsersForConversation(conversationId)
  const handleMessageAction = async (
    action: any,
    message: ChatMessage,
    value?: boolean
  ) => {
    if (
      [
        'thumb',
        'pin',
        'star',
        'favorite',
        'flag',
        'archive',
        'action_this',
      ].includes(action)
    ) {
      const field = action === 'action_this' ? 'actionThis' : action
      const nextValue =
        typeof value === 'boolean'
          ? value
          : !Boolean(message[field as keyof ChatMessage])
      const success = await updateMessageBooleanAction(
        message.id,
        action,
        nextValue
      )
      if (!success) toast.error(`Failed to update message.`)
    } else if (action === 'delete') {
      await deleteMessageForMe(message.id)
      refreshMessages()
    } else if (action === 'deleteForEveryone' && currentUser) {
      await deleteMessageForEveryone(message.id, currentUser.accountNo)
      refreshMessages()
    } else if (action === 'reply') {
      setReplyingTo(message)
    } else if (action === 'edit' && currentUser) {
      const nextMessage = window.prompt('Edit message', message.content)
      if (!nextMessage?.trim() || nextMessage.trim() === message.content) return
      const success = await editMessage(
        message.id,
        currentUser.accountNo,
        nextMessage.trim()
      )
      if (!success) toast.error('Failed to edit message')
    } else if (action === 'forward' && currentUser) {
      const targets = (
        await getUserConversations(currentUser.accountNo)
      ).filter((item) => item.id !== conversationId)
      setForwardConversations(targets)
      setSelectedForwardTargets([])
      setForwardingMessage(message)
    }
  }

  const handleExecuteForward = async () => {
    if (!forwardingMessage || !currentUser || !selectedForwardTargets.length)
      return
    setIsForwarding(true)
    const success = await forwardMessage(
      forwardingMessage.id,
      selectedForwardTargets,
      currentUser.accountNo
    )
    setIsForwarding(false)
    if (success) {
      toast.success('Message forwarded')
      setForwardingMessage(null)
      setSelectedForwardTargets([])
    } else {
      toast.error('Failed to forward message')
    }
  }

  const handleSendLocation = (type: 'current' | 'live', data: any) => {
    if (!currentUser) return
    void sendMessage(
      conversationId,
      currentUser.accountNo,
      type === 'live' ? 'Live location shared' : 'Location shared',
      undefined,
      undefined,
      {
        type,
        latitude: data.lat,
        longitude: data.lng,
        address: data.address,
        timestamp: Date.now(),
      },
      type
    )
    setIsLocationPickerOpen(false)
  }

  return (
    <>
      <ChatView
        chatName={chatName}
        chatAvatar={chatAvatar}
        membersCount={membersCount}
        onlineCount={onlineCount ?? onlineUserIds.size}
        typingText={
          typingUsers.length
            ? `${typingUsers[0].userName} is typing...`
            : undefined
        }
        onTypingChange={(value) =>
          sendTypingStatus(conversationId, value.trim() ? 'typing' : 'idle')
        }
        onRecordingChange={(recording) =>
          sendTypingStatus(conversationId, recording ? 'recording' : 'idle')
        }
        onMessageAction={handleMessageAction}
        onReply={setReplyingTo}
        messages={chatMessages}
        onBack={onBack}
        onSendMessage={handleSend}
        onShareLocation={() => setIsLocationPickerOpen(true)}
        hasMoreMessages={hasMore}
        isLoadingOlder={isLoadingOlder}
        onLoadOlder={() =>
          currentUser
            ? loadOlderMessages(conversationId, currentUser.accountNo)
            : Promise.resolve()
        }
        conversation={conversation}
        rawMessages={messages}
        currentUser={currentUser}
      />
      <LocationPicker
        open={isLocationPickerOpen}
        onOpenChange={setIsLocationPickerOpen}
        onSendLocation={handleSendLocation}
      />
      <Dialog
        open={Boolean(forwardingMessage)}
        onOpenChange={(open) => !open && setForwardingMessage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward message</DialogTitle>
          </DialogHeader>
          <div className='max-h-72 space-y-1 overflow-y-auto'>
            {forwardConversations.length ? (
              forwardConversations.map((conversation) => {
                const selected = selectedForwardTargets.includes(
                  conversation.id
                )
                return (
                  <button
                    key={conversation.id}
                    type='button'
                    onClick={() =>
                      setSelectedForwardTargets((previous) =>
                        selected
                          ? previous.filter((id) => id !== conversation.id)
                          : [...previous, conversation.id]
                      )
                    }
                    className='flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left hover:bg-muted'
                  >
                    <span className='truncate text-sm font-medium'>
                      {conversation.name || 'Conversation'}
                    </span>
                    {selected && <Check className='h-4 w-4 text-primary' />}
                  </button>
                )
              })
            ) : (
              <p className='py-6 text-center text-sm text-muted-foreground'>
                No other conversations available.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setForwardingMessage(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedForwardTargets.length || isForwarding}
              onClick={() => void handleExecuteForward()}
            >
              Forward ({selectedForwardTargets.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
