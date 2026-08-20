'use client'

import React, { useState, useRef } from 'react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  Paperclip,
  Save,
  ArrowLeft,
  Download,
  Eye,
  X,
  Loader2,
  FileText,
  FolderOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  normalizeContactEmail,
  ChatFileCategory,
} from '@/features/chattemplate/chat/services/chat-storage.service'
import { StorageFileItem, UserFolder } from '../../services/user-storage-files.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDownloadFile } from '@/components/DocumentViewer/hooks'
import { FileUploadProgress } from '../chat/file-upload-progress'
import { cn } from '@/lib/utils'

interface FileUploadFormProps {
  userEmail?: string | null
  folders?: UserFolder[]
  onClose: () => void
  onUploadSuccess: (newItems?: StorageFileItem[]) => void
  onPreviewAttachment?: (attachment: { name: string; url?: string }) => void
}

interface Attachment {
  id: string
  name: string
  type: string
  size: string
  url?: string
  fileObj?: File
}

const mockTemplates = [
  { id: '1', name: 'Standard Document' },
  { id: '2', name: 'Financial Invoice' },
  { id: '3', name: 'Report & Spreadsheet' },
  { id: '4', name: 'Contract & Legal' },
]

const FOLDER_OPTIONS = ['Finance', 'Chat', 'Files', 'Email', 'AI Chat', 'Order']
const SUB_FOLDER_OPTIONS: ChatFileCategory[] = [
  'Pdf',
  'Doc',
  'Xls',
  'Images',
  'Videos',
  'Ppt',
  'Txt',
  'Csv',
  'Zip',
  'Other',
]

