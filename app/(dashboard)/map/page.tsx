'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import with ssr:false creates a webpack bundle boundary that
// completely excludes maplibre-gl (a browser-only library) from the server bundle.
// This fixes the "Cannot find module for page: /_document" build error.
const MapPage = dynamic(() => import('@/features/map'), {
  ssr: false,
  loading: () => (
    <div className='flex h-screen w-full items-center justify-center'>
      <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
    </div>
  ),
})

export default function MapRoutePage() {
  return <MapPage />
}
