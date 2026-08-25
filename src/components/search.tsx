'use client'

import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-provider'
import { Button } from '@/components/ui/button'

export function Search({
  className = '',
  placeholder = 'Search',
  iconOnly = true,
  ...props
}: React.ComponentProps<'button'> & { placeholder?: string; iconOnly?: boolean }) {
  const search = useSearch()

  const openSearch = () => {
    if (search?.setOpen) {
      search.setOpen(true)
    }
  }

  return (
    <Button
      {...props}
      variant='ghost'
      size='icon'
      className={cn('size-8 shrink-0', className)}
      aria-label='Search'
      aria-keyshortcuts='Meta+K Control+K'
      onClick={openSearch}
    >
      <SearchIcon className='size-5' aria-hidden='true' />
    </Button>
  )
}
