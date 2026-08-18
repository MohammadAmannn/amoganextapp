import React from 'react'
import dynamic from 'next/dynamic'
import {
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  X,
  ImagePlus,
  Video as VideoIcon,
  FileText,
  MapPin,
  FileType,
  RefreshCw,
  ScanLine,
  Scan,
} from 'lucide-react'
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
import { ChatMessage } from '../../types/chat.types'

const EmojiPicker = dynamic(
  () => import('@/features/chattemplate/chat/components/emoji-picker'),
  { ssr: false }
)

interface MessageInputProps {
  draft: string
  setDraft: React.Dispatch<React.SetStateAction<string>>
  onTypingChange?: (value: string) => void
  onSend: () => void
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void
  replyingTo: ChatMessage | null
  onCancelReply: () => void
  onShareLocation?: () => void
  onNativeDocScanner: () => void
  onOpenImageConverter: () => void
  onOpenDocConverter: () => void
  onOpenDocScanner: () => void
  onOpenTextExtractor: () => void
  imageInputRef: React.RefObject<HTMLInputElement | null>
  videoInputRef: React.RefObject<HTMLInputElement | null>
  documentInputRef: React.RefObject<HTMLInputElement | null>
  cameraInputRef: React.RefObject<HTMLInputElement | null>
}

export function MessageInput({
  draft,
  setDraft,
  onTypingChange,
  onSend,
  isRecording,
  startRecording,
  stopRecording,
  replyingTo,
  onCancelReply,
  onShareLocation,
  onNativeDocScanner,
  onOpenImageConverter,
  onOpenDocConverter,
  onOpenDocScanner,
  onOpenTextExtractor,
  imageInputRef,
  videoInputRef,
  documentInputRef,
  cameraInputRef,
}: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <>
      {/* Replying banner */}
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
            onClick={onCancelReply}
            className='rounded-full p-1 text-muted-foreground hover:bg-muted cursor-pointer'
            aria-label='Cancel reply'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}

      {/* Main input bar */}
      <div className='pb-safe relative flex flex-none shrink-0 items-center gap-2.5 border-t border-border bg-muted/10 p-3'>
        <div className='relative flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-border bg-background px-3.5 py-1.5 shadow-xs'>
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
              className='w-44 max-w-[calc(100vw-32px)]'
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
              <DropdownMenuItem
                onClick={onOpenImageConverter}
                className='cursor-pointer gap-2 font-semibold'
              >
                <FileType className='h-4 w-4' /> Image Converter
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onOpenDocConverter}
                className='cursor-pointer gap-2 font-semibold'
              >
                <RefreshCw className='h-4 w-4' /> Doc Converter
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onNativeDocScanner}
                className='cursor-pointer gap-2 font-semibold'
              >
                <ScanLine className='h-4 w-4 text-primary' /> Doc Scanner
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onOpenDocScanner}
                className='cursor-pointer gap-2 font-semibold'
              >
                <Scan className='h-4 w-4' /> Scan Document
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onOpenTextExtractor}
                className='cursor-pointer gap-2 font-semibold'
              >
                <FileText className='h-4 w-4 text-primary' /> Extract Text
              </DropdownMenuItem>
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
            if (draft.trim()) onSend()
          }}
          onPointerDown={(event) => {
            if (draft.trim()) return
            try {
              event.currentTarget.setPointerCapture(event.pointerId)
            } catch (err) {}
            startRecording()
          }}
          onPointerUp={(event) => {
            if (draft.trim()) return
            try {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
            } catch (err) {}
            stopRecording()
          }}
          onPointerCancel={(event) => {
            try {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
            } catch (err) {}
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
    </>
  )
}
