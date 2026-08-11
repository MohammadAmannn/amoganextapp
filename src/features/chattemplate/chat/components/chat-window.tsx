import { useState, useRef, useEffect } from 'react'
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
  X,
  Smile,
  CheckCheck,
  Loader2,
  Mic,
  Camera,
  Download,
  ExternalLink,
  Play,
  Pause,
  Trash2,
  RotateCw,
  ImagePlus,
  Video as VideoIcon,
  FileText,
  FileType,
  RefreshCw,
  Check,
  File as FileIcon,
  Volume2,
  ChevronLeft,
  PanelLeft,
  Info,
  MapPin,
  Scan,
  ScanLine,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { ImageConverterDialog, ConvertedPdfResult } from '@/components/image-converter-dialog'
import { DocConverterDialog, ConvertedDocResult } from '@/components/doc-converter-dialog'
import { DocumentScannerModal } from '@/features/chattemplate/scanner/DocumentScannerModal'
import { TextExtractorModal } from '@/features/chattemplate/extractor/TextExtractorModal'
import { ScannedPdfResult } from '@/features/chattemplate/scanner/types'
import { useCapacitorDocScanner } from '@/hooks/useCapacitorDocScanner'
import { downloadFileFromUrl } from '@/utils/download'
import { useAuthStore } from '@/stores/auth-store'
import { cn, getDisplayNameInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
// Radix UI and Shadcn primitives
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
// Visualizer and custom voice message player components
import { AudioVisualizer } from '@/features/chattemplate/files/components/audio-visualizer'
import { VoiceMessagePlayer } from '@/features/chattemplate/files/components/voice-message-player'
// Location imports
import { LocationPicker } from '../components/locationpicker'
import { useAttachments } from '../hooks/use-attachments'
// Make sure this is the correct path
import { useLocation } from '../hooks/use-location'
import { getUserConversations } from '../repositories/conversation-repository'
import {
  updateMessageBooleanAction,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  forwardMessage,
} from '../repositories/message-repository'
// Clean Architecture Types
import { Conversation, Message } from '../types/chat.types'
import { LocationData } from '../types/location.types'
import { UserTypingState, TypingStatus } from '../types/typing.types'
import { ChatProfilePage } from './chat-profile-drawer'
// Redesigned components and hooks
import { MessageBubble } from './message-bubble'
import { ReplyPreview } from './reply-preview'
import { TypingIndicator } from './typing-indicator'

// FEATURE 1: Emoji Picker (Lazy loaded to optimize bundle size)
const EmojiPicker = dynamic(() => import('./emoji-picker'), { ssr: false })
const LeafletMap = dynamic(() => import('@/components/ui/leaflet-map'), {
  ssr: false,
})

// Custom inline PDF & Document Viewer components powered by common ReactDocViewerWrapper
const DynamicDocViewer = dynamic(
  () =>
    import('@/components/DocumentViewer/ReactDocViewerWrapper').then(
      (mod) => mod.ReactDocViewerWrapper
    ),
  {
    ssr: false,
    loading: () => (
      <div className='animate-in fade-in flex h-full w-full flex-col items-center justify-center space-y-3 bg-background duration-200'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
        <p className='animate-pulse text-xs font-semibold text-muted-foreground'>
          Loading document preview...
        </p>
      </div>
    ),
  }
)

function getFileTypeFromFileName(fileName: string): string | undefined {
  const parts = fileName.split('.')
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase()
  }
  return undefined
}

import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'

function DocPreviewViewer({ url, name, onClose }: { url: string; name: string; onClose?: () => void }) {
  return (
    <div className='doc-viewer-wrapper h-full w-full'>
      <SafeDocumentPreview fileName={name} fileUrl={url} onClose={onClose} />
    </div>
  )
}

interface ChatWindowProps {
  selectedTarget: Conversation
  messages: Message[]
  onSendMessage: (
    text: string,
    attachment?: {
      messageType: 'image' | 'video' | 'document' | 'audio'
      fileUrl: string
      fileName: string
      fileSize: number
      mimeType: string
      duration?: number
      fileContentText?: string
      fileContentJson?: any
    },
    replyMetadata?: {
      replyemoji?: string
      replyto_message_id?: string
      replyto_user_id?: string
      parent_message_id?: string
    },
    attachmentFile?: File | Blob,
    locationData?: {
      // Add this
      location: LocationData
    }
  ) => void
  onBackClick?: () => void
  isTyping?: boolean
  isLeftSidebarCollapsed?: boolean
  onToggleLeftSidebar?: () => void
  isRightSidebarOpen?: boolean
  onToggleRightSidebar?: () => void
  onlineUserIds?: Set<string>
  typingUsers?: UserTypingState[]
  onSendTypingStatus?: (status: TypingStatus) => void
  onRemoveMember?: (conversationId: string, memberId: string) => void
  onLoadOlder?: () => Promise<void> | void
  hasMoreMessages?: boolean
  isLoadingOlder?: boolean
}

interface UploadState {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  folder: 'images' | 'videos' | 'documents' | 'audio'
  xhr?: XMLHttpRequest
}

