'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  Download,
  Eye,
  FileEdit,
  FileText,
  ScanLine,
  UploadCloud,
} from 'lucide-react'
import { ocrService } from '@/features/chattemplate/extractor/ocr.service'
import { DynamicJsonForm } from '@/components/dynamic-form/DynamicJsonForm'
import { ReviewPanel } from '@/components/dynamic-form/ReviewPanel'
import { LoadingState } from '@/components/dynamic-form/LoadingState'
import { ErrorState } from '@/components/dynamic-form/ErrorState'
import { toast } from 'sonner'

type LineItem = { id: number; description: string; quantity: number; rate: number; tax: number }
type InvoiceState = {
  businessName: string
  businessEmail: string
  businessAddress: string
  customerName: string
  customerEmail: string
  customerAddress: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  notes: string
  terms: string
  discount: number
  paid: number
  items: LineItem[]
}
type Tab = 'select' | 'review' | 'pdf'

const initialInvoice: InvoiceState = {
  businessName: 'Northstar Technology Services GmbH',
  businessEmail: 'billing@northstar-tech.de',
  businessAddress: '14 Oak Street\nAustin, TX 78701',
  customerName: 'Acme Corporation',
  customerEmail: 'accounts@acme.com',
  customerAddress: '520 Market Street\nSan Francisco, CA 94105',
  invoiceNumber: 'INV-2026-1048',
  issueDate: '2026-07-18',
  dueDate: '2026-08-18',
  currency: 'USD',
  notes: 'Thank you for partnering with us.',
  terms: 'Net 30 days',
  discount: 0,
  paid: 0,
  items: [
    { id: 1, description: 'Cloud Infrastructure & Managed Consulting', quantity: 1, rate: 13200, tax: 8.18 },
  ],
}

