import { Suspense } from 'react'
import { ErrorPageContent } from '@/features/errors/error-page-content'

interface PageProps {
  params: Promise<{ error: string }>
}

export default async function ErrorPage({ params }: PageProps) {
  const { error } = await params

  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center p-8 text-sm text-muted-foreground font-semibold">
        Loading error details...
      </div>
    }>
      <ErrorPageContent error={error} />
    </Suspense>
  )
}
