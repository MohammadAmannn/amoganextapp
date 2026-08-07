'use client'

import React, { memo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  error: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = memo(({ error, onRetry }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-xs">
        <AlertTriangle className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-foreground">Processing Error</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-md">{error}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-5 gap-2 text-xs font-semibold"
        >
          <RefreshCw className="size-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  )
})

ErrorState.displayName = 'ErrorState'
