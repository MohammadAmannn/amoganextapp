'use client'

import AddProductView from '@/features/storetemplate/views/add-product-view'

// Prevent static prerendering — this page uses client-only context (auth, cart)
export const dynamic = 'force-dynamic'

export default function StoreAddProductPage() {
  return <AddProductView />
}
