'use client'

import { X, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CartItem } from './types'

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const total = item.price * item.quantity

  return (
    <div className="px-3 py-2 md:px-4 md:py-3 grid grid-cols-12 gap-2 items-center text-sm hover:bg-gray-50">
      {/* Product Name */}
      <div className="col-span-5 truncate">
        <p className="font-medium truncate">{item.name}</p>
      </div>

      {/* Quantity */}
      <div className="col-span-2 flex justify-center">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
          className="w-12 px-2 py-1 border border-input rounded text-center text-sm"
        />
      </div>

      {/* Price */}
      <div className="col-span-2">
        <div className="flex flex-col items-end">
          {item.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
          )}
          <span className="font-semibold">${item.price.toFixed(2)}</span>
        </div>
      </div>

      {/* Total & Actions */}
      <div className="col-span-3 flex items-center justify-between">
        <span className="font-bold">${total.toFixed(2)}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 cursor-pointer"
            onClick={() => onRemove(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
