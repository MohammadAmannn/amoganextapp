'use client'

import { useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/context/theme-provider'
import { ColorThemeProvider } from '@/context/color-theme-provider'
import { FontProvider } from '@/context/font-provider'
import { DirectionProvider } from '@/context/direction-provider'
import { NavigationProgress } from '@/components/navigation-progress'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { useRouter } from 'next/navigation'

function QueryProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (process.env.NODE_ENV === 'development') console.log({ failureCount, error })
              if (failureCount >= 0 && process.env.NODE_ENV === 'development') return false
              if (failureCount > 3 && process.env.NODE_ENV === 'production') return false
              return !(
                error instanceof AxiosError &&
                [401, 403].includes(error.response?.status ?? 0)
              )
            },
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            staleTime: 60 * 1000, // 60s - reduces refetch churn during navigation
          },
          mutations: {
            onError: (error) => {
              handleServerError(error)
              if (error instanceof AxiosError) {
                if (error.response?.status === 304) {
                  toast.error('Content not modified!')
                }
              }
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof AxiosError) {
              if (error.response?.status === 401) {
                toast.error('Session expired!')
                useAuthStore.getState().auth.reset()
                router.push('/sign-in')
              }
              if (error.response?.status === 500) {
                toast.error('Internal Server Error!')
                if (process.env.NODE_ENV === 'production') {
                  router.push('/500-error')
                }
              }
            }
          },
        }),
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools buttonPosition='bottom-left' />
      )}
    </QueryClientProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      let errorMessage = ''
      if ('message' in event) {
        errorMessage = event.message
      } else if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
        errorMessage = (event.reason as { message: string }).message
      }

      if (
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('Loading chunk') ||
        /Loading chunk [\d]+ failed/.test(errorMessage)
      ) {
        console.warn('ChunkLoadError detected, reloading page...', errorMessage)

        // Safeguard to prevent infinite reload loop:
        const lastReload = sessionStorage.getItem('chunk_load_last_reload')
        const now = Date.now()

        // If we reloaded less than 10 seconds ago, don't reload again to avoid loop
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('chunk_load_last_reload', now.toString())
          window.location.reload()
        }
      }
    }

    window.addEventListener('error', handleChunkError as EventListener, true)
    window.addEventListener('unhandledrejection', handleChunkError as EventListener, true)

    return () => {
      window.removeEventListener('error', handleChunkError as EventListener, true)
      window.removeEventListener('unhandledrejection', handleChunkError as EventListener, true)
    }
  }, [])

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <QueryProviderWrapper>
        <ThemeProvider>
          <ColorThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <NavigationProgress />
                {children}
                <Toaster duration={5000} />
              </DirectionProvider>
            </FontProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </QueryProviderWrapper>
    </GoogleOAuthProvider>
  )
}
