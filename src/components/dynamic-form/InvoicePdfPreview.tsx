'use client'

import React, { memo } from 'react'
import { Printer, ShieldCheck, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { flattenJsonToPairs, formatKeyToLabel } from './utils'
import { cn } from '@/lib/utils'

interface InvoicePdfPreviewProps {
  fileName?: string
  editedJson: any
  className?: string
}

/**
 * Case-insensitive recursive property locator
 */
function findProp(data: any, candidateKeys: string[]): any {
  if (!data || typeof data !== 'object') return undefined

  const dataKeys = Object.keys(data)

  // 1. Root level match
  for (const candidate of candidateKeys) {
    const candLower = candidate.toLowerCase().replace(/[_-]/g, '')
    for (const key of dataKeys) {
      if (key.toLowerCase().includes('meta')) continue
      const keyLower = key.toLowerCase().replace(/[_-]/g, '')
      if (keyLower === candLower && data[key] !== undefined && data[key] !== null) {
        return data[key]
      }
    }
  }

  // 2. Recursive nested search
  for (const key of dataKeys) {
    if (key.toLowerCase().includes('meta')) continue
    const val = data[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const found = findProp(val, candidateKeys)
      if (found !== undefined && found !== null) return found
    }
  }

  return undefined
}

/**
 * Finds array of items (e.g. items, products, lineItems, floors) inside data
 */
function findArrayProp(data: any): any[] | null {
  if (!data || typeof data !== 'object') return null

  const candidates = ['items', 'products', 'lineitems', 'services', 'floors', 'details', 'rows', 'lines']
  for (const cand of candidates) {
    const arr = findProp(data, [cand])
    if (Array.isArray(arr) && arr.length > 0) return arr
  }

  // Check top-level keys for any array of objects
  for (const key of Object.keys(data)) {
    if (key.toLowerCase().includes('meta')) continue
    if (Array.isArray(data[key]) && data[key].length > 0) {
      return data[key]
    }
  }

  return null
}

export const InvoicePdfPreview: React.FC<InvoicePdfPreviewProps> = memo(({
  fileName = 'document-invoice.pdf',
  editedJson,
  className,
}) => {
  if (!editedJson) return null

  // Dynamically extract values from editedJson without hardcoded fallbacks
  const vendorName = findProp(editedJson, [
    'vendor',
    'businessName',
    'business',
    'soldBy',
    'company',
    'supplier',
    'seller',
    'issuer',
  ])

  const vendorAddress = findProp(editedJson, [
    'businessAddress',
    'vendorAddress',
    'soldByAddress',
    'sellerAddress',
    'address',
  ])

  const customerName = findProp(editedJson, [
    'customerName',
    'customer',
    'billTo',
    'soldTo',
    'client',
    'buyer',
    'recipient',
    'owner',
  ])

  const customerAddress = findProp(editedJson, [
    'customerAddress',
    'billToAddress',
    'soldToAddress',
    'buyerAddress',
    'shippingAddress',
  ])

  const customerEmail = findProp(editedJson, [
    'customerEmail',
    'email',
    'businessEmail',
    'mail',
  ])

  const invoiceNumber = findProp(editedJson, [
    'invoiceNumber',
    'invoiceNo',
    'voucherNo',
    'invoiceId',
    'number',
    'id',
    'ref',
    'po',
  ])

  const issueDate = findProp(editedJson, [
    'invoiceDate',
    'issueDate',
    'date',
    'createdDate',
    'extractedAt',
  ])

  const dueDate = findProp(editedJson, [
    'dueDate',
    'paymentTerms',
    'terms',
    'dueDateTerms',
  ])

  const subtotal = findProp(editedJson, ['subtotal', 'netTotal', 'subTotal'])
  const tax = findProp(editedJson, ['tax', 'vat', 'gst', 'taxAmount'])
  const total = findProp(editedJson, ['total', 'totalAmount', 'grandTotal', 'amount', 'balance'])

  const items = findArrayProp(editedJson)
  const flatPairs = flattenJsonToPairs(editedJson)

  const displayTitle = vendorName
    ? String(vendorName)
    : fileName.replace(/\.[^/.]+$/, '').toUpperCase()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 shrink-0 print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Updated PDF Invoice (Synchronized with Form Data)</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
        >
          <Printer className="size-3.5" />
          <span>Print / Save PDF</span>
        </Button>
      </div>

      {/* Styled Printable Invoice Document */}
      <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-md text-foreground print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-2xs">
                {displayTitle.charAt(0)}
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">{displayTitle}</h2>
            </div>
            {vendorAddress && (
              <p className="mt-2 text-xs text-muted-foreground whitespace-pre-line leading-relaxed max-w-xs">
                {String(vendorAddress)}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <h1 className="text-2xl font-black uppercase tracking-widest text-primary">INVOICE</h1>
            {invoiceNumber && (
              <p className="mt-1 text-xs font-bold text-foreground">
                #{String(invoiceNumber)}
              </p>
            )}
            <div className="mt-3 flex flex-col sm:items-end text-xs text-muted-foreground gap-0.5">
              {issueDate && <p><span>Date: </span><strong className="text-foreground">{String(issueDate)}</strong></p>}
              {dueDate && <p><span>Terms: </span><strong className="text-foreground">{String(dueDate)}</strong></p>}
            </div>
          </div>
        </div>

        {/* Billed / Sold To Section */}
        {(customerName || customerAddress || customerEmail) && (
          <div className="grid sm:grid-cols-2 gap-6 py-6 border-b border-border">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Billed / Sold To:
              </span>
              {customerName && <p className="mt-1 text-sm font-bold text-foreground">{String(customerName)}</p>}
              {customerAddress && (
                <p className="mt-0.5 text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {String(customerAddress)}
                </p>
              )}
              {customerEmail && (
                <p className="mt-1 text-xs text-primary font-medium">{String(customerEmail)}</p>
              )}
            </div>
          </div>
        )}

        {/* Line Items Table or Extracted Data Pairs */}
        <div className="py-6 border-b border-border">
          {items && items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border uppercase font-bold text-muted-foreground">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-center">Qty / Area</th>
                    <th className="pb-2 text-right">Price / Rate</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {items.map((item: any, idx: number) => {
                    if (typeof item !== 'object' || item === null) {
                      return (
                        <tr key={idx}>
                          <td colSpan={4} className="py-2.5 font-semibold text-foreground">{String(item)}</td>
                        </tr>
                      )
                    }

                    const desc = item.description || item.title || item.name || item.item || `Item ${idx + 1}`
                    const qty = item.quantity || item.qty || item.area || item.count || '1'
                    const rate = item.rate || item.unitPrice || item.price || item.owner || '—'
                    const amount = item.amount || item.total || (typeof qty === 'number' && typeof rate === 'number' ? qty * rate : '—')

                    return (
                      <tr key={idx}>
                        <td className="py-3 pr-2 font-semibold text-foreground">{String(desc)}</td>
                        <td className="py-3 text-center text-muted-foreground">{String(qty)}</td>
                        <td className="py-3 text-right text-muted-foreground">
                          {typeof rate === 'number' ? `$${rate.toFixed(2)}` : String(rate)}
                        </td>
                        <td className="py-3 text-right font-bold text-foreground">
                          {typeof amount === 'number' ? `$${amount.toFixed(2)}` : String(amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
              {flatPairs.map((pair, idx) => (
                <div key={idx} className="flex justify-between border-b border-border/40 py-2 pr-2">
                  <span className="font-semibold text-muted-foreground">{pair.label}:</span>
                  <span className="font-bold text-foreground">{String(pair.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Summary Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-6">
          <div className="text-xs text-muted-foreground max-w-sm">
            <p className="font-semibold text-foreground">Document Verified & Updated</p>
            <p className="mt-1 text-[11px] leading-relaxed">
              Generated live from OCR extraction and your corrected form values.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            {subtotal && (
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-bold text-foreground">{String(subtotal)}</span>
              </div>
            )}
            {tax && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax / VAT:</span>
                <span className="font-bold text-foreground">{String(tax)}</span>
              </div>
            )}
            {total && (
              <div className="flex justify-between border-t border-border pt-2 text-sm font-extrabold text-foreground">
                <span>Total Amount:</span>
                <span className="text-primary">{String(total)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

InvoicePdfPreview.displayName = 'InvoicePdfPreview'