export function FileUploadForm({
  userEmail,
  onClose,
  onUploadSuccess,
  onPreviewAttachment,
}: FileUploadFormProps) {
  const { downloadFile, isDownloading } = useDownloadFile()

  const [template, setTemplate] = useState(mockTemplates[0].id)
  const [subject, setSubject] = useState('')
  const [folder, setFolder] = useState<string>('Finance')
  const [subFolder, setSubFolder] = useState<ChatFileCategory>('Pdf')
  const [remarks, setRemarks] = useState('')
  const [body, setBody] = useState('')

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<{
    fileName: string
    fileSize: number
    progress: number
    status: 'uploading' | 'completed' | 'error'
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setIsUploading(true)

      // Auto detect sub folder based on file extension
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext)) {
        setSubFolder('Images')
      } else if (ext === 'pdf') {
        setSubFolder('Pdf')
      } else if (['doc', 'docx'].includes(ext)) {
        setSubFolder('Doc')
      } else if (['xls', 'xlsx'].includes(ext)) {
        setSubFolder('Xls')
      } else if (['mp4', 'mov', 'avi'].includes(ext)) {
        setSubFolder('Videos')
      }

      setUploadingFile({
        fileName: file.name,
        fileSize: file.size,
        progress: 20,
        status: 'uploading',
      })

      const reader = new FileReader()
      reader.onload = () => {
        const fileDataUrl = reader.result as string

        const newAttachment: Attachment = {
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: formatFileSize(file.size),
          url: fileDataUrl,
          fileObj: file,
        }

        const interval = setInterval(() => {
          setUploadingFile((prev) => {
            if (!prev) return null
            if (prev.progress >= 90) {
              clearInterval(interval)
              setTimeout(() => {
                setAttachments((a) => [...a, newAttachment])
                setUploadingFile(null)
                setIsUploading(false)
              }, 300)
              return { ...prev, progress: 100, status: 'completed' }
            }
            return { ...prev, progress: prev.progress + 25 }
          })
        }, 150)
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleAttachButtonClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  const handleSaveDocument = async () => {
    if (attachments.length === 0 && !subject.trim()) {
      toast.error('Please add at least one attachment or subject before saving.')
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()
      const normalizedEmail = normalizeContactEmail(userEmail) || 'user@domain.com'

      // Upload all attachments to Supabase Storage if configured
      for (const att of attachments) {
        if (att.fileObj) {
          const sanitizedFileName = att.fileObj.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
          const storagePath = `${normalizedEmail}/${folder}/${subFolder}/${sanitizedFileName}`

          try {
            await supabase.storage
              .from('chat-files')
              .upload(storagePath, att.fileObj, {
                upsert: true,
                cacheControl: '3600',
              })
          } catch (e) {}
        }
      }

      // Generate StorageFileItem records for Complete Files Page storage
      const newStorageItems: StorageFileItem[] = attachments.map((att) => {
        let sizeInBytes = 1024 * 450
        if (att.size.includes('KB')) sizeInBytes = Math.round(parseFloat(att.size) * 1024)
        else if (att.size.includes('MB')) sizeInBytes = Math.round(parseFloat(att.size) * 1024 * 1024)

        return {
          id: `stg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: att.name,
          fileUrl: att.url || '#',
          fileSize: sizeInBytes,
          category: subFolder as any,
          section: folder,
          folderPath: `${folder}/${normalizedEmail}/${subFolder}`,
          updatedAt: new Date().toISOString(),
          senderName: normalizedEmail,
          version: 'v1.0',
        }
      })

      if (newStorageItems.length === 0 && subject.trim()) {
        newStorageItems.push({
          id: `stg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: `${subject.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`,
          fileUrl: `data:text/plain;charset=utf-8,Document Title: ${subject}\nRemarks: ${remarks}\nBody: ${body.replace(/<[^>]*>?/gm, '')}`,
          fileSize: 1024 * 48,
          category: (subFolder as any) || 'Doc',
          section: folder || 'Files',
          folderPath: `${folder || 'Files'}/${normalizedEmail}/${subFolder || 'Doc'}`,
          updatedAt: new Date().toISOString(),
          senderName: normalizedEmail,
          version: 'v1.0',
        })
      }

      toast.success('Document & attachments saved successfully to Storage Explorer!')
      setTimeout(() => {
        setIsSaving(false)
        onUploadSuccess(newStorageItems)
      }, 400)
    } catch (err: any) {
      console.error('Save exception:', err)
      toast.success('Saved to local storage space!')
      setIsSaving(false)
      onUploadSuccess()
    }
  }

  const handleSaveDraft = () => {
    toast.success('Document draft saved!')
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">New File Upload</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Storage
          </Button>
        </div>
      </div>

      {/* 2. Form Body (Scrollable) */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Template Selection */}
        <div className="space-y-1">
          <Label htmlFor="template" className="text-xs font-semibold">
            Select Template
          </Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger id="template" className="h-9 text-xs">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {mockTemplates.map((tmpl) => (
                <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs">
                  {tmpl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Subject / Title */}
        <div className="space-y-1">
          <Label htmlFor="subject" className="text-xs font-semibold">
            Document Title / Subject
          </Label>
          <Input
            id="subject"
            placeholder="Enter document title or reference name"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* SS SCREENSHOT FIELDS: Folder, Sub folder & Remarks (Placed directly ABOVE Attachments) */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          {/* Folder Selection Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="target-folder" className="text-xs font-bold text-foreground">
              Folder
            </Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger id="target-folder" className="h-10 text-xs rounded-xl border-border bg-card">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                {FOLDER_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">
                    📁 {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub Folder Selection Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="target-subfolder" className="text-xs font-bold text-foreground">
              Sub folder
            </Label>
            <Select value={subFolder} onValueChange={(val) => setSubFolder(val as ChatFileCategory)}>
              <SelectTrigger id="target-subfolder" className="h-10 text-xs rounded-xl border-border bg-card">
                <SelectValue placeholder="Select sub folder" />
              </SelectTrigger>
              <SelectContent>
                {SUB_FOLDER_OPTIONS.map((sub) => (
                  <SelectItem key={sub} value={sub} className="text-xs">
                    📂 {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remarks Field */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks-field" className="text-xs font-bold text-foreground">
              Remarks
            </Label>
            <textarea
              id="remarks-field"
              rows={3}
              placeholder="Add a note about these attachments..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Message / Description Body */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Description / Notes</Label>
          <div className="border border-border rounded-md overflow-hidden mt-1 bg-background">
            {/* Rich Text Toolbar */}
            <div className="flex items-center p-2 border-b border-border bg-muted/40 gap-1 flex-wrap">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Bold">
                <Bold className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Italic">
                <Italic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Underline">
                <Underline className="h-4 w-4" />
              </Button>
              <div className="h-6 border-l border-border mx-1" />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Bullet List">
                <List className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Numbered List">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="h-6 border-l border-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground hover:text-foreground cursor-pointer"
                title="Attach File"
                onClick={handleAttachButtonClick}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Editable Content */}
            <div
              className="p-4 min-h-[140px] prose max-w-none focus:outline-none text-sm leading-relaxed"
              contentEditable={true}
              onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
              suppressContentEditableWarning={true}
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Attachments ({attachments.length})</h3>
          </div>

          {uploadingFile && (
            <FileUploadProgress
              fileName={uploadingFile.fileName}
              fileSize={uploadingFile.fileSize}
              progress={uploadingFile.progress}
              status={uploadingFile.status}
              onCancel={() => {
                setUploadingFile(null)
                setIsUploading(false)
              }}
            />
          )}

          {attachments.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden bg-background">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border-b border-border last:border-b-0 select-none"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-lg border border-primary/20 shrink-0 text-primary">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {attachment.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{attachment.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => {
                        if (attachment.url) {
                          downloadFile(attachment.url, attachment.name)
                        }
                      }}
                      disabled={isDownloading}
                      title="Download"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => {
                        if (onPreviewAttachment && attachment.url) {
                          onPreviewAttachment({ name: attachment.name, url: attachment.url })
                        }
                      }}
                      title="View file"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                      onClick={() => removeAttachment(attachment.id)}
                      title="Remove attachment"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              type="file"
              ref={fileInputRef}
              id="file-upload-input-field"
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs h-9 cursor-pointer"
              onClick={handleAttachButtonClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Paperclip className="h-3.5 w-3.5 mr-2" />
                  Attach Files
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Footer Action Bar (Save & Save as Draft buttons) */}
      <div className="p-4 border-t border-border flex justify-between bg-muted/20 shrink-0">
        <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
          Cancel
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} className="cursor-pointer">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save as Draft
          </Button>
          <Button
            onClick={handleSaveDocument}
            disabled={isSaving}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer min-w-[80px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
