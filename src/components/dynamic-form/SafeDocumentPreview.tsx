'use client'

import React, { useState, useRef } from 'react'
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  RotateCw,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { ReviewPanel } from './ReviewPanel'

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
}

export function SafeDocumentPreview({
  fileName = 'invoice.pdf',
  fileUrl,
  editedJson,
  onClose,
}: SafeDocumentPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'document' | 'structured'>(
    editedJson && !fileUrl ? 'structured' : 'document'
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const cleanName = fileName && !fileName.toLowerCase().includes('aman')
    ? fileName
    : 'Invoice_VCH_2026.pdf'

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 250))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {})
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
  }

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = cleanName
      link.click()
    }
  }

  return (
    <div
      ref={containerRef}
      className={`w-full flex-1 flex flex-col bg-background overflow-hidden animate-in fade-in duration-200 ${
        isFullscreen ? 'fixed inset-0 z-[9999] bg-background' : 'h-full min-h-0'
      }`}
    >
      {/* Top Header Bar matched 1-to-1 to chat template & screenshot */}
      <div className="flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none gap-3 z-10 shadow-2xs">
        {/* Left: Close Cross [X] & Document Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              title="Close document viewer"
            >
              <X className="size-4" />
            </button>
          )}

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200/40 bg-indigo-500/10 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400">
            <FileText className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs sm:text-sm font-bold text-foreground max-w-[120px] xs:max-w-[180px] sm:max-w-xs">
              {cleanName}
            </p>
          </div>
        </div>

        {/* View Mode Toggle if JSON exists */}
        {editedJson && fileUrl && (
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('document')}
              className={`px-2 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-all cursor-pointer ${
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
              className={`px-2 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'structured'
                  ? 'bg-background text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Voucher
            </button>
          </div>
        )}

        {/* Right Toolbar Controls: Download | Zoom controls | Fullscreen */}
        <div className="flex items-center gap-1 shrink-0">
          {fileUrl && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download file"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            >
              <Download className="size-4" />
            </button>
          )}

          {viewMode === 'document' && (
            <>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <ZoomOut className="size-4" />
              </button>

              <span className="hidden md:inline-block text-[11px] font-semibold text-muted-foreground w-10 text-center select-none">
                {zoom}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <ZoomIn className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleRotate}
                title="Rotate Document"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <RotateCw className="size-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Main Preview Content Body */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-muted/20 flex flex-col">
        {viewMode === 'structured' && editedJson ? (
          <div className="w-full h-full min-h-0 overflow-auto">
            <ReviewPanel
              fileName={cleanName}
              fileUrl={fileUrl}
              editedJson={editedJson}
            />
          </div>
        ) : fileUrl ? (
          <div
            className="w-full h-full min-h-0 flex-1 flex flex-col transition-all duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
            }}
          >
            <DocumentViewer
              fileUrl={fileUrl}
              fileName={cleanName}
              allowDownload={true}
              allowPrint={true}
              hideHeader={true}
            />
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

