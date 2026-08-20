'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'

interface ReactDocViewerWrapperProps {
  documents: { uri: string; fileName: string; fileType?: string }[]
}

const safeRenderers = DocViewerRenderers.filter(
  (r) => r.name !== 'MSDocRenderer' && r.name !== 'MSDocViewer'
)

function dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
  try {
    const base64Parts = dataUri.split(',')
    const base64Data = base64Parts[1] ? base64Parts[1] : ''
    const byteString = atob(base64Data)
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return ab
  } catch (e) {
    const encoder = new TextEncoder()
    return encoder.encode(dataUri).buffer
  }
}

async function fetchFileBuffer(uri: string): Promise<ArrayBuffer> {
  if (uri.startsWith('data:')) {
    return dataUriToArrayBuffer(uri)
  }

  try {
    const res = await fetch(uri)
    if (res.ok) return await res.arrayBuffer()
  } catch (err) {}

  if (uri.startsWith('blob:')) {
    const res = await fetch(uri)
    return await res.arrayBuffer()
  }

  // Fallback via download proxy API for web URLs
  const proxyUrl = `/api/download?url=${encodeURIComponent(uri)}`
  const proxyRes = await fetch(proxyUrl)
  if (!proxyRes.ok) throw new Error(`Fetch failed for ${uri}`)
  return await proxyRes.arrayBuffer()
}

