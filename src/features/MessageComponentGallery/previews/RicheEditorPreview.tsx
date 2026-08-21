'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap'
import { Content } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { FaDownload, FaArrowLeft, FaTwitter, FaLinkedin, FaFacebook, FaClock, FaCalendarDay } from 'react-icons/fa'
import { Eye, Edit3, Download } from 'lucide-react'

const DEFAULT_DOC_TITLE = 'Rich Text Editor Features Demo'
const AUTHOR = 'Mohd Aman'
const CREATED_AT = 'Aug 21, 2025'
const READING_TIME = 4

// Full rich content from rich/next-tiptap-3/src/mock.ts
const HTML_MOCK_CONTENT = `
<h2>Welcome to Rich Text Editor</h2>
<p>A modern rich text editor built with <strong>Tiptap</strong> and <strong>Radix UI</strong>. Supports text formatting, media embedding, and advanced content structures.</p>

<h2>Text Formatting</h2>
<p>Supports various text styles: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p>
<p>Also supports <sub>subscript</sub> and <sup>superscript</sup>.</p>

<h2>Text Styling</h2>
<p>Customize with <span style="color: rgb(255, 0, 0)">custom colors</span> and <span style="background-color: rgb(255, 255, 0)">background highlights</span> to emphasize important content.</p>
<p>You can combine both: <span style="background-color: rgb(59, 130, 246); color: rgb(255, 255, 255); padding: 2px 6px; border-radius: 4px;">Blue background with white text</span> creates a tag-like appearance.</p>

<h2>Text Alignment</h2>
<p style="text-align: left">This paragraph is left-aligned, the default alignment for most text content.</p>
<p style="text-align: center">This paragraph is center-aligned, perfect for titles or important statements.</p>
<p style="text-align: right">This paragraph is right-aligned, often used for signatures or timestamps.</p>
<p style="text-align: justify">This paragraph uses justified alignment. When you have longer text content, justified alignment distributes the words evenly across the line width, creating clean edges on both sides.</p>

<h2>Headings Structure</h2>
<p>Supports heading levels from H1 to H6 for clear document hierarchy.</p>

<h2>Lists</h2>
<h3>Unordered Lists</h3>
<ul>
  <li><p>First item</p></li>
  <li><p>Second item with <strong>bold text</strong></p></li>
  <li>
    <p>Third item with nested list:</p>
    <ul>
      <li><p>Nested item 1</p></li>
      <li><p>Nested item 2 with <em>italic</em></p></li>
    </ul>
  </li>
</ul>
<h3>Ordered Lists</h3>
<ol>
  <li><p>Install dependencies</p></li>
  <li><p>Configure the editor</p></li>
  <li><p>Deploy your application</p></li>
</ol>

<h2>Blockquotes</h2>
<blockquote>
  <p>"The best way to predict the future is to invent it." <strong>- Alan Kay</strong></p>
</blockquote>

<h2>Code Blocks</h2>
<h3>TypeScript Example</h3>
<pre><code class="language-typescript">interface Post {
  id: string;
  title: string;
  html: string;
  readingTime: number;
}

function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 150));
}</code></pre>

<h2>Keyboard Shortcuts</h2>
<ul>
  <li><p><code>Ctrl/Cmd + B</code> - <strong>Bold</strong></p></li>
  <li><p><code>Ctrl/Cmd + I</code> - <em>Italic</em></p></li>
  <li><p><code>Ctrl/Cmd + U</code> - <u>Underline</u></p></li>
  <li><p><code>Ctrl/Cmd + Z</code> - Undo / <code>Ctrl/Cmd + Shift + Z</code> - Redo</p></li>
  <li><p>And more shortcuts for alignment, headings, lists...</p></li>
</ul>

<h2>Conclusion</h2>
<p>This editor provides a comprehensive set of features for creating rich, engaging content. Whether you're building a blog, documentation site, or content management system, it offers the flexibility and power you need.</p>
`

// ─── Reading Progress Bar ──────────────────────────────────────────────────────
function ReadingProgress({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onScroll = () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight - container.clientHeight
      if (scrollHeight <= 0) { setVisible(false); return }
      setVisible(true)
      setProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)))
    }

    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [containerRef])

  if (!visible) return null

  return (
    <div
      className="sticky top-0 left-0 h-1 bg-[#6366f1] z-50 transition-all duration-100"
      style={{ width: `${progress}%` }}
    />
  )
}

// ─── Table of Contents ─────────────────────────────────────────────────────────
interface TocItem { id: string; text: string; level: number }

