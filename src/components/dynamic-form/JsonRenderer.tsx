'use client'

import React, { useState, memo } from 'react'
import { Copy, Check, Download, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface JsonRendererProps {
  data: any
  fileName?: string
  className?: string
}

export const JsonRenderer: React.FC<JsonRendererProps> = memo(({
  data,
  fileName = 'document-data.json',
  className,
}) => {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    toast.success('JSON copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('JSON downloaded successfully!')
  }

  return (
    <div className={cn('flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden', className)}>
      {/* JSON Viewer Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/20 px-4 py-3 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          JSON Payload Output
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
          >
            <Download className="size-3.5" />
            <span>Download JSON</span>
          </Button>
        </div>
      </div>

      {/* Code Block Container */}
      <div className="relative max-h-[500px] overflow-auto bg-slate-950 p-4 text-xs font-mono leading-relaxed text-slate-100 dark:bg-slate-950">
        <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
      </div>
    </div>
  )
})

JsonRenderer.displayName = 'JsonRenderer'
