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
  FileCode,
  RotateCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReviewPanel } from './ReviewPanel'


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
    editedJson ? 'structured' : 'document'
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


  const isImage =
    fileUrl?.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i) ||
    fileUrl?.startsWith('data:image/')

  const isPdf =
    fileUrl?.match(/\.pdf(\?.*)?$/i) ||
    fileUrl?.startsWith('data:application/pdf')

  return (
    <div
      ref={containerRef}
      className={`w-full flex-1 flex flex-col bg-background overflow-hidden animate-in fade-in duration-200 ${
        isFullscreen ? 'fixed inset-0 z-[9999] bg-background' : 'h-full min-h-0'
      }`}
    >
      {/* Top Header Bar matched 1-to-1 to user's screenshot */}
      <div className="flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-2.5 select-none gap-3 z-10 shadow-2xs">
        {/* Left: Close Cross & Document Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              title="Close preview"
            >
              <X className="size-4" />
            </button>
          )}

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200/40 bg-indigo-500/10 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400">
            <FileText className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs sm:text-sm font-bold text-foreground">
              {cleanName}
            </p>
          </div>
        </div>

        {/* View Mode Toggle if JSON exists */}
        {editedJson && (
          <div className="hidden sm:flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('document')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'document'
                  ? 'bg-background text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Original Doc
            </button>
            <button
              type="button"
              onClick={() => setViewMode('structured')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'structured'
                  ? 'bg-background text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Voucher View
            </button>
          </div>
        )}

        {/* Right Toolbar Controls: Download | ZoomOut | ZoomIn | Rotate | Fullscreen */}
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
      <div className="flex-1 min-h-0 w-full overflow-auto bg-muted/20 flex flex-col items-center justify-center p-2 sm:p-4">
        {viewMode === 'structured' && editedJson ? (
          <div className="w-full h-full min-h-0">
            <ReviewPanel
              fileName={cleanName}
              fileUrl={fileUrl}
              editedJson={editedJson}
            />
          </div>
        ) : fileUrl ? (
          <div
            className="flex flex-col items-center justify-center transition-all duration-200 max-w-full max-h-full overflow-auto"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {isImage ? (
              /* Image document rendering */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt={cleanName}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-md border border-border/60 bg-background"
              />
            ) : isPdf ? (
              /* Binary PDF iframe rendering */
              <iframe
                src={fileUrl}
                title={cleanName}
                className="w-[85vw] max-w-4xl h-[78vh] rounded-xl border border-border/60 shadow-md bg-background"
              />
            ) : (
              /* Fallback document iframe / object rendering */
              <iframe
                src={fileUrl}
                title={cleanName}
                className="w-[85vw] max-w-4xl h-[78vh] rounded-xl border border-border/60 shadow-md bg-background"
              />
            )}
          </div>

        ) : editedJson ? (
          <div className="w-full h-full min-h-0">
            <ReviewPanel
              fileName={cleanName}
              fileUrl={fileUrl}
              editedJson={editedJson}
            />
          </div>
        ) : (
          /* Empty / No Document state */
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
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
