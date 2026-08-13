'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  FileEdit,
  FileText,
  ScanLine,
  UploadCloud,
  X,
} from 'lucide-react'

import { ocrService } from '@/features/chattemplate/extractor/ocr.service'
import { DynamicJsonForm } from '@/components/dynamic-form/DynamicJsonForm'
import { ReviewPanel } from '@/components/dynamic-form/ReviewPanel'
import { LoadingState } from '@/components/dynamic-form/LoadingState'
import { ErrorState } from '@/components/dynamic-form/ErrorState'
import dynamic from 'next/dynamic'
import { useVoucherStore } from '@/stores/voucher-store'

import { uploadVoucherFile } from '@/features/vouchers/repositories/voucher-repository'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'
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
  const [tab, setTab] = useState<Tab>('select')
  const [fileName, setFileName] = useState('')
  const [displayFileName, setDisplayFileName] = useState('')
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
  const [originalFileUrl, setOriginalFileUrl] = useState<string | undefined>(undefined) // blob URL for preview
  const [storedOriginalUrl, setStoredOriginalUrl] = useState<string | undefined>(undefined) // supabase storage URL

  // Preview dialog state for original uploaded file
  const [showOriginalPreview, setShowOriginalPreview] = useState(false)

  // Control whether Step 3 Preview is unlocked (unlocked ONLY after user clicks Save)
  const [isSaved, setIsSaved] = useState(false)
  const [extractionSuccess, setExtractionSuccess] = useState(false)

  // Clear session storage on initial load unless explicit save occurred
  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || !editedJson) return
    window.localStorage.setItem('voucher-review-json', JSON.stringify(editedJson, null, 2))
  }, [editedJson, hydrated])

  /**
   * Step 1: Upload file → Run OCR → AI parse raw text into structured invoice JSON
   * Also uploads the original file to Supabase Storage.
   */
  async function handleFile(file?: File) {
    if (!file) return
    setUploadedFile(file)
    setFileName(file.name)
    setIsSaved(false)
    setExtractionSuccess(false)


    // Sanitize display name (never show sample names)
    const safeName = file.name.toLowerCase().includes('aman')
      ? `Invoice_${new Date().toISOString().slice(0, 10)}.${file.name.split('.').pop()}`
      : file.name
    setDisplayFileName(safeName)

    // Create local blob URL for Eye preview of original file
    try {
      const blobUrl = URL.createObjectURL(file)
      setOriginalFileUrl(blobUrl)
    } catch { /* Ignore */ }

    setError(null)
    setLoading(true)
    setProgressPct(10)
    setScanStatus('Uploading document...')

    // Upload original file to Supabase Storage in background
    uploadVoucherFile(file, 'originals')
      .then((url) => setStoredOriginalUrl(url))
      .catch(() => { /* Non-fatal — storage URL not required for preview */ })

    // Handle raw JSON upload
    if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
      try {
        setProgressPct(50)
        const text = await file.text()
        const parsed = JSON.parse(text)
        setOcrJson(parsed)
        setProgressPct(100)
        setScanStatus('JSON imported! Click Eye to preview or Edit to modify fields.')

      } catch {
        setError('Invalid JSON file. Please upload a valid JSON document.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Step 1: Run OCR to extract raw text
    let rawText = ''
    try {
      setScanStatus('Running OCR scan...')
      const ocrResult = await ocrService.recognizeFile(file, 'eng', (pct, msg) => {
        const mappedPct = Math.round(10 + (pct * 0.6))
        setProgressPct(mappedPct)
        setScanStatus(`OCR (${mappedPct}%): ${msg}`)
      })
      rawText = ocrResult.text || ''
      if (!rawText || rawText.trim().length < 10) {
        throw new Error('OCR could not extract readable text from this document.')
      }
    } catch (err: any) {
      setError(err?.message || 'OCR failed. Please try a clearer image or PDF.')
      setLoading(false)
      return
    }

    // Step 2: AI parses raw OCR text → structured invoice JSON
    try {
      setProgressPct(75)
      setScanStatus('AI extracting invoice fields...')
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      })

      if (!res.ok) throw new Error('Invoice parsing service unavailable.')

      const { data, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)

      const structuredJson = data || { rawText }
      setOcrJson(structuredJson)
      setEditedJson(structuredJson)
      setProgressPct(100)
      setScanStatus('Fields extracted! Edit any value below and click Save.')
      setExtractionSuccess(true)
    } catch (err: any) {
      const fallback = { extractedText: rawText }
      setOcrJson(fallback)
      setEditedJson(fallback)
      setProgressPct(100)
      setScanStatus('Could not fully parse — raw text stored. Click Edit or Eye.')
    } finally {
      setLoading(false)
    }
  }

  /** Download the original uploaded file (blob) */
  const handleDownloadOriginal = () => {
    if (!uploadedFile) return
    const url = URL.createObjectURL(uploadedFile)
    const a = document.createElement('a')
    a.href = url
    a.download = displayFileName || uploadedFile.name
    a.click()
    URL.revokeObjectURL(url)
  }

  /** Save edited form → upload generated PDF → save to DB */
  const handleSaveForm = async (finalJson: any) => {
    setSaving(true)
    setEditedJson(finalJson)
    setSavedReviewData(finalJson)
    setIsSaved(true)                  

    try {
      const vendorName = finalJson.vendor || finalJson.businessName || finalJson.company || displayFileName || 'Voucher Document'
      const invoiceNo = finalJson.invoiceNumber || finalJson.invoiceNo || finalJson.voucherNo || `VCH-${Date.now().toString().slice(-6)}`
      const cleanName = `${invoiceNo}_${vendorName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

      // Save to DB via API route
      let savedDbId: string | undefined
      try {
        const res = await fetch('/api/vouchers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voucher_no: invoiceNo,
            file_name: cleanName,
            original_file_url: storedOriginalUrl || null,
            edited_json: finalJson,
            vendor_name: vendorName,
            customer_name: finalJson.customerName || finalJson.customer || null,
            invoice_date: finalJson.invoiceDate || finalJson.date || null,
            total: finalJson.total || finalJson.totalAmount || null,
            currency: finalJson.currency || 'USD',
          }),
        })
        if (res.ok) {
          const { data } = await res.json()
          savedDbId = data?.id
        }
      } catch { /* Non-fatal — continue with local save */ }

      // Update local Zustand store
      const fileUrlToUse = storedOriginalUrl || originalFileUrl
      const added = useVoucherStore.getState().addVoucher({
        voucherNo: invoiceNo,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        from: vendorName,
        userName: 'Aman',
        status: 'Active',
        fileName: cleanName,
        originalFileUrl: fileUrlToUse,
        editedFileUrl: fileUrlToUse,
        pdfUrl: fileUrlToUse,
        editedJson: finalJson,
        dbId: savedDbId,
      })
      useVoucherStore.getState().setSelectedVoucher(added)
    } catch { /* Ignore */ }

    setTimeout(() => {
      setSaving(false)
      setTab('pdf')
    }, 300)
  }

  return (
    <div className={`relative h-full w-full flex-1 flex flex-col max-w-5xl mx-auto ${tab === 'pdf' || showOriginalPreview ? 'overflow-hidden' : 'overflow-y-auto'}`}>

      {/* Step Navigation Bar */}
      <nav className="sticky top-0 z-10 flex border-b border-border bg-background/95 backdrop-blur px-4 sm:px-8" aria-label="Invoice steps">
        {([
          ['select', '1', 'Upload Document'],
          ['review', '2', 'Edit Fields'],
          ['pdf', '3', 'Voucher Preview'],
        ] as const).map(([key, number, label]) => {
          const isDisabled = key === 'pdf' && !isSaved
          return (
            <button
              key={key}
              onClick={() => {
                if (!isDisabled) {
                  setTab(key)
                }
              }}

              className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-xs font-bold transition ${
                tab === key
                  ? 'border-primary text-primary'
                  : isDisabled
                  ? 'border-transparent text-muted-foreground/40 cursor-not-allowed opacity-60'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground cursor-pointer'
              }`}
            >
              <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-black ${
                tab === key ? 'bg-primary text-primary-foreground' : isDisabled ? 'bg-muted/50 text-muted-foreground/40' : 'bg-muted text-muted-foreground'
              }`}>{number}</span>
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* STEP 1: UPLOAD */}
      {tab === 'select' && (
        <section className="w-full p-4 sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Document Processing</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Upload Document</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload any PDF or image. OCR extracts the text, then AI parses it into structured fields you can edit.
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
                setDisplayFileName('northstar-invoice.pdf')
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
                setDisplayFileName(displayFileName || 'saved-invoice.pdf')
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

          {/* Uploaded File Card */}
          {(displayFileName || fileName) && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm relative">
              {/* Compact Inline Success Banner - Centered & Less Height */}
              {extractionSuccess && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Invoice extracted! Ready for review.</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{displayFileName || fileName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{scanStatus}</p>
                  </div>
                </div>

                {/* Card Actions: Eye (preview original) | Download (download original) | Edit Fields */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Eye — preview document with doc viewer */}
                  <button
                    type="button"
                    onClick={() => setShowOriginalPreview(true)}
                    title="Preview document in doc viewer"
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </button>

                  {/* Download — download original uploaded file */}
                  <button
                    type="button"
                    onClick={handleDownloadOriginal}
                    title="Download original file"
                    disabled={!uploadedFile}
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Download className="size-4" />
                  </button>

                  {/* Edit Fields — go to step 2 */}
                  <button
                    type="button"
                    onClick={() => setTab('review')}
                    title="Edit Fields"
                    className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                  >
                    <FileEdit className="size-4" />
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

      {/* STEP 2: EDIT FIELDS */}
      {tab === 'review' && (
        <section className="w-full flex-1 flex flex-col min-h-0 p-4 sm:px-8 pt-6">
          {loading ? (
            <LoadingState message={scanStatus} progressPct={progressPct} />
          ) : error ? (
            <ErrorState error={error} onRetry={() => { setError(null); setTab('select') }} />
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* File info header */}
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{displayFileName || fileName || 'Invoice Document'}</p>
                    <p className="text-[11px] text-muted-foreground">Edit any field below and click Save to generate your voucher preview</p>
                  </div>
                </div>

                {/* Card Actions: Eye (preview original) & Download (download original) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowOriginalPreview(true)}
                    title="Preview document in doc viewer"
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOriginal}
                    title="Download original file"
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              </div>

              <DynamicJsonForm
                jsonData={editedJson || ocrJson || initialInvoice}
                editedJson={editedJson || ocrJson || initialInvoice}
                onChange={(newJson) => {
                  setEditedJson(newJson)
                  setSavedReviewData(newJson)
                }}
                onSave={handleSaveForm}
                isSaving={saving}
              />
            </div>
          )}
        </section>
      )}

      {/* STEP 3: VOUCHER PREVIEW */}
      {tab === 'pdf' && (
        <div className="fixed inset-0 z-50 flex flex-col w-full h-full h-[100dvh] bg-background overflow-hidden animate-in fade-in duration-200 md:relative md:z-auto md:h-full">
          <SafeDocumentPreview
            fileName={displayFileName || fileName || 'Invoice_VCH_2026.pdf'}
            fileUrl={originalFileUrl}
            editedJson={editedJson || savedReviewData || initialInvoice}
            onClose={() => setTab('review')}
            defaultViewMode="structured"
            showToggle={true}
          />
        </div>
      )}

      {/* Right Window Doc Viewer View (Triggered by Eye icon in Step 1 Upload Tab or Step 2 Edit Tab) */}
      {showOriginalPreview && (
        <div className="fixed inset-0 z-[100] flex flex-col w-full h-full h-[100dvh] bg-background overflow-hidden animate-in fade-in duration-200 md:absolute md:z-50 md:h-full">
          <SafeDocumentPreview
            fileName={displayFileName || fileName || 'document.pdf'}
            fileUrl={originalFileUrl}
            editedJson={editedJson}
            onClose={() => setShowOriginalPreview(false)}
          />
        </div>
      )}
    </div>
  )
}
