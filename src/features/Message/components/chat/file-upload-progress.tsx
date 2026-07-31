'use client'

import { FileText, X, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProgressProps {
  fileName: string
  fileSize: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
  onCancel?: () => void
  className?: string
}

export function formatFileSize(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadProgress({
  fileName,
  fileSize,
  progress,
  status,
  onCancel,
  className,
}: FileUploadProgressProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 select-none',
        className
      )}
    >
      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary'>
            <FileText className='h-4.5 w-4.5' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-xs font-semibold text-foreground'>
              {fileName}
            </p>
            <p className='text-[11px] text-muted-foreground'>
              {formatFileSize(fileSize)}{' '}
              {status === 'uploading' ? (
                <span className='font-medium text-foreground'>
                  · Uploading {Math.round(progress)}%
                </span>
              ) : status === 'completed' ? (
                <span className='font-medium text-foreground'>
                  · Ready
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-1.5'>
          {status === 'completed' ? (
            <CheckCircle2 className='h-4 w-4 text-foreground' />
          ) : (
            <Loader2 className='h-4 w-4 animate-spin text-foreground' />
          )}

          {onCancel && (
            <button
              type='button'
              onClick={onCancel}
              className='rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer'
              title='Cancel upload'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      {/* Animated Progress Bar (Color: BLACK) */}
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted/80 dark:bg-muted/40'>
        <div
          className='h-full transition-all duration-200 ease-out rounded-full bg-black dark:bg-white'
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
