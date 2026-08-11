'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createViewer } from '@zrimo/viewer'
import '@zrimo/viewer/styles.css'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'

interface ReactDocViewerWrapperProps {
  documents: { uri: string; fileName: string; fileType?: string }[]
}

const safeRenderers = DocViewerRenderers.filter(
  (r) => r.name !== 'MSDocRenderer' && r.name !== 'MSDocViewer'
)

function LocalWordViewer({ uri, fileName }: { uri: string; fileName: string }) {
  const [iframeError, setIframeError] = useState(false)

  // Use Google Docs Viewer iframe for 100% accurate full Word document rendering (text, tables, formatting, pages)
  const isPublicUrl = uri.startsWith('http://') || uri.startsWith('https://')

  if (isPublicUrl && !iframeError) {
    return (
      <div className="w-full h-full min-h-0 flex-1 relative overflow-hidden bg-background">
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(uri)}&embedded=true`}
          className="w-full h-full min-h-0 flex-1 border-0 rounded-none bg-background"
          title={fileName}
          onError={() => setIframeError(true)}
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-0 overflow-auto bg-muted/20 p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-background border border-border shadow-md rounded-xl p-8 text-foreground font-sans leading-relaxed text-center">
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            DOCX
          </div>
        </div>
        <h1 className="text-base font-bold text-foreground mb-1 truncate">{fileName}</h1>
        <p className="text-xs text-muted-foreground mb-5">Word Document ready for preview & download.</p>
        <a
          href={uri}
          download={fileName}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
        >
          Download Word File
        </a>
      </div>
    </div>
  )
}

export function ReactDocViewerWrapper({
  documents,
}: ReactDocViewerWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [useFallback, setUseFallback] = useState(false)
  const doc = documents[0]

  if (!doc || !doc.uri) return null

  const fileNameLower = (doc.fileName || '').toLowerCase()
  const uriLower = (doc.uri || '').toLowerCase()
  const extension = (doc.fileType || fileNameLower.split('.').pop() || '').toLowerCase()

  const isImage =
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(extension) ||
    uriLower.match(/\.(png|jpg|jpeg|webp|gif|svg|bmp)($|\?)/) ||
    uriLower.startsWith('data:image/')

  const isWord = extension === 'docx' || extension === 'doc' || fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc')

  useEffect(() => {
    if (isImage || isWord || useFallback || !doc?.uri || !containerRef.current) return

    let viewer: any = null
    let active = true

    async function loadWithZrimo() {
      try {
        if (!containerRef.current) return
        containerRef.current.innerHTML = ''

        // Initialize Zrimo Viewer engine
        viewer = createViewer()

        if (!active || !containerRef.current) return

        // Fetch file blob to pass to Zrimo WASM/JS adapters
        const res = await fetch(doc.uri)
        if (!res.ok) throw new Error('Fetch failed')
        const blob = await res.blob()
        const file = new File([blob], doc.fileName || 'document', { type: blob.type })

        if (active && containerRef.current) {
          await viewer.load({ file, fileName: doc.fileName })
        }
      } catch (err) {
        console.warn('@zrimo/viewer load fallback:', err)
        if (active) setUseFallback(true)
      }
    }

    loadWithZrimo()

    return () => {
      active = false
      if (viewer && typeof viewer.destroy === 'function') {
        viewer.destroy().catch(() => {})
      }
    }
  }, [doc?.uri, doc?.fileName, isImage, isWord, useFallback])

  // Image files: Direct <img> for 100% mobile and desktop rendering
  if (isImage) {
    return (
      <div className="w-full h-full min-h-0 flex-1 flex items-center justify-center bg-background overflow-auto p-4">
        <img
          src={doc.uri}
          alt={doc.fileName}
          className="max-w-full max-h-full object-contain shadow-xs rounded-md"
        />
      </div>
    )
  }

  // Word (.docx, .doc) files: Render local Word document viewer without Microsoft Word error popup
  if (isWord) {
    return <LocalWordViewer uri={doc.uri} fileName={doc.fileName} />
  }

  // Fallback renderer (with MSDocRenderer disabled)
  if (useFallback) {
    return (
      <div className="w-full h-full min-h-0 flex-1 relative overflow-hidden bg-background">
        <DocViewer
          documents={documents}
          pluginRenderers={safeRenderers}
          style={{ width: '100%', height: '100%' }}
          config={{
            header: {
              disableHeader: true,
              disableFileName: true,
            },
          }}
          theme={{
            disableThemeScrollbar: true,
          }}
        />
      </div>
    )
  }

  // Zrimo Document Viewer Container
  return (
    <div
      ref={containerRef}
      className="zrimo-viewer-wrapper w-full h-full min-h-0 flex-1 relative overflow-hidden bg-background"
    />
  )
}

export default ReactDocViewerWrapper
