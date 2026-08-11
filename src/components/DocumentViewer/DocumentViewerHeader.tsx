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
      {/* Left: Avatar Circle + Title Info */}
      <div className="flex items-center min-w-0 flex-1 gap-3">
        {onBack && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Avatar Circle matching screenshot */}
        <div className="h-9 w-9 rounded-full bg-[#EAE5FF] text-[#7C5CFC] dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-[#DDD5FF] dark:border-purple-800/40 select-none shadow-2xs">
          {avatarInitials}
        </div>

        {/* File title matching screenshot */}
        <div className="flex items-center min-w-0 flex-1">
          <h2 className="text-xs sm:text-sm text-foreground truncate block font-bold" title={fileName}>
            {fileName}
          </h2>
        </div>
      </div>

      {/* Right: Three Dots Menu & Close button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              title="More options"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4.5 w-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 bg-popover text-popover-foreground border border-border shadow-md rounded-xl p-1.5"
          >
            <DropdownMenuItem
              onClick={() => toast.info('Reply option selected')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Reply className="h-4 w-4 text-muted-foreground" />
              <span>Reply</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toast.info('Forward option selected')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Forward className="h-4 w-4 text-muted-foreground" />
              <span>Forward</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toast.success('Added to favorites')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>Favorite</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toast.success('Document pinned')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Pin className="h-4 w-4 text-muted-foreground" />
              <span>Pin</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toast.info('Flagged for review')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span>Flag</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleArchive}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span>Archive</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleShare}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span>Share</span>
            </DropdownMenuItem>

            {allowDownload && (
              <DropdownMenuItem
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Download className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Download</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={handleDelete}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-destructive hover:text-destructive cursor-pointer rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Close viewer"
            aria-label="Close document viewer"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default DocumentViewerHeader

