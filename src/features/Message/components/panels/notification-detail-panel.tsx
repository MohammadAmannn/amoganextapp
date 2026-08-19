'use client'

import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Bell, Download, FileText, Mail, Trash2, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DbNotification, useNotificationStore } from '@/stores/notification-store'
import { downloadFileFromUrl } from '@/utils/download'
import { HeaderActions } from '../chat/header-actions'

export interface ChatMessageDetail {
  id: string
  conversation_id: string
  sender_user_id: string | null
  message: string
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'system'
  created_at: string
  file_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  sender?: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

interface NotificationDetailPanelProps {
  notification: DbNotification
  messageDetail: ChatMessageDetail | null
  isLoadingMessage: boolean
  onClose: () => void
}

export function NotificationDetailPanel({
  notification,
  messageDetail,
  isLoadingMessage,
  onClose,
}: NotificationDetailPanelProps) {
  const { deleteNotification } = useNotificationStore()

  

  const senderName =
    messageDetail?.sender?.name ||
    notification.message_text.split(' send you a msg')[0] ||
    'System Alert'

  const senderEmail = messageDetail?.sender?.email || ''

  const handleDelete = () => {
    deleteNotification(notification.id)
    onClose()
  }

  return (
    <div className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-background'>
      {/* Panel Header */}
      <div className='flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3'>
        <div className='flex items-center gap-3 min-w-0'>

          {messageDetail?.sender ? (
            <div className='flex items-center gap-2.5 min-w-0'>
              <Avatar className='h-8 w-8 shrink-0'>
                <AvatarImage
                  src={messageDetail.sender.avatar || undefined}
                  alt={messageDetail.sender.name}
                />
                <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
                  {messageDetail.sender.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex flex-col'>
                <span className='truncate text-sm font-semibold text-foreground leading-tight'>
                  {messageDetail.sender.name}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {messageDetail.sender.email}
                </span>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-2 min-w-0'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'>
                <Bell className='h-4 w-4' />
              </div>
              <div className='min-w-0 flex flex-col'>
                <span className='truncate text-sm font-semibold text-foreground leading-tight'>
                  {senderName}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  Notification Detail
                </span>
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center gap-1.5 shrink-0'>
          <HeaderActions onDelete={handleDelete} />
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            title='Close notification'
            aria-label='Close'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className='flex-1 p-4 sm:p-6 bg-muted/10'>
        <div className='max-w-2xl mx-auto space-y-4'>
          {isLoadingMessage ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <div className='h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full' />
              <p className='text-xs text-muted-foreground'>Loading message details...</p>
            </div>
          ) : messageDetail ? (
            <div className='bg-background border border-border/80 shadow-xs rounded-2xl p-5 space-y-4'>
              <div className='flex items-center justify-between border-b pb-3 border-border/50'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-[10px] font-medium uppercase tracking-wider bg-primary/5 text-primary border-primary/20'>
                    {messageDetail.message_type || 'Message'}
                  </Badge>
                </div>
               
              </div>

              {/* Text Message */}
              <div className='text-sm text-foreground leading-relaxed whitespace-pre-wrap select-text'>
                {messageDetail.message}
              </div>

              {/* File Attachment Details */}
              {messageDetail.file_url && (
                <div className='mt-4 flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/30 transition-colors'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='p-2 bg-primary/10 text-primary rounded-lg shrink-0'>
                      <FileText className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 space-y-0.5'>
                      <p className='text-xs font-semibold text-foreground truncate'>
                        {messageDetail.file_name || 'Attached File'}
                      </p>
                      {messageDetail.file_size && (
                        <p className='text-[11px] text-muted-foreground'>
                          {(messageDetail.file_size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      messageDetail.file_url &&
                      downloadFileFromUrl(
                        messageDetail.file_url,
                        messageDetail.file_name || 'document.pdf'
                      )
                    }
                    className='h-8 gap-1.5 shrink-0 shadow-2xs text-xs font-medium'
                  >
                    <Download className='h-3.5 w-3.5' />
                    Download
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className='bg-background border border-border/80 shadow-xs rounded-2xl p-6 space-y-4'>
              <div className='flex items-center justify-between border-b pb-3 border-border/50'>
                <Badge variant='outline' className='text-[10px] font-medium uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/40'>
                  Notification
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                </span>
              </div>

              <div className='text-sm text-foreground leading-relaxed whitespace-pre-wrap select-text font-medium'>
                {notification.message_text}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
