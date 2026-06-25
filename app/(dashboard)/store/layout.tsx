'use client'

import { CartProvider } from '@/features/storetemplate/hooks/use-cart'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}
