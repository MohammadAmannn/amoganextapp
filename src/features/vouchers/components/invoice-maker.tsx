'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Printer,
  ScanLine,
  Trash2,
  UploadCloud,
} from 'lucide-react'

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
  businessName: 'Northstar Studio', businessEmail: 'hello@northstar.studio', businessAddress: '14 Oak Street\nAustin, TX 78701',
  customerName: 'Acme Corporation', customerEmail: 'accounts@acme.com', customerAddress: '520 Market Street\nSan Francisco, CA 94105',
  invoiceNumber: 'VCH-2026-0042', issueDate: '2026-08-07', dueDate: '2026-08-21', currency: 'USD',
  notes: 'Thank you for partnering with us.', terms: 'Payment is due within 14 days.', discount: 0, paid: 0,
  items: [
    { id: 1, description: 'Brand identity design', quantity: 1, rate: 1800, tax: 8.25 },
    { id: 2, description: 'Website design and development', quantity: 1, rate: 2400, tax: 8.25 },
  ],
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}
function dateLabel(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground"><span>{label}</span>{children}</label>
}
function Input({ value, onChange, type = 'text', placeholder }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" />
}
function Area({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" />
}

export function InvoiceMaker() {
  const [invoice, setInvoice] = useState<InvoiceState>(initialInvoice)
  const [tab, setTab] = useState<Tab>('select')
  const [fileName, setFileName] = useState('')
  const [scanStatus, setScanStatus] = useState('No file uploaded yet')
  const [hydrated, setHydrated] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('voucher-review-json')
    if (saved) {
      try { setInvoice(JSON.parse(saved)) } catch { /* Ignore saved JSON */ }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem('voucher-review-json', JSON.stringify(invoice, null, 2))
  }, [invoice, hydrated])

  const totals = useMemo(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
    const discount = Math.min(Math.max(invoice.discount, 0), subtotal)
    const tax = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate * (item.tax / 100), 0)
    const total = subtotal - discount + tax
    return { subtotal, discount, tax, total, balance: Math.max(total - invoice.paid, 0) }
  }, [invoice])

  const updateInvoice = (key: keyof InvoiceState, value: string | number) => setInvoice((current) => ({ ...current, [key]: value }))
  const updateItem = (id: number, key: keyof LineItem, value: string | number) => setInvoice((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, [key]: key === 'description' ? value : Number(value) || 0 } : item) }))
  const addItem = () => setInvoice((current) => ({ ...current, items: [...current.items, { id: Date.now(), description: 'New service', quantity: 1, rate: 0, tax: 0 }] }))
  const removeItem = (id: number) => setInvoice((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }))

  async function handleFile(file?: File) {
    if (!file) return
    setFileName(file.name)
    setScanStatus('Reading file and preparing extracted JSON…')
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      try {
        const parsed = JSON.parse(await file.text())
        const normalized = { ...initialInvoice, ...parsed, items: Array.isArray(parsed.items) ? parsed.items : initialInvoice.items }
        setInvoice(normalized)
        setScanStatus('JSON imported. Review the extracted fields before creating the voucher PDF.')
        setTab('review')
        return
      } catch { setScanStatus('Could not read this JSON file. Try again with a valid voucher JSON.') }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 700))
      setScanStatus(`Extraction ready for review from ${file.type || 'uploaded file'}. Confirm each field in Review.`)
      setTab('review')
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto overflow-y-auto">
      <nav className="mb-6 flex border-b border-border" aria-label="Voucher steps">
        {([['select', '1', 'Select'], ['review', '2', 'Review'], ['pdf', '3', 'PDF']] as const).map(([key, number, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            <span className="text-xs">{number}</span>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'select' && (
        <section className="w-full">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Create a voucher</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">How would you like to start?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose a source and we will open the editable voucher details.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="group flex min-h-48 flex-col items-start rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UploadCloud className="size-5" />
              </div>
              <h3 className="text-base font-semibold">Upload</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Scan a PDF, image, or voucher JSON and extract its details.</p>
              <span className="mt-auto pt-4 text-xs font-semibold text-primary">
                Choose file <ArrowRight className="ml-1 inline size-3" />
              </span>
            </button>
            <button
              onClick={() => {
                setInvoice(initialInvoice)
                setScanStatus('Template loaded. Edit the voucher details in Review.')
                setFileName('Default voucher template')
                setTab('review')
              }}
              className="group flex min-h-48 flex-col items-start rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <h3 className="text-base font-semibold">Template</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Start with a clean default voucher template.</p>
              <span className="mt-auto pt-4 text-xs font-semibold text-primary">
                Use template <ArrowRight className="ml-1 inline size-3" />
              </span>
            </button>
            <button
              onClick={() => {
                setScanStatus('Saved voucher loaded. Edit the details in Review.')
                setFileName('Saved voucher JSON')
                setTab('review')
              }}
              className="group flex min-h-48 flex-col items-start rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ScanLine className="size-5" />
              </div>
              <h3 className="text-base font-semibold">Copy from</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Continue from the voucher saved in this browser.</p>
              <span className="mt-auto pt-4 text-xs font-semibold text-primary">
                Copy saved data <ArrowRight className="ml-1 inline size-3" />
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
          {fileName && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left text-sm">
              <FileText className="size-5 text-primary" />
              <div>
                <p className="font-semibold text-xs">{fileName}</p>
                <p className="text-[10px] text-muted-foreground">{scanStatus}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'review' && (
        <section className="w-full">
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Check className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Extracted data is ready to review</p>
                <p className="text-[10px] text-muted-foreground">Edit any field. Changes save automatically.</p>
              </div>
            </div>
            <button
              onClick={() => setTab('pdf')}
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
            >
              Open PDF <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <EditorCard title="Your details">
              <div className="flex flex-col gap-3">
                <Field label="Business name">
                  <Input value={invoice.businessName} onChange={(v) => updateInvoice('businessName', v)} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email">
                    <Input value={invoice.businessEmail} onChange={(v) => updateInvoice('businessEmail', v)} />
                  </Field>
                  <Field label="Address">
                    <Input value={invoice.businessAddress.replace('\n', ', ')} onChange={(v) => updateInvoice('businessAddress', v)} />
                  </Field>
                </div>
              </div>
            </EditorCard>
            <EditorCard title="Customer details">
              <div className="flex flex-col gap-3">
                <Field label="Customer name">
                  <Input value={invoice.customerName} onChange={(v) => updateInvoice('customerName', v)} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email">
                    <Input value={invoice.customerEmail} onChange={(v) => updateInvoice('customerEmail', v)} />
                  </Field>
                  <Field label="Address">
                    <Input value={invoice.customerAddress.replace('\n', ', ')} onChange={(v) => updateInvoice('customerAddress', v)} />
                  </Field>
                </div>
              </div>
            </EditorCard>
            <EditorCard title="Voucher details">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Voucher number">
                  <Input value={invoice.invoiceNumber} onChange={(v) => updateInvoice('invoiceNumber', v)} />
                </Field>
                <Field label="Currency">
                  <select value={invoice.currency} onChange={(e) => updateInvoice('currency', e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>CAD</option>
                  </select>
                </Field>
                <Field label="Issue date">
                  <Input type="date" value={invoice.issueDate} onChange={(v) => updateInvoice('issueDate', v)} />
                </Field>
                <Field label="Due date">
                  <Input type="date" value={invoice.dueDate} onChange={(v) => updateInvoice('dueDate', v)} />
                </Field>
              </div>
            </EditorCard>
            <EditorCard title="Products & services">
              <div className="flex flex-col gap-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} aria-label="Product description" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none" />
                      <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.description}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Field label="Qty"><Input type="number" value={item.quantity} onChange={(v) => updateItem(item.id, 'quantity', v)} /></Field>
                      <Field label="Rate"><Input type="number" value={item.rate} onChange={(v) => updateItem(item.id, 'rate', v)} /></Field>
                      <Field label="Tax %"><Input type="number" value={item.tax} onChange={(v) => updateItem(item.id, 'tax', v)} /></Field>
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="h-10 rounded-lg border border-dashed border-primary/40 text-sm font-semibold text-primary hover:bg-primary/5">
                  + Add product
                </button>
              </div>
            </EditorCard>
            <EditorCard title="Payment & notes">
              <div className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Discount"><Input type="number" value={invoice.discount} onChange={(v) => updateInvoice('discount', Number(v) || 0)} /></Field>
                  <Field label="Paid amount"><Input type="number" value={invoice.paid} onChange={(v) => updateInvoice('paid', Number(v) || 0)} /></Field>
                </div>
                <Field label="Payment terms"><Area value={invoice.terms} onChange={(v) => updateInvoice('terms', v)} rows={2} /></Field>
                <Field label="Notes"><Area value={invoice.notes} onChange={(v) => updateInvoice('notes', v)} rows={2} /></Field>
              </div>
            </EditorCard>
          </div>
        </section>
      )}

      {tab === 'pdf' && (
        <section className="w-full">
          <div className="mb-5 flex items-center justify-between">
            <button onClick={() => setTab('review')} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3" />Back to Review
            </button>
            <button onClick={() => window.print()} className="flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-xs font-semibold hover:bg-muted print:hidden">
              <Printer className="size-3.5" />Print / Save PDF
            </button>
          </div>
          <InvoicePreview invoice={invoice} totals={totals} />
        </section>
      )}
    </div>
  )
}

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><h2 className="mb-4 text-sm font-bold">{title}</h2>{children}</div>
}

function InvoicePreview({ invoice, totals }: { invoice: InvoiceState; totals: { subtotal: number; discount: number; tax: number; total: number; balance: number } }) {
  return (
    <article className="invoice-paper mx-auto min-h-[900px] w-full max-w-[800px] rounded-sm border border-border bg-card p-6 shadow-md sm:p-10 print:min-h-0 print:max-w-none print:border-0 print:p-8 print:shadow-none">
      <div className="flex items-start justify-between gap-6 border-b-2 border-primary pb-6">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">N</div>
          <h2 className="text-lg font-bold tracking-tight">{invoice.businessName}</h2>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{invoice.businessAddress}</p>
          <p className="text-xs text-muted-foreground">{invoice.businessEmail}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tracking-tight text-primary">VOUCHER</p>
          <p className="mt-2 text-xs font-semibold">{invoice.invoiceNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">Issued {dateLabel(invoice.issueDate)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 border-b border-border py-6">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Bill to</p>
          <p className="font-semibold text-sm">{invoice.customerName || 'Customer name'}</p>
          <p className="mt-1 text-xs text-muted-foreground">{invoice.customerEmail}</p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{invoice.customerAddress}</p>
        </div>
        <div className="text-right">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Payment due</p>
          <p className="font-semibold text-sm">{dateLabel(invoice.dueDate)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{invoice.terms}</p>
        </div>
      </div>
      <div className="overflow-hidden py-6">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-primary text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="pb-2 font-semibold">Description</th>
              <th className="pb-2 text-right font-semibold">Qty</th>
              <th className="pb-2 text-right font-semibold">Rate</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="py-3 font-medium">{item.description}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{money(item.rate, invoice.currency)}</td>
                <td className="py-3 text-right font-medium">{money(item.quantity * item.rate, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ml-auto flex w-full max-w-xs flex-col gap-2 border-t border-border pt-4 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{money(totals.subtotal, invoice.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span>-{money(totals.discount, invoice.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{money(totals.tax, invoice.currency)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-primary pt-2 text-base font-bold">
          <span>Total</span>
          <span>{money(totals.total, invoice.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold text-primary">
          <span>Balance due</span>
          <span>{money(totals.balance, invoice.currency)}</span>
        </div>
      </div>
      <div className="mt-12 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        <p>{invoice.notes}</p>
        <p className="mt-2">{invoice.terms}</p>
      </div>
    </article>
  )
}
