'use client'

import { AlertCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItemRow } from './cart-item-row'
import type { CartItem } from './types'

interface CartProps {
  items: CartItem[]
  customer: string
  onCustomerChange: (customer: string) => void
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onClear: () => void
}

export function Cart({
  items,
  customer,
  onCustomerChange,
  onRemove,
  onUpdateQuantity,
  onClear,
}: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Customer Search Box */}
      <div className="p-3 border-b border-border flex-shrink-0 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Customer..."
            value={customer}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No items in cart</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table Header */}
            <div className="sticky top-0 bg-gray-100 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600">
              <div className="col-span-1">QTY</div>
              <div className="col-span-6">NAME</div>
              <div className="col-span-2">PRICE</div>
              <div className="col-span-3">TOTAL</div>
            </div>

            {/* Items */}
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subtotal */}
      <div className="border-t border-border p-3">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">Subtotal:</span>
          <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Button variant="outline" size="sm" className="text-xs">
            Order Note
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Order Meta
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Save to Server
          </Button>
        </div>

        {/* Checkout Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="destructive"
            onClick={onClear}
            className="text-white"
          >
            Void
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={items.length === 0}
          >
            Checkout ${subtotal.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  )
}
