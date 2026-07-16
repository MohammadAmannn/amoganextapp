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
import { Email } from "../data/emails"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EmailRecipient {
  name: string
  email: string
}

interface EmailViewProps {
  email: Email
  onBack: () => void
  onDelete: (id: string) => void
  onStartChat?: () => void
}

interface Attachment {
  id: string
  name: string
  type: string
  size: string
}

export function EmailView({ email, onBack, onDelete, onStartChat }: EmailViewProps) {
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
    setEmailBody(processedBody)
    
    setAttachments(
      email.attachments?.map((att) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: att.name,
        type: att.type,
        size: att.size,
      })) || []
    )
  }, [email])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)

      // Create array of file metadata
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
      }))

      // Simulate network delay for upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAttachments((prev) => [...prev, ...newFiles])
      setIsUploading(false)

      // Reset the input value so the same file can be selected again
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

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)
  }

  // Helper function to get a color based on name
  const getColorForName = (name: string) => {
    const colors = [
      "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
      "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200",
      "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
      "bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
      "bg-pink-200 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
      "bg-indigo-200 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
    ]

    // Simple hash function to get consistent color for a name
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Render avatar for a recipient
  const renderAvatar = (recipient: EmailRecipient, type?: string) => (
    <TooltipProvider key={recipient.email}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border border-background select-none cursor-pointer",
              getColorForName(recipient.name),
            )}
          >
            {getInitials(recipient.name)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{recipient.name}</p>
          <p className="text-xs text-muted-foreground">{recipient.email}</p>
          {type && <p className="text-xs font-medium text-primary mt-0.5">{type}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="p-4 border-b border-border bg-background/50 shrink-0">
        <div className="flex flex-col">
          {/* Back to Email button at the top right */}
          <div className="flex justify-end mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-xs hover:bg-muted cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Email
            </Button>
          </div>

          {/* Email header information - all left aligned */}
          <div className="flex flex-col mb-3">
            {/* Profile pictures row */}
            <div className="flex items-center mb-2 space-x-2">
              {/* Sender avatar */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border border-border select-none",
                  getColorForName(email.name)
                )}
              >
                {email.avatarInitials || getInitials(email.name)}
              </div>

              {/* CC recipients */}
              {email.cc && email.cc.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground mx-1">cc:</div>
                  <div className="flex -space-x-2">
                    {email.cc.map((recipient) => (
                      <div key={recipient.email} className="relative">
                        {renderAvatar(recipient, "CC")}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* BCC recipients */}
              {email.bcc && email.bcc.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground mx-1">bcc:</div>
                  <div className="flex -space-x-2">
                    {email.bcc.map((recipient) => (
                      <div key={recipient.email} className="relative">
                        {renderAvatar(recipient, "BCC")}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* From name */}
            <div className="flex items-center text-xs sm:text-sm">
              <span className="font-semibold text-muted-foreground mr-1.5">From:</span>
              <span className="font-bold text-foreground">{email.name}</span>
            </div>

            {/* From email */}
            <p className="text-xs text-muted-foreground">{email.email}</p>

            {/* Date time and action icons on the same row */}
            <div className="flex items-center justify-between mt-2 mb-1 flex-wrap gap-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="mr-1.5">to me</span>
                <span>
                  {formattedDate} - {relativeTime}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Mark as important">
                  <Flag className={cn("h-4 w-4", email.important ? "fill-destructive" : "")} />
                  <span className="sr-only">Important</span>
                </Button>

                <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500 hover:bg-amber-500/10" title="Action item">
                  <AlertTriangle className={cn("h-4 w-4", email.actionItem ? "fill-amber-500" : "")} />
                  <span className="sr-only">Action item</span>
                </Button>

                {onStartChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary hover:bg-primary/10 cursor-pointer"
                    onClick={onStartChat}
                    title="Chat about this email"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Chat</span>
                  </Button>
                )}

                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10" title="View as document">
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">View as document</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] bg-background border border-border">
                    <DropdownMenuItem className="cursor-pointer">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(email.id)} className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                className="h-8 w-8 text-foreground hover:text-foreground cursor-pointer"
                title="Attach File"
                onClick={handleAttachButtonClick}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor Content */}
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
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted w-10 h-10 flex items-center justify-center rounded-lg border border-border">
                      <span className="text-[10px] text-muted-foreground font-bold">{getFileTypeIcon(attachment.type)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{attachment.name}</p>
                      <p className="text-[10px] text-muted-foreground">{attachment.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAttachment(attachment.id)}
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
          <Button variant="outline" size="sm" className="flex-shrink-0 cursor-pointer">
            <Reply className="h-3.5 w-3.5 mr-1.5" />
            Reply
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 cursor-pointer">
            <ReplyAll className="h-3.5 w-3.5 mr-1.5" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 cursor-pointer">
            <Forward className="h-3.5 w-3.5 mr-1.5" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(email.id)}
            className="flex-shrink-0 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
