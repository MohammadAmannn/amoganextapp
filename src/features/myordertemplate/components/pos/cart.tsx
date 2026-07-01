'use client'

import { useState } from 'react'
import { AlertCircle, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItemRow } from './cart-item-row'
import type { CartItem, Product } from './types'

interface CartProps {
  items: CartItem[]
  customer: string
  onCustomerChange: (customer: string) => void
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onClear: () => void
  onCheckout: () => void
  isCheckoutLoading?: boolean
  allProducts: Product[]
  onAddToCart: (product: Product) => void
}

export function Cart({
  items,
  customer,
  onCustomerChange,
  onRemove,
  onUpdateQuantity,
  onClear,
  onCheckout,
  isCheckoutLoading = false,
  allProducts = [],
  onAddToCart,
}: CartProps) {
  const [searchVal, setSearchVal] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Filter products matching searchVal
  const matchingProducts = searchVal.trim()
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        p.category.toLowerCase().includes(searchVal.toLowerCase())
      ).slice(0, 5)
    : []

  return (
    <div className="flex flex-col h-full">
      {/* Search Customer or Product */}
      <div className="p-2 md:p-3 border-b border-border flex-shrink-0 bg-white relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Customer or Product..."
            value={isFocused ? searchVal : customer}
            onFocus={() => {
              setSearchVal(customer === 'Guest' ? '' : customer)
              setIsFocused(true)
            }}
            onChange={(e) => setSearchVal(e.target.value)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {(searchVal || customer !== 'Guest') && (
            <button
              onClick={() => {
                setSearchVal('')
                onCustomerChange('Guest')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {isFocused && searchVal.trim().length > 0 && (
          <div className="absolute z-50 left-2 right-2 mt-1 bg-white border border-border shadow-lg rounded-md overflow-hidden max-h-60 overflow-y-auto">
            {/* Products matches */}
            {matchingProducts.length > 0 && (
              <div className="p-2 border-b border-border">
                <h4 className="text-xs font-semibold text-gray-500 px-2 py-1">Products ({matchingProducts.length})</h4>
                <div className="space-y-1">
                  {matchingProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        onAddToCart(prod)
                        setSearchVal('')
                        setIsFocused(false)
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-sm flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-medium truncate">{prod.name}</span>
                      <span className="text-blue-600 font-semibold flex-shrink-0 ml-2">${prod.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Set Customer Option */}
            <div className="p-1">
              <button
                onClick={() => {
                  onCustomerChange(searchVal.trim())
                  setSearchVal('')
                  setIsFocused(false)
                }}
                className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded text-sm font-semibold text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                👤 Set Customer to "{searchVal.trim()}"
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No items in cart</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table Header: Swapped Name and QTY */}
            <div className="sticky top-0 bg-gray-100 px-3 py-2 md:px-4 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600">
              <div className="col-span-5">NAME</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-2 text-right">PRICE</div>
              <div className="col-span-3 text-right">TOTAL</div>
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
      <div className="border-t border-border p-2 md:p-3">
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
            className="text-white cursor-pointer"
            disabled={isCheckoutLoading}
          >
            Void
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            disabled={items.length === 0 || isCheckoutLoading}
            onClick={onCheckout}
          >
            {isCheckoutLoading ? 'Processing...' : `Checkout $${subtotal.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