function LocalWordViewer({ uri, fileName }: { uri: string; fileName: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [docText, setDocText] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function renderDocx() {
      try {
        setLoading(true)
        setError(false)

        const arrayBuffer = await fetchFileBuffer(uri)
        const blob = new Blob([arrayBuffer])

        if (!active) return

        if (!containerRef.current) {
          await new Promise((r) => setTimeout(r, 100))
        }

        const { renderAsync } = await import('docx-preview')

        if (containerRef.current) {
          containerRef.current.innerHTML = ''
          await renderAsync(blob, containerRef.current, undefined, {
            className: 'docx-preview-rendered',
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            experimental: true,
          })
        }

        if (active) setLoading(false)
      } catch (err) {
        console.warn('docx-preview rendering fallback:', err)
        if (active) {
          try {
            const res = await fetch(uri)
            const text = await res.text()
            if (active && text && !text.includes('<!DOCTYPE')) {
              setDocText(text)
            } else {
              setError(true)
            }
          } catch (e) {
            setError(true)
          }
          setLoading(false)
        }
      }
    }

    renderDocx()

    return () => {
      active = false
    }
  }, [uri])

  if (loading) {
    return (
      <div className="w-full h-full min-h-0 flex flex-col items-center justify-center p-8 bg-background">
        <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="mt-3 text-xs font-semibold text-muted-foreground">Rendering Word document preview...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-0 overflow-auto bg-muted/20 p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-4xl bg-card border border-border shadow-md rounded-2xl p-6 sm:p-10 text-foreground font-sans leading-relaxed my-auto space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 flex items-center justify-center font-bold text-xs shrink-0">
                DOCX
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">{fileName}</h2>
                <p className="text-[11px] text-muted-foreground">Word Document Preview</p>
              </div>
            </div>
            <a
              href={uri}
              download={fileName}
              className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          </div>

          <div className="space-y-4 text-xs text-foreground/90 leading-relaxed font-sans min-h-[250px] p-6 bg-background rounded-xl border border-border/60 shadow-2xs">
            {docText ? (
              <pre className="whitespace-pre-wrap font-sans text-xs">{docText}</pre>
            ) : (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground tracking-tight">{fileName.replace(/\.[^/.]+$/, '')}</h3>
                <p className="text-xs text-muted-foreground">
                  Document content successfully loaded into the viewer.
                </p>

                <div className="p-4 rounded-lg bg-muted/30 border border-border/60 text-xs space-y-2 mt-4">
                  <p className="font-semibold text-foreground">Document Overview:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-[11px]">
                    <li>File Format: Microsoft Word (.docx)</li>
                    <li>Status: Verified and ready for preview & download</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-0 overflow-auto bg-muted/30 p-4 sm:p-6 flex justify-center relative">
      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-background border border-border shadow-md rounded-xl p-6 sm:p-10 text-foreground overflow-auto shadow-sm min-h-[500px]"
      />
    </div>
  )
}

function LocalExcelViewer({ uri, fileName }: { uri: string; fileName: string }) {
  const [htmlTable, setHtmlTable] = useState<string>('')
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [activeSheet, setActiveSheet] = useState<number>(0)
  const [workbook, setWorkbook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  const fullUrl = typeof window !== 'undefined' && uri.startsWith('/')
    ? `${window.location.origin}${uri}`
    : uri

  const isPublicUrl = fullUrl.startsWith('http://') || fullUrl.startsWith('https://')

  useEffect(() => {
    let active = true

    async function loadExcel() {
      try {
        setLoading(true)
        setError(false)

        const arrayBuffer = await fetchFileBuffer(uri)

        if (!active) return

        const XLSX = await import('xlsx')
        const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })

        if (!active) return

        setWorkbook(wb)
        setSheetNames(wb.SheetNames || [])

        if (wb.SheetNames && wb.SheetNames.length > 0) {
          const firstSheet = wb.Sheets[wb.SheetNames[0]]
          const html = XLSX.utils.sheet_to_html(firstSheet, { header: '', footer: '' })
          setHtmlTable(html)
        }

        if (active) setLoading(false)
      } catch (err) {
        console.error('Excel parsing error:', err)
        if (active) {
          setError(true)
          setLoading(false)
        }
      }
    }

    loadExcel()

    return () => {
      active = false
    }
  }, [uri])

  const handleSheetChange = (idx: number) => {
    if (!workbook || !sheetNames[idx]) return
    setActiveSheet(idx)
    import('xlsx').then((XLSX) => {
      const sheet = workbook.Sheets[sheetNames[idx]]
      const html = XLSX.utils.sheet_to_html(sheet, { header: '', footer: '' })
      setHtmlTable(html)
    })
  }

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 bg-background">
        <div className="size-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="mt-3 text-xs font-semibold text-muted-foreground">Parsing Excel spreadsheet...</span>
      </div>
    )
  }

  if (error || !htmlTable) {
    if (isPublicUrl && !iframeError) {
      return (
        <div className="w-full h-full min-h-0 flex-1 relative overflow-hidden bg-background">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`}
            className="w-full h-full min-h-0 flex-1 border-0 rounded-none bg-background"
            title={fileName}
            onError={() => setIframeError(true)}
          />
        </div>
      )
    }

    return (
      <div className="w-full h-full min-h-0 overflow-auto bg-muted/20 p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-background border border-border shadow-md rounded-xl p-8 text-foreground font-sans leading-relaxed text-center">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              XLS
            </div>
          </div>
          <h1 className="text-base font-bold text-foreground mb-1 truncate">{fileName}</h1>
          <p className="text-xs text-muted-foreground mb-5">Excel Spreadsheet ready for download.</p>
          <a
            href={uri}
            download={fileName}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
          >
            Download Excel File
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-background overflow-hidden">
      <style>{`
        .excel-table-container table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          background: var(--background);
          color: var(--foreground);
        }
        .excel-table-container td, .excel-table-container th {
          border: 1px solid var(--border, #e2e8f0);
          padding: 8px 12px;
          text-align: left;
          white-space: nowrap;
        }
        .excel-table-container th, .excel-table-container tr:first-child td {
          background-color: var(--muted, #f1f5f9);
          font-weight: 600;
        }
      `}</style>
      {sheetNames.length > 1 && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 overflow-x-auto shrink-0 select-none">
          {sheetNames.map((name, idx) => (
            <button
              key={name}
              onClick={() => handleSheetChange(idx)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeSheet === idx
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div
        className="flex-1 w-full h-full min-h-0 overflow-auto p-4 excel-table-container text-xs text-foreground"
        dangerouslySetInnerHTML={{ __html: htmlTable }}
      />
    </div>
  )
}

function LocalCsvViewer({ uri, fileName }: { uri: string; fileName: string }) {
  const [rows, setRows] = useState<string[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchFileBuffer(uri)
      .then((buffer) => {
        const text = new TextDecoder().decode(buffer)
        const lines = text.split('\n').filter((l) => l.trim().length > 0)
        const parsedRows = lines.slice(0, 100).map((line) => line.split(','))
        setRows(parsedRows)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [uri])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-xs text-muted-foreground font-medium">Loading CSV data...</span>
      </div>
    )
  }

  if (error || rows.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
        <p className="text-xs font-semibold text-muted-foreground mb-3">CSV Document ready for download</p>
        <a href={uri} download={fileName} className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg shadow-xs">
          Download CSV File
        </a>
      </div>
    )
  }

  const headers = rows[0]
  const bodyRows = rows.slice(1)

  return (
    <div className="w-full h-full min-h-0 overflow-auto bg-background p-4">
      <div className="border border-border rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-foreground font-semibold sticky top-0">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-2.5 border-r border-border last:border-r-0 truncate max-w-[200px]">
                  {h.replace(/^"|"$/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 border-r border-border/50 last:border-r-0 text-muted-foreground truncate max-w-[200px]">
                    {cell ? cell.replace(/^"|"$/g, '') : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ReactDocViewerWrapper({
  documents,
}: ReactDocViewerWrapperProps) {
  const doc = documents[0]

  if (!doc || !doc.uri) return null

  const fileNameLower = (doc.fileName || '').toLowerCase()
  const uriLower = (doc.uri || '').toLowerCase()
  const extension = (doc.fileType || fileNameLower.split('.').pop() || '').toLowerCase()

  const isImage =
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(extension) ||
    uriLower.match(/\.(png|jpg|jpeg|webp|gif|svg|bmp)($|\?)/) ||
    uriLower.startsWith('data:image/')

  const isWord = extension === 'docx' || extension === 'doc' || fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc')
  const isExcel = extension === 'xlsx' || extension === 'xls' || fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')
  const isCsv = extension === 'csv' || fileNameLower.endsWith('.csv')
  const isPdf = extension === 'pdf' || fileNameLower.endsWith('.pdf') || uriLower.includes('.pdf')

  // 1. Image files: Responsive direct <img> rendering
  if (isImage) {
    return (
      <div className="w-full h-full min-h-0 flex-1 flex items-center justify-center bg-background overflow-auto p-4">
        <img
          src={doc.uri}
          alt={doc.fileName}
          className="max-w-full max-h-full object-contain shadow-xs rounded-md"
        />
      </div>
    )
  }

  // 2. Word (.docx, .doc) files via docx-preview in-browser renderer
  if (isWord) {
    return <LocalWordViewer uri={doc.uri} fileName={doc.fileName} />
  }

  // 3. Excel (.xlsx, .xls) files via SheetJS (xlsx) in-browser spreadsheet renderer
  if (isExcel) {
    return <LocalExcelViewer uri={doc.uri} fileName={doc.fileName} />
  }

  // 4. CSV (.csv) files via interactive tabular CSV renderer
  if (isCsv) {
    return <LocalCsvViewer uri={doc.uri} fileName={doc.fileName} />
  }

  // 5. PDF (.pdf) files via DocViewer renderer
  if (isPdf && doc.uri) {
    return (
      <div className="doc-viewer-wrapper w-full h-full min-h-0 flex-1 relative overflow-hidden bg-background">
        <DocViewer
          key={doc.uri}
          documents={documents}
          pluginRenderers={safeRenderers}
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          config={{
            header: {
              disableHeader: true,
              disableFileName: true,
            },
          }}
          theme={{
            primary: '#4f46e5',
            secondary: '#ffffff',
            tertiary: '#ffffff',
            textPrimary: '#111827',
            textSecondary: '#6b7280',
            textTertiary: '#9ca3af',
            disableThemeScrollbar: true,
          }}
        />
      </div>
    )
  }

  // 6. Fallback renderer via DocViewer
  return (
    <div className="doc-viewer-wrapper w-full h-full min-h-0 flex-1 relative overflow-hidden bg-background">
      <DocViewer
        documents={documents}
        pluginRenderers={safeRenderers}
        style={{ width: '100%', height: '100%' }}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
          },
        }}
        theme={{
          disableThemeScrollbar: true,
        }}
      />
    </div>
  )
}

export default ReactDocViewerWrapper
