'use client'

import React, { useState, useRef } from 'react'
import {
  Paperclip,
  Download,
  Eye,
  X,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

export interface AttachmentItem {
  id: string
  name: string
  size: string
  type: string // e.g. 'PDF', 'DOC', 'PNG', 'ZIP'
  url?: string
}

interface AttachmentCardUploaderProps {
  initialAttachments?: AttachmentItem[]
}

const DEFAULT_ATTACHMENTS: AttachmentItem[] = [
  {
    id: 'att-1',
    name: 'quarterly-report.pdf',
    size: '0 B',
    type: 'PDF',
  },
]

export function AttachmentCardUploader({
  initialAttachments = DEFAULT_ATTACHMENTS,
}: AttachmentCardUploaderProps) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments)
  const [uploadingFile, setUploadingFile] = useState<{
    name: string
    size: string
    type: string
    progress: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStartUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB'

    setUploadingFile({
      name: file.name,
      size: sizeMb,
      type: ext,
      progress: 10,
    })

    let currentProgress = 10
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        setTimeout(() => {
          const newAtt: AttachmentItem = {
            id: `att-${Date.now()}`,
            name: file.name,
            size: sizeMb,
            type: ext,
          }
          setAttachments((prev) => [...prev, newAtt])
          setUploadingFile(null)
          toast.success(`Attached "${file.name}" successfully!`)
        }, 400)
      } else {
        setUploadingFile((prev) => (prev ? { ...prev, progress: currentProgress } : null))
      }
    }, 300)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleStartUpload(file)
    }
  }

  const handleRemoveAttachment = (id: string, name: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id))
    toast.info(`Removed "${name}"`)
  }

  return (
    <div className='w-full flex flex-col space-y-3 font-sans select-none'>
      {/* Header */}
      <h3 className='text-sm font-semibold text-foreground'>
        Attachments ({attachments.length})
      </h3>

      {/* Attachments Group Container (Border-rounded container matching email view) */}
      {attachments.length > 0 && (
        <div className='border border-border rounded-lg overflow-hidden bg-background w-full'>
          {attachments.map((att) => (
            <div
              key={att.id}
              className='group flex items-center justify-between p-3 border-b border-border last:border-b-0 w-full transition-colors hover:bg-muted/20'
            >
              <div
                className='flex items-center space-x-3 cursor-pointer min-w-0'
                onClick={() => toast.info(`Previewing ${att.name}`)}
                title='View file preview'
              >
                <div className='bg-muted/80 w-10 h-10 flex items-center justify-center rounded-lg border border-border shrink-0'>
                  <span className='text-[10px] text-muted-foreground font-bold uppercase'>
                    {att.type}
                  </span>
                </div>
                <div className='flex flex-col min-w-0'>
                  <p className='text-xs font-semibold text-foreground hover:underline truncate'>
                    {att.name}
                  </p>
                  <p className='text-[10px] text-muted-foreground'>{att.size}</p>
                </div>
              </div>

              <div className='flex items-center space-x-1 shrink-0'>
                <button
                  type='button'
                  onClick={() => toast.success(`Downloading ${att.name}...`)}
                  className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer'
                  title='Download file'
                >
                  <Download className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => toast.info(`Previewing ${att.name}`)}
                  className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer'
                  title='View file'
                >
                  <Eye className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveAttachment(att.id, att.name)
                  }}
                  className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100'
                  title='Remove attachment'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Uploading Progress Container */}
      {uploadingFile && (
        <div className='rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2 shadow-2xs w-full'>
          <div className='flex items-center justify-between text-xs font-semibold text-foreground'>
            <div className='flex items-center gap-2 truncate'>
              <FileText className='h-4 w-4 text-primary shrink-0' />
              <span className='truncate'>{uploadingFile.name}</span>
            </div>
            <span className='text-primary shrink-0'>{uploadingFile.progress}%</span>
          </div>
          <div className='h-1.5 w-full rounded-full bg-muted/60 overflow-hidden'>
            <div
              className='h-full bg-primary rounded-full transition-all duration-300 ease-out'
              style={{ width: `${uploadingFile.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Attach Files Trigger Button */}
      <div className='w-full pt-1'>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          className='hidden'
        />

        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className='flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-all cursor-pointer shadow-2xs'
        >
          <Paperclip className='h-4 w-4 text-muted-foreground' />
          <span>Attach Files</span>
        </button>
      </div>
    </div>
  )
}
