import { useState, useRef } from 'react'
import { Check, CheckCheck, Clock, CornerUpLeft, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AttachmentRenderer } from '@/features/chattemplate/files/components/attachment-renderer'
import { Message } from '../types/chat.types'
import { MessageActions } from './message-actions'
import { MessageToolbar } from './message-toolbar'
import { ReplyPreview } from './reply-preview'

interface MessageBubbleProps {
  message: Message
  currentUserId: string
  isGroup: boolean
  onReact: (
    messageId: string,
    action:
      | 'thumb'
      | 'favorite'
      | 'flag'
      | 'star'
      | 'pin'
      | 'archive'
      | 'action_this',
    value: boolean
  ) => void
  onDeleteForMe: (messageId: string) => void
  onDeleteForEveryone?: (messageId: string) => void
  onReply: (message: Message) => void
  onForward: (message: Message) => void
  onEdit?: (message: Message) => void
  onViewDocument?: (url: string, name: string, messageId?: string) => void
  onOpenLocationOnMap?: (location: any, type: 'current' | 'live') => void
}

export function MessageBubble({
  message,
  currentUserId,
  isGroup,
  onReact,
  onDeleteForMe,
  onDeleteForEveryone,
  onReply,
  onForward,
  onEdit,
  onViewDocument,
  onOpenLocationOnMap,
}: MessageBubbleProps) {
  if (message.message_type === 'system') {
    return (
      <div className='animate-in fade-in my-1 flex w-full justify-center duration-200 select-none'>
        <div className='max-w-[85%] rounded-xl border border-sky-200/50 bg-sky-100/80 px-4 py-1.5 text-center text-[11px] font-semibold whitespace-pre-wrap text-sky-800 shadow-xs dark:border-sky-900/30 dark:bg-sky-950/40 dark:text-sky-300'>
          {message.message}
        </div>
      </div>
    )
  }

  const isMe = message.sender_user_id === currentUserId
  const [showMobileToolbar, setShowMobileToolbar] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const messageTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Copy text handler
  const handleCopy = () => {
    if (message.message) {
      navigator.clipboard.writeText(message.message)
      toast.success('Message copied to clipboard!')
      setShowMobileToolbar(false)
    }
  }

  // Share handler
  const handleShare = () => {
    if (navigator.share && message.message) {
      navigator
        .share({
          text: message.message,
        })
        .catch(() => { })
    } else {
      toast.success('Ready to share message link!')
    }
    setShowMobileToolbar(false)
  }

  // Touch handlers to support mobile long press
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowMobileToolbar(true)
      if (navigator.vibrate) {
        navigator.vibrate(50) // Small haptic feedback
      }
    }, 600)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMobileToolbar((prev) => !prev)
  }

  const handleReact = (
    action:
      | 'thumb'
      | 'favorite'
      | 'flag'
      | 'star'
      | 'pin'
      | 'archive'
      | 'action_this',
    value: boolean
  ) => {
    if (onReact) {
      onReact(message.id, action, value)
    }
  }

  const handleDeleteForMe = () => {
    if (onDeleteForMe) {
      onDeleteForMe(message.id)
    }
    setShowMobileToolbar(false)
  }

  const handleDeleteForEveryone = () => {
    if (onDeleteForEveryone) {
      onDeleteForEveryone(message.id)
    }
    setShowMobileToolbar(false)
  }

  const handleReply = () => {
    onReply(message)
    setShowMobileToolbar(false)
  }

  const handleForward = () => {
    onForward(message)
    setShowMobileToolbar(false)
  }

  const isPureAttachment = !message.deleted && message.message_type !== 'text' && message.message_type !== 'location' && !message.message

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        'group relative flex max-w-[85%] flex-col items-start gap-1 pb-3 transition-all duration-300 sm:max-w-[75%]',
        {
          'ms-auto items-end': isMe,
        }
      )}
    >
      {/* Sender name for group chats (not me) */}
      {isGroup && !isMe && message.sender && (
        <span className='px-1 text-[10px] leading-none font-semibold text-muted-foreground/80 select-none'>
          {message.sender.name}
        </span>
      )}

      <div
        onClick={handleBubbleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'group/bubble relative max-w-full text-sm leading-relaxed transition-all duration-200 select-text',
          {
            'text-foreground': !message.deleted,
            'text-muted-foreground italic': message.deleted,
          }
        )}
      >
        {/* Forwarded Tag */}
        {message.forward && !message.deleted && (
          <span className='mb-1 flex items-center gap-1 text-[10px] leading-none font-extrabold text-muted-foreground opacity-80 select-none'>
            <CornerUpLeft className='h-2.5 w-2.5 scale-x-[-1] text-sky-500' />
            Forwarded message
          </span>
        )}

        {/* Reply Message Preview inside the bubble */}
        {message.reply && message.replyto_message && !message.deleted && (
          <ReplyPreview message={message.replyto_message} />
        )}

        {/* Attachments Renderer */}
        {!message.deleted && message.message_type !== 'location' && (
          <AttachmentRenderer
            messageType={message.message_type as any}
            fileUrl={message.file_url}
            fileName={message.file_name}
            fileSize={message.file_size}
            duration={message.duration}
            onViewDocument={onViewDocument}
            messageId={message.id}
            processingStatus={message.processing_status}
          />
        )}

        {/* Location Card Renderer */}
        {!message.deleted &&
          message.message_type === 'location' &&
          message.location_data && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                onOpenLocationOnMap?.(
                  message.location_data,
                  message.location_type || 'current'
                )
              }}
              className='my-1 flex max-w-[260px] cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3 transition-colors hover:bg-muted/70 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70'
            >
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20'>
                <MapPin className='h-5 w-5 animate-pulse text-emerald-600 dark:text-emerald-400' />
              </div>
              <div className='min-w-0 flex-1 text-left'>
                <span className='block truncate text-xs font-bold text-foreground'>
                  {message.location_type === 'live'
                    ? 'Live Location'
                    : 'Current Location'}
                </span>
                <span
                  className='block truncate text-[10px] text-muted-foreground'
                  title={message.location_data.address}
                >
                  {message.location_data.address ||
                    `${message.location_data.latitude.toFixed(5)}, ${message.location_data.longitude.toFixed(5)}`}
                </span>
                <span className='mt-0.5 block animate-pulse text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                  Click to view map
                </span>
              </div>
            </div>
          )}

        {/* Text Message Content */}
        {message.deleted ? (
          <p className='break-words'>This message was deleted.</p>
        ) : (
          (message.message_type === 'text' ||
            (message.message && message.message_type !== 'location')) && (
            <p className='mt-1 break-words whitespace-pre-wrap'>
              {message.message}
            </p>
          )
        )}

        {/* Timestamp and Check marks */}
        <div className='mt-1 flex items-center justify-end gap-1 text-[9px] leading-none text-muted-foreground opacity-70 select-none'>
          <span>{messageTime}</span>
          {isMe && !message.deleted && (
            <span className='flex items-center'>
              {message.message_status === 'pending' && (
                <span title='Pending'>
                  <Clock className='h-3 w-3 animate-pulse text-muted-foreground/60' />
                </span>
              )}
              {message.message_status === 'sent' && (
                <span title='Sent'>
                  <Check className='h-3.5 w-3.5 text-muted-foreground/70' />
                </span>
              )}
              {message.message_status === 'delivered' && (
                <span title='Delivered'>
                  <CheckCheck className='h-3.5 w-3.5 text-muted-foreground/70' />
                </span>
              )}
              {message.message_status === 'read' && (
                <span title='Read'>
                  <CheckCheck className='h-3.5 w-3.5 text-sky-500' />
                </span>
              )}
              {!message.message_status && (
                <span title='Sent'>
                  <CheckCheck className='h-3.5 w-3.5 text-muted-foreground/70' />
                </span>
              )}
            </span>
          )}
        </div>

        {/* Reaction Active Badges */}
        {!message.deleted && (
          <MessageActions
            thumb={message.thumb}
            favorite={message.favorite}
            flag={message.flag}
            star={message.star}
            pin={message.pin}
            archive={message.archive}
          />
        )}
      </div>

      {/* Floating Toolbar (CSS hover on desktop, click/long press state on mobile) */}
      {!message.deleted && (
        <MessageToolbar
          message={message}
          onCopy={handleCopy}
          onReact={handleReact}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onReply={handleReply}
          onForward={handleForward}
          onEdit={onEdit ? () => onEdit(message) : undefined}
          onShare={handleShare}
          isSender={isMe}
          className={cn(
            'pointer-events-none absolute z-30 scale-95 opacity-0 shadow-md transition-all duration-200',
            // Desktop hover behavior
            'group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100',
            // Mobile active behavior
            showMobileToolbar
              ? 'pointer-events-auto scale-100 opacity-100'
              : '',
            // Positioning based on sender
            isMe ? 'right-2 -bottom-4' : '-bottom-4 left-2'
          )}
        />
      )}
    </div>
  )
}
export default MessageBubble
