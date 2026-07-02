'use client'

import { useState } from 'react'
import { AlertCircle, Search, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItemRow } from './cart-item-row'
import type { CartItem, Product, Customer } from './types'

interface CartProps {
  items: CartItem[]
  customer: string
  selectedCustomer: Customer | null
  onCustomerSelect: (customer: Customer | null) => void
  onCustomerChange: (customer: string) => void
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onClear: () => void
  onCheckout: () => void
  isCheckoutLoading?: boolean
  allProducts: Product[]
  onAddToCart: (product: Product) => void
  allCustomers: Customer[]
  isLoadingCustomers?: boolean
}

export function Cart({
  items,
  customer,
  selectedCustomer,
  onCustomerSelect,
  onCustomerChange,
  onRemove,
  onUpdateQuantity,
  onClear,
  onCheckout,
  isCheckoutLoading = false,
  allProducts = [],
  onAddToCart,
  allCustomers = [],
  isLoadingCustomers = false,
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

  // Filter customers locally matching searchVal case-insensitively across name, username, email
  const matchingCustomers = searchVal.trim().length >= 2
    ? allCustomers.filter((c) => {
        const query = searchVal.toLowerCase()
        const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase()
        return (
          fullName.includes(query) ||
          (c.username || '').toLowerCase().includes(query) ||
          (c.email || '').toLowerCase().includes(query) ||
          (c.billing?.phone || '').includes(query)
        )
      }).slice(0, 8)
    : []

  return (
    <div className="flex flex-col h-full">
      {/* Selected WooCommerce Customer Card */}
      {selectedCustomer && (
        <div className="p-3 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            {selectedCustomer.avatar_url ? (
              <img
                src={selectedCustomer.avatar_url}
                alt={selectedCustomer.first_name}
                className="h-10 w-10 rounded-full border border-blue-200 object-cover shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-sm flex-shrink-0">
                {(selectedCustomer.first_name?.[0] || selectedCustomer.username?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                {`${selectedCustomer.first_name || ''} ${selectedCustomer.last_name || ''}`.trim() || selectedCustomer.username}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
                  ID: {selectedCustomer.id}
                </span>
              </div>
              <div className="text-xs text-slate-500 truncate">{selectedCustomer.email}</div>
              {selectedCustomer.billing?.city && (
                <div className="text-[11px] text-slate-400 truncate">
                  📍 {selectedCustomer.billing.city}, {selectedCustomer.billing.country || ''}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              onCustomerSelect(null)
              onCustomerChange('Guest')
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer flex-shrink-0"
            title="Deselect Customer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Customer or Product */}
      <div className="p-2 md:p-3 border-b border-border flex-shrink-0 bg-white relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Customer or Product..."
            value={searchVal}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setSearchVal(e.target.value)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {isFocused && (searchVal.trim().length > 0 || isLoadingCustomers) && (
          <div className="absolute z-50 left-2 right-2 mt-1 bg-white border border-border shadow-lg rounded-md overflow-hidden max-h-80 overflow-y-auto">
            {/* Loading Indicator */}
            {isLoadingCustomers && (
              <div className="p-3 text-xs text-muted-foreground flex items-center justify-center gap-2 border-b border-border">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading customers database...</span>
              </div>
            )}

            {/* Customers matches */}
            {!isLoadingCustomers && matchingCustomers.length > 0 && (
              <div className="p-2 border-b border-border">
                <h4 className="text-xs font-semibold text-gray-500 px-2 py-1">WooCommerce Customers ({matchingCustomers.length})</h4>
                <div className="space-y-1">
                  {matchingCustomers.map((cust) => {
                    const fullName = `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || cust.username
                    return (
                      <button
                        key={cust.id}
                        onClick={() => {
                          onCustomerSelect(cust)
                          onCustomerChange(fullName)
                          setSearchVal('')
                          setIsFocused(false)
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-sm flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {cust.avatar_url ? (
                            <img
                              src={cust.avatar_url}
                              alt={fullName}
                              className="h-6 w-6 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold border border-blue-200">
                              {(cust.first_name?.[0] || cust.username?.[0] || 'U').toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-semibold text-slate-700">{fullName}</span>
                            <span className="text-xs text-slate-400 ml-2">@{cust.username}</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium ml-2 truncate">{cust.email}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

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
                      className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-sm flex justify-between items-center cursor-pointer transition-colors"
                    >
                      <span className="font-medium truncate text-slate-700">{prod.name}</span>
                      <span className="text-blue-600 font-semibold flex-shrink-0 ml-2">${prod.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
