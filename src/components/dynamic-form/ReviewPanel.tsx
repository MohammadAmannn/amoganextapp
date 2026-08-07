'use client'

import React, { useState, memo, useMemo } from 'react'
import { ArrowLeft, Code, LayoutList, FileText } from 'lucide-react'
import { flattenJsonToPairs, formatKeyToLabel } from './utils'
import { JsonRenderer } from './JsonRenderer'
import { cn } from '@/lib/utils'

interface ReviewPanelProps {
  fileName?: string
  editedJson: any
  onBackToEdit: () => void
}

// ─────────────────────────────────────────────
// Invoice PDF Preview – structured exactly like
// a real invoice document from the extracted data
// ─────────────────────────────────────────────
function InvoiceDocumentPreview({ data, fileName }: { data: any; fileName: string }) {
  if (!data) return null

  const get = (...keys: string[]) => {
    for (const k of keys) {
      const kl = k.toLowerCase().replace(/[_-\s]/g, '')
      for (const dk of Object.keys(data)) {
        if (dk.toLowerCase().replace(/[_-\s]/g, '') === kl && data[dk] != null && data[dk] !== '') {
          return data[dk]
        }
      }
    }
    return null
  }

  const vendor = get('vendor', 'businessName', 'company', 'issuer', 'soldBy')
  const vendorAddress = get('vendorAddress', 'businessAddress', 'sellerAddress', 'soldByAddress')
  const vendorEmail = get('vendorEmail', 'businessEmail', 'email')
  const vendorPhone = get('vendorPhone', 'businessPhone', 'phone')
  const vatId = get('vatId', 'vatNumber', 'taxId', 'gstNumber')
  const customer = get('customerName', 'customer', 'billTo', 'soldTo', 'client', 'buyer')
  const customerAddress = get('customerAddress', 'billToAddress', 'soldToAddress', 'shippingAddress')
  const customerEmail = get('customerEmail', 'clientEmail')
  const customerPhone = get('customerPhone', 'clientPhone')
  const invoiceNo = get('invoiceNumber', 'invoiceNo', 'voucherNo', 'refNo', 'number', 'id')
  const invoiceDate = get('invoiceDate', 'issueDate', 'date', 'created')
  const dueDate = get('dueDate')
  const paymentTerms = get('paymentTerms', 'terms', 'payment')
  const purchaseOrder = get('purchaseOrder', 'poNumber', 'po')
  const subtotal = get('subtotal', 'subTotal', 'netTotal')
  const tax = get('tax', 'taxAmount', 'vat', 'gst')
  const discount = get('discount')
  const total = get('total', 'totalAmount', 'grandTotal', 'balance')
  const currency = get('currency') || 'USD'
  const notes = get('notes', 'remarks', 'comments')

  const items: any[] = (() => {
    const candidates = ['items', 'products', 'lineItems', 'services', 'details', 'lines', 'rows']
    for (const c of candidates) {
      const v = get(c)
      if (Array.isArray(v) && v.length > 0) return v
    }
    return []
  })()

  const initials = vendor ? String(vendor).charAt(0).toUpperCase() : fileName.charAt(0).toUpperCase()

  return (
    <div className="w-full rounded-2xl border border-border bg-white text-gray-900 shadow-lg dark:bg-card dark:text-foreground p-6 sm:p-10 print:shadow-none print:border-none">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-gray-200 dark:border-border pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary font-extrabold text-lg text-white shadow">
              {initials}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {vendor ? String(vendor) : fileName}
            </h2>
          </div>
          {vendorAddress && (
            <p className="text-xs text-gray-500 dark:text-muted-foreground whitespace-pre-line leading-relaxed max-w-xs">
              {String(vendorAddress)}
            </p>
          )}
          {vendorEmail && <p className="text-xs text-primary mt-1">{String(vendorEmail)}</p>}
          {vendorPhone && <p className="text-xs text-gray-500 dark:text-muted-foreground">{String(vendorPhone)}</p>}
          {vatId && <p className="text-xs text-gray-400 dark:text-muted-foreground mt-1">VAT ID: {String(vatId)}</p>}
        </div>

        <div className="sm:text-right flex-shrink-0">
          <h1 className="text-3xl font-black uppercase tracking-widest text-primary">INVOICE</h1>
          {invoiceNo && <p className="text-sm font-bold mt-1">#{String(invoiceNo)}</p>}
          {purchaseOrder && <p className="text-xs text-gray-500 dark:text-muted-foreground">PO: {String(purchaseOrder)}</p>}
          <div className="mt-3 space-y-0.5 text-xs text-gray-500 dark:text-muted-foreground">
            {invoiceDate && <p>Date: <strong className="text-gray-800 dark:text-foreground">{String(invoiceDate)}</strong></p>}
            {dueDate && <p>Due: <strong className="text-gray-800 dark:text-foreground">{String(dueDate)}</strong></p>}
            {paymentTerms && <p>Terms: <strong className="text-gray-800 dark:text-foreground">{String(paymentTerms)}</strong></p>}
          </div>
        </div>
      </div>

      {/* Bill To / Sold To */}
      {(customer || customerAddress) && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-border">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-muted-foreground mb-1">
            Bill To / Sold To:
          </p>
          {customer && <p className="font-bold text-sm">{String(customer)}</p>}
          {customerAddress && (
            <p className="text-xs text-gray-500 dark:text-muted-foreground whitespace-pre-line leading-relaxed mt-0.5 max-w-xs">
              {String(customerAddress)}
            </p>
          )}
          {customerEmail && <p className="text-xs text-primary mt-1">{String(customerEmail)}</p>}
          {customerPhone && <p className="text-xs text-gray-500 dark:text-muted-foreground">{String(customerPhone)}</p>}
        </div>
      )}

      {/* Line Items */}
      {items.length > 0 ? (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-border overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-border">
                <th className="pb-2 font-extrabold uppercase tracking-wide text-gray-400 dark:text-muted-foreground pr-4">Description</th>
                <th className="pb-2 font-extrabold uppercase tracking-wide text-gray-400 dark:text-muted-foreground text-center px-2">Qty</th>
                <th className="pb-2 font-extrabold uppercase tracking-wide text-gray-400 dark:text-muted-foreground text-right px-2">Unit Price</th>
                <th className="pb-2 font-extrabold uppercase tracking-wide text-gray-400 dark:text-muted-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                if (typeof item !== 'object') {
                  return (
                    <tr key={idx} className="border-b border-gray-100 dark:border-border/40">
                      <td colSpan={4} className="py-2.5 font-medium">{String(item)}</td>
                    </tr>
                  )
                }
                const desc = item.description ?? item.title ?? item.name ?? item.item ?? `Item ${idx + 1}`
                const qty = item.quantity ?? item.qty ?? item.area ?? 1
                const price = item.unitPrice ?? item.rate ?? item.price ?? 0
                const amount = item.amount ?? item.total ?? (typeof qty === 'number' && typeof price === 'number' ? qty * price : '—')
                return (
                  <tr key={idx} className="border-b border-gray-100 dark:border-border/40">
                    <td className="py-3 font-semibold pr-4">{String(desc)}</td>
                    <td className="py-3 text-center text-gray-500 dark:text-muted-foreground px-2">{String(qty)}</td>
                    <td className="py-3 text-right text-gray-500 dark:text-muted-foreground px-2">
                      {typeof price === 'number' ? `$${price.toFixed(2)}` : String(price)}
                    </td>
                    <td className="py-3 text-right font-bold">
                      {typeof amount === 'number' ? `$${amount.toFixed(2)}` : String(amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Totals + Notes */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="text-xs max-w-xs">
          {notes && (
            <>
              <p className="font-extrabold uppercase tracking-wide text-gray-400 dark:text-muted-foreground mb-1">Notes</p>
              <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">{String(notes)}</p>
            </>
          )}
        </div>

        <div className="w-full sm:w-60 shrink-0 space-y-1.5 text-xs">
          {subtotal != null && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-muted-foreground">Subtotal:</span>
              <span className="font-bold">{String(subtotal)}</span>
            </div>
          )}
          {discount != null && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-muted-foreground">Discount:</span>
              <span className="font-bold text-emerald-600">-{String(discount)}</span>
            </div>
          )}
          {tax != null && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-muted-foreground">Tax / VAT:</span>
              <span className="font-bold">{String(tax)}</span>
            </div>
          )}
          {total != null && (
            <div className="flex justify-between border-t border-gray-300 dark:border-border pt-2 text-sm font-extrabold">
              <span>Total ({currency}):</span>
              <span className="text-primary">{String(total)}</span>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] text-gray-400 dark:text-muted-foreground">
        Document generated from your uploaded file • {fileName}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Matches View – same as target screenshot
// ─────────────────────────────────────────────
function MatchesView({ data, fileName }: { data: any; fileName: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const matches = useMemo(() => flattenJsonToPairs(data), [data])

  return (
    <section className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{fileName}</h1>
        <div className="mt-3 h-0.5 w-full bg-foreground/90" />
        <p className="mt-4 text-xs font-semibold text-muted-foreground/80">
          Extracted source matches from the uploaded document
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {matches.map((item, idx) => {
          const isSelected = selectedIndex === idx
          return (
            <div
              key={`${item.key}-${idx}`}
              onClick={() => setSelectedIndex(idx)}
              className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 cursor-pointer select-none"
            >
              {/* Left: UPPERCASE label */}
              <div className="sm:col-span-1 pl-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  {item.key}
                </span>
              </div>
              {/* Right: value card */}
              <div
                className={cn(
                  'sm:col-span-3 flex items-start justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all shadow-2xs',
                  isSelected
                    ? 'border-amber-500/80 bg-amber-500/10 text-foreground ring-1 ring-amber-500/40 dark:bg-amber-950/20'
                    : 'border-border/80 bg-card text-foreground/90 hover:border-border hover:bg-muted/30'
                )}
              >
                <span className="whitespace-pre-line leading-relaxed break-words">{item.formattedValue}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// ReviewPanel – the tab-3 container
// ─────────────────────────────────────────────
export const ReviewPanel: React.FC<ReviewPanelProps> = memo(({
  fileName = 'invoice.pdf',
  editedJson,
  onBackToEdit,
}) => {
  const [view, setView] = useState<'invoice' | 'matches' | 'json'>('invoice')

  const handlePrint = () => window.print()

  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-200">
      {/* Toolbar */}
      <div className="sticky top-[52px] z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur px-4 sm:px-8 py-3 print:hidden">
        <button
          onClick={onBackToEdit}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          ← Edit Fields
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
            {([ ['invoice', FileText, 'Invoice PDF'], ['matches', LayoutList, 'Field Matches'], ['json', Code, 'JSON'] ] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer',
                  view === key
                    ? 'bg-background text-primary shadow-2xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {view === 'invoice' && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors print:hidden"
            >
              🖨 Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        {view === 'invoice' && (
          <InvoiceDocumentPreview data={editedJson} fileName={fileName} />
        )}
        {view === 'matches' && (
          <MatchesView data={editedJson} fileName={fileName} />
        )}
        {view === 'json' && (
          <JsonRenderer data={editedJson} fileName={fileName} />
        )}
      </div>
    </div>
  )
})

ReviewPanel.displayName = 'ReviewPanel'
