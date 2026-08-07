'use client'

import React, { useState, memo } from 'react'
import { ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { formatKeyToLabel } from './utils'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  path: string
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
  itemCount?: number
  isNested?: boolean
}

export const FormSection: React.FC<FormSectionProps> = memo(({
  title,
  path,
  children,
  collapsible = true,
  defaultExpanded = true,
  itemCount,
  isNested = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const displayTitle = formatKeyToLabel(title)

  return (
    <div
      className={cn(
        'w-full rounded-2xl border transition-all duration-200 shadow-2xs',
        isNested
          ? 'border-border/60 bg-muted/10 p-3 sm:p-4 my-2'
          : 'border-border bg-card p-4 sm:p-5 my-3'
      )}
    >
      {/* Section Header */}
      <div
        onClick={() => collapsible && setIsExpanded((prev) => !prev)}
        className={cn(
          'flex items-center justify-between gap-2 select-none py-1',
          collapsible && 'cursor-pointer group'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Layers className="size-3.5" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-foreground truncate">
            {displayTitle}
          </h3>
          {typeof itemCount === 'number' && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {collapsible && (
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        )}
      </div>

      {/* Section Body */}
      {isExpanded && (
        <div className="mt-4 flex flex-col gap-3.5 border-t border-border/40 pt-3.5 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  )
})

FormSection.displayName = 'FormSection'
