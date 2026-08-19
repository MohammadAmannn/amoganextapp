"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  Trash2,
  Reply,
  Forward,
  MessageSquare,
  MoreVertical,
  Download,
  Printer,
  Archive,
  Share2,
  Flag,
  AlertTriangle,
  ReplyAll,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  FileText,
  Paperclip,
  Eye,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Email } from "../../data/emails"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HeaderActions } from "../chat/header-actions"
import { cn } from "@/lib/utils"

interface EmailRecipient {
  name: string
  email: string
}

import { useDownloadFile } from "@/components/DocumentViewer/hooks"

interface EmailViewProps {
  email: Email
  onBack: () => void
  onDelete: (id: string) => void
  onStartChat?: () => void
  onPreviewAttachment?: (attachment: { name: string; url?: string }) => void
}

interface Attachment {
  id: string
  name: string
  type: string
  size: string
  url?: string
}

function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // 1. Remove script tags
    const scripts = doc.querySelectorAll('script')
    scripts.forEach(script => script.remove())

    // 2. Remove inline handlers & dangerous protocols
    const allElements = doc.querySelectorAll('*')
    allElements.forEach(el => {
      const attrs = el.attributes
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attrName = attrs[i].name.toLowerCase()
        if (attrName.startsWith('on')) {
          el.removeAttribute(attrs[i].name)
        }
      }
      const href = el.getAttribute('href')
      if (href && href.toLowerCase().trim().startsWith('javascript:')) {
        el.removeAttribute('href')
      }
    })

    return doc.body.innerHTML
  } catch (e) {
    console.error('HTML Sanitization error:', e)
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }
}

export function EmailView({ email, onBack, onDelete, onStartChat, onPreviewAttachment }: EmailViewProps) {
  const { downloadFile, isDownloading } = useDownloadFile()
  const [subject, setSubject] = useState(email.subject)
  const [emailBody, setEmailBody] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const emailDate = new Date(email.date)
  const formattedDate = format(emailDate, "MMM d, yyyy h:mm a")
  const relativeTime = formatDistanceToNow(emailDate, { addSuffix: true })

  // Process the email body and reset state when email changes
  useEffect(() => {
    setSubject(email.subject)
    let processedBody = email.body
    // Remove the h2 heading with "Weekly Team Updates"
    processedBody = processedBody.replace(/<h2>Weekly Team Updates<\/h2>/, "")
    setEmailBody(sanitizeHtml(processedBody))
    
    setAttachments(
      email.attachments?.map((att) => ({
        id: att.id || Math.random().toString(36).substring(2, 9),
        name: att.name,
        type: att.type,
        size: att.size,
        url: att.url,
      })) || []
    )
  }, [email])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)

      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
      }))

      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAttachments((prev) => [...prev, ...newFiles])
      setIsUploading(false)
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)
  }

  const getColorForName = (name: string) => {
    const colors = [
      "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
      "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200",
      "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
      "bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
      "bg-pink-200 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
      "bg-indigo-200 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
    ]

    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full flex-col bg-card overflow-y-auto rounded-none border-0 border-border shadow-xs md:relative md:z-auto sm:rounded-xl sm:border">
      <div className="px-4 py-3 border-b border-border bg-background/50 shrink-0">
        {/* Header Row: Back/Close + Avatar + From info on LEFT, HeaderActions on RIGHT */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-border shrink-0",
                getColorForName(email.name)
              )}
            >
              {email.avatarInitials || getInitials(email.name)}
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate">
                From: {email.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {email.email}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <HeaderActions
              onDelete={() => onDelete(email.id)}
              onDownload={() => downloadFile("mock-email.pdf", "application/pdf")}
            />
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Close"
              aria-label="Close email"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Second Row: CC, BCC, Date, and Action Icons */}
        <div className="flex flex-col mt-2">
          {/* CC recipients if any */}
          {email.cc && email.cc.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              <span className="font-medium">CC:</span>
              <span>{email.cc.map(c => c.name).join(', ')}</span>
            </div>
          )}
          
          {/* BCC recipients if any */}
          {email.bcc && email.bcc.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              <span className="font-medium">BCC:</span>
              <span>{email.bcc.map(c => c.name).join(', ')}</span>
            </div>
          )}
          
          {/* Date row */}
          <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="mr-1.5">to me</span>
              <span>
                {formattedDate} - {relativeTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component - Subject, Email Content, Attachments */}
      <div className="p-4 flex-1 space-y-4">
        {/* Editable subject text box */}
        <div className="space-y-1">
          <label htmlFor="subject" className="block text-xs font-semibold text-muted-foreground">
            Subject
          </label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="font-medium text-sm h-9"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">
            Email Content
          </label>
          <div className="border border-border rounded-lg overflow-hidden bg-background">
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
                className="h-8 w-8 text-foreground hover:text-foreground cursor-pointer"
                title="Attach File"
                onClick={handleAttachButtonClick}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            <div
              className="p-4 min-h-[200px] prose max-w-none focus:outline-none text-sm leading-relaxed"
              contentEditable={true}
              dangerouslySetInnerHTML={{ __html: emailBody }}
              onInput={(e) => setEmailBody((e.target as HTMLDivElement).innerHTML)}
              suppressContentEditableWarning={true}
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center">
            <h3 className="text-sm font-semibold">Attachments ({attachments.length})</h3>
            {isUploading && (
              <div className="ml-3 flex items-center text-primary text-xs font-semibold">
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden bg-background">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
                  <div
                    className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      if (onPreviewAttachment && attachment.url) {
                        onPreviewAttachment({ name: attachment.name, url: attachment.url })
                      }
                    }}
                    title="View file preview"
                  >
                    <div className="bg-muted w-10 h-10 flex items-center justify-center rounded-lg border border-border">
                      <span className="text-[10px] text-muted-foreground font-bold">{getFileTypeIcon(attachment.type)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground hover:underline">{attachment.name}</p>
                      <p className="text-[10px] text-muted-foreground">{attachment.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
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
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              type="file"
              ref={fileInputRef}
              id="email-view-file-upload"
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

      <div className="p-4 border-t border-border bg-muted/20 shrink-0">
        <div className="flex space-x-2 overflow-x-auto py-1">
          <Button variant="outline" size="sm" className="flex-shrink-0 cursor-pointer text-xs">
            <Reply className="h-3.5 w-3.5 mr-1.5" />
            Reply
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 cursor-pointer text-xs">
            <ReplyAll className="h-3.5 w-3.5 mr-1.5" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 cursor-pointer text-xs">
            <Forward className="h-3.5 w-3.5 mr-1.5" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(email.id)}
            className="flex-shrink-0 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive cursor-pointer text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}