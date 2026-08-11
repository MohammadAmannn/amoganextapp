export interface DocumentViewerProps {
  fileUrl: string
  fileName: string
  mimeType?: string
  extension?: string
  allowDownload?: boolean
  allowPrint?: boolean
  onClose?: () => void
  onBack?: () => void
  fullscreen?: boolean
  messageId?: string
  hideHeader?: boolean
  avatarInitials?: string
  folderPath?: string
  timestamp?: string
  onArchive?: () => void
  onShare?: () => void
  onDelete?: () => void
}

