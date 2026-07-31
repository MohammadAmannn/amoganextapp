'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Info,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Check,
  Download,
  Eye,
  FileText,
  ImagePlus,
  Video as VideoIcon,
  X,
  MapPin,
  CheckCheck,
  Clock,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MessageToolbar } from '@/features/chattemplate/chat/components/message-toolbar'
import { Message, Conversation } from '@/features/chattemplate/chat/types/chat.types'
import { VoiceMessagePlayer } from '@/features/chattemplate/files/components/voice-message-player'
import { ChatProfilePage } from '@/features/chattemplate/chat/components/chat-profile-drawer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getDisplayNameInitials } from '@/lib/utils'
import { HeaderActions } from './header-actions'
import { FileUploadProgress } from './file-upload-progress'

const DynamicDocViewer = dynamic(
  () =>
    import('@cyntler/react-doc-viewer').then((mod) => {
      return function WrappedDocViewer({
        documents,
      }: {
        documents: { uri: string; fileName: string; fileType?: string }[]
      }) {
        return (
          <mod.default
            documents={documents}
            pluginRenderers={mod.DocViewerRenderers}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true,
                retainURLParams: false,
              },
            }}
            style={{ height: '100%' }}
          />
        )
      }
    }),
  { ssr: false }
)
const LocationMap = dynamic(() => import('@/components/ui/leaflet-map'), {
  ssr: false,
})
const EmojiPicker = dynamic(
  () => import('@/features/chattemplate/chat/components/emoji-picker'),
  { ssr: false }
)

export interface ChatAttachment {
  type: 'image' | 'video' | 'document' | 'audio'
  name: string
  size: number
  url: string
  mimeType: string
  file?: File
  duration?: number
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
  replyTo?: {
    id?: string
    sender: string
    content: string
    unavailable?: boolean
  }
}

