'use client'

import ProductDetailView from '@/features/storetemplate/views/product-detail-view'
import { use } from 'react'

export default function StoreProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ProductDetailView params={{ id }} />
}
