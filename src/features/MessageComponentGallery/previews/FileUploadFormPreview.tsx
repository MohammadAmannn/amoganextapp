'use client'

import React, { useState } from 'react'
import { FileUploadForm } from '@/features/Message/components/files/file-upload-form'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'
import { toast } from 'sonner'

export function FileUploadFormPreview({ stateIndex = 0 }: { stateIndex?: number }) {
  const [activePreviewDoc, setActivePreviewDoc] = useState<{ name: string; url?: string } | null>(null)

  const handleClose = () => {
    toast.info('File upload form closed')
    setActivePreviewDoc(null)
  }

  const handleUploadSuccess = () => {
    toast.success('File uploaded successfully!')
    setActivePreviewDoc(null)
  }

  const handlePreviewAttachment = (attachment: { name: string; url?: string }) => {
    setActivePreviewDoc(attachment)
  }

  if (activePreviewDoc) {
    return (
      <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background border-0 p-0 m-0 overflow-hidden animate-in fade-in duration-200">
        <SafeDocumentPreview
          fileName={activePreviewDoc.name}
          fileUrl={activePreviewDoc.url}
          onClose={() => setActivePreviewDoc(null)}
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col bg-background p-0 m-0 overflow-y-auto font-sans select-none">
      <FileUploadForm
        userEmail="user@amoga.app"
        onClose={handleClose}
        onUploadSuccess={handleUploadSuccess}
        onPreviewAttachment={handlePreviewAttachment}
      />
    </div>
  )
}

export default FileUploadFormPreview
