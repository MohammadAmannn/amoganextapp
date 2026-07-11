'use client'

import React from 'react'
import { DocumentViewer } from '../DocumentViewer/DocumentViewer'
import { useRouter } from 'next/navigation'

interface SecureDocumentClientPageProps {
  fileName: string
  fileUrl: string
  mimeType?: string
  messageId: string
}

export default function SecureDocumentClientPage({
  fileName,
  fileUrl,
  mimeType,
  messageId,
}: SecureDocumentClientPageProps) {
  const router = useRouter()

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <DocumentViewer
        fileUrl={fileUrl}
        fileName={fileName}
        mimeType={mimeType}
        onClose={() => router.push('/')}
        fullscreen={true}
        messageId={messageId}
      />
    </div>
  )
}
