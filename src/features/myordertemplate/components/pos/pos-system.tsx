'use client'

import { useState, useEffect } from 'react'
import { ProductCatalog, SAMPLE_PRODUCTS } from './product-catalog'
import { Cart } from './cart'
import { OrderSuccessModal } from './order-success-modal'
import type { CartItem, Product } from './types'

export function POSSystem() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState('Guest')
  const [activeMobileView, setActiveMobileView] = useState<'catalog' | 'cart'>('catalog')
  
  // Lifted WooCommerce products and categories state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Order checkout states
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/products?per_page=100')
      if (!res.ok) {
        throw new Error('Failed to fetch products from WooCommerce API')
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        const mapped = data.map((wpProd: any): Product => {
          const categoryName = wpProd.categories && wpProd.categories.length > 0
            ? wpProd.categories[0].name
            : 'Uncategorized'

          const imageSrc = wpProd.images && wpProd.images.length > 0
            ? wpProd.images[0].src
            : '/placeholder/400x400.svg'

          return {
            id: String(wpProd.id),
            name: wpProd.name || '',
            price: parseFloat(wpProd.price) || 0.0,
            originalPrice: parseFloat(wpProd.regular_price) > parseFloat(wpProd.price) ? parseFloat(wpProd.regular_price) : undefined,
            image: imageSrc,
            category: categoryName,
            hasVariants: wpProd.variations && wpProd.variations.length > 0
          }
        })
        setProducts(mapped)
      } else {
        setProducts(SAMPLE_PRODUCTS)
      }
    } catch (err: any) {
      console.error('Error fetching WooCommerce products for POS:', err)
      setError(err.message || 'Error fetching products')
      setProducts(SAMPLE_PRODUCTS)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const res = await fetch('/api/products?endpoint=categories')
      if (!res.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        const names = data.map((cat: any) => cat.name || '')
        setCategories(names.filter((name) => name !== ''))
      }
    } catch (err) {
      console.error('Error fetching categories for POS:', err)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleRefresh = () => {
    fetchProducts()
    fetchCategories()
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

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

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    try {
      setIsCheckoutLoading(true)
      
      // Parse customer name into first/last name
      const nameParts = customer.trim().split(/\s+/)
      const firstName = nameParts[0] || 'Guest'
      const lastName = nameParts.slice(1).join(' ')

      const orderPayload = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: true,
        billing: {
          first_name: firstName,
          last_name: lastName,
          email: 'guest@example.com' // Fallback WooCommerce customer email
        },
        line_items: cartItems.map(item => ({
          product_id: parseInt(item.id),
          quantity: item.quantity
        }))
      }

      const res = await fetch('/api/products?endpoint=orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create WooCommerce order. Please verify credentials.')
      }

      const data = await res.json()
      const order = Array.isArray(data) ? data[0] : data

      setCreatedOrder(order)
      setIsSuccessModalOpen(true)
      
      // Clear cart and reset view/fields on success
      setCartItems([])
      setCustomer('Guest')
      setActiveMobileView('catalog') // Redirect back to products view
    } catch (err: any) {
      console.error('Checkout failed:', err)
      alert(err.message || 'Checkout failed. Please try again.')
    } finally {
      setIsCheckoutLoading(false)
    }
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
        {/* Left Side: Product Catalog (50% on web view) */}
        <div className={`flex-1 flex-col min-h-0 p-2 md:p-3 ${
          activeMobileView === 'catalog' ? 'flex' : 'hidden md:flex'
        }`}>
          <ProductCatalog
            onAddToCart={addToCart}
            products={products}
            categories={categories}
            isLoading={isLoading}
            isLoadingCategories={isLoadingCategories}
            error={error}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Right Side: Cart / Checkout (50% on web view) */}
        <div className={`border-l border-border bg-slate-50 flex-col min-h-0 ${
          activeMobileView === 'cart' ? 'flex w-full' : 'hidden md:flex md:flex-1'
        }`}>
          <Cart
            items={cartItems}
            customer={customer}
            onCustomerChange={setCustomer}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onClear={clearCart}
            onCheckout={handleCheckout}
            isCheckoutLoading={isCheckoutLoading}
            allProducts={products}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {/* Order Success Dialog */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        order={createdOrder}
      />
    </div>
  )
}
