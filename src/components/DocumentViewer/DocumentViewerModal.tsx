'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { DocumentViewer } from './DocumentViewer'
import { DocumentViewerProps } from './types'

interface DocumentViewerModalProps extends Omit<DocumentViewerProps, 'fullscreen'> {
  isOpen: boolean
  onClose: () => void
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  mimeType,
  extension,
  allowDownload = true,
  allowPrint = true,
}: DocumentViewerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent 
        showCloseButton={false} // Disable default absolute close button
        className="fixed top-[50%] left-[50%] z-50 flex flex-col w-full h-[100dvh] sm:h-[90vh] max-w-none sm:max-w-6xl translate-x-[-50%] translate-y-[-50%] p-0 gap-0 overflow-hidden bg-background border-none sm:border sm:rounded-xl shadow-2xl outline-none"
      >
        <DialogTitle className="sr-only">
          Document Viewer - {fileName}
        </DialogTitle>
        <DocumentViewer
          fileUrl={fileUrl}
          fileName={fileName}
          mimeType={mimeType}
          extension={extension}
          allowDownload={allowDownload}
          allowPrint={allowPrint}
          onClose={onClose}
          fullscreen={false}
        />
      </DialogContent>
    </Dialog>
  )
}

export default DocumentViewerModal
