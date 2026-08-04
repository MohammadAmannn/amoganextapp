'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { FileCode, FileText, X, Loader2, RefreshCw, FileCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface ConvertedDocResult {
  publicUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  storagePath: string
}

interface DocConverterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConverted: (result: ConvertedDocResult) => void
}

const SUPPORTED_TARGETS = [
  { label: 'PDF Document (.pdf)', value: 'pdf' },
  { label: 'Word Document (.docx)', value: 'docx' },
  { label: 'Excel Spreadsheet (.xlsx)', value: 'xlsx' },
  { label: 'Plain Text (.txt)', value: 'txt' },
  { label: 'PNG Image (.png)', value: 'png' },
]

export function DocConverterDialog({
  open,
  onOpenChange,
  onConverted,
}: DocConverterDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>('pdf')
  const [docName, setDocName] = useState<string>('')
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedFile(file)
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    setDocName(`${baseName}_converted`)
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setDocName('')
  }

  const handleConvertAndSend = async () => {
    if (!selectedFile) {
      toast.error('Please select a document to convert')
      return
    }

    setIsConverting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('targetFormat', targetFormat)

      if (docName.trim()) {
        formData.append('fileName', docName.trim())
      }

      const res = await fetch('/api/convert/doc', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert document')
      }

      toast.success(`Successfully converted document to ${targetFormat.toUpperCase()}!`)

      onConverted({
        publicUrl: data.publicUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType || 'application/octet-stream',
        storagePath: data.storagePath,
      })

      handleRemoveFile()
      onOpenChange(false)
    } catch (err) {
      console.error('Document conversion error:', err)
      toast.error(err instanceof Error ? err.message : 'Document conversion failed')
    } finally {
      setIsConverting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl border border-border bg-background p-5 shadow-2xl sm:max-w-lg'>
        <DialogHeader className='space-y-1.5 text-left'>
          <div className='flex items-center gap-2 text-emerald-600 dark:text-emerald-500'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20'>
              <RefreshCw className='h-5 w-5' />
            </div>
            <DialogTitle className='text-lg font-bold text-foreground'>
              Document Converter
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs text-muted-foreground'>
            Convert any document (PDF, Word, Excel, PowerPoint, Text) to your desired format and send it as a chat attachment.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* File input dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className='group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5'
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv'
              className='hidden'
              onChange={handleFileChange}
            />
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400'>
              <FileCode className='h-6 w-6' />
            </div>
            <p className='mt-2.5 text-xs font-bold text-foreground'>
              Click or drag document to upload
            </p>
            <p className='mt-1 text-[11px] text-muted-foreground'>
              Supports PDF, DOCX, XLSX, PPTX, TXT, CSV
            </p>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className='space-y-3 rounded-xl border border-border/60 bg-muted/40 p-3.5'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <FileText className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs font-bold text-foreground'>
                      {selectedFile.name}
                    </p>
                    <p className='text-[10px] text-muted-foreground'>
                      {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={handleRemoveFile}
                  className='rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                  title='Remove file'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>

              {/* Target Format Selector */}
              <div className='grid grid-cols-2 gap-3 pt-1'>
                <div className='space-y-1'>
                  <Label className='text-xs font-bold text-foreground'>
                    Convert To Format
                  </Label>
                  <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger className='h-9 rounded-xl text-xs font-medium'>
                      <SelectValue placeholder='Select format' />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TARGETS.map((t) => (
                        <SelectItem key={t.value} value={t.value} className='text-xs font-semibold'>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='doc-title' className='text-xs font-bold text-foreground'>
                    Output File Name
                  </Label>
                  <div className='relative flex items-center'>
                    <Input
                      id='doc-title'
                      type='text'
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder='Enter name'
                      className='h-9 rounded-xl text-xs pr-12 font-medium'
                    />
                    <span className='absolute right-2.5 text-[11px] font-bold text-muted-foreground select-none'>
                      .{targetFormat}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='flex items-center justify-end gap-2 pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isConverting}
            className='h-9 rounded-xl text-xs font-bold'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConvertAndSend}
            disabled={!selectedFile || isConverting}
            className='h-9 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 disabled:opacity-50'
          >
            {isConverting ? (
              <>
                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                Converting...
              </>
            ) : (
              <>
                <FileCheck className='mr-1.5 h-3.5 w-3.5' />
                Convert & Attach
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
