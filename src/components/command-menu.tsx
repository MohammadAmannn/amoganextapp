import React from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun, MapPin } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'
import markersData from '@/features/map/data/markers.json'

export function CommandMenu() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const isMapRoute = routerState.location.pathname.includes('/map')

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {!isMapRoute && sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => navigate({ to: navItem.url }))
                      }}
                    >
                      <div className='flex size-4 items-center justify-center'>
                        <ArrowRight className='size-2 text-muted-foreground/80' />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    value={`${navItem.title}-${subItem.url}`}
                    onSelect={() => {
                      runCommand(() => navigate({ to: subItem.url }))
                    }}
                  >
                    <div className='flex size-4 items-center justify-center'>
                      <ArrowRight className='size-2 text-muted-foreground/80' />
                    </div>
                    {navItem.title} <ChevronRight /> {subItem.title}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}
          <CommandGroup heading='Locations'>
            {markersData.map((marker) => (
              <CommandItem
                key={`search-marker-${marker.id}`}
                value={`location-${marker.locationName}-${marker.name}`}
                onSelect={() => {
                  runCommand(() => navigate({ to: '/map', search: { markerId: marker.id } as any }))
                }}
              >
                <div className='flex size-4 items-center justify-center mr-2'>
                  <MapPin className='size-3.5 text-muted-foreground' />
                </div>
                <div className='flex flex-col align-start text-left'>
                  <span className='font-medium text-sm text-gray-900 dark:text-gray-100'>{marker.locationName}</span>
                  <span className='text-[10px] text-muted-foreground'>Contact: {marker.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          {!isMapRoute && (
            <>
              <CommandSeparator />
              <CommandGroup heading='Theme'>
                <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                  <Sun /> <span>Light</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                  <Moon className='scale-90' />
                  <span>Dark</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
                  <Laptop />
                  <span>System</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
