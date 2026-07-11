import React, { useState } from 'react'
import { ExternalLink, Printer, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateSecureFileUrl } from '@/services/share.service'

interface DocumentViewerActionsProps {
  fileUrl: string
  allowPrint?: boolean
  messageId?: string
}

export function DocumentViewerActions({
  fileUrl,
  allowPrint = true,
  messageId,
}: DocumentViewerActionsProps) {
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    try {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = fileUrl
      document.body.appendChild(iframe)
      iframe.onload = () => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
      }
    } catch (e) {
      window.open(fileUrl, '_blank')
    }
  }

  const handleCopy = () => {
    let copyUrl = fileUrl
    if (messageId) {
      copyUrl = generateSecureFileUrl(messageId)
    } else if (typeof window !== 'undefined' && window.location.pathname.includes('/files/document/')) {
      copyUrl = window.location.href
    }
    navigator.clipboard.writeText(copyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5">
      {allowPrint && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePrint}
          className="h-8 text-xs font-bold gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
          title="Print document"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Print</span>
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="h-8 text-xs font-bold gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
        title="Copy file URL"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          const url = messageId ? generateSecureFileUrl(messageId) : fileUrl
          window.open(url, '_blank')
        }}
        className="h-8 text-xs font-bold gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
        title="Open in new tab"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Open</span>
      </Button>
    </div>
  )
}
export default DocumentViewerActions
