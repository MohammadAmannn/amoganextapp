'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider, useLayout } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { NotFoundError } from '@/features/errors/not-found-error'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

function AuthenticatedLayoutContent({ children }: AuthenticatedLayoutProps) {
  const { showInlineNotFound, setShowInlineNotFound } = useLayout()
  const pathname = usePathname()

  useEffect(() => {
    setShowInlineNotFound(false)
  }, [pathname, setShowInlineNotFound])

  return (
    <>
      <SkipToMain />
      <AppSidebar />
      <SidebarInset
        className={cn(
          '@container/content flex min-h-svh flex-1 flex-col',
          'has-data-[layout=fixed]:h-svh',
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
        )}
      >
        {showInlineNotFound ? (
          <NotFoundError
            embedded
            onDismiss={() => setShowInlineNotFound(false)}
          />
        ) : (
          children
        )}
      </SidebarInset>
    </>
  )
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [defaultOpen, setDefaultOpen] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setDefaultOpen(getCookie('sidebar_state') !== 'false')
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
