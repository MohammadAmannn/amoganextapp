import React from 'react'
import {
  Download,
  X,
  Loader2,
  ArrowLeft,
  MoreHorizontal,
  Reply,
  Forward,
  Star,
  Pin,
  Flag,
  Archive,
  Share2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDownloadFile } from './hooks'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { toast } from 'sonner'

export interface DocumentViewerHeaderProps {
  fileName: string
  fileUrl: string
  allowDownload?: boolean
  onClose?: () => void
  onBack?: () => void
  allowOpenInNewTab?: boolean
  messageId?: string
  avatarInitials?: string
  folderPath?: string
  timestamp?: string
  onArchive?: () => void
  onShare?: () => void
  onDelete?: () => void
}

export function DocumentViewerHeader({
  fileName,
  fileUrl,
  allowDownload = true,
  onClose,
  onBack,
  avatarInitials = 'M1',
  onArchive,
  onShare,
  onDelete,
}: DocumentViewerHeaderProps) {
  const { downloadFile, isDownloading } = useDownloadFile()

  const handleArchive = () => {
    if (onArchive) {
      onArchive()
    } else {
      toast.success('Document archived')
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      if (fileUrl) {
        navigator.clipboard?.writeText(fileUrl)
        toast.success('Share link copied to clipboard')
      } else {
        toast.success('Share options opened')
      }
    }
  }

  const handleDownload = () => {
    if (fileUrl) {
      downloadFile(fileUrl, fileName)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    } else {
      toast.success('Document deleted')
      if (onClose) onClose()
    }
  }

  return (
    <div className="flex flex-none items-center justify-between bg-card px-4 py-2.5 border-b border-border/80 shrink-0 select-none w-full gap-3 shadow-2xs">
      {/* Left: Close Cross (X) or Back + Avatar Circle + Title Info */}
      <div className="flex items-center min-w-0 flex-1 gap-2.5 sm:gap-3">
        {(onClose || onBack) && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose || onBack}
            className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Close viewer"
            aria-label="Close document viewer"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        )}

        {/* Avatar Circle matching screenshot */}
        <div className="h-9 w-9 rounded-full bg-[#EAE5FF] text-[#7C5CFC] dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-[#DDD5FF] dark:border-purple-800/40 select-none shadow-2xs">
          {avatarInitials}
        </div>

        {/* File title */}
        <div className="flex items-center min-w-0 flex-1">
          <h2 className="text-xs sm:text-sm text-foreground truncate block font-bold" title={fileName}>
            {fileName}
          </h2>
        </div>
      </div>

      {/* Right: HeaderActions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <HeaderActions
          onDelete={handleDelete}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      </div>
    </div>
  )
}

export default DocumentViewerHeader

