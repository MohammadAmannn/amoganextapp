'use client'

import React, { useState } from 'react'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { FileUploadForm } from '@/features/Message/components/files/file-upload-form'
import { DynamicJsonForm } from '@/components/dynamic-form/DynamicJsonForm'
import { ReviewPanel } from '@/components/dynamic-form/ReviewPanel'
import { SafeDocumentPreview } from '@/components/dynamic-form/SafeDocumentPreview'
import { ScanLine, CheckCircle2, Eye, FileText, ArrowRight, X } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'upload' | 'review' | 'preview'

const initialMockVoucher = {
  voucherNumber: 'VCH-2026-8842',
  date: '2026-08-21',
  vendorName: 'Northstar Tech GmbH',
  amount: '$14,280.00',
  category: 'Cloud Infrastructure',
  status: 'Approved',
  tax: '$1,142.40',
  description: 'Enterprise Cloud & Managed Services Consulting',
}

export function NewVouncher({ stateIndex = 0 }: { stateIndex?: number }) {
  const [currentTab, setCurrentTab] = useState<Tab>('upload')
  const [formData, setFormData] = useState<any>(initialMockVoucher)
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url?: string } | null>(null)

  const handleUploadSuccess = () => {
    toast.success('Document uploaded! Transitioning to field review...')
    setCurrentTab('review')
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
            <p className="truncate text-sm font-bold text-foreground">New Voucher</p>
            <p className="truncate text-xs text-muted-foreground">
              Upload documents with custom metadata, auto-parse OCR and generate voucher preview.
            </p>
          </div>
        </div>
        <HeaderActions />
      </div>

      {/* ─── Step Navigation Bar matching Voucher Form ──────────────────── */}
      <nav className="sticky top-0 z-10 flex border-b border-border bg-background/95 backdrop-blur px-4 sm:px-8 select-none" aria-label="Voucher steps">
        {([
          ['upload', '1', 'Upload Document'],
          ['review', '2', 'Edit Fields'],
          ['preview', '3', 'Voucher Preview'],
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
          </button>
        ))}
      </nav>

      {/* ─── Step Content Panels ────────────────────────────────────────── */}
      <div className="relative h-full min-h-0 w-full flex-1 overflow-y-auto bg-background">
        {/* TAB 1: File Upload Form (Full Width, No Outer Border) */}
        {currentTab === 'upload' && (
          <div className="w-full h-full p-0 m-0">
            <FileUploadForm
              userEmail="user@amoga.app"
              onClose={() => toast.info('Cancelled upload')}
              onUploadSuccess={handleUploadSuccess}
              onPreviewAttachment={(attachment) => setPreviewDoc(attachment)}
            />
          </div>
        )}

        {/* TAB 2: Edit Fields */}
        {currentTab === 'review' && (
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Extracted Fields</h3>
                <p className="text-xs text-muted-foreground">
                  Verify and edit the auto-parsed OCR document fields below.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('preview')}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                <span>Continue to Preview</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <DynamicJsonForm
              jsonData={formData}
              editedJson={formData}
              onChange={(updated) => setFormData(updated)}
              onSave={(finalJson) => {
                setFormData(finalJson)
                toast.success('Changes saved!')
                setCurrentTab('preview')
              }}
            />
          </div>
        )}

        {/* TAB 3: Voucher Preview */}
        {currentTab === 'preview' && (
          <div className="p-4 md:p-6">
            <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">VOUCHER SUMMARY</h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">#{formData.voucherNumber || 'VCH-2026-001'}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold rounded-full">
                {formData.status || 'Verified'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Vendor</span>
                <p className="font-semibold text-foreground">{formData.vendorName}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Issue Date</span>
                <p className="font-semibold text-foreground">{formData.date}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Category</span>
                <p className="font-semibold text-foreground">{formData.category}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Total Amount</span>
                <p className="font-bold text-lg text-indigo-600">{formData.amount}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setCurrentTab('review')}
                className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-xl hover:bg-muted cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                onClick={() => toast.success('Voucher printed and archived!')}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                Approve & Print
              </button>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Safe Document Preview Modal if user clicks attachment preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="relative w-full max-w-4xl h-[85vh] bg-background rounded-2xl overflow-hidden border border-border shadow-2xl flex flex-col">
            <SafeDocumentPreview
              fileName={previewDoc.name}
              fileUrl={previewDoc.url}
              onClose={() => setPreviewDoc(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default NewVouncher
