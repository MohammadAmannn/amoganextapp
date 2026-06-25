'use client'

import { Suspense } from 'react'
import SearchView from '@/features/storetemplate/views/search-view'

export default function StoreSearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <SearchView />
    </Suspense>
  )
}
