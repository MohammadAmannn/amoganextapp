'use client'

import React, { useState, memo, useMemo } from 'react'
import { Code, LayoutList, FileText, Download, Printer } from 'lucide-react'
import { flattenJsonToPairs } from './utils'
import { JsonRenderer } from './JsonRenderer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ReviewPanelProps {
  fileName?: string
  fileUrl?: string
  editedJson: any
  onBackToEdit?: () => void
}

// ─────────────────────────────────────────────
// Field Matches View
// ─────────────────────────────────────────────
function MatchesView({ data, fileName }: { data: any; fileName: string }) {
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

// ─────────────────────────────────────────────
// Professional Invoice Template
// ─────────────────────────────────────────────
function ProfessionalInvoicePreview({ data, fileName }: { data: any; fileName: string }) {
  if (!data) return null

  const get = (...keys: string[]) => {
    for (const k of keys) {
      const kl = k.toLowerCase().replace(/[_\-\s]/g, '')
      for (const dk of Object.keys(data)) {
        if (dk.toLowerCase().replace(/[_\-\s]/g, '') === kl && data[dk] != null && data[dk] !== '') {
          return data[dk]
        }
      }
    }
    return null
  }

  const vendor = get('vendor', 'businessName', 'company', 'issuer', 'soldBy', 'from')
  const vendorAddress = get('vendorAddress', 'businessAddress', 'sellerAddress', 'fromAddress')
  const vendorEmail = get('vendorEmail', 'businessEmail', 'email')
  const vendorPhone = get('vendorPhone', 'businessPhone', 'phone')
  const vatId = get('vatId', 'vatNumber', 'taxId', 'gstNumber')
  const customer = get('customerName', 'customer', 'billTo', 'soldTo', 'client', 'buyer', 'to')
  const customerAddress = get('customerAddress', 'billToAddress', 'soldToAddress', 'shippingAddress')
  const customerEmail = get('customerEmail', 'clientEmail')
  const customerPhone = get('customerPhone', 'clientPhone')
  const invoiceNo = get('invoiceNumber', 'invoiceNo', 'voucherNo', 'refNo', 'number', 'id', 'documentNumber')
  const invoiceDate = get('invoiceDate', 'issueDate', 'date', 'created', 'issuedDate')
  const dueDate = get('dueDate', 'due', 'paymentDue')
  const paymentTerms = get('paymentTerms', 'terms', 'payment')
  const purchaseOrder = get('purchaseOrder', 'poNumber', 'po')
  const subtotal = get('subtotal', 'subTotal', 'netTotal')
  const tax = get('tax', 'taxAmount', 'vat', 'gst', 'taxTotal')
  const discount = get('discount')
  const total = get('total', 'totalAmount', 'grandTotal', 'balance', 'amountDue')
  const currency = get('currency') || 'USD'
  const notes = get('notes', 'remarks', 'comments', 'memo')
  const terms = get('paymentTerms', 'terms', 'conditions')

  const items: any[] = (() => {
    const candidates = ['items', 'products', 'lineItems', 'services', 'details', 'lines', 'rows']
    for (const c of candidates) {
      const v = get(c)
      if (Array.isArray(v) && v.length > 0) return v
    }
    return []
  })()

  const displayVendor = vendor ? String(vendor) : 'Vendor'
  const initials = displayVendor.slice(0, 2).toUpperCase()

  const fmt = (val: any) => {
    const n = parseFloat(String(val ?? '0'))
    return isNaN(n) ? String(val ?? '') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const fmtCurrency = (val: any) => `${currency} ${fmt(val)}`

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-border bg-card text-foreground shadow-md overflow-hidden print:shadow-none print:border-none">
      {/* Header Band */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 sm:px-10 py-7 text-primary-foreground">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 font-black text-xl tracking-tight shadow-inner backdrop-blur-sm">
              {initials}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{displayVendor}</h1>
              {vendorEmail && <p className="text-xs text-primary-foreground/80 mt-0.5">{String(vendorEmail)}</p>}
              {vendorPhone && <p className="text-xs text-primary-foreground/80">{String(vendorPhone)}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">Invoice</p>
            <p className="text-lg sm:text-xl font-black tracking-tight mt-0.5">#{invoiceNo || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-7">
        {/* Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 pb-6 border-b border-border">
          {invoiceDate && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Issue Date</p>
              <p className="text-sm font-semibold mt-0.5">{String(invoiceDate)}</p>
            </div>
          )}
          {dueDate && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Date</p>
              <p className="text-sm font-semibold mt-0.5 text-red-600 dark:text-red-400">{String(dueDate)}</p>
            </div>
          )}
          {paymentTerms && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Terms</p>
              <p className="text-sm font-semibold mt-0.5">{String(paymentTerms)}</p>
            </div>
          )}
          {purchaseOrder && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PO Number</p>
              <p className="text-sm font-semibold mt-0.5">{String(purchaseOrder)}</p>
            </div>
          )}
        </div>

        {/* Bill From / Bill To */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Bill From</p>
            <p className="font-bold text-sm">{displayVendor}</p>
            {vendorAddress && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">{String(vendorAddress)}</p>}
            {vatId && <p className="text-xs text-muted-foreground mt-1">VAT: {String(vatId)}</p>}
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Bill To</p>
            <p className="font-bold text-sm">{customer ? String(customer) : 'Customer'}</p>
            {customerAddress && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">{String(customerAddress)}</p>}
            {customerEmail && <p className="text-xs text-primary mt-1">{String(customerEmail)}</p>}
            {customerPhone && <p className="text-xs text-muted-foreground">{String(customerPhone)}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        {items.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2.5 pr-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</th>
                  <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-14">Qty</th>
                  <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rate</th>
                  {items.some(i => i.tax != null) && (
                    <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tax</th>
                  )}
                  <th className="text-right py-2.5 pl-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => {
                  const qty = parseFloat(String(item.quantity || item.qty || 1))
                  const rate = parseFloat(String(item.rate || item.price || item.unitPrice || 0))
                  const taxPct = parseFloat(String(item.tax || 0))
                  const amount = qty * rate
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-foreground">{item.description || item.name || item.item || 'Item'}</p>
                        {item.detail && <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>}
                      </td>
                      <td className="py-3 px-2 text-center text-muted-foreground">{qty}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">{fmtCurrency(rate)}</td>
                      {items.some(it => it.tax != null) && (
                        <td className="py-3 px-2 text-right text-muted-foreground">{taxPct > 0 ? `${taxPct}%` : '—'}</td>
                      )}
                      <td className="py-3 pl-2 text-right font-semibold">{fmtCurrency(amount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-72 flex flex-col gap-1">
            {subtotal != null && (
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{fmtCurrency(subtotal)}</span>
              </div>
            )}
            {tax != null && (
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{fmtCurrency(tax)}</span>
              </div>
            )}
            {discount != null && parseFloat(String(discount)) > 0 && (
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-green-600 dark:text-green-400">-{fmtCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 mt-2 border-t-2 border-primary">
              <span className="font-black text-base">Total Due</span>
              <span className="font-black text-xl text-primary">{fmtCurrency(total ?? (items.reduce((acc, it) => acc + (parseFloat(String(it.quantity || 1)) * parseFloat(String(it.rate || it.price || 0))), 0)))}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(notes || terms) && (
          <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-border">
            {notes && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Notes</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{String(notes)}</p>
              </div>
            )}
            {terms && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Payment Terms</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{String(terms)}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer stamp */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <FileText className="size-3.5" />
            <span>Generated via Voucher System</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            #{invoiceNo || 'DRAFT'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ReviewPanel – Step 3 Container
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

  const handleDownloadPdf = () => {
    const data = editedJson || {}
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const kl = k.toLowerCase().replace(/[_\-\s]/g, '')
        for (const dk of Object.keys(data)) {
          if (dk.toLowerCase().replace(/[_\-\s]/g, '') === kl && data[dk] != null && data[dk] !== '') {
            return String(data[dk])
          }
        }
      }
      return ''
    }

    const vendor = get('vendor', 'businessName', 'company') || 'Vendor'
    const vendorAddress = get('vendorAddress', 'businessAddress') || ''
    const vendorEmail = get('vendorEmail', 'businessEmail', 'email') || ''
    const customer = get('customerName', 'customer', 'billTo', 'client') || 'Customer'
    const customerAddress = get('customerAddress', 'billToAddress') || ''
    const invoiceNo = get('invoiceNumber', 'invoiceNo', 'voucherNo') || 'DRAFT'
    const invoiceDate = get('invoiceDate', 'issueDate', 'date') || new Date().toLocaleDateString()
    const dueDate = get('dueDate') || ''
    const paymentTerms = get('paymentTerms', 'terms') || ''
    const subtotal = get('subtotal', 'subTotal') || ''
    const tax = get('tax', 'taxAmount', 'vat') || ''
    const total = get('total', 'totalAmount', 'grandTotal') || ''
    const currency = get('currency') || 'USD'
    const notes = get('notes', 'remarks') || ''
    const terms = get('paymentTerms', 'terms') || ''

    const items: any[] = (() => {
      const candidates = ['items', 'products', 'lineItems', 'services', 'details', 'lines']
      for (const c of candidates) {
        const v = data[c] || data[c.toLowerCase()] || data[c.toUpperCase()]
        if (Array.isArray(v) && v.length > 0) return v
      }
      return []
    })()

    const fmt = (val: any) => {
      const n = parseFloat(String(val ?? '0'))
      return isNaN(n) ? String(val ?? '') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    // Use a hidden iframe instead of window.open to completely avoid browser popup blockers
    let iframe = document.getElementById('pdf-print-iframe') as HTMLIFrameElement | null
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'pdf-print-iframe'
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)
    }

    const doc = iframe.contentWindow?.document
    if (!doc) {
      toast.error('Unable to initialize PDF generator.')
      return
    }

    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${cleanFileName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 32px; }
    .header { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; padding: 28px 36px; display: flex; justify-content: space-between; align-items: flex-start; border-radius: 16px 16px 0 0; }
    .logo { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; margin-right: 14px; }
    .vendor-name { font-size: 20px; font-weight: 900; }
    .vendor-meta { font-size: 11px; opacity: 0.85; margin-top: 3px; }
    .invoice-num { text-align: right; }
    .invoice-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.75; }
    .invoice-val { font-size: 18px; font-weight: 900; margin-top: 3px; }
    .body { padding: 28px 36px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
    .meta-item label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; display: block; margin-bottom: 3px; }
    .meta-item span { font-size: 12px; font-weight: 600; }
    .billing { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .bill-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
    .bill-box label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5; display: block; margin-bottom: 4px; }
    .bill-box .name { font-size: 13px; font-weight: 700; }
    .bill-box .address { font-size: 11px; color: #6b7280; margin-top: 3px; line-height: 1.5; white-space: pre-line; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead tr { border-bottom: 2px solid #111827; }
    th { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; padding: 8px 6px; text-align: left; }
    th:not(:first-child) { text-align: right; }
    td { padding: 10px 6px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
    td:not(:first-child) { text-align: right; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-inner { width: 260px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
    .total-row.grand { border-top: 2px solid #4f46e5; border-bottom: none; margin-top: 4px; }
    .total-row.grand span:first-child { font-size: 15px; font-weight: 900; }
    .total-row.grand span:last-child { font-size: 18px; font-weight: 900; color: #4f46e5; }
    .footer-notes { padding-top: 16px; border-top: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .note-block label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; display: block; margin-bottom: 3px; }
    .note-block p { font-size: 11px; color: #6b7280; line-height: 1.5; }
    .stamp { margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .stamp span { font-size: 10px; color: #9ca3af; }
    @media print {
      html, body { height: 100%; }
      .page { padding: 0; }
      .header { border-radius: 12px 12px 0 0; }
      @page { size: A4; margin: 10mm; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div style="display:flex;align-items:center">
      <div class="logo">${vendor.slice(0, 2).toUpperCase()}</div>
      <div>
        <div class="vendor-name">${vendor}</div>
        ${vendorEmail ? `<div class="vendor-meta">${vendorEmail}</div>` : ''}
        ${vendorAddress ? `<div class="vendor-meta">${vendorAddress.split('\n')[0]}</div>` : ''}
      </div>
    </div>
    <div class="invoice-num">
      <div class="invoice-label">Invoice</div>
      <div class="invoice-val">#${invoiceNo}</div>
    </div>
  </div>

  <div class="body">
    <div class="meta-grid">
      ${invoiceDate ? `<div class="meta-item"><label>Issue Date</label><span>${invoiceDate}</span></div>` : ''}
      ${dueDate ? `<div class="meta-item"><label>Due Date</label><span style="color:#dc2626">${dueDate}</span></div>` : ''}
      ${paymentTerms ? `<div class="meta-item"><label>Terms</label><span>${paymentTerms}</span></div>` : ''}
      <div class="meta-item"><label>Currency</label><span>${currency}</span></div>
    </div>

    <div class="billing">
      <div class="bill-box">
        <label>Bill From</label>
        <div class="name">${vendor}</div>
        ${vendorAddress ? `<div class="address">${vendorAddress}</div>` : ''}
      </div>
      <div class="bill-box">
        <label>Bill To</label>
        <div class="name">${customer}</div>
        ${customerAddress ? `<div class="address">${customerAddress}</div>` : ''}
      </div>
    </div>

    ${items.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Description</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: any) => {
          const qty = parseFloat(String(item.quantity || item.qty || 1))
          const rate = parseFloat(String(item.rate || item.price || 0))
          const amount = qty * rate
          return `
          <tr>
            <td>${item.description || item.name || 'Item'}</td>
            <td style="text-align:right">${qty}</td>
            <td style="text-align:right">${currency} ${fmt(rate)}</td>
            <td style="text-align:right">${currency} ${fmt(amount)}</td>
          </tr>`
        }).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="totals">
      <div class="totals-inner">
        ${subtotal ? `<div class="total-row"><span>Subtotal</span><span>${currency} ${fmt(subtotal)}</span></div>` : ''}
        ${tax ? `<div class="total-row"><span>Tax</span><span>${currency} ${fmt(tax)}</span></div>` : ''}
        <div class="total-row grand">
          <span>Total Due</span>
          <span>${currency} ${fmt(total || items.reduce((a, it) => a + (parseFloat(String(it.quantity || 1)) * parseFloat(String(it.rate || it.price || 0))), 0))}</span>
        </div>
      </div>
    </div>

    ${notes || terms ? `
    <div class="footer-notes">
      ${notes ? `<div class="note-block"><label>Notes</label><p>${notes}</p></div>` : ''}
      ${terms ? `<div class="note-block"><label>Payment Terms</label><p>${terms}</p></div>` : ''}
    </div>` : ''}

    <div class="stamp">
      <span>Generated via Voucher System</span>
      <span>#${invoiceNo}</span>
    </div>
  </div>
</div>
</body>
</html>`)
    doc.close()

    // Trigger printing from hidden iframe without popup blocker
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        toast.success('Print dialog opened! Choose "Save as PDF".')
      } catch (err) {
        toast.error('Print trigger failed. Please try again.')
      }
    }, 250)
  }

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Toolbar - Flush at top (top-0) */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-2.5 shadow-2xs print:hidden shrink-0">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
          {([
            ['invoice', FileText, 'Voucher Preview'],
            ['matches', LayoutList, 'Field Matches'],
            ['json', Code, 'JSON'],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer select-none',
                view === key
                  ? 'bg-background text-primary shadow-2xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Download PDF button */}
        <Button
          type="button"
          size="sm"
          onClick={handleDownloadPdf}
          className="gap-2 font-bold px-4 shadow-2xs cursor-pointer text-xs"
        >
          <Printer className="size-3.5" />
          <span>Download PDF</span>
        </Button>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin">
        {view === 'invoice' && (
          <ProfessionalInvoicePreview data={editedJson} fileName={cleanFileName} />
        )}
        {view === 'matches' && (
          <MatchesView data={editedJson} fileName={cleanFileName} />
        )}
        {view === 'json' && (
          <JsonRenderer data={editedJson} fileName={cleanFileName} />
        )}
      </div>
    </div>
  )
})

ReviewPanel.displayName = 'ReviewPanel'

