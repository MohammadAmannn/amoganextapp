import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarPaginationProps {
  page: number
  limit: number
  total: number
  hasMore?: boolean
  isLoading?: boolean
  onPrevPage?: () => void
  onNextPage?: () => void
}

export function SidebarPagination({
  page,
  limit,
  total,
  hasMore = true,
  isLoading = false,
  onPrevPage,
  onNextPage,
}: SidebarPaginationProps) {
  if (total <= 0) return null

  const startRange = (page - 1) * limit + 1
  const endRange = Math.min(page * limit, total)

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 select-none pr-0.5 ml-auto">
      <span className="text-[11px] font-medium text-muted-foreground/80 whitespace-nowrap">
        {startRange}–{endRange} of {total}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={page <= 1 || isLoading}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasMore || endRange >= total || isLoading}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
