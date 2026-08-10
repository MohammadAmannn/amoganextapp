'use client'

import React, { useState, memo, useMemo } from 'react'
import { Code, LayoutList, FileText, Download } from 'lucide-react'
import { flattenJsonToPairs } from './utils'
import { JsonRenderer } from './JsonRenderer'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { downloadFileFromUrl } from '@/utils/download'

// Dynamic import of @cyntler/react-doc-viewer — same pattern as chat template
const DynamicDocViewer = dynamic(
  () =>
    import('@cyntler/react-doc-viewer').then((mod) => {
      return function WrappedDocViewer({
        documents,
      }: {
        documents: { uri: string; fileName: string; fileType?: string }[]
      }) {
        return (
          <mod.default
            documents={documents}
            pluginRenderers={mod.DocViewerRenderers}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true,
                retainURLParams: false,
              },
              pdfZoom: {
                defaultZoom: 1,
                zoomJump: 0.1,
              },
              pdfVerticalScrollByDefault: true,
            }}
            style={{ width: '100%', height: '100%' }}
          />
        )
      }
    }),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Loading document…
    </div>
  )}
)

interface ReviewPanelProps {
  fileName?: string
  fileUrl?: string
  editedJson: any
  onBackToEdit?: () => void
}

// ─────────────────────────────────────────────
// Field Matches View
// ─────────────────────────────────────────────
function MatchesView({ data }: { data: any }) {
  const pairs = useMemo(() => {
    if (!data || typeof data !== 'object') return []
    return flattenJsonToPairs(data)
  }, [data])

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <LayoutList className="size-4 text-primary" />
        <h3 className="font-bold text-sm">Extracted Field Matches</h3>
        <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold">
          {pairs.length} fields
        </span>
      </div>
      <div className="grid gap-2">
        {pairs.map(({ key, value }) => (
          <div key={key} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
            <span className="text-[11px] font-bold text-muted-foreground min-w-[140px] uppercase tracking-wide flex-shrink-0 mt-0.5">{key}</span>
            <span className="text-xs text-foreground flex-1 break-words">{String(value ?? '')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getFileType(name: string) {
  return name.split('.').pop()?.toLowerCase()
}

// ─────────────────────────────────────────────
// ReviewPanel – Step 3
// ─────────────────────────────────────────────
export const ReviewPanel: React.FC<ReviewPanelProps> = memo(({
  fileName = 'Invoice_VCH_2026.pdf',
  fileUrl,
  editedJson,
}) => {
  const [view, setView] = useState<'invoice' | 'matches' | 'json'>('invoice')

  const cleanFileName = useMemo(() => {
    if (!fileName || fileName.toLowerCase().includes('aman')) {
      return 'Invoice_VCH_2026.pdf'
    }
    return fileName
  }, [fileName])

  const handleDownload = () => {
    if (fileUrl) {
      downloadFileFromUrl(fileUrl, cleanFileName)
    }
  }

  return (
    // Outer: fill the step-3 panel completely
    <div className="flex flex-col w-full h-full min-h-0">

      {/* ── Single unified header bar ── */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-2.5 shrink-0">
        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
          {([
            ['invoice', FileText, 'Voucher Preview'],
            ['matches', LayoutList, 'Field Matches'],
            ['json', Code, 'JSON'],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none',
                view === key
                  ? 'bg-background text-primary shadow-sm border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Download */}
        {fileUrl && (
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            aria-label="Download document"
            title="Download document"
          >
            <Download className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* ── Content area — fills remaining height ── */}
      {view === 'invoice' ? (
        // Document viewer — takes all remaining space and scrolls internally
        <div className="flex-1 min-h-0 overflow-auto w-full">
          {fileUrl ? (
            <DynamicDocViewer
              documents={[
                {
                  uri: fileUrl,
                  fileName: cleanFileName,
                  fileType: getFileType(cleanFileName),
                },
              ]}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-12 text-center text-muted-foreground">
              <FileText className="size-10 mb-4 opacity-40" />
              <p className="text-sm font-semibold">No document to preview.</p>
              <p className="text-xs mt-1 opacity-70">Upload a file in Step 1 first.</p>
            </div>
          )}
        </div>
      ) : (
        // Field Matches / JSON — scrollable card list
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          {view === 'matches' && <MatchesView data={editedJson} />}
          {view === 'json' && <JsonRenderer data={editedJson} fileName={cleanFileName} />}
        </div>
      )}
    </div>
  )
})

ReviewPanel.displayName = 'ReviewPanel'
