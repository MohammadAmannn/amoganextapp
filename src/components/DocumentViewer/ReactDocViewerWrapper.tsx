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
  return (
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
  )
}
export default ReactDocViewerWrapper