function TableOfContents({ contentRef, activeId }: { contentRef: React.RefObject<HTMLDivElement | null>; activeId: string }) {
  const [items, setItems] = useState<TocItem[]>([])

  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    const headings = container.querySelectorAll('h2, h3')
    const result: TocItem[] = []
    headings.forEach((h, i) => {
      const id = h.id || `heading-${i}`
      h.id = id
      result.push({ id, text: h.textContent || '', level: parseInt(h.tagName[1]) })
    })
    setItems(result)
  }, [contentRef])

  if (!items.length) return null

  return (
    <div className="hidden lg:block order-3 min-w-[200px]">
      <div className="sticky top-6 max-h-[calc(100vh-180px)] overflow-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">On this page</h3>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`block hover:text-[#6366f1] transition-colors truncate ${
                  activeId === item.id ? 'text-[#6366f1] font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Post Preview Article ──────────────────────────────────────────────────────
function PostPreview({
  title,
  html,
  onBack,
  scrollContainerRef,
}: {
  title: string
  html: string
  onBack: () => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState('')

  // Track active heading via IntersectionObserver
  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const headings = container.querySelectorAll('h2, h3')
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 1 }
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [html])

  return (
    <div className="w-full min-h-full bg-background">
      {/* Reading Progress Bar */}
      <ReadingProgress containerRef={scrollContainerRef} />

      <article className="max-w-5xl mx-auto px-4 py-8">
        {/* Post Header */}
        <div className="max-w-2xl mx-auto mb-8">
          {/* Author row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-[#6366f1] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {AUTHOR.split(' ').map(w => w[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">By <u>{AUTHOR}</u></div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FaCalendarDay className="h-3.5 w-3.5" />
                  {CREATED_AT}
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                <span className="flex items-center gap-1">
                  <FaClock className="h-3.5 w-3.5" />
                  {READING_TIME} min read
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onBack}
              className="shrink-0 h-8 px-4 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-md cursor-pointer"
            >
              <Edit3 className="h-3 w-3 mr-1" /> Edit
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold leading-snug text-foreground">
            {title || 'Untitled Document'}
          </h1>
        </div>

        {/* 3-column grid: social | content | toc */}
        <div className="flex gap-8 items-start">
          {/* Social Sharing Sidebar */}
          <div className="hidden lg:flex flex-col items-center gap-3 sticky top-6 pt-2 shrink-0">
            <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#1877f2] hover:border-[#1877f2] transition-colors cursor-pointer">
              <FaFacebook className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#0a66c2] hover:border-[#0a66c2] transition-colors cursor-pointer">
              <FaLinkedin className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer">
              <FaTwitter className="h-4 w-4" />
            </button>
          </div>

          {/* Main Article Content */}
          <div
            ref={contentRef}
            className="flex-1 min-w-0 article-content prose dark:prose-invert prose-headings:scroll-m-20 max-w-none
              prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-foreground
              prose-h3:text-base prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-foreground
              prose-p:text-sm prose-p:leading-7 prose-p:text-foreground/90
              prose-li:text-sm prose-li:leading-7
              prose-blockquote:border-l-[3px] prose-blockquote:border-[#6366f1] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-foreground
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4
              prose-a:text-[#6366f1] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Table of Contents */}
          <TableOfContents contentRef={contentRef} activeId={activeId} />
        </div>
      </article>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function RichEditorPreview() {
  const [docTitle, setDocTitle] = useState(DEFAULT_DOC_TITLE)
  const [isEditable, setIsEditable] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [content, setContent] = useState<Content>(HTML_MOCK_CONTENT)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const effectiveTitle = docTitle.trim() || 'Untitled Document'
  const htmlContent = typeof content === 'string' ? content : ''

  const handleExportDOC = () => {
    const docHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>${effectiveTitle}</title>
<style>body{font-family:'Calibri',Arial,sans-serif;font-size:11pt;line-height:1.6;color:#1e293b;margin:1in;}h1{font-size:22pt;color:#0f172a;border-bottom:2px solid #6366f1;padding-bottom:6px;}h2{font-size:16pt;color:#1e293b;margin-top:18px;}blockquote{border-left:4px solid #6366f1;padding-left:12px;color:#475569;font-style:italic;}pre{background:#0f172a;color:#f8fafc;padding:12px;font-family:'Consolas',monospace;font-size:9.5pt;}code{font-family:'Consolas',monospace;background:#f1f5f9;padding:2px 4px;}</style>
</head><body><h1>${effectiveTitle}</h1>${htmlContent}</body></html>`

    const blob = new Blob([docHTML], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${effectiveTitle.toLowerCase().replace(/\s+/g, '-')}.doc`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded Word (.doc) document!')
  }

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full min-h-0 flex-1 flex flex-col bg-background overflow-y-auto"
    >
      {isPreviewMode ? (
        /* ── Full Post Preview Mode (like next-tiptap.vercel.app/post-csr) ── */
        <PostPreview
          title={effectiveTitle}
          html={htmlContent}
          onBack={() => setIsPreviewMode(false)}
          scrollContainerRef={scrollContainerRef}
        />
      ) : (
        /* ── Editor Mode ── */
        <div className="flex-1 flex flex-col p-4 md:p-6 font-sans select-none">
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Top Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-foreground">Editable</span>
                <Switch
                  checked={isEditable}
                  onCheckedChange={(checked) => {
                    setIsEditable(checked)
                    toast(checked ? 'Editor set to Editable' : 'Editor locked (Read-only)')
                  }}
                  className="cursor-pointer data-[state=checked]:bg-[#6366f1]"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => setIsPreviewMode(true)}
                  className="h-9 px-5 rounded-full text-xs font-semibold gap-1.5 bg-[#6366f1] text-white hover:bg-[#4f46e5] cursor-pointer shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportDOC}
                  className="h-9 px-4 rounded-full text-xs font-semibold gap-1.5 border border-border/80 bg-background text-foreground hover:bg-muted cursor-pointer shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Export</span>
                </Button>
              </div>
            </div>

            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="h-4 w-1 rounded-full bg-[#6366f1]" />
                <span>Title</span>
              </div>
              <Input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                disabled={!isEditable}
                placeholder="Enter post title..."
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-xs focus-visible:ring-[#6366f1] disabled:opacity-60 disabled:bg-muted/30"
              />
            </div>

            {/* Content Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="h-4 w-1 rounded-full bg-[#6366f1]" />
                <span>Content</span>
              </div>
              <div className="rounded-2xl border border-border bg-background shadow-xs">
                <MinimalTiptapEditor
                  value={content}
                  onChange={setContent}
                  className="w-full min-h-[420px] border-0"
                  editorContentClassName="p-5 text-sm leading-relaxed"
                  placeholder="Write your rich content..."
                  autofocus={false}
                  editable={isEditable}
                  injectCSS={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichEditorPreview
