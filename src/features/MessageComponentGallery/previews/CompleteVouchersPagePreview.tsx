'use client'

import React from 'react'
import { InvoiceMaker } from '@/features/vouchers/components/invoice-maker'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { Plus } from 'lucide-react'

export function CompleteVouchersPagePreview({ stateIndex = 0 }: { stateIndex?: number }) {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-0 m-0 overflow-hidden font-sans select-none">
      {/* Header bar matching exact voucher header */}
      <div className="flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none gap-3">
        <div className="flex min-w-0 items-center gap-3 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400 font-bold">
            <Plus className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">Voucher Form</p>
            <p className="truncate text-xs text-muted-foreground">
              Create, review and print digital vouchers.
            </p>
          </div>
        </div>

        <HeaderActions />
      </div>

      {/* Stepper + InvoiceMaker Component Stage */}
      <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-background flex flex-col">
        <InvoiceMaker />
      </div>
    </div>
  )
}

export default CompleteVouchersPagePreview
