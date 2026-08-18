import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function EmailListSkeleton() {
  return (
    <div className='flex flex-col space-y-2 p-2.5 animate-in fade-in duration-200'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className='flex flex-col rounded-xl border border-border/50 bg-card p-3.5 space-y-2.5 shadow-2xs'
        >
          {/* Header Row: Checkbox/Avatar placeholder, Sender Name, Date */}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
              <Skeleton className='h-7 w-7 rounded-full shrink-0 bg-muted/80' />
              <Skeleton className='h-3.5 w-28 sm:w-36 rounded-sm bg-muted/80' />
            </div>
            <Skeleton className='h-3 w-12 rounded-xs shrink-0 bg-muted/60' />
          </div>

          {/* Subject Line */}
          <Skeleton className='h-3.5 w-3/4 rounded-sm bg-muted/90' />

          {/* Body Snippet Lines */}
          <div className='space-y-1.5 pt-0.5'>
            <Skeleton className='h-3 w-full rounded-sm bg-muted/60' />
            <Skeleton className='h-3 w-4/5 rounded-sm bg-muted/40' />
          </div>

          {/* Badges Footer */}
          <div className='flex items-center justify-between pt-1'>
            <div className='flex items-center gap-1.5'>
              <Skeleton className='h-4 w-12 rounded-full bg-muted/70' />
              <Skeleton className='h-4 w-14 rounded-full bg-muted/50' />
            </div>
            <Skeleton className='h-3 w-3 rounded-full shrink-0 bg-muted/40' />
          </div>
        </div>
      ))}
    </div>
  )
}
