'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { DocumentViewerProps } from './types'
import { DocumentViewerHeader } from './DocumentViewerHeader'
import { DocumentViewerActions } from './DocumentViewerActions'
import { getFileExtension, useDownloadFile } from './hooks'
import { Loader2, FileWarning, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ReactDocViewerWrapper = dynamic(
  () => import('./ReactDocViewerWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-grow w-full h-full flex-col items-center justify-center bg-background/50 py-24 min-h-0">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 mt-2 text-xs text-muted-foreground font-semibold">Loading document...</span>
      </div>
    ),
  }
)

export function DocumentViewer({
  fileUrl,
  fileName,
  mimeType,
  extension: propExtension,
  allowDownload = true,
  allowPrint = true,
  onClose,
  onBack,
  fullscreen = false,
  messageId,
}: DocumentViewerProps) {
  const extension = (propExtension || getFileExtension(fileName, fileUrl)).toLowerCase()
  const { downloadFile, isDownloading } = useDownloadFile()

  const [textContent, setTextContent] = useState<string | null>(null)
  const [textLoading, setTextLoading] = useState(false)
  const [textError, setTextError] = useState(false)

  // List of extensions supported by @cyntler/react-doc-viewer
  const viewerSupportedExtensions = [
    'pdf',
    'csv',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'bmp',
    'svg',
    'webp',
    'txt',
    // MS Office extensions rendered via Microsoft Viewer iframe
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
  ]

  const isTextBased = ['json', 'xml', 'html', 'md', 'css', 'js', 'ts'].includes(extension)
  const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(extension)
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(extension)

  useEffect(() => {
    if (isTextBased && fileUrl) {
      setTextLoading(true)
      setTextError(false)
      fetch(fileUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch file content')
          return res.text()
        })
        .then((text) => {
          setTextContent(text)
          setTextLoading(false)
        })
        .catch((err) => {
          console.error('Failed to preview text file content:', err)
          setTextError(true)
          setTextLoading(false)
        })
    } else {
      setTextContent(null)
    }
  }, [fileUrl, isTextBased])

  // Helper renderer for custom media and files
  const renderContent = () => {
    if (isVideo) {
      return (
        <div className="flex-grow flex items-center justify-center w-full h-full bg-zinc-950 p-4 min-h-0">
          <video
            src={fileUrl}
            controls
            playsInline
            className="max-w-full max-h-full rounded-lg object-contain shadow-lg"
          />
        </div>
      )
    }

    if (isAudio) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center w-full h-full bg-muted/10 p-8 min-h-0">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <p className="text-xs font-bold text-center text-foreground truncate">{fileName}</p>
            <audio src={fileUrl} controls className="w-full" />
          </div>
        </div>
      )
    }

    if (isTextBased) {
      if (textLoading) {
        return (
          <div className="flex-grow flex w-full h-full items-center justify-center bg-background/50 py-24 min-h-0">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-xs text-muted-foreground font-semibold">Loading text preview...</span>
          </div>
        )
      }

      if (textError) {
        return renderFallback()
      }

      return (
        <div className="flex-grow flex flex-col p-4 bg-muted/20 dark:bg-muted/10 overflow-hidden w-full h-full min-h-0">
          {extension === 'html' ? (
            <iframe
              srcDoc={textContent || ''}
              className="w-full h-full min-h-0 flex-grow bg-background border border-border rounded-lg"
              title={fileName}
            />
          ) : (
            <pre className="flex-1 p-4 bg-card border border-border/80 rounded-xl overflow-auto whitespace-pre-wrap break-all leading-relaxed min-h-0 font-mono text-xs text-foreground">
              <code>{textContent}</code>
            </pre>
          )}
        </div>
      )
    }

    if (viewerSupportedExtensions.includes(extension)) {
      const documents = [{ uri: fileUrl, fileName: fileName }]
      return (
        <div className="doc-viewer-wrapper flex-grow w-full h-full relative bg-background flex flex-col min-h-0">
          <ReactDocViewerWrapper documents={documents} />
        </div>
      )
    }

    return renderFallback()
  }

  const renderFallback = () => {
    return (
      <div className="flex-grow flex items-center justify-center w-full h-full bg-background/10 p-6 overflow-y-auto min-h-0">
        <div className="flex flex-col items-center justify-center text-center p-8 bg-card border border-border/50 rounded-xl shadow-xs max-w-md w-full gap-4 animate-in fade-in duration-200">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FileWarning className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">Preview Unavailable</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This file type ({extension.toUpperCase() || 'unknown'}) cannot be previewed in the browser. You can download the file to open it.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px] text-xs font-bold gap-1.5 h-9 cursor-pointer"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in New Tab
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 min-w-[120px] text-xs font-bold gap-1.5 h-9 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => downloadFile(fileUrl, fileName)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex w-full flex-col bg-card border-0 sm:border border-border rounded-none sm:rounded-xl shadow-xs overflow-hidden flex-grow flex-1 min-h-0 ${
        fullscreen ? 'h-[100dvh]' : 'h-full'
      }`}
    >
      <DocumentViewerHeader
        fileName={fileName}
        fileUrl={fileUrl}
        allowDownload={allowDownload}
        onClose={onClose}
        onBack={onBack}
        messageId={messageId}
      />
      <div className="flex-grow flex flex-col overflow-hidden bg-zinc-950/5 dark:bg-zinc-900/5 relative w-full min-h-0">
        {renderContent()}
      </div>
      <div className="flex justify-end p-2 bg-muted/10 border-t border-border select-none shrink-0">
        <DocumentViewerActions
          fileUrl={fileUrl}
          allowPrint={allowPrint && extension === 'pdf'}
          messageId={messageId}
        />
      </div>
    </div>
  )
}
export default DocumentViewer
