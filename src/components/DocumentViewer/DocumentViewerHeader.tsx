import { Download, X, Loader2, ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDownloadFile } from './hooks'
import { generateSecureFileUrl } from '@/services/share.service'

interface DocumentViewerHeaderProps {
  fileName: string
  fileUrl: string
  allowDownload?: boolean
  onClose?: () => void
  onBack?: () => void
  allowOpenInNewTab?: boolean
  messageId?: string
}

export function DocumentViewerHeader({
  fileName,
  fileUrl,
  allowDownload = true,
  onClose,
  onBack,
  allowOpenInNewTab = true,
  messageId,
}: DocumentViewerHeaderProps) {
  const { downloadFile, isDownloading } = useDownloadFile()

  return (
    <div className="flex flex-none justify-between items-center bg-card p-4 border-b border-border shrink-0 select-none w-full gap-4">
      <div className="flex items-center min-w-0 flex-1 gap-2.5">
        {onBack && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="h-8.5 w-8.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Go back"
            aria-label="Go back to list"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
        )}
        <h2 className="text-sm font-bold text-foreground truncate block leading-normal pr-4" title={fileName}>
          {fileName}
        </h2>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {allowOpenInNewTab && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const url = messageId ? generateSecureFileUrl(messageId) : fileUrl
              window.open(url, '_blank')
            }}
            className="h-8.5 w-8.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Open in New Tab"
            aria-label="Open document in new tab"
          >
            <ExternalLink className="h-4.5 w-4.5" />
          </Button>
        )}
        {allowDownload && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => downloadFile(fileUrl, fileName)}
            className="h-8.5 w-8.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Download document"
            disabled={isDownloading}
            aria-label="Download document"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        )}
        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8.5 w-8.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
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
