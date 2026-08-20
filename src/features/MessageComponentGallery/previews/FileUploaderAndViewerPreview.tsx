'use client'

import React, { useState, useRef } from 'react'
import {
  Paperclip,
  Download,
  Eye,
  X,
  FileText,
  UploadCloud,
  Check,
  Copy,
  Save,
  Code2,
  FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useDownloadFile } from '@/components/DocumentViewer/hooks'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'

export interface AttachedFileItem {
  id: string
  name: string
  size: string
  type: string // e.g. 'PDF', 'DOC', 'PNG', 'ZIP', 'CSV'
  extension: string
  url: string
  timestamp: string
}

const DEFAULT_SAMPLE_ATTACHMENTS: AttachedFileItem[] = [
  {
    id: 'att-csv-1',
    name: 'bank-full.csv',
    size: '3.6 MB',
    type: 'FILE',
    extension: 'csv',
    url: 'data:text/csv;charset=utf-8,id,name,balance,department,status\n101,John Doe,75000,Finance,Active\n102,Jane Smith,88000,Operations,Active\n103,Alex Wong,62000,Sales,Pending',
    timestamp: 'Just now',
  },
  {
    id: 'att-doc-2',
    name: 'file-sample_1MB.docx',
    size: '1002.7 KB',
    type: 'DOC',
    extension: 'docx',
    url: 'data:text/plain;charset=utf-8,Sample Word Document Content:\n\n1. Executive Summary\nThis document outlines the project scope, financial projections, and deliverables.\n\n2. Key Objectives\n- Streamline message workflows\n- Integrate document viewer for PDF, DOCX, XLSX, and CSV files\n- Maintain UI/UX consistency across app templates.',
    timestamp: '2 mins ago',
  },
  {
    id: 'att-xls-3',
    name: 'report (1).xlsx',
    size: '16.5 KB',
    type: 'XLS',
    extension: 'xlsx',
    url: 'data:text/csv;charset=utf-8,Quarter,Revenue,Expenses,Net Profit\nQ1,$120000,$45000,$75000\nQ2,$145000,$50000,$95000\nQ3,$160000,$55000,$105000\nQ4,$190000,$60000,$130000',
    timestamp: '10 mins ago',
  },
  {
    id: 'att-pdf-4',
    name: 'report (21).pdf',
    size: '19.3 KB',
    type: 'PDF',
    extension: 'pdf',
    url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    timestamp: '15 mins ago',
  },
]

export function FileUploaderAndViewerPreview({ stateIndex = 0 }: { stateIndex?: number }) {
  const [attachments, setAttachments] = useState<AttachedFileItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [activePreviewFile, setActivePreviewFile] = useState<AttachedFileItem | null>(null)
  const [jsonViewOpen, setJsonViewOpen] = useState(stateIndex === 2)
  const [copiedJson, setCopiedJson] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { downloadFile } = useDownloadFile()

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Process uploaded files
  const processFiles = (files: FileList | File[]) => {
    const newItems: AttachedFileItem[] = Array.from(files).map((f, idx) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE'
      const formattedSize =
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(f.size / 1024).toFixed(1)} KB`

      return {
        id: `att-${Date.now()}-${idx}`,
        name: f.name,
        size: formattedSize,
        type: ext,
        extension: ext.toLowerCase(),
        url: URL.createObjectURL(f),
        timestamp: 'Just now',
      }
    })

    setAttachments((prev) => [...newItems, ...prev])
    toast.success(`Attached ${newItems.length} file(s) successfully!`)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  // Open DocumentViewer preview inline on the same right side window using SafeDocumentPreview
  const handleOpenPreview = (file: AttachedFileItem) => {
    setActivePreviewFile(file)
  }

  // Download attachment file
  const handleDownload = (file: AttachedFileItem) => {
    downloadFile(file.url, file.name)
    toast.info(`Downloading ${file.name}...`)
  }

  // Remove attachment card
  const handleRemove = (id: string, name: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
    toast.info(`Removed "${name}"`)
  }

  // Export JSON payload
  const handleSaveJson = () => {
    const jsonString = JSON.stringify(attachments, null, 2)
    navigator.clipboard.writeText(jsonString)
    setCopiedJson(true)
    toast.success('JSON attachment payload copied to clipboard!')
    setTimeout(() => setCopiedJson(false), 2000)
  }

  // ─── INLINE DOCUMENT VIEWER PREVIEW STATE (Screenshot 2 Standard) ───
  if (activePreviewFile) {
    return (
      <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background border-0 p-0 m-0 overflow-hidden animate-in fade-in duration-200">
        <SafeDocumentPreview
          fileName={activePreviewFile.name}
          fileUrl={activePreviewFile.url}
          onClose={() => setActivePreviewFile(null)}
        />
      </div>
    )
  }

  // ─── FILE UPLOADER & ATTACHMENTS VIEW (Screenshot 3 Standard) ───
  return (
    <div className="flex h-full w-full flex-col flex-1 min-h-0 overflow-y-auto bg-background p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-3xl mx-auto rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden flex flex-col space-y-4 p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Attachments ({attachments.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJsonViewOpen(!jsonViewOpen)}
              className="h-7 px-2.5 text-xs gap-1.5 border-border cursor-pointer hover:bg-muted"
            >
              <Code2 className="h-3.5 w-3.5 text-purple-500" />
              <span>{jsonViewOpen ? 'Hide JSON' : 'View JSON'}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSaveJson}
              disabled={attachments.length === 0}
              className="h-7 px-2.5 text-xs gap-1.5 bg-primary text-primary-foreground cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save JSON</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 cursor-pointer select-none',
            dragActive
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : 'border-border/80 bg-muted/10 hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="h-6 w-6 text-primary mb-1.5 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-semibold text-foreground">
            Click to upload or drag & drop files here
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Supports PDF, DOCX, XLSX, CSV, PNG, JPG (up to 25 MB)
          </p>
        </div>

        {/* JSON View */}
        {jsonViewOpen && (
          <div className="rounded-xl border border-border bg-zinc-950 p-3 shadow-inner space-y-2 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-800 pb-1.5">
              <span>Attachment Payload (JSON format)</span>
              <button
                type="button"
                onClick={handleSaveJson}
                className="text-xs text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40 scrollbar-thin p-1">
              <code>{JSON.stringify(attachments, null, 2)}</code>
            </pre>
          </div>
        )}

        {/* Attachment Card Group Container (Screenshot 3 Standard 1-to-1 Match) */}
        {attachments.length > 0 ? (
          <div className="border border-border rounded-xl overflow-hidden bg-background w-full shadow-2xs">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group flex items-center justify-between p-3 border-b border-border/80 last:border-b-0 w-full transition-colors hover:bg-muted/20"
              >
                {/* Left: Type Badge & Info */}
                <div
                  className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1"
                  onClick={() => handleOpenPreview(att)}
                  title="View file preview"
                >
                  <div className="bg-muted/80 w-10 h-10 flex items-center justify-center rounded-lg border border-border/60 shrink-0">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      {att.type}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-semibold text-foreground hover:underline truncate">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{att.size}</p>
                  </div>
                </div>

                {/* Right: Download, Eye & Clear Buttons */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(att)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(att)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(att.id, att.name)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Clear attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center border border-dashed rounded-xl bg-muted/10">
            <p className="text-xs text-muted-foreground">No files attached yet.</p>
          </div>
        )}

        {/* Attach Files Button (Screenshot 3 Standard 1-to-1 Match) */}
        <div className="w-full pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-all cursor-pointer shadow-2xs"
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span>Attach Files</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUploaderAndViewerPreview
