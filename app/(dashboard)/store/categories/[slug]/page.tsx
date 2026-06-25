'use client'

import CategoryDetailView from '@/features/storetemplate/views/category-detail-view'
import { use } from 'react'

export default function StoreCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <CategoryDetailView params={{ slug }} />
}
