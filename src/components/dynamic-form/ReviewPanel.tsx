'use client'

import React, { useState, memo, useMemo, useRef, useEffect } from 'react'
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
        {pairs.map(({ key, value }, index) => (
          <div key={`${key}-${index}`} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
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

  // Reset cached PDF URL whenever editedJson changes so preview & download are always updated
  useEffect(() => {
    setCachedPdfUrl(null)
  }, [editedJson])

  const cleanFileName = useMemo(() => {
    if (!fileName || fileName.toLowerCase().includes('aman')) {
      return 'Invoice_VCH_2026.pdf'
    }
    return fileName
  }, [fileName])

  const pdfFileName = cleanFileName.replace(/\.pdf$/i, '') + '_invoice.pdf'

  /**
   * High-reliability vector PDF generator using jsPDF.
   * Renders exact voucher view with crisp vector typography, tables, and colors.
   */
  const handleDownload = async () => {
    if (isDownloading) return

    if (cachedPdfUrl) {
      downloadFileFromUrl(cachedPdfUrl, pdfFileName)
      return
    }

    setIsDownloading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const data = editedJson || {}

      const get = (...keys: string[]) => {
        if (!data || typeof data !== 'object') return null
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

      const vendor = String(get('vendor', 'businessName', 'company', 'from') || 'Vendor')
      const vendorAddress = String(get('vendorAddress', 'businessAddress', 'fromAddress') || '')
      const vendorEmail = String(get('vendorEmail', 'businessEmail', 'email') || '')

      const customer = String(get('customerName', 'customer', 'billTo', 'client', 'to') || 'Customer')
      const customerAddress = String(get('customerAddress', 'billToAddress', 'shippingAddress') || '')
      const customerEmail = String(get('customerEmail', 'clientEmail') || '')

      const invoiceNo = String(get('invoiceNumber', 'invoiceNo', 'voucherNo', 'number', 'id') || 'INV-2026-1048')
      const invoiceDate = String(get('invoiceDate', 'issueDate', 'date') || new Date().toISOString().slice(0, 10))
      const dueDate = String(get('dueDate', 'due') || '')
      const currency = String(get('currency') || 'USD')
      const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'

      const subtotal = get('subtotal', 'subTotal')
      const tax = get('tax', 'taxAmount')
      const discount = get('discount')
      const total = get('total', 'totalAmount', 'grandTotal')
      const notes = get('notes', 'remarks')
      const terms = get('paymentTerms', 'terms')

      const items: any[] = (() => {
        const candidates = ['items', 'products', 'lineItems', 'services', 'details', 'lines']
        for (const c of candidates) {
          const v = get(c)
          if (Array.isArray(v) && v.length > 0) return v
        }
        return []
      })()

      const margin = 15
      let y = margin

      // Header Banner Accent
      pdf.setFillColor(248, 250, 252)
      pdf.rect(0, 0, 210, 38, 'F')
      pdf.setDrawColor(226, 232, 240)
      pdf.setLineWidth(0.3)
      pdf.line(0, 38, 210, 38)

      // Vendor Logo Badge
      pdf.setFillColor(79, 70, 229)
      pdf.roundedRect(margin, 10, 14, 14, 3, 3, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text(vendor.slice(0, 2).toUpperCase(), margin + 7, 18.5, { align: 'center' })

      // Vendor Title
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(vendor, margin + 18, 17)

      if (vendorEmail) {
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 116, 139)
        pdf.text(vendorEmail, margin + 18, 22)
      }

      // Title & Ref No (Right Aligned)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(79, 70, 229)
      pdf.text('VOUCHER / INVOICE', 210 - margin, 17, { align: 'right' })

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(71, 85, 105)
      pdf.text(`#${invoiceNo}`, 210 - margin, 23, { align: 'right' })

      y = 48

      // Bill To Column
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(148, 163, 184)
      pdf.text('BILL TO', margin, y)

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(15, 23, 42)
      pdf.text(customer, margin, y + 5)

      pdf.setFontSize(8.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(71, 85, 105)
      let custY = y + 9.5
      if (customerEmail) {
        pdf.text(customerEmail, margin, custY)
        custY += 4.5
      }
      if (customerAddress) {
        const lines = pdf.splitTextToSize(customerAddress, 85)
        pdf.text(lines, margin, custY)
      }

      // Details Column (Right Side)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(148, 163, 184)
      pdf.text('INVOICE DETAILS', 130, y)

      pdf.setFontSize(8.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(71, 85, 105)
      pdf.text(`Issue Date: ${invoiceDate}`, 130, y + 5)
      let detY = y + 9.5
      if (dueDate) {
        pdf.text(`Due Date: ${dueDate}`, 130, detY)
        detY += 4.5
      }
      pdf.text(`Currency: ${currency}`, 130, detY)

      y = 78

      // Table Header
      pdf.setFillColor(241, 245, 249)
      pdf.rect(margin, y, 180, 8, 'F')
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(71, 85, 105)
      pdf.text('DESCRIPTION', margin + 3, y + 5.5)
      pdf.text('QTY', 125, y + 5.5, { align: 'right' })
      pdf.text('RATE', 158, y + 5.5, { align: 'right' })
      pdf.text('AMOUNT', 192, y + 5.5, { align: 'right' })

      y += 8

      // Table Rows
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8.5)
      pdf.setTextColor(30, 41, 59)

      const itemsList = items.length > 0 ? items : [
        { description: 'Cloud Infrastructure & Managed Consulting', quantity: 1, rate: total || 13200 }
      ]

      let calcSubtotal = 0

      itemsList.forEach((item, idx) => {
        const desc = String(item.description || item.name || item.item || `Line Item #${idx + 1}`)
        const qty = parseFloat(String(item.quantity || item.qty || 1)) || 1
        const rate = parseFloat(String(item.rate || item.price || item.unitPrice || 0)) || 0
        const amt = qty * rate
        calcSubtotal += amt

        if (idx % 2 === 1) {
          pdf.setFillColor(248, 250, 252)
          pdf.rect(margin, y, 180, 7, 'F')
        }

        const descLines = pdf.splitTextToSize(desc, 95)
        pdf.text(descLines, margin + 3, y + 4.8)
        pdf.text(String(qty), 125, y + 4.8, { align: 'right' })
        pdf.text(`${currencySymbol}${rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 158, y + 4.8, { align: 'right' })
        pdf.text(`${currencySymbol}${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 192, y + 4.8, { align: 'right' })

        const rowH = Math.max(7.5, descLines.length * 4.5)
        y += rowH
      })

      pdf.setDrawColor(226, 232, 240)
      pdf.setLineWidth(0.3)
      pdf.line(margin, y, 195, y)
      y += 8

      // Totals Box
      const finalSubtotal = subtotal != null ? parseFloat(String(subtotal)) : calcSubtotal
      const finalTax = tax != null ? parseFloat(String(tax)) : 0
      const finalDiscount = discount != null ? parseFloat(String(discount)) : 0
      const finalTotal = total != null ? parseFloat(String(total)) : (finalSubtotal + finalTax - finalDiscount)

      const totX = 130
      pdf.setFontSize(8.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 116, 139)

      pdf.text('Subtotal:', totX, y)
      pdf.text(`${currencySymbol}${finalSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 192, y, { align: 'right' })
      y += 5.5

      if (finalTax > 0) {
        pdf.text('Tax:', totX, y)
        pdf.text(`${currencySymbol}${finalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 192, y, { align: 'right' })
        y += 5.5
      }

      if (finalDiscount > 0) {
        pdf.text('Discount:', totX, y)
        pdf.text(`-${currencySymbol}${finalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 192, y, { align: 'right' })
        y += 5.5
      }

      pdf.setDrawColor(79, 70, 229)
      pdf.setLineWidth(0.5)
      pdf.line(totX, y, 195, y)
      y += 6.5

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(79, 70, 229)
      pdf.text('Total Due:', totX, y)
      pdf.text(`${currencySymbol}${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 192, y, { align: 'right' })

      y += 16

      // Notes & Terms
      if (notes || terms) {
        pdf.setDrawColor(226, 232, 240)
        pdf.setLineWidth(0.2)
        pdf.line(margin, y, 195, y)
        y += 6

        if (notes) {
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(148, 163, 184)
          pdf.text('NOTES', margin, y)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(71, 85, 105)
          const nLines = pdf.splitTextToSize(String(notes), 85)
          pdf.text(nLines, margin, y + 4.5)
        }

        if (terms) {
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(148, 163, 184)
          pdf.text('PAYMENT TERMS', 110, y)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(71, 85, 105)
          const tLines = pdf.splitTextToSize(String(terms), 85)
          pdf.text(tLines, 110, y + 4.5)
        }
      }

      // Footer
      pdf.setFontSize(7.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(148, 163, 184)
      pdf.text('Generated via Voucher System', margin, 285)
      pdf.text(`#${invoiceNo}`, 195, 285, { align: 'right' })

      const pdfBlob = pdf.output('blob')

      // Trigger instant 1-click download in browser
      const blobUrl = URL.createObjectURL(pdfBlob)
      downloadFileFromUrl(blobUrl, pdfFileName)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)

      // Upload blob to Supabase storage in background for URL caching
      uploadVoucherBlob(pdfBlob, pdfFileName)
        .then((url) => setCachedPdfUrl(url))
        .catch(() => {})
    } catch (err) {
      console.error('Failed to generate PDF:', err)
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
