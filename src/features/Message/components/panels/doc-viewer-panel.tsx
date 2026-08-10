'use client'

import React from 'react'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'

interface DocViewerPanelProps {
  onBack: () => void
  fileName?: string
}

export function DocViewerPanel({
  onBack,
  fileName = 'demo.pdf',
}: DocViewerPanelProps) {
  return (
    <SafeDocumentPreview
      fileName={fileName}
      fileUrl="/project.pdf"
      onClose={onBack}
    />
  )
}
