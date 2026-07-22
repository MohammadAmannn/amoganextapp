import { createClient } from '@/lib/supabase/client'
import { isCapacitor } from '@/lib/platform'

/**
 * Initializes Capacitor Native Handlers:
 * 1. Deep Linking (OAuth Redirects for Google Login)
 * 2. Android Back Button navigation
 * 3. App Resume Session Restoration
 *
 * SAFELY RETURNS IMMEDIATELY IF RUNNING ON BROWSER (Zero Web Regression).
 */
export function initializeCapacitorHandlers(router: any, onAuthSuccess?: () => void) {
  if (!isCapacitor() || typeof window === 'undefined') return

  // Dynamically import Capacitor plugins to prevent SSR/Build errors on Web
  Promise.all([
    import('@capacitor/app' as any) as Promise<any>,
    import('@capacitor/browser' as any) as Promise<any>
  ]).then(([{ App }, { Browser }]) => {
    // 1. DEEP LINK LISTENER (Handles com.aman.amoganextapp://auth/callback)
    App.addListener('appUrlOpen', async (data: { url: string }) => {
      console.log('[Capacitor Init] App opened via Deep Link URL:', data.url)

      try {
        const urlObj = new URL(data.url)

        // Close Chrome Custom Tab / External Browser if open
        try {
          await Browser.close()
        } catch {
          // Browser may already be closed
        }

        // Handle Auth Callback Deep Link
        if (data.url.includes('auth/callback') || urlObj.pathname.includes('callback') || urlObj.hash || urlObj.search) {
          const supabase = createClient()

          // A) Hash fragment based callback (#access_token=...&refresh_token=...)
          if (data.url.includes('#')) {
            const hashParams = new URLSearchParams(data.url.split('#')[1])
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')

            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              if (!error) {
                if (onAuthSuccess) onAuthSuccess()
                const nextUrl = hashParams.get('next') || '/'
                router.push(nextUrl)
                return
              }
            }
          }

          // B) Search params based callback (?code=...)
          const code = urlObj.searchParams.get('code')
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (!error) {
              if (onAuthSuccess) onAuthSuccess()
              const nextUrl = urlObj.searchParams.get('next') || '/'
              router.push(nextUrl)
              return
            }
          }
        }
      } catch (err) {
        console.error('[Capacitor Init] Error handling deep link:', err)
      }
    })

    // 2. ANDROID BACK BUTTON LISTENER
    App.addListener('backButton', (state: { canGoBack: boolean }) => {
      const pathname = window.location.pathname
      const isRootPage = pathname === '/' || pathname === '/sign-in' || pathname === '/dashboard'

      if (isRootPage || !state.canGoBack) {
        App.minimizeApp()
      } else {
        window.history.back()
      }
    })

    // 3. APP RESUME / SESSION RESTORATION
    App.addListener('appStateChange', async (state: { isActive: boolean }) => {
      if (state.isActive) {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          // Refresh session automatically if expired or expiring soon
          await supabase.auth.refreshSession()
        }
      }
    })
  }).catch(err => {
    console.error('[Capacitor Init] Failed to load Capacitor plugins:', err)
  })
}
