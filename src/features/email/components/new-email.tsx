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
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface NewEmailProps {
  onCancel: () => void
  onSend: (emailData: any) => void
  onSaveDraft: (emailData: any) => void
}

interface Attachment {
  id: string
  name: string
  type: string
  size: string
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

export function NewEmail({ onCancel, onSend, onSaveDraft }: NewEmailProps) {
  const [subject, setSubject] = useState("")
  const [from, setFrom] = useState(mockEmailAccounts[0].id)
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState<string[]>([])
  const [bcc, setBcc] = useState<string[]>([])
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const emailData = {
      subject,
      from,
      to,
      cc,
      bcc,
      body,
      template,
      attachments,
    }
    onSend(emailData)
  }

  const handleSaveDraft = () => {
    const emailData = {
      subject,
      from,
      to,
      cc,
      bcc,
      body,
      template,
      attachments,
    }
    onSaveDraft(emailData)
  }

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

  // Helper function to render contact selection
  const renderContactSelection = (
    selectedContacts: string[],
    setSelectedContacts: (contacts: string[]) => void,
    placeholder: string,
  ) => {
    return (
      <div className="flex flex-wrap gap-2 items-center border rounded-md p-2 min-h-10">
        {selectedContacts.map((contactId) => {
          const contact = mockContacts.find((c) => c.id === contactId)
          if (!contact) return null

          return (
            <div
              key={contact.id}
              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
            >
              {contact.name}
              <button
                className="ml-2 text-blue-500 hover:text-blue-700 font-bold"
                onClick={() => setSelectedContacts(selectedContacts.filter((id) => id !== contact.id))}
              >
                ×
              </button>
            </div>
          )
        })}

        <Popover>
          <PopoverTrigger asChild>
            <button className="text-gray-500 hover:text-gray-700 text-xs cursor-pointer select-none">
              {selectedContacts.length === 0 ? placeholder : "Add more..."}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <div className="max-h-[300px] overflow-auto p-1 bg-background border rounded-lg shadow-md">
              {mockContacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                  <Checkbox
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts([...selectedContacts, contact.id])
                      } else {
                        setSelectedContacts(selectedContacts.filter((id) => id !== contact.id))
                      }
                    }}
                  />
                  <label htmlFor={`contact-${contact.id}`} className="text-xs cursor-pointer select-none flex-1">
                    {contact.name} <span className="text-muted-foreground">({contact.email})</span>
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">New Email</h1>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs hover:bg-muted cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Email
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
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger id="from" className="h-9 text-xs">
              <SelectValue placeholder="Select your email" />
            </SelectTrigger>
            <SelectContent>
              {mockEmailAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-xs">
                  {account.name} ({account.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {renderContactSelection(to, setTo, "Select recipients")}
        </div>

        {/* Cc */}
        {showCc && (
          <div className="space-y-1">
            <Label htmlFor="cc" className="text-xs font-semibold">Cc</Label>
            {renderContactSelection(cc, setCc, "Select Cc recipients")}
          </div>
        )}

        {/* Bcc */}
        {showBcc && (
          <div className="space-y-1">
            <Label htmlFor="bcc" className="text-xs font-semibold">Bcc</Label>
            {renderContactSelection(bcc, setBcc, "Select Bcc recipients")}
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
          <Button onClick={handleSend} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
