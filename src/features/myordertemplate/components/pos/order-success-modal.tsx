'use client'

import { CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  order,
}: OrderSuccessModalProps) {
  if (!order) return null

  // Extract order details
  const orderNumber = order.number || order.id || 'N/A'
  const customerName = order.billing 
    ? `${order.billing.first_name || ''} ${order.billing.last_name || ''}`.trim() || 'Guest'
    : 'Guest'
  
  const orderDate = order.date_created 
    ? new Date(order.date_created).toLocaleString() 
    : new Date().toLocaleString()

  const totalAmount = parseFloat(order.total) || 0.0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-border rounded-lg shadow-xl overflow-hidden p-0">
        {/* Banner with Icon */}
        <div className="bg-emerald-50 py-8 flex flex-col items-center justify-center border-b border-emerald-100">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 animate-bounce" />
          <DialogHeader className="mt-4 text-center">
            <DialogTitle className="text-xl font-bold text-emerald-800">
              Order Created Successfully!
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Details Table */}
        <div className="p-6 space-y-4 text-sm text-gray-700 bg-white">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Your transaction has been processed and saved to the WooCommerce server.
          </p>

          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {/* Order No */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50/50">
              <span className="font-semibold text-gray-500">Order Number</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border">
                #{orderNumber}
              </span>
            </div>

            {/* Customer */}
            <div className="flex justify-between items-center px-4 py-3">
              <span className="font-semibold text-gray-500">Customer</span>
              <span className="font-medium text-gray-900">{customerName}</span>
            </div>

            {/* Date */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50/50">
              <span className="font-semibold text-gray-500">Date & Time</span>
              <span className="text-gray-900">{orderDate}</span>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center px-4 py-3 bg-emerald-50/20">
              <span className="font-semibold text-emerald-800">Amount Paid</span>
              <span className="text-lg font-extrabold text-emerald-700">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-border flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
          >
            Okay, Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
