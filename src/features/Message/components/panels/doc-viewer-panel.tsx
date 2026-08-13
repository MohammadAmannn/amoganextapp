'use client'

import React from 'react'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'

interface DocViewerPanelProps {
  onBack: () => void
  fileName?: string
  fileUrl?: string
}

export function DocViewerPanel({
  onBack,
  fileName = 'document.pdf',
  fileUrl,
}: DocViewerPanelProps) {
  return (
    <SafeDocumentPreview
      fileName={fileName}
      fileUrl={fileUrl}
      onClose={onBack}
    />
  )
}
