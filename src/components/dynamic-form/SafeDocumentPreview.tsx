'use client'

import React, { useState, useRef } from 'react'
import {
  X,
  Download,
  Plus,
  Minus,
  ArrowLeftRight,
  Square,
  FileText,
  RotateCw,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { ReviewPanel } from './ReviewPanel'
import { DocumentViewerHeader } from '@/components/DocumentViewer/DocumentViewerHeader'
import { useDownloadFile } from '@/components/DocumentViewer/hooks'

const DocumentViewer = dynamic(
  () => import('@/components/DocumentViewer/DocumentViewer').then((m) => m.DocumentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full py-16">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="mt-3 text-xs font-semibold text-muted-foreground">Loading document viewer...</span>
      </div>
    ),
  }
)

interface SafeDocumentPreviewProps {
  fileName?: string
  fileUrl?: string
  editedJson?: any
  onClose?: () => void
  defaultViewMode?: 'document' | 'structured'
  showToggle?: boolean
  hideToggle?: boolean
}

export function SafeDocumentPreview({
  fileName = 'invoice.pdf',
  fileUrl,
  editedJson,
  onClose,
  defaultViewMode,
  showToggle = false,
  hideToggle = false,
}: SafeDocumentPreviewProps) {
  const [zoom, setZoom] = useState(105)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { downloadFile } = useDownloadFile()
  
  const initialMode = hideToggle
    ? 'document'
    : defaultViewMode
    ? defaultViewMode
    : 'document'

  const [viewMode, setViewMode] = useState<'document' | 'structured'>(initialMode)
  const containerRef = useRef<HTMLDivElement>(null)

  const cleanName = fileName || 'document.pdf'

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 250))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50))

  const handleDownload = () => {
    if (fileUrl) {
      downloadFile(fileUrl, cleanName)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`w-full flex-1 flex flex-col bg-background overflow-hidden animate-in fade-in duration-200 ${
        isFullscreen ? 'fixed inset-0 z-[9999] bg-background' : 'h-full min-h-0'
      }`}
    >
      {/* Top Header Bar matched 1-to-1 to user's screenshot */}
      <DocumentViewerHeader
        fileName={cleanName}
        fileUrl={fileUrl || ''}
        onClose={onClose}
        avatarInitials="M1"
      />

      {/* Sub-toolbar Controls Bar (Zoom, Fit, Page Navigation, View mode, Download) */}
      <div className="flex flex-none items-center justify-between border-b border-border bg-muted/10 px-4 py-1.5 select-none gap-2 z-10 flex-wrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <Minus className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="size-3.5" />
          </button>

          <span className="text-xs font-semibold text-foreground px-1 select-none min-w-[42px] text-center">
            {zoom}%
          </span>

          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Fit Width"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeftRight className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Page View"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <Square className="size-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle if AI voucher JSON exists and hideToggle is false */}
          {!hideToggle && editedJson && (
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('document')}
                className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'document'
                    ? 'bg-background text-primary shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Doc
              </button>
              <button
                type="button"
                onClick={() => setViewMode('structured')}
                className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'structured'
                    ? 'bg-background text-primary shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Voucher
              </button>
            </div>
          )}

          {fileUrl && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download file"
              className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <Download className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Content Body */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-background flex flex-col">
        {viewMode === 'structured' && editedJson ? (
          <div className="w-full h-full min-h-0 overflow-auto">
            <ReviewPanel
              fileName={cleanName}
              fileUrl={fileUrl}
              editedJson={editedJson}
            />
          </div>
        ) : fileUrl && fileUrl !== 'null' && fileUrl !== 'undefined' && fileUrl.trim() !== '' ? (
          <div className="w-full h-full min-h-0 flex-1 flex flex-col overflow-auto bg-background">
            <div
              className="w-full h-full flex-1 flex flex-col transition-transform duration-200"
              style={
                zoom !== 100
                  ? {
                      zoom: `${zoom}%`,
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top center',
                    }
                  : undefined
              }
            >
              <DocumentViewer
                key={`${cleanName}-${fileUrl}`}
                fileUrl={fileUrl}
                fileName={cleanName}
                allowDownload={true}
                allowPrint={true}
                hideHeader={true}
              />
            </div>
          </div>
        ) : editedJson ? (
          <div className="w-full h-full min-h-0 overflow-auto">
            <ReviewPanel
              fileName={cleanName}
              fileUrl={fileUrl}
              editedJson={editedJson}
            />
          </div>
        ) : (
          /* Empty / No Document state */
          <div className="flex flex-col items-center justify-center h-full w-full p-12 text-center text-muted-foreground">
            <FileText className="size-12 mb-3 opacity-30 text-indigo-500" />
            <p className="text-sm font-semibold text-foreground/80">Document preview ready</p>
            <p className="text-xs mt-1 max-w-xs text-muted-foreground">
              Select a voucher card or upload a file to view the document.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


