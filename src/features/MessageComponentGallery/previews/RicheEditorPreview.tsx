'use client'

import React, { useState, useEffect } from 'react'
import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap'
import { Content } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  Eye,
  Edit3,
  Download,
  Copy,
  FileCode,
  FileText,
  Check,
  ChevronDown,
  Lock,
  Unlock,
} from 'lucide-react'

const DEFAULT_DOC_TITLE = 'Rich Text Editor Features Demo'

const INITIAL_HTML_CONTENT = `
<h1>Next Tiptap - WYSIWYG Rich Text Editor</h1>
<p>A modern, customizable WYSIWYG editor built with <strong>Next.js</strong>, <strong>TipTap v2</strong>, and <strong>Tailwind CSS</strong>.</p>
<hr />
<h2>Key Features</h2>
<ul>
  <li><strong>Rich Formatting:</strong> Headings (H1–H6), Bold, Italic, Underline, Strikethrough, Highlight color, and Inline code.</li>
  <li><strong>Lists & Layouts:</strong> Bulleted lists, numbered lists, task checklists, blockquotes, and tables.</li>
  <li><strong>Links & Media:</strong> Interactive bubble menus for editing hyperlinks and image embeds.</li>
  <li><strong>Code Blocks:</strong> Syntax highlighted code blocks for developer-friendly documentation.</li>
  <li><strong>Export Support:</strong> Export directly to <code>.doc</code> (Word Document), <code>.html</code>, or <code>.json</code> formats.</li>
</ul>
<blockquote>
  "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra
</blockquote>
<pre><code>// Example Code Block
function greetUser(name: string) {
  console.log(\`Hello, \${name}! Welcome to Next Tiptap.\`)
}
greetUser('Developer')</code></pre>
`

export function RichEditorPreview() {
  const [docTitle, setDocTitle] = useState(DEFAULT_DOC_TITLE)
  const [isEditable, setIsEditable] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [content, setContent] = useState<Content>(INITIAL_HTML_CONTENT)
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  // 1. Export as .DOC (Word Document) - DEFAULT EXPORT
  const handleExportDOC = () => {
    const htmlContent = typeof content === 'string' ? content : ''
    const docHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; margin: 1in; }
    h1 { font-size: 22pt; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 6px; }
    h2 { font-size: 16pt; color: #1e293b; margin-top: 18px; }
    blockquote { border-left: 4px solid #6366f1; margin: 12px 0; padding-left: 12px; color: #475569; font-style: italic; }
    pre { background: #0f172a; color: #f8fafc; padding: 12px; font-family: 'Consolas', monospace; font-size: 9.5pt; border-radius: 6px; }
    ul, ol { margin-left: 20px; }
    code { font-family: 'Consolas', monospace; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${docTitle}</h1>
  ${htmlContent}
</body>
</html>`

    const blob = new Blob([docHTML], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.doc`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as Word (.doc) Document!')
  }

  // 2. Export as .HTML file download
  const handleExportHTMLFile = () => {
    const htmlString = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 1rem; color: #475569; font-style: italic; }
    pre { background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${docTitle}</h1>
  ${typeof content === 'string' ? content : ''}
</body>
</html>`

    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as HTML (.html) File!')
  }

  // 3. Export as .JSON file download
  const handleExportJSONFile = () => {
    const jsonString = JSON.stringify({ title: docTitle, content }, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as JSON Schema!')
  }

  // 4. Copy HTML snippet to clipboard
  const handleCopyHTML = () => {
    const htmlString = typeof content === 'string' ? content : JSON.stringify(content)
    navigator.clipboard.writeText(htmlString)
    setCopiedFormat('html')
    toast.success('HTML copied to clipboard!')
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  // 5. Copy Plain Text to clipboard
  const handleCopyText = () => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = typeof content === 'string' ? content : ''
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    navigator.clipboard.writeText(plainText)
    setCopiedFormat('text')
    toast.success('Plain text copied to clipboard!')
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-4 md:p-6 overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="max-w-4xl w-full mx-auto space-y-5">
        {/* ─── Top Control Header Bar (Exact next-tiptap style) ────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Editable Toggle Switch */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                {isEditable ? (
                  <Unlock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                Editable
              </span>
              <Switch
                checked={isEditable}
                onCheckedChange={(checked) => {
                  setIsEditable(checked)
                  toast(checked ? 'Editor set to Editable' : 'Editor locked (Read-only)')
                }}
                className="cursor-pointer data-[state=checked]:bg-indigo-600"
              />
            </div>

            {/* Right: Preview & Export Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Preview Mode Button */}
              <Button
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="h-9 px-4 rounded-full text-xs font-semibold gap-1.5 transition-all cursor-pointer shadow-2xs bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isPreviewMode ? (
                  <>
                    <Edit3 className="h-3.5 w-3.5" /> Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </>
                )}
              </Button>

              {/* Default Export Button (Word .DOC by default) with Dropdown */}
              <div className="flex items-center rounded-full border border-border/80 shadow-2xs overflow-hidden bg-background">
                <Button
                  size="sm"
                  onClick={handleExportDOC}
                  className="h-9 px-3.5 text-xs font-semibold gap-1.5 bg-background text-foreground hover:bg-muted border-r border-border/60 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Export (.DOC)</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-none"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={handleExportDOC} className="text-xs gap-2 cursor-pointer font-medium">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Export as .DOC (Word)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportHTMLFile} className="text-xs gap-2 cursor-pointer">
                      <FileCode className="h-3.5 w-3.5 text-sky-600" />
                      <span>Export as .HTML File</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJSONFile} className="text-xs gap-2 cursor-pointer">
                      <Download className="h-3.5 w-3.5 text-purple-600" />
                      <span>Export as .JSON Schema</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyHTML} className="text-xs gap-2 cursor-pointer">
                      {copiedFormat === 'html' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Copy HTML</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyText} className="text-xs gap-2 cursor-pointer">
                      {copiedFormat === 'text' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Copy Plain Text</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Title Input Field with Blue Accent Pill */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="h-3.5 w-1 rounded-full bg-indigo-600" />
              <span>Title</span>
            </div>
            <Input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title..."
              className="h-10 w-full rounded-xl border border-border/80 bg-background px-3.5 text-sm font-semibold text-foreground shadow-2xs focus-visible:ring-indigo-600"
            />
          </div>
        </div>

        {/* ─── Editor & Preview Window ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/80 bg-background shadow-xs overflow-hidden">
          {isPreviewMode ? (
            /* Rendered HTML Document Preview */
            <div className="p-6 text-sm leading-relaxed max-w-none">
              <div className="pb-3 mb-4 border-b border-border/60 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{docTitle}</h2>
                <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-200/50">
                  Preview Mode
                </span>
              </div>
              <div
                className="prose dark:prose-invert max-w-none space-y-3"
                dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}
              />
            </div>
          ) : (
            /* TipTap Editor Component */
            <MinimalTiptapEditor
              value={content}
              onChange={setContent}
              className="w-full min-h-[440px] border-0"
              editorContentClassName="p-5 text-sm leading-relaxed"
              placeholder="Write your rich content..."
              autofocus={false}
              editable={isEditable}
              injectCSS={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default RichEditorPreview
