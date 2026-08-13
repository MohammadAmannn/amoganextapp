import { isCapacitor } from '@/lib/platform'

/**
 * Returns the mobile login initiation URL for Google OAuth inside Capacitor `@capacitor/browser`.
 */
export function getMobileGoogleAuthUrl(targetUrl: string = '/'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/api/auth/mobile-login?next=${encodeURIComponent(targetUrl)}`
}