interface ChatViewProps {
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
    action:
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
      | 'deleteForEveryone',
    message: ChatMessage,
    value?: boolean
  ) => void
  onReply?: (message: ChatMessage) => void
  rawMessages?: Message[]
  currentUser?: { accountNo: string; name?: string; email?: string } | null
  conversation?: Conversation | null
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ChatView({
  chatName,
  chatAvatar,
  membersCount,
  onlineCount,
  messages,
  onBack,
  onSendMessage,
  onShareLocation,
  typingText,
  onTypingChange,
  onRecordingChange,
  onLoadOlder,
  hasMoreMessages,
  isLoadingOlder,
  onMessageAction,
  onReply,
  rawMessages,
  currentUser,
  conversation,
}: ChatViewProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [draft, setDraft] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingStartingRef = useRef(false)
  const releaseRequestedRef = useRef(false)
  const discardRecordingRef = useRef(false)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [previewDoc, setPreviewDoc] = useState<ChatAttachment | null>(null)
  const [mapPreview, setMapPreview] = useState<ChatLocation | null>(null)
  const [previewImage, setPreviewImage] = useState<ChatAttachment | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null)
  const [activeToolbarMessageId, setActiveToolbarMessageId] = useState<
    string | null
  >(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoadingOlder) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }
  }, [messages])

  const handleSend = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onSendMessage(trimmed, undefined, replyingTo || undefined)
    setDraft('')
    setReplyingTo(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const stopRecording = () => {
    releaseRequestedRef.current = true
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') recorder.stop()
  }

  const startRecording = async () => {
    if (
      recordingStartingRef.current ||
      recorderRef.current?.state === 'recording'
    )
      return

    releaseRequestedRef.current = false
    discardRecordingRef.current = false
    recordingStartingRef.current = true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recordingStreamRef.current = stream

      // If the user released while the permission prompt was open, do not leave
      // the microphone running or send an empty recording.
      if (releaseRequestedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        recordingStreamRef.current = null
        return
      }

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })

        if (!discardRecordingRef.current && blob.size > 0) {
          const extension = blob.type.includes('ogg') ? 'ogg' : 'webm'
          const file = new File([blob], `voice-${Date.now()}.${extension}`, {
            type: blob.type,
          })
          onSendMessage('', {
            type: 'audio',
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file),
            mimeType: file.type,
            file,
          })
        }

        stream.getTracks().forEach((track) => track.stop())
        recordingStreamRef.current = null
        recorderRef.current = null
        chunksRef.current = []
        setIsRecording(false)
        onRecordingChange?.(false)
      }
      recorder.start()
      setIsRecording(true)
      onRecordingChange?.(true)

      if (releaseRequestedRef.current && recorder.state === 'recording') {
        recorder.stop()
      }
    } catch (error) {
      console.error('Unable to start voice recording:', error)
      toast.error(
        'Microphone permission is required to record a voice message.'
      )
      setIsRecording(false)
      onRecordingChange?.(false)
    } finally {
      recordingStartingRef.current = false
    }
  }

  const [uploadState, setUploadState] = useState<{
    fileName: string
    fileSize: number
    progress: number
    status: 'uploading' | 'completed' | 'error'
  } | null>(null)

  useEffect(() => {
    return () => {
      discardRecordingRef.current = true
      const recorder = recorderRef.current
      if (recorder?.state === 'recording') recorder.stop()
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: ChatAttachment['type']
  ) => {
    const file = event.target.files?.[0]
    if (!file || file.size === 0) return

    setUploadState({
      fileName: file.name,
      fileSize: file.size,
      progress: 15,
      status: 'uploading',
    })

    const interval = setInterval(() => {
      setUploadState((prev) => {
        if (!prev) return null
        if (prev.progress >= 90) {
          clearInterval(interval)
          setTimeout(() => {
            onSendMessage('', {
              type,
              name: file.name,
              size: file.size,
              url: URL.createObjectURL(file),
              mimeType: file.type,
              file,
            })
            setUploadState(null)
          }, 350)
          return { ...prev, progress: 100, status: 'completed' }
        }
        return { ...prev, progress: prev.progress + 25 }
      })
    }, 180)

    event.target.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileType = (name: string) => name.split('.').pop()?.toLowerCase()

  const getToolbarMessage = (message: ChatMessage): Message => ({
    id: message.id,
    conversation_id: '',
    owner_user_id: '',
    sender_user_id: message.senderUserId || null,
    message: message.content,
    message_type: message.location
      ? 'location'
      : message.attachment?.type || 'text',
    direction: message.isOwn ? 'Sent' : 'Received',
    sent: message.messageStatus !== 'pending',
    received:
      message.messageStatus === 'delivered' || message.messageStatus === 'read',
    created_at: message.time.toISOString(),
    message_status:
      message.messageStatus === 'failed' ? undefined : message.messageStatus,
    file_url: message.attachment?.url,
    file_name: message.attachment?.name,
    file_size: message.attachment?.size,
    mime_type: message.attachment?.mimeType,
    duration: message.attachment?.duration,
    thumb: !!message.thumb,
    favorite: !!message.favorite,
    flag: !!message.flag,
    star: !!message.star,
    pin: !!message.pin,
    archive: !!message.archive,
    deleted: false,
    action_this: !!message.actionThis,
    reply: !!message.replyTo,
    forward: !!message.forwarded,
  })

  const scrollToMessage = (messageId?: string) => {
    if (!messageId) return
    const target = document.getElementById(`email-chat-message-${messageId}`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightedMessageId(messageId)
    window.setTimeout(() => setHighlightedMessageId(null), 1200)
  }

  const handleMessagesScroll = async () => {
    const container = scrollRef.current
    if (
      !container ||
      container.scrollTop > 40 ||
      !hasMoreMessages ||
      isLoadingOlder ||
      !onLoadOlder
    )
      return
    const previousHeight = container.scrollHeight
    await onLoadOlder()
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop =
          scrollRef.current.scrollHeight - previousHeight
      }
    })
  }

  const subtitle =
    typeof onlineCount === 'number' && typeof membersCount === 'number'
      ? `${membersCount} members, ${onlineCount} online`
      : 'Last seen today at ' + formatTime(new Date())

  if (showProfile) {
    const displayConvo = conversation || ({
      id: 'synthetic-convo',
      name: chatName,
      image: chatAvatar,
      type: (membersCount && membersCount > 2) ? 'group' : 'direct',
      created_at: new Date().toISOString(),
      members: (membersCount && membersCount > 2)
        ? Array.from({ length: membersCount }).map((_, i) => ({
            id: `m-${i}`,
            name: `Member ${i + 1}`,
            email: `member${i + 1}@example.com`,
            avatar_url: ''
          }))
        : [
            { id: currentUser?.accountNo || '1', name: currentUser?.name || 'You', email: currentUser?.email || '', avatar_url: '' },
            { id: '2', name: chatName, email: 'partner@example.com', avatar_url: chatAvatar || '' }
          ]
    } as Conversation)

    const displayRawMessages = rawMessages || messages.map(msg => ({
      id: msg.id,
      conversation_id: displayConvo.id,
      owner_user_id: msg.isOwn ? (currentUser?.accountNo || '1') : '2',
      sender_user_id: msg.isOwn ? (currentUser?.accountNo || '1') : '2',
      message: msg.content,
      message_type: msg.location
        ? 'location'
        : msg.attachment?.type || 'text',
      direction: msg.isOwn ? 'Sent' : 'Received',
      sent: true,
      received: true,
      created_at: msg.time.toISOString(),
      file_url: msg.attachment?.url,
      file_name: msg.attachment?.name,
      file_size: msg.attachment?.size,
      mime_type: msg.attachment?.mimeType,
      duration: msg.attachment?.duration,
      deleted: false,
      star: !!msg.star,
      pin: !!msg.pin,
      favorite: !!msg.favorite,
      flag: !!msg.flag,
      archive: !!msg.archive,
      thumb: !!msg.thumb,
    })) as Message[]

    return (
      <div className='animate-in fade-in flex h-full w-full flex-col overflow-hidden bg-card duration-200 select-none'>
        <ChatProfilePage
          conversation={displayConvo}
          messages={displayRawMessages}
          currentUser={currentUser || null}
          onBack={() => setShowProfile(false)}
          onViewDocument={(url, name) => {
            setShowProfile(false)
            setPreviewDoc({ type: 'document', url, name, size: 0, mimeType: '' })
          }}
        />
      </div>
    )
  }

  if (previewDoc) {
    return (
      <div className='fixed inset-0 z-50 flex h-full w-full flex-col bg-background md:relative md:z-auto'>
        <div className='flex items-center justify-between gap-3 border-b border-border px-4 py-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <button
              type='button'
              onClick={() => setPreviewDoc(null)}
              className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
              aria-label='Close document preview'
            >
              <X className='h-5 w-5' />
            </button>
            <span className='truncate text-sm font-semibold'>
              {previewDoc.name}
            </span>
          </div>
          <a
            href={previewDoc.url}
            download={previewDoc.name}
            className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
            aria-label='Download document'
          >
            <Download className='h-5 w-5' />
          </a>
        </div>
        <div className='min-h-0 flex-1 overflow-hidden'>
          <DynamicDocViewer
            documents={[
              {
                uri: previewDoc.url,
                fileName: previewDoc.name,
                fileType: getFileType(previewDoc.name),
              },
            ]}
          />
        </div>
      </div>
    )
  }

  if (mapPreview) {
    return (
      <div className='fixed inset-0 z-50 flex h-full w-full flex-col bg-background md:relative md:z-auto'>
        <div className='flex items-center gap-3 border-b border-border px-4 py-3'>
          <button
            type='button'
            onClick={() => setMapPreview(null)}
            className='rounded-md p-1.5 text-muted-foreground hover:bg-muted'
            aria-label='Close map preview'
          >
            <X className='h-5 w-5' />
          </button>
          <span className='text-sm font-semibold'>
            {mapPreview.type === 'live' ? 'Live Location' : 'Current Location'}
          </span>
        </div>
        <div className='min-h-0 flex-1'>
          <LocationMap {...mapPreview} />
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 z-50 flex h-full w-full flex-col bg-card overflow-hidden rounded-none border-0 border-border shadow-xs md:relative md:z-auto sm:rounded-xl sm:border'>
      {/* Header */}
      <div className='flex flex-none shrink-0 items-center justify-between border-b border-border bg-muted/10 p-4 select-none'>
        <div className='flex min-w-0 items-center gap-2'>
          <button
            onClick={onBack}
            className='-ml-1 shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted md:hidden'
            aria-label='Close chat'
          >
            <X className='h-4 w-4' />
          </button>

          <div
            onClick={() => setShowProfile(true)}
            className='flex cursor-pointer items-center gap-3 transition-opacity select-none hover:opacity-85'
            title='Click to view info'
          >
            <div className='relative shrink-0'>
              <Avatar className='h-10 w-10 rounded-xl border border-border/60'>
                {chatAvatar ? (
                  <AvatarImage src={chatAvatar} alt={chatName} />
                ) : null}
                <AvatarFallback className='rounded-xl bg-primary/10 font-bold text-primary'>
                  {chatName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='flex min-w-0 flex-col'>
              <span className='block truncate text-sm leading-tight font-bold text-foreground'>
                {chatName}
              </span>
              <span className='truncate text-xs leading-tight text-muted-foreground'>
                {typingText || subtitle}
              </span>
            </div>
          </div>
        </div>

        <HeaderActions onDelete={onBack} />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={() => void handleMessagesScroll()}
        className='min-h-0 w-full flex-1 overflow-y-auto bg-muted/5 p-4 scrollbar-thin'
      >
        {isLoadingOlder && (
          <div className='py-2 text-center text-xs text-muted-foreground'>
            Loading older messages…
          </div>
        )}
        {messages.length === 0 ? (
          <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              id={`email-chat-message-${msg.id}`}
              key={msg.id}
              className={cn(
                'mb-3 flex justify-start rounded-lg transition-colors duration-300',
                highlightedMessageId === msg.id && 'bg-primary/10'
              )}
            >
              <div className='relative mt-0.5 mr-2.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-muted'>
                <div className='flex h-full w-full items-center justify-center bg-muted text-xs font-medium text-muted-foreground'>
                  {msg.avatarInitials ||
                    msg.sender?.charAt(0)?.toUpperCase() ||
                    '?'}
                </div>
              </div>

              <div className='group/message relative flex max-w-[85%] flex-col items-start pb-3 sm:max-w-[75%]'>
                <div className='mb-0.5 ml-1 text-xs font-medium text-muted-foreground'>
                  {msg.sender || 'Unknown'}
                </div>

                <div
                  onClick={() =>
                    setActiveToolbarMessageId((activeId) =>
                      activeId === msg.id ? null : msg.id
                    )
                  }
                  className={
                    msg.attachment
                      ? 'relative rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-2 shadow-sm'
                      : 'relative px-1 py-0.5'
                  }
                >
                  {msg.forwarded && (
                    <div className='mb-1 text-[10px] font-semibold text-muted-foreground'>
                      Forwarded
                    </div>
                  )}
                  {msg.replyTo && (
                    <button
                      type='button'
                      onClick={() => scrollToMessage(msg.replyTo?.id)}
                      className='mb-1.5 block w-full rounded-r-md border-l-2 border-primary bg-muted/40 px-2 py-1.5 text-left transition-colors hover:bg-muted/70'
                    >
                      <span className='block truncate text-[10px] font-bold text-primary'>
                        ↩ Replying to {msg.replyTo.sender}
                      </span>
                      <span className='block truncate text-xs text-muted-foreground'>
                        {msg.replyTo.unavailable
                          ? 'Original message unavailable'
                          : msg.replyTo.content}
                      </span>
                    </button>
                  )}
                  {msg.content && (
                    <div className='text-[15px] break-words whitespace-pre-wrap text-black dark:text-white'>
                      {msg.content}
                    </div>
                  )}
                  {msg.attachment?.type === 'document' && (
                    <div className='flex w-full max-w-80 min-w-60 items-center gap-2 rounded-xl border border-border/80 bg-card p-2 transition-colors hover:bg-muted/10'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400'>
                        <FileText className='h-4.5 w-4.5' />
                      </div>
                      <span className='min-w-0 flex-1 overflow-hidden'>
                        <span className='block truncate text-xs font-bold text-foreground'>
                          {msg.attachment.name}
                        </span>
                        <span className='mt-0.5 block truncate text-[10px] font-semibold text-muted-foreground'>
                          {formatFileSize(msg.attachment.size)} &bull;{' '}
                          {getFileType(msg.attachment.name)?.toUpperCase() ||
                            'FILE'}
                        </span>
                      </span>
                      <div className='flex shrink-0 items-center gap-0.5'>
                        <button
                          type='button'
                          onClick={() => setPreviewDoc(msg.attachment!)}
                          className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
                          aria-label={`Preview ${msg.attachment.name}`}
                          title='Preview'
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                        <a
                          href={msg.attachment.url}
                          download={msg.attachment.name}
                          className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
                          aria-label={`Download ${msg.attachment.name}`}
                          title='Download'
                        >
                          <Download className='h-4 w-4' />
                        </a>
                      </div>
                    </div>
                  )}
                  {msg.attachment?.type === 'image' && (
                    <button
                      type='button'
                      onClick={() => setPreviewImage(msg.attachment!)}
                    >
                      <img
                        src={msg.attachment.url}
                        alt={msg.attachment.name}
                        className='max-h-64 rounded-lg object-cover'
                      />
                    </button>
                  )}
                  {msg.attachment?.type === 'video' && (
                    <video
                      controls
                      src={msg.attachment.url}
                      className='max-h-64 rounded-lg'
                    />
                  )}
                  {msg.attachment?.type === 'audio' && (
                    <VoiceMessagePlayer
                      fileUrl={msg.attachment.url}
                      duration={msg.attachment.duration}
                    />
                  )}
                  {msg.location && (
                    <button
                      type='button'
                      onClick={() => setMapPreview(msg.location!)}
                      className='mt-1 block w-64 overflow-hidden rounded-xl border border-border/60 bg-muted/40 text-left'
                    >
                      <div className='h-36 w-full'>
                        <LocationMap {...msg.location} />
                      </div>
                      <div className='flex items-center gap-2 px-3 py-2'>
                        <MapPin className='h-4 w-4 shrink-0 text-emerald-600' />
                        <div className='min-w-0'>
                          <p className='truncate text-xs font-semibold'>
                            {msg.location.type === 'live'
                              ? 'Live Location'
                              : 'Current Location'}
                          </p>
                          <p className='truncate text-[10px] text-muted-foreground'>
                            {msg.location.address ||
                              `${msg.location.latitude.toFixed(5)}, ${msg.location.longitude.toFixed(5)}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  )}
                  <div className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                    {formatTime(msg.time)}
                    {msg.isOwn && (
                      <span title={msg.messageStatus || 'sent'}>
                        {msg.messageStatus === 'pending' ? (
                          <Clock className='h-3.5 w-3.5 animate-pulse' />
                        ) : msg.messageStatus === 'delivered' ? (
                          <CheckCheck className='h-3.5 w-3.5' />
                        ) : msg.messageStatus === 'read' ? (
                          <CheckCheck className='h-3.5 w-3.5 text-sky-500' />
                        ) : (
                          <Check className='h-3.5 w-3.5' strokeWidth={2} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {onMessageAction && (
                  <MessageToolbar
                    message={getToolbarMessage(msg)}
                    onCopy={() => {
                      if (msg.content) {
                        void navigator.clipboard.writeText(msg.content)
                        toast.success('Message copied to clipboard!')
                      }
                    }}
                    onReact={(action, value) =>
                      onMessageAction(action, msg, value)
                    }
                    onDeleteForMe={() => onMessageAction('delete', msg)}
                    onDeleteForEveryone={() =>
                      onMessageAction('deleteForEveryone', msg)
                    }
                    onReply={() => {
                      setReplyingTo(msg)
                      if (onReply) onReply(msg)
                      else onMessageAction('reply', msg)
                    }}
                    onForward={() => onMessageAction('forward', msg)}
                    onEdit={() => onMessageAction('edit', msg)}
                    onShare={() => {
                      if (navigator.share && msg.content) {
                        void navigator.share({ text: msg.content })
                      }
                    }}
                    isSender={msg.isOwn}
                    className={cn(
                      'pointer-events-none absolute -bottom-4 left-2 z-30 scale-95 opacity-0 transition-all duration-200 group-hover/message:pointer-events-auto group-hover/message:scale-100 group-hover/message:opacity-100',
                      activeToolbarMessageId === msg.id &&
                        'pointer-events-auto scale-100 opacity-100'
                    )}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Upload Progress Bar */}
      {uploadState && (
        <div className='border-t border-border bg-muted/20 px-3 py-2'>
          <FileUploadProgress
            fileName={uploadState.fileName}
            fileSize={uploadState.fileSize}
            progress={uploadState.progress}
            status={uploadState.status}
            onCancel={() => setUploadState(null)}
          />
        </div>
      )}

      {/* Input bar */}
      {replyingTo && (
        <div className='flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2'>
          <div className='min-w-0 flex-1 border-l-2 border-primary pl-2'>
            <p className='text-[10px] font-bold text-primary'>
              Replying to {replyingTo.sender}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {replyingTo.content ||
                replyingTo.attachment?.name ||
                'Attachment'}
            </p>
          </div>
          <button
            type='button'
            onClick={() => setReplyingTo(null)}
            className='rounded-full p-1 text-muted-foreground hover:bg-muted'
            aria-label='Cancel reply'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
      <div className='pb-safe relative flex flex-none shrink-0 items-center gap-2.5 border-t border-border bg-muted/10 p-3'>
        <div className='relative flex h-10 min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-full border border-border bg-background px-3.5 py-1.5 shadow-xs'>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='shrink-0 cursor-pointer rounded-md p-0.5 hover:bg-muted focus:ring-1 focus:ring-ring focus:outline-none'
                aria-label='Open emoji picker'
              >
                <Smile className='h-5 w-5 text-muted-foreground/80 transition-colors hover:text-foreground' />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side='top'
              align='start'
              className='border-none bg-transparent p-0 shadow-none'
              sideOffset={12}
            >
              <EmojiPicker
                onSelectEmoji={(emoji: string) =>
                  setDraft((value) => value + emoji)
                }
              />
            </PopoverContent>
          </Popover>

          <input
            type='text'
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              onTypingChange?.(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder='Message'
            className='min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:border-0 focus:ring-0 focus:outline-none'
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='shrink-0 cursor-pointer rounded-md p-0.5 hover:bg-muted focus:ring-1 focus:ring-ring focus:outline-none'
                aria-label='Attachment options'
              >
                <Paperclip className='h-5 w-5 text-muted-foreground/80 transition-colors hover:text-foreground' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              side='top'
              sideOffset={12}
              className='w-40'
            >
              <DropdownMenuItem
                onClick={() => imageInputRef.current?.click()}
                className='cursor-pointer gap-2 font-semibold'
              >
                <ImagePlus className='h-4 w-4' /> Images
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => videoInputRef.current?.click()}
                className='cursor-pointer gap-2 font-semibold'
              >
                <VideoIcon className='h-4 w-4' /> Videos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => documentInputRef.current?.click()}
                className='cursor-pointer gap-2 font-semibold'
              >
                <FileText className='h-4 w-4' /> Documents
              </DropdownMenuItem>
              {onShareLocation && (
                <DropdownMenuItem
                  onClick={onShareLocation}
                  className='cursor-pointer gap-2 font-semibold'
                >
                  <MapPin className='h-4 w-4' /> Location
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type='button'
            onClick={() => cameraInputRef.current?.click()}
            className='shrink-0 cursor-pointer rounded-md p-0.5 hover:bg-muted focus:ring-1 focus:ring-ring focus:outline-none'
            aria-label='Take photo'
          >
            <Camera className='h-5 w-5 text-muted-foreground/80 transition-colors hover:text-foreground' />
          </button>
        </div>

        <button
          type='button'
          onClick={() => {
            if (draft.trim()) handleSend()
          }}
          onPointerDown={(event) => {
            if (draft.trim()) return
            event.preventDefault()
            event.currentTarget.setPointerCapture(event.pointerId)
            void startRecording()
          }}
          onPointerUp={(event) => {
            if (draft.trim()) return
            event.preventDefault()
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
            stopRecording()
          }}
          onPointerCancel={() => {
            if (!draft.trim()) stopRecording()
          }}
          onContextMenu={(event) => event.preventDefault()}
          aria-label={
            draft.trim()
              ? 'Send message'
              : isRecording
                ? 'Release to send voice message'
                : 'Hold to record voice message'
          }
          title={draft.trim() ? 'Send' : 'Hold to record'}
          className={cn(
            'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition-all duration-100 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 disabled:opacity-55',
            isRecording && 'scale-110 bg-red-600'
          )}
        >
          {draft.trim() ? (
            <Send className='h-4.5 w-4.5 translate-x-[1px]' strokeWidth={2} />
          ) : (
            <Mic className='h-4.5 w-4.5' strokeWidth={2} />
          )}
        </button>
      </div>
      <input
        ref={imageInputRef}
        type='file'
        className='hidden'
        accept='.jpg,.jpeg,.png,.gif,.webp,.svg'
        onChange={(event) => handleFileSelect(event, 'image')}
      />
      {previewImage && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
          <button
            type='button'
            onClick={() => setPreviewImage(null)}
            className='absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white'
            aria-label='Close image preview'
          >
            <X className='h-5 w-5' />
          </button>
          <img
            src={previewImage.url}
            alt={previewImage.name}
            className='max-h-full max-w-full object-contain'
          />
        </div>
      )}
      <input
        ref={videoInputRef}
        type='file'
        className='hidden'
        accept='.mp4,.mov,.avi,.mkv,.webm'
        onChange={(event) => handleFileSelect(event, 'video')}
      />
      <input
        ref={documentInputRef}
        type='file'
        className='hidden'
        accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'
        onChange={(event) => handleFileSelect(event, 'document')}
      />
      <input
        ref={cameraInputRef}
        type='file'
        className='hidden'
        accept='image/*'
        capture='environment'
        onChange={(event) => handleFileSelect(event, 'image')}
      />
    </div>
  )
}