export function InvoiceMaker() {
  const [invoice, setInvoice] = useState<InvoiceState>(initialInvoice)
  const [tab, setTab] = useState<Tab>('select')
  const [fileName, setFileName] = useState('')
  const [scanStatus, setScanStatus] = useState('No file uploaded yet')
  const [progressPct, setProgressPct] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Dynamic JSON form workflow states
  const [ocrJson, setOcrJson] = useState<any>(null)
  const [editedJson, setEditedJson] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedReviewData, setSavedReviewData] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    const saved = window.localStorage.getItem('voucher-review-json')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setEditedJson(parsed)
        setSavedReviewData(parsed)
      } catch { /* Ignore */ }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || !editedJson) return
    window.localStorage.setItem('voucher-review-json', JSON.stringify(editedJson, null, 2))
  }, [editedJson, hydrated])

  /**
   * Step 1: Upload file → Run OCR → AI parse raw text into structured invoice JSON
   * Note: User stays on upload page and can navigate by clicking Edit icon, Eye preview icon, or Tab headers.
   */
  async function handleFile(file?: File) {
    if (!file) return
    setUploadedFile(file)
    setFileName(file.name)

    try {
      const url = URL.createObjectURL(file)
      setFileUrl(url)
    } catch { /* Ignore */ }

    setError(null)
    setLoading(true)
    setProgressPct(10)
    setScanStatus('Reading document...')

    // Handle raw JSON upload
    if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
      try {
        setProgressPct(50)
        const text = await file.text()
        const parsed = JSON.parse(text)
        setOcrJson(parsed)
        setEditedJson(parsed)
        setProgressPct(100)
        setScanStatus('JSON file imported! Click Eye icon to preview or Edit icon to modify.')
        toast.success('JSON imported successfully!')
      } catch {
        setError('Invalid JSON file. Please upload a valid JSON document.')
        toast.error('Invalid JSON file')
      } finally {
        setLoading(false)
      }
      return
    }

    // Step 1: Run OCR to extract raw text
    let rawText = ''
    try {
      setScanStatus('Running OCR scan on document...')
      const ocrResult = await ocrService.recognizeFile(file, 'eng', (pct, msg) => {
        const mappedPct = Math.round(10 + (pct * 0.6)) // 10% -> 70%
        setProgressPct(mappedPct)
        setScanStatus(`OCR (${mappedPct}%): ${msg}`)
      })
      rawText = ocrResult.text || ''
      if (!rawText || rawText.trim().length < 10) {
        throw new Error('OCR could not extract readable text from this document.')
      }
    } catch (err: any) {
      setError(err?.message || 'OCR failed. Please try a clearer image or PDF.')
      toast.error('OCR Failed')
      setLoading(false)
      return
    }

    // Step 2: AI parses raw OCR text → structured invoice JSON
    try {
      setProgressPct(75)
      setScanStatus('AI is extracting structured invoice fields...')
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      })

      if (!res.ok) {
        throw new Error('Invoice parsing service unavailable. Please try again.')
      }

      const { data, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)

      const structuredJson = data || { rawText }
      setOcrJson(structuredJson)
      setEditedJson(structuredJson)
      setProgressPct(100)
      setScanStatus('Invoice fields extracted! Edit any value and click Save.')
      toast.success('Invoice extracted! Ready for review.')
    } catch (err: any) {
      // Fallback: use raw text as single field if AI fails
      const fallback = { extractedText: rawText }
      setOcrJson(fallback)
      setEditedJson(fallback)
      setProgressPct(100)
      setScanStatus('Could not fully parse fields — raw text stored. Click Edit or Eye icon.')
      toast.warning('AI parsing failed. Raw text ready.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadJson = () => {
    const dataToSave = editedJson || ocrJson || initialInvoice
    const jsonString = JSON.stringify(dataToSave, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'invoice') + '.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('JSON file downloaded!')
  }

  const handleSaveForm = (finalJson: any) => {
    setSaving(true)
    setEditedJson(finalJson)
    setSavedReviewData(finalJson)
    toast.success('Saved! Review your invoice below.')
    setTimeout(() => {
      setSaving(false)
      setTab('pdf')
    }, 300)
  }

  return (
    <div className="w-full flex-1 flex flex-col max-w-5xl mx-auto overflow-y-auto">
      {/* Step Navigation Bar */}
      <nav className="sticky top-0 z-10 flex border-b border-border bg-background/95 backdrop-blur px-4 sm:px-8" aria-label="Invoice steps">
        {([
          ['select', '1', 'Upload Document'],
          ['review', '2', 'Edit Fields'],
          ['pdf', '3', 'Voucher Preview'],
        ] as const).map(([key, number, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-xs font-bold transition ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-black ${
              tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{number}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* STEP 1: UPLOAD */}
      {tab === 'select' && (
        <section className="w-full p-4 sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Document Processing</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Upload Document</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload any PDF or image. OCR extracts the text, then AI parses it into structured invoice fields you can edit.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Upload Button */}
            <button
              onClick={() => fileRef.current?.click()}
              className="group flex min-h-48 flex-col items-start rounded-2xl border-2 border-dashed border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md cursor-pointer"
            >
              <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UploadCloud className="size-5" />
              </div>
              <h3 className="text-base font-bold">Upload Document</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">PDF, PNG, JPG, JPEG. OCR + AI extracts structured fields automatically.</p>
              <span className="mt-auto pt-4 text-xs font-bold text-primary">
                Choose file <ArrowRight className="ml-1 inline size-3" />
              </span>
            </button>

            {/* Template Button */}
            <button
              onClick={() => {
                setOcrJson(initialInvoice)
                setEditedJson(initialInvoice)
                setFileName('northstar-invoice.pdf')
                setScanStatus('Template loaded. Edit fields and save.')
                setTab('review')
              }}
              className="group flex min-h-48 flex-col items-start rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md cursor-pointer"
            >
              <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <h3 className="text-base font-bold">Use Template</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Start with a pre-filled voucher template as a demo.</p>
              <span className="mt-auto pt-4 text-xs font-bold text-primary">
                Use template <ArrowRight className="ml-1 inline size-3" />
              </span>
            </button>

            {/* Make Template Button */}
            <button
              onClick={() => {
                const saved = savedReviewData || initialInvoice
                setOcrJson(saved)
                setEditedJson(saved)
                setFileName(fileName || 'saved-invoice.json')
                setScanStatus('Loaded from saved browser data.')
                setTab('review')
              }}
              className="group flex min-h-48 flex-col items-start rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md cursor-pointer"
            >
              <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ScanLine className="size-5" />
              </div>
              <h3 className="text-base font-bold">Make Template</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Create or resume your custom voucher template.</p>
              <span className="mt-auto pt-4 text-xs font-bold text-primary">
                Make template <ArrowRight className="ml-1 inline size-3" />
              </span>
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.json,application/pdf,image/*,application/json"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {/* Uploaded File Card with Progress Bar & Action Icons */}
          {fileName && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4.5 shadow-sm transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{fileName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{scanStatus}</p>
                  </div>
                </div>

                {/* Step 1 Card Actions: Download JSON, Edit Fields, Eye Preview */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    title="Download JSON"
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <Download className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('review')}
                    title="Edit Fields"
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <FileEdit className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('pdf')}
                    title="Preview Invoice"
                    className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </button>
                </div>
              </div>

              {/* Upload & Processing Progress Bar */}
              {loading && (
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Extracting & Parsing Invoice...</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* STEP 2: EDIT FIELDS (DynamicJsonForm) */}
      {tab === 'review' && (
        <section className="w-full flex-1 flex flex-col min-h-0 p-4 sm:px-8 pt-6">
          {loading ? (
            <LoadingState message={scanStatus} progressPct={progressPct} />
          ) : error ? (
            <ErrorState error={error} onRetry={() => { setError(null); setTab('select') }} />
          ) : editedJson ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Document File Card at Top of Edit Fields Step (Replaces plain info banner) */}
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4.5 shadow-sm transition-all">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{fileName || 'Uploaded Invoice'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">Invoice fields extracted! Edit any value below and click Save.</p>
                  </div>
                </div>

                {/* Step 2 Card Actions: Download JSON & Eye Preview Icon */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    title="Download JSON"
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <Download className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('pdf')}
                    title="Preview Invoice"
                    className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </button>
                </div>
              </div>

              {/* Schema-independent Dynamic Form */}
              <DynamicJsonForm
                jsonData={ocrJson || editedJson}
                editedJson={editedJson}
                onChange={(newJson) => setEditedJson(newJson)}
                onSave={handleSaveForm}
                isSaving={saving}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <UploadCloud className="size-10 mb-4 opacity-40" />
              <p className="text-sm font-semibold">No document loaded.</p>
              <p className="text-xs mt-1">Go back to Step 1 and upload a file.</p>
            </div>
          )}
        </section>
      )}

      {/* STEP 3: INVOICE PREVIEW + MATCHES + JSON */}
      {tab === 'pdf' && (
        <ReviewPanel
          fileName={fileName || 'invoice.pdf'}
          fileUrl={fileUrl}
          editedJson={savedReviewData || editedJson || initialInvoice}
        />
      )}
    </div>
  )
}
