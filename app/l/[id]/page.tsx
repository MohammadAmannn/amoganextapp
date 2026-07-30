import { Suspense } from 'react'
import { PublicLinkTree } from '@/features/link-builder/components/public-link-tree'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicLinkTreePage({ params }: PageProps) {
  const { id } = await params

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading custom page...</p>
      </div>
    }>
      <PublicLinkTree id={id} />
    </Suspense>
  )
}
