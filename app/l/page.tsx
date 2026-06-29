'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function RedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const c = searchParams.get('c')
    const exp = searchParams.get('exp')

    if (c) {
      const redirectUrl = `/l/${c}${exp ? `?exp=${exp}` : ''}`
      router.replace(redirectUrl)
    } else {
      router.replace('/link-builder')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4" />
      <p className="text-sm font-semibold text-slate-400">Redirecting to profile...</p>
    </div>
  )
}

export default function RedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading profile...</p>
      </div>
    }>
      <RedirectHandler />
    </Suspense>
  )
}
