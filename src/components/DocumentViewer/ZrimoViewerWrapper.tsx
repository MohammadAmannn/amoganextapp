'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Loader2, FileWarning, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDownloadFile } from './hooks'

interface ZrimoViewerWrapperProps {
  fileUrl: string
  fileName: string
}

export function ZrimoViewerWrapper({ fileUrl, fileName }: ZrimoViewerWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { downloadFile, isDownloading } = useDownloadFile()

  useEffect(() => {
    let viewerInstance: any = null
    let active = true

    async function initViewer() {
      try {
        setLoading(true)
        setError(false)

        const { createViewer } = await import('@zrimo/viewer')
        await import('@zrimo/viewer/styles.css')

        if (!active || !containerRef.current) return

        containerRef.current.innerHTML = ''
        viewerInstance = createViewer({
          container: containerRef.current,
          ui: true,
          fit: 'width',
        })

        // Fetch file as blob if string URL or data URL
        let source: any = fileUrl
        if (
          typeof fileUrl === 'string' &&
          (fileUrl.startsWith('http') || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:'))
        ) {
          try {
            const res = await fetch(fileUrl)
            if (res.ok) {
              source = await res.blob()
            }
          } catch (e) {
            console.warn('Fetch fallback for zrimo viewer:', e)
          }
        }

        if (!active) return
        await viewerInstance.load(source, { fileName })
        if (active) setLoading(false)
      } catch (err) {
        console.warn('Zrimo viewer load error:', err)
        if (active) {
          setError(true)
          setLoading(false)
        }
      }
    }

    initViewer()

    return () => {
      active = false
      if (viewerInstance) {
        try {
          viewerInstance.destroy()
        } catch (e) {}
      }
    }
  }, [fileUrl, fileName])

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center w-full h-full bg-background p-6">
        <div className="flex flex-col items-center justify-center text-center p-6 bg-card border border-border/60 rounded-xl shadow-xs max-w-sm w-full gap-3">
          <FileWarning className="h-8 w-8 text-amber-500" />
          <h4 className="text-xs font-bold text-foreground">Preview fallback</h4>
          <p className="text-[11px] text-muted-foreground">You can download or open the file to view it.</p>
          <div className="flex gap-2 w-full pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8 cursor-pointer"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" /> Open
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 text-xs h-8 cursor-pointer"
              onClick={() => downloadFile(fileUrl, fileName)}
              disabled={isDownloading}
            >
              <Download className="h-3 w-3 mr-1" /> Download
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-0 relative flex-1 bg-background overflow-hidden zrimo-viewer-wrapper flex flex-col">
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="mt-2 text-xs font-semibold text-muted-foreground">Loading @zrimo/viewer...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full flex-1 min-h-0 overflow-auto" />
    </div>
  )
}

export default ZrimoViewerWrapper
