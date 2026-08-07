'use client'

import React, { memo } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  progressPct?: number
}

export const LoadingState: React.FC<LoadingStateProps> = memo(({
  message = 'Extracting document data and generating dynamic form...',
  progressPct,
}) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs animate-pulse">
        <Sparkles className="size-7" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Loader2 className="size-4 animate-spin text-primary" />
        <p className="text-sm font-bold text-foreground">{message}</p>
      </div>
      {typeof progressPct === 'number' && progressPct > 0 && (
        <div className="mt-4 w-48 overflow-hidden rounded-full bg-muted h-1.5">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      )}
    </div>
  )
})

LoadingState.displayName = 'LoadingState'
