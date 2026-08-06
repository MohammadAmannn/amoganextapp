import { ImageViewer } from './image-viewer'
import { VideoPlayer } from './video-player'
import { DocumentCard } from './document-card'
import { VoicePlayer } from './voice-player'

interface AttachmentRendererProps {
  messageType: 'image' | 'video' | 'document' | 'audio' | 'text'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  duration?: number
  onViewDocument?: (url: string, name: string) => void
  messageId?: string
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed' | null
}

export function AttachmentRenderer({
  messageType,
  fileUrl,
  fileName,
  fileSize,
  duration,
  onViewDocument,
  messageId,
  processingStatus,
}: AttachmentRendererProps) {
  if (!fileUrl) return null

  switch (messageType) {
    case 'image':
      return <ImageViewer fileUrl={fileUrl} fileName={fileName} />
    case 'video':
      return <VideoPlayer fileUrl={fileUrl} fileName={fileName} />
    case 'audio':
      return <VoicePlayer fileUrl={fileUrl} duration={duration} />
    case 'document':
      return (
        <DocumentCard
          fileUrl={fileUrl}
          fileName={fileName || 'Attachment'}
          fileSize={fileSize}
          onPreview={onViewDocument ? () => onViewDocument(fileUrl, fileName || 'Attachment') : undefined}
          messageId={messageId}
          processingStatus={processingStatus}
        />
      )
    default:
      return null
  }
}
export default AttachmentRenderer
