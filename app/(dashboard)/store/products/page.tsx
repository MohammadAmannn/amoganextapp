'use client'

import { Suspense } from 'react'
import ProductsView from '@/features/storetemplate/views/products-view'

export default function StoreProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <ProductsView />
    </Suspense>
  )
}
