import React from 'react'
import { Eye, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { 
  getFileIconInfo, 
  getFileExtension, 
  useDownloadFile 
} from '../utils/file-helpers'
import { cn } from '@/lib/utils'

export interface FileCardProps {
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt?: string
  onPreview?: () => void
  onDownload?: () => void
  allowPreview?: boolean
  allowDownload?: boolean
  file?: {
    file_url?: string
    file_name?: string
    file_size?: number
    created_at?: string
  }
  className?: string
  messageId?: string
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed' | null
}

export function FileCard({ 
  fileUrl, 
  fileName, 
  fileSize, 
  createdAt, 
  onPreview,
  onDownload,
  allowPreview = true,
  allowDownload = true,
  file,
  className,
  messageId,
  processingStatus
}: FileCardProps) {
  const { downloadFile, isDownloading } = useDownloadFile()

  const resolvedUrl = fileUrl || file?.file_url || ''
  const resolvedName = fileName || file?.file_name || 'Document'
  const resolvedSize = fileSize !== undefined ? fileSize : file?.file_size
  const resolvedCreatedAt = createdAt || file?.created_at

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const fileExt = getFileExtension(resolvedName, resolvedUrl)
  const iconInfo = getFileIconInfo(fileExt)
  const Icon = iconInfo.icon

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreview) {
      onPreview()
    }
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDownload) {
      onDownload()
    } else {
      downloadFile(resolvedUrl, resolvedName)
    }
  }

  const handleRetryClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!messageId) return
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

  const renderProcessingStatus = () => {
    if (!processingStatus) return null
    
    if (processingStatus === 'pending' || processingStatus === 'processing') {
      return (
        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold leading-normal mt-0.5 flex items-center gap-1 select-none">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Parsing...
        </span>
      )
    }
    
    if (processingStatus === 'failed') {
      return (
        <span className="text-[10px] text-destructive font-semibold leading-normal mt-0.5 flex items-center gap-1 select-none">
          <AlertCircle className="h-2.5 w-2.5" />
          Parsing failed
        </span>
      )
    }
    
    if (processingStatus === 'completed') {
      return (
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-normal mt-0.5 select-none">
          Parsed
        </span>
      )
    }
    
    return null
  }

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-all duration-200 w-full min-w-0 select-none",
      className
    )}>
      {/* File icon */}
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
        iconInfo.colorClass
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* File info — takes remaining space, text truncated */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <span 
          className="text-xs font-bold text-foreground truncate" 
          title={resolvedName}
        >
          {resolvedName}
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold leading-normal mt-0.5 truncate">
          {resolvedSize ? formatBytes(resolvedSize) : 'Unknown size'} 
          {resolvedCreatedAt ? ` • ${formatDate(resolvedCreatedAt)}` : ` • ${fileExt.toUpperCase()}`}
        </span>
        {renderProcessingStatus()}
      </div>

      {/* Action icons — always visible, never clipped */}
      <div className="flex items-center gap-0.5 shrink-0">
        {resolvedUrl && allowPreview && onPreview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePreviewClick}
            aria-label="Preview"
            title="Preview"
            className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer shrink-0"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        )}
        {resolvedUrl && allowDownload && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            aria-label="Download"
            title="Download"
            className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
        {processingStatus === 'failed' && messageId && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRetryClick}
            aria-label="Retry parsing"
            title="Retry parsing"
            className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default FileCard
