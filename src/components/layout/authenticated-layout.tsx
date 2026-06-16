import { Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
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
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  useEffect(() => {
    setShowInlineNotFound(false)
  }, [pathname, setShowInlineNotFound])

  return (
    <>
      <SkipToMain />
      <AppSidebar />
      <SidebarInset
        className={cn(
          '@container/content',
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
          children ?? <Outlet />
        )}
      </SidebarInset>
    </>
  )
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
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
