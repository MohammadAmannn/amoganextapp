'use client'

import { SearchIcon } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function SidebarSearch() {
  const { setOpen } = useSearch()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setOpen(true)}
          tooltip='Search (⌘K)'
          className='bg-sidebar-accent/50 hover:bg-sidebar-accent border border-sidebar-border/60 text-muted-foreground hover:text-foreground'
        >
          <SearchIcon className='size-4 shrink-0' />
          <span className='flex-1 text-left text-xs font-normal group-data-[collapsible=icon]:hidden'>
            Search...
          </span>
          <kbd className='pointer-events-none hidden h-4 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 group-data-[collapsible=icon]:hidden sm:flex'>
            <span className='text-[10px]'>⌘</span>K
          </kbd>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
