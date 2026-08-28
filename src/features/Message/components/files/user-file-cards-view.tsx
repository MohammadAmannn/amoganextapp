'use client'

import React from 'react'
import { UserFileCardsView as DsUserFileCardsView } from '@amogads/ui'
import { StorageFileItem, UserFolder } from '../../services/user-storage-files.service'
import { useDownloadFile } from '@/components/DocumentViewer/hooks'
import { toast } from 'sonner'

export interface UserFileCardsViewProps {
  folder: UserFolder | null
  files: StorageFileItem[]
  onSelectFileForPreview: (file: StorageFileItem) => void
  onBack?: () => void
}

export function UserFileCardsView({
  folder,
  files,
  onSelectFileForPreview,
  onBack,
}: UserFileCardsViewProps) {
  const { downloadFile } = useDownloadFile()

  const handleDownload = (file: any) => {
    if (file.fileUrl) {
      downloadFile(file.fileUrl, file.fileName)
      toast.success(`Downloading ${file.fileName}...`)
    } else {
      toast.info('File download started')
    }
  }

  const handleCopyLink = (file: any) => {
    if (file.fileUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(file.fileUrl)
      toast.success('Public file link copied to clipboard!')
    } else {
      toast.info('Copied link')
    }
  }

  return (
    <DsUserFileCardsView
      folder={folder as any}
      files={files as any}
      onSelectFileForPreview={(file) => onSelectFileForPreview(file as any)}
      onDownloadFile={handleDownload}
      onCopyLink={handleCopyLink}
      onBack={onBack}
    />
  )
}