export function ChatWindow({
  selectedTarget,
  messages,
  onSendMessage,
  onBackClick,
  isTyping,
  isLeftSidebarCollapsed,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  onlineUserIds,
  typingUsers = [],
  onSendTypingStatus,
  onRemoveMember,
  onLoadOlder,
  hasMoreMessages,
  isLoadingOlder,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('')
  const { uploads, startUpload, cancelUpload } = useAttachments()
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  // Inline profile and PDF view states
  const [showProfile, setShowProfile] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{
    url: string
    name: string
  } | null>(null)
  // Reset profile and doc preview view states on conversation switch
  useEffect(() => {
    setShowProfile(false)
    setPreviewDoc(null)
  }, [selectedTarget.id])

  // Redesign states
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(
    null
  )
  const [forwardConversations, setForwardConversations] = useState<
    Conversation[]
  >([])
  const [selectedForwardTargets, setSelectedForwardTargets] = useState<
    string[]
  >([])
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false)

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [slideX, setSlideX] = useState(0)

  // Camera capture states
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  // Location states
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)
  const [isImageConverterOpen, setIsImageConverterOpen] = useState(false)
  const [isDocConverterOpen, setIsDocConverterOpen] = useState(false)
  const [isDocumentScannerOpen, setIsDocumentScannerOpen] = useState(false)
  const [isTextExtractorOpen, setIsTextExtractorOpen] = useState(false)
  const { startDocScan } = useCapacitorDocScanner()

  const handlePdfConverted = (result: ConvertedPdfResult) => {
    onSendMessage('', {
      messageType: 'document',
      fileUrl: result.publicUrl,
      fileName: result.fileName,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
    })
  }

  const handleDocConverted = (result: ConvertedDocResult) => {
    onSendMessage('', {
      messageType: 'document',
      fileUrl: result.publicUrl,
      fileName: result.fileName,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
    })
  }

  const handleScannedPdfComplete = (result: ScannedPdfResult) => {
    onSendMessage('', {
      messageType: 'document',
      fileUrl: result.publicUrl,
      fileName: result.fileName,
      fileSize: result.fileSize,
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
      messageType: 'document',
      fileUrl: result.publicUrl,
      fileName: result.fileName,
      fileSize: result.fileSize,
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
  const [liveLocationInterval, setLiveLocationInterval] =
    useState<NodeJS.Timeout | null>(null)
  const {
    getCurrentLocation,
    startLiveTracking,
    stopLiveTracking,
    isTracking,
  } = useLocation()
  const [activeMapLocation, setActiveMapLocation] = useState<{
    lat: number
    lng: number
    type: 'current' | 'live'
    address?: string
  } | null>(null)

  // Drag coordinates reference
  const startXRef = useRef<number>(0)
  const mimeTypeRef = useRef<string>('audio/webm')

  // Web camera stream references
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  // Auth User
  const currentUser = useAuthStore((state) => state.auth.user)

  // Refs for files, recording & focus management
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const handleMessagesScroll = async () => {
    const container = scrollContainerRef.current
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
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight - previousHeight
      }
    })
  }
  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Web Audio WAV recording references
  const audioContextRef = useRef<AudioContext | null>(null)
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const recordingBufferRef = useRef<Float32Array[]>([])

  const recordingStartTimeRef = useRef<number>(0)
  const isRecordingRef = useRef<boolean>(false)

  // Clean up recording timer and streams on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Clean up live location tracking on unmount or conversation change
  useEffect(() => {
    return () => {
      if (liveLocationInterval) {
        clearInterval(liveLocationInterval)
        setLiveLocationInterval(null)
      }
      stopLiveTracking()
    }
  }, [liveLocationInterval, stopLiveTracking, selectedTarget.id])

  // Auto-scroll to bottom of conversation using direct scrollTop to prevent viewport scrolling/blurring on mobile
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (!isLoadingOlder) scrollToBottom()
  }, [messages, isTyping])

  // Real-time Supabase Broadcast Typing & Recording References
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingBroadcastRef = useRef<number>(0)
  const recordingBroadcastIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up typing timers and recording broadcast intervals on conversation switch or unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (recordingBroadcastIntervalRef.current)
        clearInterval(recordingBroadcastIntervalRef.current)
    }
  }, [selectedTarget.id])

  const handleInputChange = (val: string) => {
    setInputText(val)

    if (!onSendTypingStatus) return

    if (val.trim().length > 0) {
      const now = Date.now()
      if (now - lastTypingBroadcastRef.current > 1500) {
        onSendTypingStatus('typing')
        lastTypingBroadcastRef.current = now
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        onSendTypingStatus('idle')
      }, 3000)
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      onSendTypingStatus('idle')
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    if (onSendTypingStatus) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      onSendTypingStatus('idle')
    }
    onSendMessage(
      inputText.trim(),
      undefined,
      replyingTo
        ? {
            replyto_message_id: replyingTo.id,
            replyto_user_id: replyingTo.sender_user_id || undefined,
            parent_message_id: replyingTo.parent_message_id || replyingTo.id,
          }
        : undefined
    )
    setInputText('')
    setReplyingTo(null)

    // Keep input element focused on mobile/desktop to prevent keyboard from closing
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }

  const handleReactToMessage = async (
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
  ) => {
    const success = await updateMessageBooleanAction(messageId, action, value)
    if (!success) {
      toast.error('Failed to update reaction')
    }
  }

  const handleDeleteMessageForMe = async (messageId: string) => {
    const success = await deleteMessageForMe(messageId)
    if (!success) {
      toast.error('Failed to delete message')
    }
  }

  const handleDeleteMessageForEveryone = async (messageId: string) => {
    if (!currentUser) return
    const success = await deleteMessageForEveryone(
      messageId,
      currentUser.accountNo
    )
    if (!success) {
      toast.error('Failed to delete message for everyone')
    }
  }

  const handleStartReply = (message: Message) => {
    setReplyingTo(message)
    inputRef.current?.focus()
  }

  const handleEditMessage = async (message: Message) => {
    if (!currentUser || message.message_type !== 'text') return
    const nextMessage = window.prompt('Edit message', message.message || '')
    if (!nextMessage?.trim() || nextMessage.trim() === message.message) return
    const success = await editMessage(
      message.id,
      currentUser.accountNo,
      nextMessage.trim()
    )
    if (!success) toast.error('Failed to edit message')
  }

  const handleStartForward = async (message: Message) => {
    setForwardingMessage(message)
    if (currentUser) {
      const activeConvs = await getUserConversations(currentUser.accountNo)
      setForwardConversations(activeConvs)
      setSelectedForwardTargets([])
      setIsForwardDialogOpen(true)
    }
  }

  // ========== LOCATION SHARING HANDLERS ==========
  const handleLocationClick = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setIsLocationPickerOpen(true)
  }

  const handleSendLocation = async (type: 'current' | 'live', data: any) => {
    try {
      const locationData: LocationData = {
        type,
        latitude: data.lat,
        longitude: data.lng,
        accuracy: data.accuracy || 0,
        address: data.address,
        timestamp: Date.now(),
        ...(type === 'live' && {
          isActive: true,
          expiresAt: data.expiresAt,
          duration: data.duration,
          lastUpdated: Date.now(),
        }),
      }

      // Send as message
      onSendMessage(
        type === 'live'
          ? '📍 Live location sharing started'
          : '📍 Current location shared',
        undefined,
        undefined,
        undefined,
        { location: locationData }
      )

      // If live, start periodic updates
      if (type === 'live') {
        await startLiveLocationUpdates(data.duration, data.lat, data.lng)
      }

      toast.success(
        type === 'live'
          ? 'Live location sharing started!'
          : 'Location shared successfully!'
      )
    } catch (error) {
      console.error('Failed to send location:', error)
      toast.error('Failed to share location')
    }
  }

  const startLiveLocationUpdates = async (
    durationMinutes: number,
    initialLat: number,
    initialLng: number
  ) => {
    let lastSentLocation = { lat: initialLat, lng: initialLng }

    startLiveTracking(async (position) => {
      // Only update if location changed significantly (more than 10 meters)
      const distance = calculateDistance(
        lastSentLocation.lat,
        lastSentLocation.lng,
        position.lat,
        position.lng
      )

      if (distance > 10) {
        lastSentLocation = { lat: position.lat, lng: position.lng }
        console.log('Live location update:', position)
        // Emit via your real-time service
        // socket.emit('live-location-update', {
        //     conversationId: selectedTarget.id,
        //     latitude: position.lat,
        //     longitude: position.lng,
        //     accuracy: position.accuracy
        // })
      }
    })

    // Auto-stop after duration
    setTimeout(
      () => {
        stopLiveTracking()
        toast.info('Live location sharing expired')
      },
      durationMinutes * 60 * 1000
    )
  }

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }
  // ========== END LOCATION SHARING HANDLERS ==========

  const handleExecuteForward = async () => {
    if (
      !forwardingMessage ||
      selectedForwardTargets.length === 0 ||
      !currentUser
    )
      return
    const success = await forwardMessage(
      forwardingMessage.id,
      selectedForwardTargets,
      currentUser.accountNo
    )
    if (success) {
      toast.success('Message forwarded successfully!')
      setIsForwardDialogOpen(false)
      setForwardingMessage(null)
      setSelectedForwardTargets([])
    } else {
      toast.error('Failed to forward message')
    }
  }

  const toggleForwardTarget = (convoId: string) => {
    setSelectedForwardTargets((prev) =>
      prev.includes(convoId)
        ? prev.filter((id) => id !== convoId)
        : [...prev, convoId]
    )
  }

  // Get recipient profile status or details (for header indicator)
  const getSubDetails = () => {
    if (selectedTarget.type !== 'direct') {
      const count = selectedTarget.members?.length || 0
      const groupType =
        selectedTarget.type === 'channel_group'
          ? 'Channel'
          : selectedTarget.type === 'message_group'
            ? 'Discussion'
            : 'Group'
      return `${count} ${count === 1 ? 'member' : 'members'} • ${groupType}`
    }
    return 'Direct Chat'
  }

  // FEATURE 1: Emoji Picker selection & cursor position preservation
  const handleSelectEmoji = (emoji: string) => {
    const input = inputRef.current
    if (!input) {
      setInputText((prev) => prev + emoji)
      return
    }

    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    const text = input.value
    const before = text.substring(0, start)
    const after = text.substring(end)

    const newText = before + emoji + after
    setInputText(newText)

    // Refocus input and restore selection cursor position
    setTimeout(() => {
      input.focus()
      const newPos = start + emoji.length
      input.setSelectionRange(newPos, newPos)
    }, 0)
  }

  // Helper: File size formatting
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // Helper: File downloader
  const downloadFile = async (url: string, name: string) => {
    await downloadFileFromUrl(url, name)
  }

  // Handle selection of files from native triggers
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: 'images' | 'videos' | 'documents'
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (file.size === 0) return

    // Map folder to correct message type
    const messageType =
      folder === 'images' ? 'image' : folder === 'videos' ? 'video' : 'document'

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      onSendMessage(
        '',
        {
          messageType,
          fileUrl: '',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
        undefined,
        file
      )
      e.target.value = ''
      return
    }

    startUpload(
      file,
      folder,
      (url, details) => {
        onSendMessage('', {
          messageType,
          fileUrl: url,
          fileName: details.name,
          fileSize: details.size,
          mimeType: details.type,
        })
      },
      () => {
        toast.error('Failed to upload file.')
      }
    )
    e.target.value = ''
  }

  // FEATURE 3: Camera Capture overlay triggers and helpers
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  const handleCameraClick = async () => {
    if (isMobileDevice()) {
      cameraInputRef.current?.click()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      cameraStreamRef.current = stream
      setIsCameraOpen(true)

      // Bind stream to video preview on next DOM tick
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream
          cameraVideoRef.current
            .play()
            .catch((err) => console.error('Webcam preview start failed:', err))
        }
      }, 100)
    } catch (err) {
      console.error('Camera access failed:', err)
      // Fallback to local image selector if no camera is attached or access is denied
      imageInputRef.current?.click()
    }
  }

  const closeCamera = () => {
    setIsCameraOpen(false)
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
    }
  }

  const capturePhoto = () => {
    const video = cameraVideoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw mirroring image for natural preview frame
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], `camera-capture-${Date.now()}.png`, {
        type: 'image/png',
      })

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        onSendMessage(
          '',
          {
            messageType: 'image',
            fileUrl: '',
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          },
          undefined,
          file
        )
        closeCamera()
        return
      }

      startUpload(
        file,
        'images',
        (url, details) => {
          onSendMessage('', {
            messageType: 'image',
            fileUrl: url,
            fileName: details.name,
            fileSize: details.size,
            mimeType: details.type,
          })
        },
        () => {
          toast.error('Failed to upload captured photo.')
        }
      )
      closeCamera()
    }, 'image/png')
  }

  // Audio recording helpers for universally compatible WAV format (WAV has a 44-byte PCM header)
  const bufferToWav = (buffer: Float32Array, sampleRate: number): Blob => {
    const bufferLength = buffer.length
    const wavBuffer = new ArrayBuffer(44 + bufferLength * 2)
    const view = new DataView(wavBuffer)

    const writeStringHelper = (
      view: DataView,
      offset: number,
      string: string
    ) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeStringHelper(view, 0, 'RIFF')
    view.setUint32(4, 36 + bufferLength * 2, true)
    writeStringHelper(view, 8, 'WAVE')
    writeStringHelper(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true) // raw PCM format
    view.setUint16(22, 1, true) // mono channel
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // 16-bit
    writeStringHelper(view, 36, 'data')
    view.setUint32(40, bufferLength * 2, true)

    let offset = 44
    for (let i = 0; i < buffer.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, buffer[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }

    return new Blob([view], { type: 'audio/wav' })
  }

  // FEATURE 4: Microphone audio note recording logic (Hold to record / Release to automatically send)
  const handleStartRecording = async (
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return
    }

    if (e) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      startXRef.current = clientX
    }
    setSlideX(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      recordingBufferRef.current = []

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext
      const audioCtx = new AudioContextClass()
      audioContextRef.current = audioCtx

      const source = audioCtx.createMediaStreamSource(stream)
      // Create script processor with buffer size 4096, 1 input channel, 1 output channel
      const processor = audioCtx.createScriptProcessor(4096, 1, 1)
      scriptProcessorRef.current = processor

      processor.onaudioprocess = (audioProcessingEvent) => {
        if (!isRecordingRef.current) return
        const inputBuffer = audioProcessingEvent.inputBuffer
        const inputData = inputBuffer.getChannelData(0)
        // Clone the float array and store it
        recordingBufferRef.current.push(new Float32Array(inputData))
      }

      source.connect(processor)
      processor.connect(audioCtx.destination)

      recordingStartTimeRef.current = Date.now()
      isRecordingRef.current = true
      setIsRecording(true)
      setRecordDuration(0)

      if (onSendTypingStatus) {
        onSendTypingStatus('recording')
      }
      if (recordingBroadcastIntervalRef.current)
        clearInterval(recordingBroadcastIntervalRef.current)
      recordingBroadcastIntervalRef.current = setInterval(() => {
        if (onSendTypingStatus && isRecordingRef.current) {
          onSendTypingStatus('recording')
        }
      }, 1500)

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Microphone access error:', err)
    }
  }

  const handleStopAndSendRecording = async () => {
    if (!isRecordingRef.current) return
    isRecordingRef.current = false
    setIsRecording(false)
    setSlideX(0)

    if (recordingBroadcastIntervalRef.current) {
      clearInterval(recordingBroadcastIntervalRef.current)
      recordingBroadcastIntervalRef.current = null
    }
    if (onSendTypingStatus) {
      onSendTypingStatus('idle')
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Stop recording and disconnect nodes
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect()
      scriptProcessorRef.current.onaudioprocess = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }

    const durationSec = Math.max(
      1,
      Math.round((Date.now() - recordingStartTimeRef.current) / 1000)
    )

    // Discard recording if it's less than 1 second (accidental clicks)
    if (durationSec < 1) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      return
    }

    // Merge buffer chunks
    const chunks = recordingBufferRef.current
    let totalLength = 0
    for (const chunk of chunks) {
      totalLength += chunk.length
    }
    const mergedBuffer = new Float32Array(totalLength)
    let bufferOffset = 0
    for (const chunk of chunks) {
      mergedBuffer.set(chunk, bufferOffset)
      bufferOffset += chunk.length
    }

    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const blob = bufferToWav(mergedBuffer, sampleRate)
    const file = new File([blob], `voice-note-${Date.now()}.wav`, {
      type: 'audio/wav',
    })

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      onSendMessage(
        '',
        {
          messageType: 'audio',
          fileUrl: '',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          duration: durationSec,
        },
        undefined,
        file
      )
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      return
    }

    startUpload(
      file,
      'audio',
      (url, details) => {
        onSendMessage('', {
          messageType: 'audio',
          fileUrl: url,
          fileName: details.name,
          fileSize: details.size,
          mimeType: details.type,
          duration: durationSec,
        })
      },
      () => {
        toast.error('Failed to upload voice note.')
      },
      durationSec
    )

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const handleDiscardRecording = () => {
    if (!isRecordingRef.current) return
    isRecordingRef.current = false
    setIsRecording(false)
    setSlideX(0)

    if (recordingBroadcastIntervalRef.current) {
      clearInterval(recordingBroadcastIntervalRef.current)
      recordingBroadcastIntervalRef.current = null
    }
    if (onSendTypingStatus) {
      onSendTypingStatus('idle')
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect()
      scriptProcessorRef.current.onaudioprocess = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  // Pointer movement listener for both touch dragging and mouse dragging (slide-to-cancel)
  const handlePointerMove = (e: any) => {
    if (!isRecordingRef.current) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const deltaX = startXRef.current - clientX // positive value means dragging left

    if (deltaX > 0) {
      setSlideX(Math.min(120, deltaX))

      // If user drags more than 100px left, discard/cancel the recording immediately
      if (deltaX > 100) {
        handleDiscardRecording()
      }
    } else {
      setSlideX(0)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStartRecording(e)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    if (slideX < 100) {
      handleStopAndSendRecording()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    handleStartRecording(e)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    if (slideX < 100) {
      handleStopAndSendRecording()
    }
  }

  // Mouse leave triggers cancellation (slide-to-cancel action on Desktop)
  const handleMouseLeave = () => {
    if (isRecordingRef.current) {
      handleDiscardRecording()
    }
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (activeMapLocation) {
    return (
      <div className='animate-in fade-in flex h-full w-full flex-col overflow-hidden rounded-none border-0 border-border bg-card shadow-xs duration-200 sm:rounded-xl sm:border'>
        <div className='flex flex-none shrink-0 items-center justify-between border-b border-border bg-muted/10 p-4 select-none'>
          <div className='flex min-w-0 items-center gap-3'>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => setActiveMapLocation(null)}
              className='h-8.5 w-8.5 shrink-0 cursor-pointer rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground'
              title='Close Map'
            >
              <X className='h-5 w-5' />
            </Button>
            <span className='flex items-center gap-1.5 text-sm font-bold text-foreground'>
              <MapPin className='h-4.5 w-4.5 animate-bounce text-emerald-600' />
              {activeMapLocation.type === 'live'
                ? 'Live Location'
                : 'Current Location'}
            </span>
          </div>
          <span
            className='max-w-[200px] truncate text-xs font-semibold text-muted-foreground'
            title={activeMapLocation.address}
          >
            {activeMapLocation.address ||
              `${activeMapLocation.lat.toFixed(5)}, ${activeMapLocation.lng.toFixed(5)}`}
          </span>
        </div>
        <div className='relative h-full min-h-0 w-full flex-grow overflow-hidden bg-background'>
          <LeafletMap
            latitude={activeMapLocation.lat}
            longitude={activeMapLocation.lng}
            type={activeMapLocation.type}
            address={activeMapLocation.address}
          />
        </div>
      </div>
    )
  }

  if (showProfile) {
    return (
      <div className='animate-in fade-in flex h-full w-full flex-col overflow-hidden rounded-none border-0 border-border bg-card shadow-xs duration-200 select-none sm:rounded-xl sm:border'>
        <ChatProfilePage
          conversation={selectedTarget}
          messages={messages}
          currentUser={currentUser}
          onBack={() => setShowProfile(false)}
          onViewDocument={(url, name) => {
            setShowProfile(false)
            setPreviewDoc({ url, name })
          }}
          onRemoveMember={onRemoveMember}
        />
      </div>
    )
  }

  if (previewDoc) {
    return (
      <div className='animate-in fade-in flex h-full w-full flex-col overflow-hidden rounded-none border-0 border-border bg-card shadow-xs duration-200 sm:rounded-xl sm:border'>
        <div className='relative h-full min-h-0 w-full flex-1 overflow-hidden bg-background'>
          <DocPreviewViewer
            url={previewDoc.url}
            name={previewDoc.name}
            onClose={() => setPreviewDoc(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full w-full flex-col overflow-hidden rounded-none border-0 border-border bg-card shadow-xs sm:rounded-xl sm:border'>
      {/* Chat Header */}
      <div className='flex flex-none shrink-0 items-center justify-between border-b border-border bg-muted/10 p-4 select-none'>
        <div className='flex min-w-0 items-center gap-2'>
          {onBackClick && (
            <Button
              size='icon'
              variant='ghost'
              onClick={onBackClick}
              className='h-8 w-8 shrink-0 sm:hidden'
            >
              <X className='h-5 w-5' />
            </Button>
          )}

          <div
            onClick={() => setShowProfile(true)}
            className='flex cursor-pointer items-center gap-3 transition-opacity select-none hover:opacity-85'
            title='Click to view info'
          >
            <div className='relative shrink-0'>
              <Avatar className='h-10 w-10 rounded-xl border border-border/60'>
                <AvatarImage
                  src={selectedTarget.image}
                  alt={selectedTarget.name}
                />
                <AvatarFallback className='rounded-xl bg-primary/10 font-bold text-primary'>
                  {getDisplayNameInitials(selectedTarget.name || '')}
                </AvatarFallback>
              </Avatar>
              {(() => {
                if (selectedTarget.type !== 'direct') return null
                const recipient = selectedTarget.members?.find(
                  (m) => m.id !== currentUser?.accountNo
                )
                const isOnline = recipient
                  ? onlineUserIds?.has(recipient.id)
                  : false
                return (
                  <span
                    className={cn(
                      'absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full ring-2 ring-background',
                      isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                    )}
                  />
                )
              })()}
            </div>

            <div className='flex min-w-0 flex-col'>
              <span className='block truncate text-sm leading-normal font-bold text-foreground'>
                {selectedTarget.name}
              </span>
              {(() => {
                if (typingUsers && typingUsers.length > 0) {
                  const isRecording = typingUsers.some(
                    (u) => u.status === 'recording'
                  )
                  return (
                    <div className='mt-0.5 flex items-center gap-1.5 select-none'>
                      {isRecording ? (
                        <span className='flex animate-pulse items-center gap-1 text-[11px] leading-none font-bold text-red-500'>
                          <Mic className='h-3 w-3 shrink-0 animate-pulse' />
                          {typingUsers.length === 1
                            ? `${typingUsers[0].userName} is recording audio...`
                            : `${typingUsers[0].userName} and others are recording audio...`}
                        </span>
                      ) : (
                        <span className='flex animate-pulse items-center gap-1 text-[11px] leading-none font-bold text-emerald-500'>
                          <span className='h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-emerald-500' />
                          {typingUsers.length === 1
                            ? `${typingUsers[0].userName} is typing...`
                            : `${typingUsers[0].userName} and others are typing...`}
                        </span>
                      )}
                    </div>
                  )
                }

                if (selectedTarget.type !== 'direct') {
                  const totalMembers = selectedTarget.members?.length || 0
                  const onlineCount =
                    selectedTarget.members?.filter((m) =>
                      onlineUserIds?.has(m.id)
                    ).length || 0
                  return (
                    <div className='mt-0.5 flex items-center gap-2 select-none'>
                      <span className='text-[10px] leading-none font-semibold text-muted-foreground'>
                        {totalMembers}{' '}
                        {totalMembers === 1 ? 'Member' : 'Members'} •{' '}
                        {onlineCount} Online
                      </span>
                      <div className='flex shrink-0 items-center -space-x-1.5'>
                        {selectedTarget.members?.slice(0, 3).map((m, idx) => (
                          <Avatar
                            key={m.id || idx}
                            className='h-4.5 w-4.5 shrink-0 rounded-full border border-background shadow-xs ring-1 ring-border/10'
                          >
                            <AvatarImage
                              src={m.avatar_url || undefined}
                              alt={m.name}
                            />
                            <AvatarFallback className='flex items-center justify-center rounded-full bg-primary/20 text-[7px] font-black text-primary'>
                              {m.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(selectedTarget.members?.length || 0) > 3 && (
                          <div className='flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-background bg-muted text-[7px] font-black text-muted-foreground shadow-xs ring-1 ring-border/10'>
                            +{selectedTarget.members!.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                const recipient = selectedTarget.members?.find(
                  (m) => m.id !== currentUser?.accountNo
                )
                const isOnline = recipient
                  ? onlineUserIds?.has(recipient.id)
                  : false

                const formatLastSeen = (lastSeenStr?: string): string => {
                  if (!lastSeenStr) return 'Offline'
                  const date = new Date(lastSeenStr)
                  const now = new Date()

                  const isToday = date.toDateString() === now.toDateString()
                  const yesterday = new Date(now)
                  yesterday.setDate(now.getDate() - 1)
                  const isYesterday =
                    date.toDateString() === yesterday.toDateString()

                  const timeStr = date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  if (isToday) {
                    return `Last seen today at ${timeStr}`
                  } else if (isYesterday) {
                    return `Last seen yesterday at ${timeStr}`
                  } else {
                    const dateStr = date.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })
                    return `Last seen on ${dateStr} at ${timeStr}`
                  }
                }

                return (
                  <span
                    className={cn(
                      'block truncate text-[10px] leading-normal font-semibold',
                      isOnline ? 'text-emerald-500' : 'text-muted-foreground'
                    )}
                  >
                    {isOnline
                      ? ' Online'
                      : formatLastSeen(recipient?.last_seen)}
                  </span>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div className='flex shrink-0 items-center gap-1.5'>
          <Button
            size='icon'
            variant='ghost'
            onClick={() => setShowProfile(true)}
            className={cn(
              'hidden h-8.5 w-8.5 shrink-0 cursor-pointer rounded-full transition-colors hover:bg-muted sm:flex',
              showProfile
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title='View Details'
          >
            <Info className='h-4.5 w-4.5' />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-8.5 w-8.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <Phone className='h-4 w-4' />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-8.5 w-8.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <Video className='h-4 w-4' />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-8.5 w-8.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <MoreVertical className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area with custom layout templates based on media types */}
      <div
        ref={scrollContainerRef}
        onScroll={() => void handleMessagesScroll()}
        className='min-h-0 w-full flex-1 scrollbar-thin overflow-y-auto bg-muted/5 p-4'
      >
        <div className='space-y-4 pb-2'>
          {isLoadingOlder && (
            <div className='py-2 text-center text-xs text-muted-foreground'>
              Loading older messages…
            </div>
          )}
          {selectedTarget.type !== 'direct' && (
            <div className='animate-in fade-in my-2 flex w-full justify-center duration-200 select-none'>
              <div className='flex max-w-[90%] items-center justify-center gap-1.5 rounded-xl border border-amber-200/50 bg-amber-100/70 px-4 py-2 text-center text-[11px] leading-normal font-medium text-amber-800 shadow-xs dark:border-amber-900/20 dark:bg-amber-950/20 dark:text-amber-300'>
                <span>
                  🔒 Messages to this group are now secured with end-to-end
                  encryption. Tap for more info.
                </span>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className='py-20 text-center text-xs font-medium text-muted-foreground'>
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUser?.accountNo || ''}
                isGroup={selectedTarget.type !== 'direct'}
                onReact={handleReactToMessage}
                onDeleteForMe={handleDeleteMessageForMe}
                onDeleteForEveryone={handleDeleteMessageForEveryone}
                onReply={handleStartReply}
                onForward={handleStartForward}
                onEdit={handleEditMessage}
                onViewDocument={(url: string, name: string) => {
                  setPreviewDoc({ url, name })
                }}
                onOpenLocationOnMap={(loc, type) => {
                  setActiveMapLocation({
                    lat: loc.latitude,
                    lng: loc.longitude,
                    type,
                    address: loc.address,
                  })
                }}
              />
            ))
          )}

          {/* Typing & Voice Recording Indicator Bubble */}
          <TypingIndicator typingUsers={typingUsers} />

          {/* Typing Indicator */}
          {isTyping && typingUsers.length === 0 && (
            <div className='flex max-w-[75%] items-end gap-2.5'>
              <div className='flex items-center gap-1 rounded-2xl rounded-tl-none border border-border/50 bg-card px-4 py-3 shadow-xs'>
                <Loader2 className='h-3 w-3 animate-spin text-muted-foreground' />
                <span className='text-xs font-medium text-muted-foreground'>
                  typing...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD EXPERIENCE: floating progress indicators */}
      {uploads.length > 0 && (
        <div className='max-h-36 shrink-0 space-y-2 overflow-y-auto border-t border-border bg-muted/20 px-4 py-2.5'>
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className='flex flex-col gap-1.5 rounded-lg border border-border/60 bg-card p-2 shadow-xs'
            >
              <div className='flex items-center justify-between text-xs'>
                <span className='max-w-[70%] truncate font-semibold text-foreground'>
                  {upload.file.name}
                </span>
                <span className='font-medium text-muted-foreground'>
                  {upload.status === 'uploading' && `${upload.progress}%`}
                  {upload.status === 'success' && 'Uploaded'}
                  {upload.status === 'error' && 'Failed'}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Progress
                  value={upload.progress}
                  className='h-1.5 flex-1 bg-muted'
                />
                <div className='flex items-center gap-1'>
                  <Button
                    size='icon'
                    variant='ghost'
                    type='button'
                    className='h-6 w-6 cursor-pointer rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    onClick={() => cancelUpload(upload.id)}
                    title='Cancel upload'
                  >
                    <X className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {replyingTo && (
        <ReplyPreview
          message={replyingTo}
          onCancel={() => setReplyingTo(null)}
        />
      )}

      <form
        onSubmit={handleSend}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        className='pb-safe relative flex flex-none shrink-0 items-center gap-2.5 border-t border-border bg-muted/10 p-3'
      >
        <div className='relative flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-border bg-background px-3.5 py-1.5 shadow-xs'>
          {isRecording ? (
            /* MICROPHONE BUTTON: Recording active UI template (translucent glassmorphic visualizer) */
            <div
              style={{
                transform: `translateX(-${slideX}px)`,
                transition: 'transform 0.05s ease-out',
              }}
              className='relative flex h-full w-full min-w-0 flex-1 items-center justify-between rounded-full bg-sky-50/10 px-1.5 py-0.5 backdrop-blur-md transition-all duration-300 dark:bg-sky-950/10'
            >
              <div className='flex min-w-0 shrink-0 items-center gap-1.5'>
                <span className='h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]' />
                <span className='shrink-0 text-[11px] font-extrabold text-red-500 dark:text-red-400'>
                  Recording
                </span>
                <span className='shrink-0 font-mono text-[11px] font-bold text-muted-foreground/90 tabular-nums'>
                  {formatDuration(recordDuration)}
                </span>
              </div>

              {/* Premium Waveform Visualizer */}
              <div className='flex h-full flex-grow justify-center overflow-hidden px-2'>
                <AudioVisualizer stream={streamRef.current} />
              </div>

              {/* Slide to Cancel chevron guide */}
              <div
                className='flex shrink-0 items-center gap-1 transition-opacity select-none'
                style={{ opacity: Math.max(0.1, 1 - slideX / 60) }}
              >
                <ChevronLeft className='h-3 w-3 animate-pulse text-muted-foreground/80' />
                <span className='text-[10px] font-bold text-muted-foreground/90'>
                  Slide to cancel
                </span>
              </div>

              {/* Dynamic bin icon overlay as sliding occurs */}
              {slideX > 15 && (
                <div
                  className={cn(
                    'animate-in fade-in zoom-in-50 absolute top-1/2 left-1/3 flex -translate-y-1/2 items-center gap-1.5 transition-all duration-150',
                    slideX > 80
                      ? 'scale-125 font-black text-red-500'
                      : 'font-bold text-muted-foreground/60'
                  )}
                  style={{
                    transform: `translate3d(calc(-33% + ${slideX}px), -50%, 0)`,
                  }}
                >
                  <Trash2
                    className={cn(
                      'h-4 w-4 shrink-0',
                      slideX > 80 ? 'animate-bounce' : ''
                    )}
                  />
                  <span className='text-[9px] tracking-wider uppercase'>
                    {slideX > 80 ? 'Release to delete' : ''}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Default Text Input state */
            <>
              {/* EMOJI BUTTON: Radix Popover wrapper */}
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
                  <EmojiPicker onSelectEmoji={handleSelectEmoji} />
                </PopoverContent>
              </Popover>

              <input
                ref={inputRef}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder='Message'
                className='min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:border-0 focus:ring-0 focus:outline-none'
                disabled={isRecording}
              />

              {/* ATTACHMENT BUTTON: Shadcn Dropdown menu */}
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
                    <ImagePlus className='h-4 w-4' />
                    <span>Images</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => videoInputRef.current?.click()}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <VideoIcon className='h-4 w-4' />
                    <span>Videos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => docInputRef.current?.click()}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <FileText className='h-4 w-4' />
                    <span>Documents</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLocationClick()}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <MapPin className='h-4 w-4' />
                    <span>Location</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsImageConverterOpen(true)}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <FileType className='h-4 w-4' />
                    <span>Image Converter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDocConverterOpen(true)}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <RefreshCw className='h-4 w-4' />
                    <span>Doc Converter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleNativeDocScanner}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <ScanLine className='h-4 w-4 text-primary' />
                    <span>Doc Scanner</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDocumentScannerOpen(true)}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <Scan className='h-4 w-4' />
                    <span>Scan Document</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsTextExtractorOpen(true)}
                    className='cursor-pointer gap-2 font-semibold'
                  >
                    <FileText className='h-4 w-4 text-primary' />
                    <span>Extract Text</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* CAMERA BUTTON: Device capture selector */}
              <button
                type='button'
                onClick={handleCameraClick}
                className='shrink-0 cursor-pointer rounded-md p-0.5 hover:bg-muted focus:ring-1 focus:ring-ring focus:outline-none'
                aria-label='Take picture'
              >
                <Camera className='h-5 w-5 text-muted-foreground/80 transition-colors hover:text-foreground' />
              </button>
            </>
          )}
        </div>

        {/* Action Button: Send message text or hold to record voice note */}
        {inputText.trim() ? (
          <button
            type='submit'
            className='flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition-all duration-100 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 disabled:opacity-55'
            aria-label='Send message'
          >
            <Send className='h-4.5 w-4.5 translate-x-[1px]' />
          </button>
        ) : (
          /* MICROPHONE BUTTON: Hold to record, release to send automatically, drag/leave to discard */
          <button
            type='button'
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'flex h-10 w-10 shrink-0 cursor-pointer touch-none items-center justify-center rounded-full text-white shadow-md transition-all duration-200 select-none disabled:opacity-55',
              isRecording
                ? 'scale-125 animate-pulse bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:bg-red-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            )}
            aria-label='Record voice note'
          >
            <Mic className='h-4.5 w-4.5' />
          </button>
        )}
      </form>

      {/* Hidden file selector element hooks */}
      <input
        type='file'
        ref={imageInputRef}
        className='hidden'
        accept='.jpg,.jpeg,.png,.gif,.webp,.svg'
        onChange={(e) => handleFileSelect(e, 'images')}
      />
      <input
        type='file'
        ref={videoInputRef}
        className='hidden'
        accept='.mp4,.mov,.avi,.mkv,.webm'
        onChange={(e) => handleFileSelect(e, 'videos')}
      />
      <input
        type='file'
        ref={docInputRef}
        className='hidden'
        accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'
        onChange={(e) => handleFileSelect(e, 'documents')}
      />
      <input
        type='file'
        ref={cameraInputRef}
        className='hidden'
        accept='image/*'
        capture='environment'
        onChange={(e) => handleFileSelect(e, 'images')}
      />

      {/* Dynamic Dialog for Camera Live Preview */}
      <Dialog
        open={isCameraOpen}
        onOpenChange={(open) => {
          if (!open) closeCamera()
        }}
      >
        <DialogContent className='flex flex-col items-center gap-4 rounded-xl border border-border bg-background p-4 shadow-lg sm:max-w-md'>
          <div className='flex w-full items-center justify-between'>
            <h3 className='text-sm font-bold text-foreground'>Capture Photo</h3>
          </div>

          <div className='relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black'>
            <video
              ref={cameraVideoRef}
              className='h-full w-full scale-x-[-1] object-cover'
              playsInline
              muted
            />
          </div>

          <div className='flex w-full justify-end gap-3'>
            <Button
              variant='outline'
              onClick={closeCamera}
              className='h-9 rounded-xl text-xs font-bold'
            >
              Cancel
            </Button>
            <Button
              onClick={capturePhoto}
              className='h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700'
            >
              Capture & Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forward Message Dialog */}
      <Dialog open={isForwardDialogOpen} onOpenChange={setIsForwardDialogOpen}>
        <DialogContent className='rounded-2xl border border-border bg-background p-4 shadow-lg sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>
              Forward Message
            </DialogTitle>
          </DialogHeader>
          <div className='max-h-60 space-y-2 overflow-y-auto py-2'>
            {forwardConversations.length === 0 ? (
              <p className='py-4 text-center text-xs text-muted-foreground'>
                No active conversations found.
              </p>
            ) : (
              forwardConversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => toggleForwardTarget(convo.id)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-xl border border-border/40 p-2.5 transition-all hover:bg-muted/50',
                    selectedForwardTargets.includes(convo.id)
                      ? 'border-primary/30 bg-primary/5'
                      : ''
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={convo.image} />
                      <AvatarFallback className='text-[10px] font-bold'>
                        {getDisplayNameInitials(convo.name || 'Chat')}
                      </AvatarFallback>
                    </Avatar>
                    <span className='max-w-[200px] truncate text-xs font-bold'>
                      {convo.name || 'Direct Chat'}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-md border transition-all',
                      selectedForwardTargets.includes(convo.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {selectedForwardTargets.includes(convo.id) && (
                      <Check className='h-3 w-3' />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button
              variant='outline'
              onClick={() => setIsForwardDialogOpen(false)}
              className='h-9 rounded-xl text-xs font-bold'
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteForward}
              disabled={selectedForwardTargets.length === 0}
              className='h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700'
            >
              Forward ({selectedForwardTargets.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== LOCATION PICKER DIALOG - CORRECTLY PLACED HERE ========== */}
      <LocationPicker
        open={isLocationPickerOpen}
        onOpenChange={setIsLocationPickerOpen}
        onSendLocation={handleSendLocation}
        isLiveEnabled={true} // Enable live location sharing for both direct and group chats
      />

      {/* ========== IMAGE TO PDF CONVERTER DIALOG ========== */}
      <ImageConverterDialog
        open={isImageConverterOpen}
        onOpenChange={setIsImageConverterOpen}
        onConverted={handlePdfConverted}
      />

      {/* ========== DOCUMENT CONVERTER DIALOG ========== */}
      <DocConverterDialog
        open={isDocConverterOpen}
        onOpenChange={setIsDocConverterOpen}
        onConverted={handleDocConverted}
      />

      {/* ========== ENTERPRISE DOCUMENT SCANNER MODAL ========== */}
      <DocumentScannerModal
        isOpen={isDocumentScannerOpen}
        onClose={() => setIsDocumentScannerOpen(false)}
        onComplete={handleScannedPdfComplete}
      />

      {/* ========== OCR TEXT EXTRACTOR MODAL ========== */}
      <TextExtractorModal
        isOpen={isTextExtractorOpen}
        onClose={() => setIsTextExtractorOpen(false)}
        onComplete={handleOcrPdfComplete}
      />
    </div>
  )
}

export default ChatWindow
