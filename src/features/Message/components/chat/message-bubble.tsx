import React from 'react'
import dynamic from 'next/dynamic'
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  MapPin,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MessageToolbar } from '@/features/chattemplate/chat/components/message-toolbar'
import { Message } from '@/features/chattemplate/chat/types/chat.types'
import { VoiceMessagePlayer } from '@/features/chattemplate/files/components/voice-message-player'
import { downloadFileFromUrl } from '@/utils/download'
import { ChatMessage, ChatAttachment, ChatLocation, MessageActionType } from '../../types/chat.types'

const LocationMap = dynamic(() => import('@/components/ui/leaflet-map'), {
  ssr: false,
})

interface MessageBubbleProps {
  msg: ChatMessage
  isHighlighted: boolean
  activeToolbarMessageId: string | null
  setActiveToolbarMessageId: React.Dispatch<React.SetStateAction<string | null>>
  onScrollToReply: (replyId?: string) => void
  onPreviewDoc: (attachment: ChatAttachment) => void
  onPreviewImage: (attachment: ChatAttachment) => void
  onPreviewMap: (location: ChatLocation) => void
  onRetryPdf: (messageId: string) => void
  onMessageAction?: (
    action: MessageActionType,
    message: ChatMessage,
    value?: boolean
  ) => void
  onReply?: (message: ChatMessage) => void
  formatTime: (date: Date) => string
  formatFileSize: (bytes: number) => string
  getFileType: (name: string) => string | undefined
}

export function MessageBubble({
  msg,
  isHighlighted,
  activeToolbarMessageId,
  setActiveToolbarMessageId,
  onScrollToReply,
  onPreviewDoc,
  onPreviewImage,
  onPreviewMap,
  onRetryPdf,
  onMessageAction,
  onReply,
  formatTime,
  formatFileSize,
  getFileType,
}: MessageBubbleProps) {
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

  return (
    <div
      id={`email-chat-message-${msg.id}`}
      className={cn(
        'mb-3 flex justify-start rounded-lg transition-colors duration-300',
        isHighlighted && 'bg-primary/10'
      )}
    >
      <div className='relative mt-0.5 mr-2.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-muted'>
        <div className='flex h-full w-full items-center justify-center bg-muted text-xs font-medium text-muted-foreground'>
          {msg.avatarInitials || msg.sender?.charAt(0)?.toUpperCase() || '?'}
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
          className='relative px-1 py-0.5'
        >
          {msg.forwarded && (
            <div className='mb-1 text-[10px] font-semibold text-muted-foreground'>
              Forwarded
            </div>
          )}
          {msg.replyTo && (
            <button
              type='button'
              onClick={() => onScrollToReply(msg.replyTo?.id)}
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
            <div className='flex w-full max-w-80 min-w-60 items-center gap-2.5 rounded-2xl border border-border/80 bg-card p-3 transition-colors hover:bg-muted/10 my-1 shadow-2xs'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400'>
                <FileText className='h-4.5 w-4.5' />
              </div>
              <span className='min-w-0 flex-1 overflow-hidden'>
                <span className='block truncate text-xs font-bold text-foreground'>
                  {msg.attachment.name}
                </span>
                <span className='mt-0.5 block truncate text-[10px] font-semibold text-muted-foreground'>
                  {formatFileSize(msg.attachment.size)} &bull;{' '}
                  {getFileType(msg.attachment.name)?.toUpperCase() || 'FILE'}
                </span>
                {msg.processingStatus === 'pending' ||
                msg.processingStatus === 'processing' ? (
                  <span className='text-[10px] text-sky-600 dark:text-sky-400 font-semibold leading-normal mt-0.5 flex items-center gap-1 select-none'>
                    <Loader2 className='h-2.5 w-2.5 animate-spin' />
                    Parsing...
                  </span>
                ) : msg.processingStatus === 'failed' ? (
                  <span className='text-[10px] text-destructive font-semibold leading-normal mt-0.5 flex items-center gap-1 select-none'>
                    <AlertCircle className='h-2.5 w-2.5' />
                    Parsing failed
                  </span>
                ) : msg.processingStatus === 'completed' ? (
                  <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-normal mt-0.5 select-none'>
                    Parsed
                  </span>
                ) : null}
              </span>
              <div className='flex shrink-0 items-center gap-0.5'>
                {msg.processingStatus === 'failed' && (
                  <button
                    type='button'
                    onClick={() => onRetryPdf(msg.id)}
                    className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
                    aria-label='Retry parsing'
                    title='Retry parsing'
                  >
                    <RefreshCw className='h-4 w-4' />
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => onPreviewDoc(msg.attachment!)}
                  className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
                  aria-label={`Preview ${msg.attachment.name}`}
                  title='Preview'
                >
                  <Eye className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() =>
                    msg.attachment &&
                    downloadFileFromUrl(
                      msg.attachment.url,
                      msg.attachment.name
                    )
                  }
                  className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
                  aria-label={`Download ${msg.attachment.name}`}
                  title='Download'
                >
                  <Download className='h-4 w-4' />
                </button>
              </div>
            </div>
          )}
          {msg.attachment?.type === 'image' && (
            <button
              type='button'
              onClick={() => onPreviewImage(msg.attachment!)}
              className='outline-none block my-1 overflow-hidden rounded-2xl cursor-pointer'
            >
              <img
                src={msg.attachment.url}
                alt={msg.attachment.name}
                className='max-h-72 max-w-full rounded-2xl object-cover hover:opacity-95 transition-opacity'
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
              onClick={() => onPreviewMap(msg.location!)}
              className='mt-1 block w-64 overflow-hidden rounded-xl border border-border/60 bg-muted/40 text-left cursor-pointer'
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
            onReact={(action, value) => onMessageAction(action, msg, value)}
            onDeleteForMe={() => onMessageAction('delete', msg)}
            onDeleteForEveryone={() =>
              onMessageAction('deleteForEveryone', msg)
            }
            onReply={() => {
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
  )
}
