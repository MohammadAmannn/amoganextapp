'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'
import {
  ImageConverterDialog,
  ConvertedPdfResult,
} from '@/components/image-converter-dialog'
import {
  DocConverterDialog,
  ConvertedDocResult,
} from '@/components/doc-converter-dialog'
import { DocumentScannerModal } from '@/features/chattemplate/scanner/DocumentScannerModal'
import { TextExtractorModal } from '@/features/chattemplate/extractor/TextExtractorModal'
import { ScannedPdfResult } from '@/features/chattemplate/scanner/types'
import { useCapacitorDocScanner } from '@/hooks/useCapacitorDocScanner'
import { Message, Conversation } from '@/features/chattemplate/chat/types/chat.types'
import { ChatProfilePage } from '@/features/chattemplate/chat/components/chat-profile-drawer'
import {
  ChatMessage,
  ChatAttachment,
  ChatLocation,
  ChatViewProps,
  MessageActionType,
} from '../../types/chat.types'
import { ChatHeader } from './chat-header'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import { FileUploadProgress } from './file-upload-progress'

export type { ChatMessage, ChatAttachment, ChatLocation, ChatViewProps, MessageActionType }

const LocationMap = dynamic<any>(() => import('@/components/ui/leaflet-map'), {
  ssr: false,
})

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileType(name: string) {
  return name.split('.').pop()?.toLowerCase()
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
  const [isImageConverterOpen, setIsImageConverterOpen] = useState(false)
  const [isDocConverterOpen, setIsDocConverterOpen] = useState(false)
  const [isDocumentScannerOpen, setIsDocumentScannerOpen] = useState(false)
  const [isTextExtractorOpen, setIsTextExtractorOpen] = useState(false)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [activeToolbarMessageId, setActiveToolbarMessageId] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<{
    fileName: string
    fileSize: number
    progress: number
    status: 'uploading' | 'completed' | 'error'
  } | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const { startDocScan } = useCapacitorDocScanner()

  const handleRetryPdf = async (messageId: string) => {
    try {
      const res = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, isRetry: true }),
      })
      if (res.ok) {
        toast.success('PDF parsing retry triggered successfully!')
      } else {
        toast.error('Failed to trigger retry.')
      }
    } catch (err) {
      console.error('Retry failed:', err)
      toast.error('Network error triggering retry.')
    }
  }

  const handlePdfConverted = (result: ConvertedPdfResult) => {
    onSendMessage('', {
      type: 'document',
      name: result.fileName,
      size: result.fileSize,
      url: result.publicUrl,
      mimeType: result.mimeType,
    })
  }

  const handleDocConverted = (result: ConvertedDocResult) => {
    onSendMessage('', {
      type: 'document',
      name: result.fileName,
      size: result.fileSize,
      url: result.publicUrl,
      mimeType: result.mimeType,
    })
  }

  const handleScannedPdfComplete = (result: ScannedPdfResult) => {
    onSendMessage('', {
      type: 'document',
      name: result.fileName,
      size: result.fileSize,
      url: result.publicUrl,
      mimeType: result.mimeType,
    })
  }

  const handleOcrPdfComplete = (result: {
    fileName: string
    fileSize: number
    publicUrl: string
    mimeType: string
    extractedText: string
    extractedJson: Record<string, any>
  }) => {
    onSendMessage('', {
      type: 'document',
      name: result.fileName,
      size: result.fileSize,
      url: result.publicUrl,
      mimeType: result.mimeType,
      fileContentText: result.extractedText,
      fileContentJson: result.extractedJson,
    })
  }

  const handleNativeDocScanner = () => {
    startDocScan(
      (result) => handleScannedPdfComplete(result),
      () => setIsDocumentScannerOpen(true)
    )
  }

  useEffect(() => {
    if (!isLoadingOlder) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }
  }, [messages, isLoadingOlder])

  const handleSend = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onSendMessage(trimmed, undefined, replyingTo || undefined)
    setDraft('')
    setReplyingTo(null)
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
    const displayConvo =
      conversation ||
      ({
        id: 'synthetic-convo',
        name: chatName,
        image: chatAvatar,
        type: membersCount && membersCount > 2 ? 'group' : 'direct',
        created_at: new Date().toISOString(),
        members:
          membersCount && membersCount > 2
            ? Array.from({ length: membersCount }).map((_, i) => ({
                id: `m-${i}`,
                name: `Member ${i + 1}`,
                email: `member${i + 1}@example.com`,
                avatar_url: '',
              }))
            : [
                {
                  id: currentUser?.accountNo || '1',
                  name: currentUser?.name || 'You',
                  email: currentUser?.email || '',
                  avatar_url: '',
                },
                {
                  id: '2',
                  name: chatName,
                  email: 'partner@example.com',
                  avatar_url: chatAvatar || '',
                },
              ],
      } as Conversation)

    const displayRawMessages =
      rawMessages ||
      (messages.map((msg) => ({
        id: msg.id,
        conversation_id: displayConvo.id,
        owner_user_id: msg.isOwn ? currentUser?.accountNo || '1' : '2',
        sender_user_id: msg.isOwn ? currentUser?.accountNo || '1' : '2',
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
      })) as Message[])

    return (
      <div className='animate-in fade-in flex h-full w-full flex-col overflow-hidden bg-card duration-200 select-none'>
        <ChatProfilePage
          conversation={displayConvo}
          messages={displayRawMessages}
          currentUser={currentUser || null}
          onBack={() => setShowProfile(false)}
          onViewDocument={(url, name) => {
            setShowProfile(false)
            setPreviewDoc({
              type: 'document',
              url,
              name,
              size: 0,
              mimeType: '',
            })
          }}
        />
      </div>
    )
  }

  if (previewDoc) {
    return (
      <div className='fixed inset-0 z-50 flex h-full w-full flex-col bg-background md:relative md:z-auto'>
        <SafeDocumentPreview
          fileName={previewDoc.name}
          fileUrl={previewDoc.url}
          onClose={() => setPreviewDoc(null)}
        />
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
            className='rounded-md p-1.5 text-muted-foreground hover:bg-muted cursor-pointer'
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
      <ChatHeader
        chatName={chatName}
        chatAvatar={chatAvatar}
        subtitle={subtitle}
        typingText={typingText}
        onBack={onBack}
        onShowProfile={() => setShowProfile(true)}
      />

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
            <MessageBubble
              key={msg.id}
              msg={msg}
              isHighlighted={highlightedMessageId === msg.id}
              activeToolbarMessageId={activeToolbarMessageId}
              setActiveToolbarMessageId={setActiveToolbarMessageId}
              onScrollToReply={scrollToMessage}
              onPreviewDoc={setPreviewDoc}
              onPreviewImage={setPreviewImage}
              onPreviewMap={setMapPreview}
              onRetryPdf={handleRetryPdf}
              onMessageAction={onMessageAction}
              onReply={onReply}
              formatTime={formatTime}
              formatFileSize={formatFileSize}
              getFileType={getFileType}
            />
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
      <MessageInput
        draft={draft}
        setDraft={setDraft}
        onTypingChange={onTypingChange}
        onSend={handleSend}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onShareLocation={onShareLocation}
        onNativeDocScanner={handleNativeDocScanner}
        onOpenImageConverter={() => setIsImageConverterOpen(true)}
        onOpenDocConverter={() => setIsDocConverterOpen(true)}
        onOpenDocScanner={() => setIsDocumentScannerOpen(true)}
        onOpenTextExtractor={() => setIsTextExtractorOpen(true)}
        imageInputRef={imageInputRef}
        videoInputRef={videoInputRef}
        documentInputRef={documentInputRef}
        cameraInputRef={cameraInputRef}
      />

      {/* Hidden File Inputs */}
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
            className='absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white cursor-pointer'
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

      {/* Dialogs */}
      <ImageConverterDialog
        open={isImageConverterOpen}
        onOpenChange={setIsImageConverterOpen}
        onConverted={handlePdfConverted}
      />
      <DocConverterDialog
        open={isDocConverterOpen}
        onOpenChange={setIsDocConverterOpen}
        onConverted={handleDocConverted}
      />
      <DocumentScannerModal
        isOpen={isDocumentScannerOpen}
        onClose={() => setIsDocumentScannerOpen(false)}
        onComplete={handleScannedPdfComplete}
      />
      <TextExtractorModal
        isOpen={isTextExtractorOpen}
        onClose={() => setIsTextExtractorOpen(false)}
        onComplete={handleOcrPdfComplete}
      />
    </div>
  )
}
