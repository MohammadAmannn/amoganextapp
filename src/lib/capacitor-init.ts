import { isCapacitor } from '@/lib/platform'

/**
 * Initializes Capacitor Native Handlers:
 * 1. Deep Linking (OAuth Redirects for Google Login)
 * 2. Android Back Button navigation
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
      console.log('📱 [Capacitor Init] App opened via Deep Link URL:', data.url)

      try {
        const urlObj = new URL(data.url)

        // Close Chrome Custom Tab / External Browser if open
        try {
          await Browser.close()
        } catch {
          // Browser may already be closed
        }

        // Handle Auth Callback Deep Link
        if (data.url.includes('auth/callback') || urlObj.pathname.includes('callback')) {
          const token = urlObj.searchParams.get('token')
          const next = urlObj.searchParams.get('next') || '/'

          if (onAuthSuccess) onAuthSuccess()

          if (token) {
            console.log('📱 [Capacitor Init] Deep link session token received. Syncing cookie to native webview...')
            window.location.href = `/api/auth/mobile-set-cookie?token=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`
          } else {
            console.log('📱 [Capacitor Init] Deep link auth success without token. Navigating native webview to:', next)
            window.location.href = next
          }
          return
        }
      } catch (err) {
        console.error('❌ [Capacitor Init] Error handling deep link:', err)
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
  }).catch(err => {
    console.error('❌ [Capacitor Init] Failed to load Capacitor plugins:', err)
  })
}
