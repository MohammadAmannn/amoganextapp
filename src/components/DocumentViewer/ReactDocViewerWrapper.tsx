'use client'

import React from 'react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'

interface ReactDocViewerWrapperProps {
  documents: { uri: string; fileName: string; fileType?: string }[]
}

export function ReactDocViewerWrapper({
  documents,
}: ReactDocViewerWrapperProps) {
  const doc = documents[0]

  if (!doc || !doc.uri) return null

  const fileNameLower = (doc.fileName || '').toLowerCase()
  const uriLower = (doc.uri || '').toLowerCase()
  const extension = (doc.fileType || fileNameLower.split('.').pop() || '').toLowerCase()

  const isImage =
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(extension) ||
    uriLower.match(/\.(png|jpg|jpeg|webp|gif|svg|bmp)($|\?)/) ||
    uriLower.startsWith('data:image/')

  // Image files: Render <img> for 100% reliable mobile and desktop display
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

  // Universal canvas-backed renderer for PDFs, DOCX, XLSX, PPTX, CSV, TXT
  return (
    <div className="w-full h-full min-h-0 flex-1 relative overflow-hidden bg-background">
      <DocViewer
        documents={documents}
        pluginRenderers={DocViewerRenderers}
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

export default ReactDocViewerWrapper
