'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  ScanLine,
  Calendar as CalendarIcon,
  ArrowLeft,
  ArrowRight,
  Save,
  ChevronDown,
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  Printer,
  Download,
  CheckCircle2,
  FileCheck,
  Tag,
  Package,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Paperclip,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'upload' | 'items' | 'preview'

// Types for items and products
interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  image?: string
}

const SAMPLE_CATALOG_PRODUCTS: OrderItem[] = [
  {
    id: 'prod-1',
    name: '1-Ajax Rode Bloemen Kofir',
    price: 99.0,
    quantity: 1,
    category: 'Clothing',
  },
  {
    id: 'prod-2',
    name: 'Light Cured Composite Kit',
    price: 32.0,
    quantity: 1,
    category: 'Accessories',
  },
  {
    id: 'prod-3',
    name: 'Pencil Stabilo Professional 2B',
    price: 30.0,
    quantity: 1,
    category: 'Office',
  },
  {
    id: 'prod-4',
    name: 'Minimalist Architecture Poster A2',
    price: 50.0,
    quantity: 1,
    category: 'Art',
  },
  {
    id: 'prod-5',
    name: 'Logitech MX Master 3S Wireless',
    price: 99.99,
    quantity: 1,
    category: 'Electronics',
  },
  {
    id: 'prod-6',
    name: 'Ergonomic Desk Mat Leather Gray',
    price: 35.0,
    quantity: 1,
    category: 'Office',
  },
]

