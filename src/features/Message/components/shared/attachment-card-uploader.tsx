 'use client'

import React, { useState, useRef } from 'react'
import {
  Paperclip,
  Download,
  Eye,
  X,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

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
    name: 'Q3-Update.pdf',
    size: '2.4 MB',
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

    // Simulate progress bar upload animation
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
    <div className='w-full flex flex-col space-y-4 select-none font-sans p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs'>
      <div className='space-y-4 w-full'>
        {/* Title Header */}
        <h3 className='text-sm font-bold text-foreground tracking-tight'>
          Attachments ({attachments.length})
        </h3>

        {/* Attachments List */}
        <div className='space-y-2.5 w-full'>
          {attachments.map((att) => (
            <div
              key={att.id}
              className='group flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs transition-all hover:border-primary/30 hover:shadow-sm w-full'
            >
              {/* Left: Type Badge & Info */}
              <div className='flex items-center gap-3.5 min-w-0'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground font-bold text-xs uppercase tracking-wider border border-border/40'>
                  {att.type}
                </div>
                <div className='flex flex-col min-w-0 space-y-0.5'>
                  <span className='text-sm font-semibold text-foreground truncate'>
                    {att.name}
                  </span>
                  <span className='text-xs text-muted-foreground/80 font-medium'>
                    {att.size}
                  </span>
                </div>
              </div>

              {/* Right Actions */}
              <div className='flex items-center gap-1 shrink-0'>
                <button
                  type='button'
                  onClick={() => toast.success(`Downloading ${att.name}...`)}
                  className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                  title='Download file'
                >
                  <Download className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => toast.info(`Previewing ${att.name}`)}
                  className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                  title='View file'
                >
                  <Eye className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => handleRemoveAttachment(att.id, att.name)}
                  className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100'
                  title='Remove attachment'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Uploading Progress Card */}
        {uploadingFile && (
          <div className='rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200 w-full'>
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
      </div>

      {/* Attach Files Button Trigger */}
      <div className='pt-2 w-full mt-auto'>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          className='hidden'
        />

        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className='flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border/80 bg-background py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/50 hover:border-primary/40 active:scale-[0.99] cursor-pointer shadow-2xs'
        >
          <Paperclip className='h-4.5 w-4.5 text-muted-foreground' />
          <span>Attach Files</span>
        </button>
      </div>
    </div>
  )
}
