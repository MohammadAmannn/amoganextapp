'use client'

import { useState } from 'react'
import { ProductCatalog } from './product-catalog'
import { Cart } from './cart'
import type { CartItem, Product } from './types'

export function POSSystem() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState('Guest')
  const [activeMobileView, setActiveMobileView] = useState<'catalog' | 'cart'>('catalog')

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevItems, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-background overflow-hidden">
      {/* Mobile Toggle Tabs (50-50 Segmented Control) */}
      <div className="flex border-b border-border bg-white md:hidden flex-shrink-0">
        <button
          onClick={() => setActiveMobileView('catalog')}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeMobileView === 'catalog'
              ? 'border-blue-500 text-blue-600 bg-blue-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveMobileView('cart')}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMobileView === 'cart'
              ? 'border-blue-500 text-blue-600 bg-blue-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cart
          {totalItems > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Content Columns */}
      <div className="flex-1 flex min-h-0">
        {/* Left Side: Product Catalog */}
        <div className={`flex-grow flex-col min-h-0 p-3 ${
          activeMobileView === 'catalog' ? 'flex' : 'hidden md:flex'
        }`}>
          <ProductCatalog onAddToCart={addToCart} />
        </div>

        {/* Right Side: Cart / Checkout */}
        <div className={`border-l border-border bg-slate-50 flex-col min-h-0 ${
          activeMobileView === 'cart' ? 'flex w-full' : 'hidden md:flex w-96'
        }`}>
          <Cart
            items={cartItems}
            customer={customer}
            onCustomerChange={setCustomer}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onClear={clearCart}
          />
        </div>
      </div>
    </div>
  )
}
