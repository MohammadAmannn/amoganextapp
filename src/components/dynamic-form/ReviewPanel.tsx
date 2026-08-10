'use client'

import React, { useState, memo, useMemo, useRef } from 'react'
import { Code, LayoutList, FileText, Download, Loader2 } from 'lucide-react'
import { flattenJsonToPairs } from './utils'
import { JsonRenderer } from './JsonRenderer'
import { cn } from '@/lib/utils'
import { downloadFileFromUrl } from '@/utils/download'
import { uploadVoucherBlob } from '@/features/vouchers/repositories/voucher-repository'

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
// ReviewPanel – Step 3
// ─────────────────────────────────────────────
export const ReviewPanel: React.FC<ReviewPanelProps> = memo(({
  fileName = 'Invoice_VCH_2026.pdf',
  fileUrl,
  editedJson,
}) => {
  const [view, setView] = useState<'invoice' | 'matches' | 'json'>('invoice')
  const [isDownloading, setIsDownloading] = useState(false)
  const [cachedPdfUrl, setCachedPdfUrl] = useState<string | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const cleanFileName = useMemo(() => {
    if (!fileName || fileName.toLowerCase().includes('aman')) {
      return 'Invoice_VCH_2026.pdf'
    }
    return fileName
  }, [fileName])

  const pdfFileName = cleanFileName.replace(/\.pdf$/i, '') + '_invoice.pdf'

  /**
   * Build invoice as a self-contained HTML string (no CSS vars, no oklch/lab),
   * upload to Supabase storage, then download directly — no print dialog.
   */
  const handleDownload = async () => {
    if (isDownloading) return

    // If already uploaded this session, just re-download
    if (cachedPdfUrl) {
      downloadFileFromUrl(cachedPdfUrl, pdfFileName)
      return
    }

    setIsDownloading(true)
    try {
      const data = editedJson || {}
      const get = (...keys: string[]) => {
        for (const k of keys) {
          const kl = k.toLowerCase().replace(/[_\-\s]/g, '')
          for (const dk of Object.keys(data)) {
            if (dk.toLowerCase().replace(/[_\-\s]/g, '') === kl && data[dk] != null && data[dk] !== '') return data[dk]
          }
        }
        return null
      }

      const vendor    = String(get('vendor','businessName','company','issuer','soldBy','from') || 'Vendor')
      const vendorAddr= get('vendorAddress','businessAddress','sellerAddress','fromAddress')
      const vendorEmail = get('vendorEmail','businessEmail','email')
      const vendorPhone = get('vendorPhone','businessPhone','phone')
      const vatId     = get('vatId','vatNumber','taxId','gstNumber')
      const customer  = String(get('customerName','customer','billTo','soldTo','client','buyer','to') || 'Customer')
      const custAddr  = get('customerAddress','billToAddress','soldToAddress','shippingAddress')
      const custEmail = get('customerEmail','clientEmail')
      const custPhone = get('customerPhone','clientPhone')
      const invoiceNo = String(get('invoiceNumber','invoiceNo','voucherNo','refNo','number','id','documentNumber') || 'N/A')
      const invoiceDate = get('invoiceDate','issueDate','date','created','issuedDate')
      const dueDate   = get('dueDate','due','paymentDue')
      const payTerms  = get('paymentTerms','terms','payment')
      const subtotal  = get('subtotal','subTotal','netTotal')
      const tax       = get('tax','taxAmount','vat','gst','taxTotal')
      const discount  = get('discount')
      const total     = get('total','totalAmount','grandTotal','balance','amountDue')
      const currency  = String(get('currency') || 'USD')
      const notes     = get('notes','remarks','comments','memo')
      const terms     = get('paymentTerms','terms','conditions')
      const initials  = vendor.slice(0, 2).toUpperCase()

      const items: any[] = (() => {
        for (const c of ['items','products','lineItems','services','details','lines','rows']) {
          const v = get(c); if (Array.isArray(v) && v.length > 0) return v
        }; return []
      })()

      const fmt = (v: any) => { const n = parseFloat(String(v ?? '0')); return isNaN(n) ? String(v ?? '') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
      const fc  = (v: any) => `${currency} ${fmt(v)}`

      const hasTax = items.some(i => i.tax != null)

      const itemRows = items.map(it => {
        const qty    = parseFloat(String(it.quantity || it.qty || 1))
        const rate   = parseFloat(String(it.rate || it.price || it.unitPrice || 0))
        const taxPct = parseFloat(String(it.tax || 0))
        const amount = qty * rate
        return `
          <tr>
            <td style="padding:10px 12px 10px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827">
              ${it.description || it.name || it.item || 'Item'}
              ${it.detail ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${it.detail}</div>` : ''}
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;color:#6b7280">${qty}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;color:#6b7280">${fc(rate)}</td>
            ${hasTax ? `<td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;color:#6b7280">${taxPct > 0 ? taxPct + '%' : '—'}</td>` : ''}
            <td style="padding:10px 0 10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;color:#111827">${fc(amount)}</td>
          </tr>`
      }).join('')

      const computedTotal = total ?? items.reduce((a, it) => a + (parseFloat(String(it.quantity||1)) * parseFloat(String(it.rate||it.price||0))), 0)

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Invoice #${invoiceNo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;color:#111827;padding:32px 16px}
    .page{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10)}
    .header{background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;color:#fff}
    .header-row{display:flex;align-items:center;justify-content:space-between;gap:16px}
    .avatar{width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;flex-shrink:0}
    .vendor-name{font-size:22px;font-weight:800;letter-spacing:-.02em}
    .vendor-sub{font-size:12px;opacity:.8;margin-top:2px}
    .inv-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.7;text-align:right}
    .inv-no{font-size:20px;font-weight:900;text-align:right;margin-top:2px}
    .body{padding:32px 40px}
    .meta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid #e5e7eb}
    .meta-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:4px}
    .meta-val{font-size:13px;font-weight:600;color:#111827}
    .meta-due{color:#dc2626}
    .addr-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
    .addr-box{border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;padding:16px}
    .addr-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6366f1;margin-bottom:8px}
    .addr-name{font-size:13px;font-weight:700;color:#111827}
    .addr-detail{font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5}
    table{width:100%;border-collapse:collapse;margin-bottom:24px}
    th{text-align:left;padding:10px 12px 10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;border-bottom:2px solid #e5e7eb}
    th.r{text-align:right;padding:10px 0 10px 8px}
    th.c{text-align:center;padding:10px 8px}
    .totals{display:flex;justify-content:flex-end;margin-bottom:24px}
    .totals-inner{width:280px}
    .t-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280}
    .t-row span:last-child{font-weight:500;color:#111827}
    .t-grand{display:flex;justify-content:space-between;align-items:center;padding:12px 0;margin-top:8px;border-top:2px solid #6366f1}
    .t-grand-label{font-size:15px;font-weight:900;color:#111827}
    .t-grand-val{font-size:18px;font-weight:900;color:#6366f1}
    .notes-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding-top:20px;border-top:1px solid #e5e7eb;margin-bottom:24px}
    .notes-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:6px}
    .notes-val{font-size:12px;color:#6b7280;line-height:1.6}
    .footer{display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#9ca3af;padding-top:16px;border-top:1px solid #f3f4f6}
    @media print{body{padding:0;background:#fff}.page{border-radius:0;box-shadow:none}}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-row">
      <div style="display:flex;align-items:center;gap:16px">
        <div class="avatar">${initials}</div>
        <div>
          <div class="vendor-name">${vendor}</div>
          ${vendorEmail ? `<div class="vendor-sub">${vendorEmail}</div>` : ''}
          ${vendorPhone ? `<div class="vendor-sub">${vendorPhone}</div>` : ''}
        </div>
      </div>
      <div>
        <div class="inv-label">Invoice</div>
        <div class="inv-no">#${invoiceNo}</div>
      </div>
    </div>
  </div>
  <div class="body">
    ${(invoiceDate || dueDate || payTerms) ? `
    <div class="meta-grid">
      ${invoiceDate ? `<div><div class="meta-label">Issue Date</div><div class="meta-val">${invoiceDate}</div></div>` : ''}
      ${dueDate ? `<div><div class="meta-label">Due Date</div><div class="meta-val meta-due">${dueDate}</div></div>` : ''}
      ${payTerms ? `<div><div class="meta-label">Terms</div><div class="meta-val">${payTerms}</div></div>` : ''}
    </div>` : ''}
    <div class="addr-grid">
      <div class="addr-box">
        <div class="addr-tag">Bill From</div>
        <div class="addr-name">${vendor}</div>
        ${vendorAddr ? `<div class="addr-detail">${String(vendorAddr)}</div>` : ''}
        ${vatId ? `<div class="addr-detail">VAT: ${vatId}</div>` : ''}
      </div>
      <div class="addr-box">
        <div class="addr-tag">Bill To</div>
        <div class="addr-name">${customer}</div>
        ${custAddr ? `<div class="addr-detail">${String(custAddr)}</div>` : ''}
        ${custEmail ? `<div class="addr-detail" style="color:#6366f1">${custEmail}</div>` : ''}
        ${custPhone ? `<div class="addr-detail">${custPhone}</div>` : ''}
      </div>
    </div>
    ${items.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="c" style="width:50px">Qty</th>
          <th class="r">Rate</th>
          ${hasTax ? `<th class="r">Tax</th>` : ''}
          <th class="r">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>` : ''}
    <div class="totals">
      <div class="totals-inner">
        ${subtotal != null ? `<div class="t-row"><span>Subtotal</span><span>${fc(subtotal)}</span></div>` : ''}
        ${tax != null ? `<div class="t-row"><span>Tax</span><span>${fc(tax)}</span></div>` : ''}
        ${discount != null && parseFloat(String(discount)) > 0 ? `<div class="t-row"><span>Discount</span><span style="color:#16a34a">-${fc(discount)}</span></div>` : ''}
        <div class="t-grand">
          <span class="t-grand-label">Total Due</span>
          <span class="t-grand-val">${fc(computedTotal)}</span>
        </div>
      </div>
    </div>
    ${(notes || terms) ? `
    <div class="notes-grid">
      ${notes ? `<div><div class="notes-label">Notes</div><div class="notes-val">${notes}</div></div>` : ''}
      ${terms ? `<div><div class="notes-label">Payment Terms</div><div class="notes-val">${terms}</div></div>` : ''}
    </div>` : ''}
    <div class="footer">
      <span>Generated via Voucher System</span>
      <span>#${invoiceNo}</span>
    </div>
  </div>
</div>
</body>
</html>`

      // Upload the self-contained HTML to Supabase storage
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const uploadName = pdfFileName.replace(/\.pdf$/i, '.html')
      const publicUrl = await uploadVoucherBlob(blob, uploadName)
      setCachedPdfUrl(publicUrl)

      // Download directly from Supabase
      downloadFileFromUrl(publicUrl, uploadName)
    } catch (err) {
      console.error('Invoice generation failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }


  return (
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

        {/* Download as PDF */}
        {view === 'invoice' && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-wait"
            title={isDownloading ? 'Generating PDF…' : 'Download as PDF'}
          >
            {isDownloading
              ? <Loader2 className="size-3.5 animate-spin" />
              : <Download className="size-3.5" />}
            <span>{isDownloading ? 'Generating…' : 'Download PDF'}</span>
          </button>
        )}
      </div>

      {/* ── Content area — fills remaining height ── */}
      {view === 'invoice' ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div ref={invoiceRef}>
            <ProfessionalInvoicePreview data={editedJson} fileName={cleanFileName} />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          {view === 'matches' && <MatchesView data={editedJson} />}
          {view === 'json' && <JsonRenderer data={editedJson} fileName={cleanFileName} />}
        </div>
      )}
    </div>
  )
})

ReviewPanel.displayName = 'ReviewPanel'
