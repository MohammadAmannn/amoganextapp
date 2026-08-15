"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Paperclip,
  Save,
  Send,
  ArrowLeft,
  Download,
  Eye,
  X,
  Loader2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { FileUploadProgress } from "../chat/file-upload-progress"
import { useDownloadFile } from "@/components/DocumentViewer/hooks"

interface NewEmailProps {
  onCancel: () => void
  onSend: (emailData: any) => void
  onSaveDraft: (emailData: any) => void
  onPreviewAttachment?: (attachment: { name: string; url?: string }) => void
}

interface Attachment {
  id: string
  name: string
  type: string
  size: string
  url?: string
}

// Mock data for templates, email accounts, and contacts
const mockTemplates = [
  { id: "1", name: "Blank" },
  { id: "2", name: "Meeting Request" },
  { id: "3", name: "Weekly Update" },
  { id: "4", name: "Thank You" },
]

const mockEmailAccounts = [
  { id: "1", email: "user@example.com", name: "Main Account" },
  { id: "2", email: "work@example.com", name: "Work Account" },
  { id: "3", email: "personal@example.com", name: "Personal" },
]

const mockContacts = [
  { id: "1", email: "john.doe@example.com", name: "John Doe" },
  { id: "2", email: "jane.smith@example.com", name: "Jane Smith" },
  { id: "3", email: "alex.wilson@example.com", name: "Alex Wilson" },
  { id: "4", email: "sarah.johnson@example.com", name: "Sarah Johnson" },
  { id: "5", email: "mike.brown@example.com", name: "Mike Brown" },
]

export function NewEmail({ onCancel, onSend, onSaveDraft, onPreviewAttachment }: NewEmailProps) {
  const { downloadFile, isDownloading } = useDownloadFile()
  const [subject, setSubject] = useState("")
  const [from, setFrom] = useState("ask@morrai.com")
  const [toInput, setToInput] = useState("")
  const [ccInput, setCcInput] = useState("")
  const [bccInput, setBccInput] = useState("")
  const [template, setTemplate] = useState(mockTemplates[0].id)
  const [body, setBody] = useState("")
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: "1",
      name: "quarterly-report.pdf",
      type: "application/pdf",
      size: "2.4 MB",
    },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<{
    fileName: string
    fileSize: number
    progress: number
    status: 'uploading' | 'completed' | 'error'
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    const parseRecipients = (raw: string) => {
      return raw
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }

    const resolvedTo = parseRecipients(toInput)
    const resolvedCc = parseRecipients(ccInput)
    const resolvedBcc = parseRecipients(bccInput)

    if (resolvedTo.length === 0) {
      toast.error("Please specify at least one recipient in the 'To' field.")
      return
    }

    setIsSending(true)
    try {
      const formattedAttachments = attachments.map((att: any) => ({
        filename: att.name,
        contentType: att.type,
        content: att.url || "",
      }))

      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: resolvedTo,
          subject: subject || "(No Subject)",
          html: body || "",
          attachments: formattedAttachments,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Email sent successfully")
        
        const finalAttachments = Array.isArray(data.attachments) && data.attachments.length > 0
          ? data.attachments
          : attachments.map(att => ({
              id: att.id,
              name: att.name,
              type: att.type,
              size: att.size,
              url: att.url,
            }))

        onSend({
          from,
          to: resolvedTo,
          cc: resolvedCc,
          bcc: resolvedBcc,
          subject: subject || "(No Subject)",
          body: body || "",
          attachments: finalAttachments,
        })
      } else {
        toast.error(data.message || "Failed to send email")
      }
    } catch (err: any) {
      console.error("Error sending email:", err)
      toast.error("Failed to send email. Check credentials or connection.")
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = () => {
    const emailData = {
      subject,
      from,
      to: toInput,
      cc: ccInput,
      bcc: bccInput,
      body,
      template,
      attachments,
    }
    onSaveDraft(emailData)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setIsUploading(true)

      setUploadingFile({
        fileName: file.name,
        fileSize: file.size,
        progress: 15,
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
              }, 350)
              return { ...prev, progress: 100, status: 'completed' }
            }
            return { ...prev, progress: prev.progress + 25 }
          })
        }, 150)
      }
      reader.readAsDataURL(file)
      e.target.value = ""
    }
  }

  const handleAttachButtonClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  const getFileTypeIcon = (type: string) => {
    if (type.includes("pdf")) return "PDF"
    if (type.includes("image")) return "IMG"
    if (type.includes("word")) return "DOC"
    if (type.includes("excel") || type.includes("spreadsheet")) return "XLS"
    if (type.includes("presentation")) return "PPT"
    return "FILE"
  }



  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">New Message</h1>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs hover:bg-muted cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Message
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Template Selection */}
        <div className="space-y-1">
          <Label htmlFor="template" className="text-xs font-semibold">Select Template</Label>
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

        {/* Subject */}
        <div className="space-y-1">
          <Label htmlFor="subject" className="text-xs font-semibold">Subject</Label>
          <Input
            id="subject"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* From */}
        <div className="space-y-1">
          <Label htmlFor="from" className="text-xs font-semibold">From</Label>
          <Input
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="ask@morai.com"
            className="h-9 text-xs"
          />
        </div>

        {/* To */}
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="to" className="text-xs font-semibold">To</Label>
            <div className="flex space-x-2 text-xs">
              <button
                className={cn("text-primary hover:underline cursor-pointer select-none", showCc && "font-bold")}
                onClick={() => setShowCc(!showCc)}
              >
                Cc
              </button>
              <button
                className={cn("text-primary hover:underline cursor-pointer select-none", showBcc && "font-bold")}
                onClick={() => setShowBcc(!showBcc)}
              >
                Bcc
              </button>
            </div>
          </div>
          <Input
            id="to"
            placeholder="Recipient email address (e.g. recipient@example.com)"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Cc */}
        {showCc && (
          <div className="space-y-1">
            <Label htmlFor="cc" className="text-xs font-semibold">Cc</Label>
            <Input
              id="cc"
              placeholder="Cc recipients (comma separated)"
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        )}

        {/* Bcc */}
        {showBcc && (
          <div className="space-y-1">
            <Label htmlFor="bcc" className="text-xs font-semibold">Bcc</Label>
            <Input
              id="bcc"
              placeholder="Bcc recipients (comma separated)"
              value={bccInput}
              onChange={(e) => setBccInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        )}

        {/* Rich Text Editor */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Message</Label>
          <div className="border border-border rounded-md overflow-hidden mt-1 bg-background">
            {/* Toolbar */}
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
              <div className="h-6 border-l border-border mx-1"></div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Bullet List">
                <List className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Numbered List">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="h-6 border-l border-border mx-1"></div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Link">
                <Link className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Image">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground hover:text-foreground"
                title="Attach File"
                onClick={handleAttachButtonClick}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor Content */}
            <div
              className="p-4 min-h-[220px] prose max-w-none focus:outline-none text-sm leading-relaxed"
              contentEditable={true}
              onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
              suppressContentEditableWarning={true}
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center">
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
                <div key={attachment.id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0 select-none">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-lg border border-primary/20 shrink-0 text-primary">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{attachment.name}</p>
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
                      {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
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
              id="file-upload"
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

      <div className="p-4 border-t border-border flex justify-between bg-muted/20 shrink-0">
        <Button variant="outline" size="sm" onClick={onCancel} className="cursor-pointer">
          Cancel
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} className="cursor-pointer">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save as Draft
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending} 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer min-w-[80px]"
          >
            {isSending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