export function NewVouncherScan({ stateIndex = 0 }: { stateIndex?: number }) {
  // Stepper state
  const [currentTab, setCurrentTab] = useState<Tab>('upload')

  // Tab 1 Form Fields
  const [template, setTemplate] = useState<string>('Standard Document')
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 21))
  const [voucherNo, setVoucherNo] = useState<string>('VCH-2026-1048')
  const [ledger, setLedger] = useState<string>('General Operating Ledger / Accounts Payable')
  const [remarks, setRemarks] = useState<string>('Procurement of office supplies and technical equipment.')
  const [terms, setTerms] = useState<string>('Net 30 days. Payment due within 30 days of issue date.')
  const [attachedFileName, setAttachedFileName] = useState<string>('invoice-scan-aug2026.pdf')

  // Tab 2 Items Cart State (from My Order Template)
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'prod-1',
      name: '1-Ajax Rode Bloemen Kofir',
      price: 99.0,
      quantity: 2,
      category: 'Clothing',
    },
    {
      id: 'prod-3',
      name: 'Pencil Stabilo Professional 2B',
      price: 30.0,
      quantity: 3,
      category: 'Office',
    },
  ])

  // Catalog search & filter in Tab 2
  const [catalogSearch, setCatalogSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const taxRate = 0.08
  const taxAmount = subtotal * taxRate
  const grandTotal = subtotal + taxAmount

  // Cart operations
  const handleAddItem = (product: OrderItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    toast.success(`Added "${product.name}" to voucher items!`)
  }

  const handleUpdateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean) as OrderItem[]
    )
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    toast.info('Item removed')
  }

  // Filter products for Tab 2
  const categories = ['All', 'Clothing', 'Accessories', 'Office', 'Art', 'Electronics']
  const filteredProducts = SAMPLE_CATALOG_PRODUCTS.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(catalogSearch.toLowerCase())
    const matchesCat = selectedCategory === 'All' || prod.category === selectedCategory
    return matchesSearch && matchesCat
  })

  // Export Handlers
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const margin = 40
      let y = 50

      // Header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(79, 70, 229) // Indigo
      doc.text('OFFICIAL VOUCHER', margin, y)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(`Voucher No: #${voucherNo}`, 390, y)

      y += 20
      doc.setDrawColor(226, 232, 240)
      doc.line(margin, y, 555, y)

      y += 25
      doc.setFontSize(10)
      doc.setTextColor(30, 41, 59)
      doc.text(`Date: ${date ? format(date, 'MMMM d, yyyy') : 'N/A'}`, margin, y)
      doc.text(`Template: ${template}`, 300, y)

      y += 18
      doc.text(`Ledger Account: ${ledger}`, margin, y)

      if (remarks) {
        y += 18
        doc.text(`Remarks: ${remarks.slice(0, 75)}`, margin, y)
      }

      y += 28
      // Table Header
      doc.setFillColor(241, 245, 249)
      doc.rect(margin, y - 12, 515, 20, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text('#', margin + 6, y + 2)
      doc.text('Item Description', margin + 30, y + 2)
      doc.text('Category', margin + 240, y + 2)
      doc.text('Qty', margin + 340, y + 2)
      doc.text('Unit Price', margin + 390, y + 2)
      doc.text('Total', margin + 460, y + 2)

      y += 18
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)

      items.forEach((item, index) => {
        doc.text(String(index + 1), margin + 6, y)
        doc.text(item.name.slice(0, 34), margin + 30, y)
        doc.text(item.category, margin + 240, y)
        doc.text(String(item.quantity), margin + 340, y)
        doc.text(`$${item.price.toFixed(2)}`, margin + 390, y)
        doc.text(`$${(item.price * item.quantity).toFixed(2)}`, margin + 460, y)
        y += 18
        doc.setDrawColor(241, 245, 249)
        doc.line(margin, y - 12, 555, y - 12)
      })

      y += 12
      doc.line(margin, y, 555, y)
      y += 20
      doc.setFont('helvetica', 'normal')
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 390, y)
      y += 16
      doc.text(`Tax (8%): $${taxAmount.toFixed(2)}`, 390, y)
      y += 18
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(79, 70, 229)
      doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 390, y)

      if (terms) {
        y += 30
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139)
        doc.text(`Payment Terms: ${terms.slice(0, 100)}`, margin, y)
      }

      doc.save(`voucher-${voucherNo.toLowerCase()}.pdf`)
      toast.success('Downloaded Voucher PDF (.pdf)!')
    } catch (err) {
      console.error('PDF generation error:', err)
      toast.error('Failed to generate PDF')
    }
  }

  const handleDownloadXLS = () => {
    try {
      const wsData = [
        [`OFFICIAL VOUCHER SUMMARY: #${voucherNo}`],
        [`Date: ${date ? format(date, 'yyyy-MM-dd') : ''}`],
        [`Ledger: ${ledger}`],
        [`Template: ${template}`],
        [],
        ['#', 'Item / Description', 'Category', 'Quantity', 'Unit Price ($)', 'Line Total ($)'],
        ...items.map((it, idx) => [
          idx + 1,
          it.name,
          it.category,
          it.quantity,
          Number(it.price.toFixed(2)),
          Number((it.price * it.quantity).toFixed(2)),
        ]),
        [],
        ['', '', '', '', 'Subtotal ($)', Number(subtotal.toFixed(2))],
        ['', '', '', '', 'Tax (8%) ($)', Number(taxAmount.toFixed(2))],
        ['', '', '', '', 'Grand Total ($)', Number(grandTotal.toFixed(2))],
      ]

      const ws = XLSX.utils.aoa_to_sheet(wsData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Voucher')
      XLSX.writeFile(wb, `voucher-${voucherNo.toLowerCase()}.xlsx`)
      toast.success('Downloaded Excel Spreadsheet (.xlsx)!')
    } catch (err) {
      console.error('Excel export error:', err)
      toast.error('Failed to export Excel file')
    }
  }

  const handleDownloadDOC = () => {
    const tableRowsHTML = items
      .map(
        (it, i) => `<tr>
          <td style="padding:8px;border:1px solid #cbd5e1;text-align:center;">${i + 1}</td>
          <td style="padding:8px;border:1px solid #cbd5e1;"><strong>${it.name}</strong></td>
          <td style="padding:8px;border:1px solid #cbd5e1;">${it.category}</td>
          <td style="padding:8px;border:1px solid #cbd5e1;text-align:center;">${it.quantity}</td>
          <td style="padding:8px;border:1px solid #cbd5e1;text-align:right;">$${it.price.toFixed(2)}</td>
          <td style="padding:8px;border:1px solid #cbd5e1;text-align:right;">$${(it.price * it.quantity).toFixed(2)}</td>
        </tr>`
      )
      .join('')

    const docHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>Voucher ${voucherNo}</title>
<style>body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.5;color:#1e293b;margin:0.8in;}h1{color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:6px;font-size:20pt;}table{width:100%;border-collapse:collapse;margin-top:16px;}th{background:#f1f5f9;border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:10pt;color:#475569;}</style>
</head>
<body>
<h1>OFFICIAL VOUCHER - #${voucherNo}</h1>
<p><strong>Date:</strong> ${date ? format(date, 'MMMM d, yyyy') : ''} | <strong>Ledger:</strong> ${ledger} | <strong>Template:</strong> ${template}</p>
<table>
<thead><tr><th>#</th><th>Item / Description</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
<tbody>${tableRowsHTML}</tbody>
</table>
<div style="margin-top:16px;text-align:right;">
<p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
<p>Tax (8%): <strong>$${taxAmount.toFixed(2)}</strong></p>
<p style="font-size:14pt;color:#4f46e5;">Grand Total: <strong>$${grandTotal.toFixed(2)}</strong></p>
</div>
</body></html>`

    const blob = new Blob([docHTML], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voucher-${voucherNo.toLowerCase()}.doc`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded Word (.doc) Document!')
  }

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-0 m-0 overflow-hidden font-sans select-none">
      {/* ─── Top Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none gap-3">
        <div className="flex min-w-0 items-center gap-3 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400 font-bold">
            <ScanLine className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">New Voucher Scan</p>
            <p className="truncate text-xs text-muted-foreground">
              Voucher processing with custom metadata form, My Order items catalog, and live PDF preview.
            </p>
          </div>
        </div>
        <HeaderActions />
      </div>

      {/* ─── Step Navigation Bar matching Voucher Form ──────────────────── */}
      <nav className="sticky top-0 z-10 flex border-b border-border bg-background/95 backdrop-blur px-4 sm:px-8 select-none" aria-label="Voucher steps">
        {([
          ['upload', '1', 'Upload Document'],
          ['items', '2', 'Add Item'],
          ['preview', '3', 'Voucher PDF'],
        ] as const).map(([key, number, label]) => (
          <button
            key={key}
            onClick={() => setCurrentTab(key)}
            className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-xs font-bold transition cursor-pointer ${
              currentTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] font-black ${
                currentTab === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {number}
            </span>
            <span>{label}</span>
            {key === 'items' && items.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-mono ml-1">
                {items.length}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      {/* ─── Step Content Panels ────────────────────────────────────────── */}
      <div className="relative h-full min-h-0 w-full flex-1 overflow-y-auto bg-background">
        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: UPLOAD DOCUMENT FORM                                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {currentTab === 'upload' && (
          <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">Voucher Details & Document Upload</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fill in voucher header metadata and attach the supporting receipt or invoice document.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Select Template */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Select Template <span className="text-rose-500">*</span>
                </label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="h-10 w-full bg-background border-border">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Document">Standard Document</SelectItem>
                    <SelectItem value="Tax Invoice">Tax Invoice Voucher</SelectItem>
                    <SelectItem value="Purchase Voucher">Purchase Voucher</SelectItem>
                    <SelectItem value="Expense Report">Expense Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Date Selector (Using our Date Picker category pattern) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Date <span className="text-rose-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-10 border-border bg-background hover:bg-muted/50 cursor-pointer',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2.5 h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      {date ? format(date, 'PPP') : <span>Pick voucher date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border border-border bg-background shadow-lg rounded-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 3. Voucher No */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Voucher No <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  placeholder="e.g. VCH-2026-1048"
                  className="h-10 bg-background border-border"
                />
              </div>

              {/* 4. Ledger */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Ledger <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={ledger}
                  onChange={(e) => setLedger(e.target.value)}
                  placeholder="e.g. General Operating Ledger"
                  className="h-10 bg-background border-border"
                />
              </div>
            </div>

            {/* 5. Description / Notes & Remarks with Rich Toolbar matching screenshot */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Terms</label>
              <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50">
                {/* Rich Toolbar Header */}
                <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/20 text-muted-foreground select-none">
                  <button
                    type="button"
                    onClick={() => toast.info('Bold formatting applied')}
                    className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted hover:text-foreground font-bold text-xs transition-colors cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('Italic formatting applied')}
                    className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted hover:text-foreground italic text-xs transition-colors cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('Underline formatting applied')}
                    className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted hover:text-foreground underline text-xs transition-colors cursor-pointer"
                    title="Underline"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>

                  <div className="h-4 w-px bg-border mx-1.5" />

                  <button
                    type="button"
                    onClick={() => toast.info('Bullet list applied')}
                    className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('Numbered list applied')}
                    className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                  </button>

                  <div className="h-4 w-px bg-border mx-1.5" />

                  <button
                    type="button"
                    onClick={() => toast.info('Attachment link dialog')}
                    className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Attach File/Link"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Textarea Input */}
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add notes, descriptions, or remarks about this voucher..."
                  rows={3}
                  className="w-full border-0 bg-transparent p-3 text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 shadow-none"
                />
              </div>
            </div>

            {/* 6. Terms */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Terms</label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter payment, delivery, or settlement terms..."
                rows={2}
                className="bg-background border-border resize-none text-sm"
              />
            </div>

            {/* 7. File Upload Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Attached Document</label>
              {attachedFileName ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-200/50 bg-indigo-500/5 dark:border-indigo-900/40">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{attachedFileName}</p>
                      <p className="text-[10px] text-muted-foreground">Ready for OCR extraction • 1.4 MB</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAttachedFileName('')
                      toast.info('File removed')
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setAttachedFileName('scanned_receipt_0821.pdf')
                    toast.success('Attached sample receipt document!')
                  }}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer text-center group"
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-indigo-600 transition-colors mb-2" />
                  <p className="text-xs font-semibold text-foreground">Click to upload document (PDF, PNG, JPG)</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Drag and drop file here or browse</p>
                </div>
              )}
            </div>

            {/* ─── Bottom Action Buttons Bar ────────────────────────────── */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
              {/* Back button (Replaced Cancel) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Returned to gallery dashboard')}
                className="h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>

              <div className="flex items-center gap-2.5">
                {/* Save As Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save as</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => toast.success('Voucher details saved as Draft!')}
                      className="text-xs gap-2 cursor-pointer font-medium"
                    >
                      <FileCheck className="h-4 w-4 text-indigo-600" />
                      <span>Save as Draft</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        toast.success('Saved! Transitioning to Add Items...')
                        setCurrentTab('items')
                      }}
                      className="text-xs gap-2 cursor-pointer font-medium"
                    >
                      <ArrowRight className="h-4 w-4 text-emerald-600" />
                      <span>Save & Continue to Items</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Continue to Add Items Primary Button */}
                <Button
                  size="sm"
                  onClick={() => setCurrentTab('items')}
                  className="h-9 px-5 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                >
                  <span>Continue to Add Items</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ADD ITEM (MY ORDER TEMPLATE POS SYSTEM)                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {currentTab === 'items' && (
          <div className="w-full h-full flex flex-col min-h-0 bg-background">
            {/* Top Toolbar in Tab 2 */}
            <div className="flex flex-none items-center justify-between border-b border-border bg-muted/10 px-4 sm:px-6 py-3 gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-foreground">My Order Item Management</h3>
                <p className="text-xs text-muted-foreground">
                  Select products from the catalog or customize order line items.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTab('upload')}
                  className="h-8 px-3 text-xs gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Details</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setCurrentTab('preview')}
                  className="h-8 px-4 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                >
                  <span>Proceed to Voucher PDF</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Main Dual-Column Grid: Catalog (Left) + Order Cart (Right) */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Left Column: Product Catalog */}
              <div className="lg:col-span-7 flex flex-col min-h-0 border-r border-border p-4 sm:p-5 overflow-y-auto space-y-4">
                {/* Search & Category Chips */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search product catalog..."
                      className="pl-9 h-9 text-xs bg-background border-border"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border',
                          selectedCategory === cat
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                            : 'bg-background border-border/70 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Catalog Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((product) => {
                    const inCart = items.find((i) => i.id === product.id)
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col justify-between p-3.5 rounded-xl border border-border bg-card hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-2xs group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="text-[10px] font-medium h-4 px-1 text-muted-foreground">
                              {product.category}
                            </Badge>
                            <span className="font-bold text-sm text-foreground">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs text-foreground mt-2 line-clamp-2">
                            {product.name}
                          </h4>
                        </div>

                        <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">In Stock</span>
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(product)}
                            className="h-7 px-2.5 text-xs font-semibold bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {inCart ? `Add (+${inCart.quantity})` : 'Add Item'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Selected Order Items (Cart) */}
              <div className="lg:col-span-5 flex flex-col min-h-0 bg-muted/5 p-4 sm:p-5 overflow-y-auto justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Order Line Items ({items.length})
                      </h4>
                    </div>
                    {items.length > 0 && (
                      <button
                        onClick={() => {
                          setItems([])
                          toast.info('Cleared order cart')
                        }}
                        className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Items List */}
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground space-y-1">
                      <Package className="h-8 w-8 mx-auto opacity-40 mb-2" />
                      <p className="text-xs font-medium">No items added to this voucher yet</p>
                      <p className="text-[11px]">Select items from the catalog on the left to add them.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card shadow-2xs gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              ${item.price.toFixed(2)} / unit
                            </p>
                          </div>

                          {/* Qty Steppers */}
                          <div className="flex items-center gap-1.5 shrink-0 bg-muted/40 rounded-lg p-0.5 border border-border/50">
                            <button
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right shrink-0 min-w-[55px]">
                            <p className="text-xs font-bold text-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial Summary Card */}
                {items.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax / VAT (8%)</span>
                      <span className="font-semibold text-foreground">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-foreground">
                      <span>Total Amount</span>
                      <span className="text-indigo-600 dark:text-indigo-400">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: VOUCHER PDF (DOCUMENT WITH ITEMS TABLE)                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {currentTab === 'preview' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border gap-3 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-foreground">Voucher Document PDF</h3>
                <p className="text-xs text-muted-foreground">
                  Official generated voucher document ready for review and printing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTab('items')}
                  className="h-8 px-3 text-xs gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Edit Items</span>
                </Button>

                {/* Single Download As Dropdown Button with PDF, XLS, and DOC options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download as</span>
                      <ChevronDown className="h-3 w-3 ml-0.5 opacity-80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-border">
                    <DropdownMenuItem
                      onClick={handleDownloadPDF}
                      className="text-xs font-medium gap-2.5 cursor-pointer py-2"
                    >
                      <FileText className="h-4 w-4 text-rose-500" />
                      <span>Download as PDF (.pdf)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDownloadXLS}
                      className="text-xs font-medium gap-2.5 cursor-pointer py-2"
                    >
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      <span>Download as Excel (.xls)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDownloadDOC}
                      className="text-xs font-medium gap-2.5 cursor-pointer py-2"
                    >
                      <Download className="h-4 w-4 text-indigo-600" />
                      <span>Download as Word (.doc)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Official Printable Voucher Document Paper */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-10 shadow-sm space-y-6 text-foreground">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-1 rounded-full bg-indigo-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">OFFICIAL VOUCHER</h1>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Template: {template}
                  </p>
                </div>

                <div className="sm:text-right space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified & Approved</span>
                  </div>
                  <p className="text-sm font-bold text-foreground font-mono mt-1">#{voucherNo}</p>
                </div>
              </div>

              {/* Metadata Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-muted/10 p-4 rounded-xl border border-border/60">
                <div>
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Voucher Date</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {date ? format(date, 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Ledger Account</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5 truncate">{ledger}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Attachment</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5 truncate">{attachedFileName || 'None'}</p>
                </div>
              </div>

              {/* ─── LIVE ITEMS TABLE FROM TAB 2 ───────────────────────── */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Order Line Items
                </h4>

                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3">Item / Description</th>
                        <th className="py-2.5 px-3 w-28">Category</th>
                        <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                        <th className="py-2.5 px-3 w-24 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground italic">
                            No items found. Go back to Step 2 to add items.
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-3 text-center text-muted-foreground font-mono">
                              {index + 1}
                            </td>
                            <td className="py-3 px-3 font-semibold text-foreground">
                              {item.name}
                            </td>
                            <td className="py-3 px-3 text-muted-foreground">
                              <Badge variant="outline" className="text-[10px] font-normal h-4 px-1.5">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-foreground">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-3 text-right text-muted-foreground">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary Table */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                {/* Remarks & Terms Column */}
                <div className="space-y-3 flex-1 text-xs max-w-sm">
                  {remarks && (
                    <div className="p-3 rounded-lg border border-border/70 bg-muted/5">
                      <span className="font-bold text-foreground block mb-0.5">Remarks:</span>
                      <p className="text-muted-foreground leading-relaxed">{remarks}</p>
                    </div>
                  )}
                  {terms && (
                    <div className="p-3 rounded-lg border border-border/70 bg-muted/5">
                      <span className="font-bold text-foreground block mb-0.5">Payment Terms:</span>
                      <p className="text-muted-foreground leading-relaxed">{terms}</p>
                    </div>
                  )}
                </div>

                {/* Grand Total Box */}
                <div className="w-full sm:w-64 p-4 rounded-xl border border-border bg-muted/15 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax / VAT (8%):</span>
                    <span className="font-semibold text-foreground">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between items-center text-sm font-bold text-foreground">
                    <span>Grand Total:</span>
                    <span className="text-lg text-indigo-600 dark:text-indigo-400">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Footer */}
              <div className="pt-8 border-t border-border/80 grid grid-cols-2 gap-8 text-xs text-muted-foreground">
                <div>
                  <div className="h-10 border-b border-dashed border-border" />
                  <p className="pt-1.5 font-medium">Prepared By: Accounts Officer</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-border" />
                  <p className="pt-1.5 font-medium">Authorized Signature & Stamp</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewVouncherScan
