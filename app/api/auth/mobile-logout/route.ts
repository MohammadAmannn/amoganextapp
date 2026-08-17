import { NextResponse } from 'next/server'

/**
 * GET /api/auth/mobile-logout
 * Handles instant sign-out for mobile & web by purging ALL session cookies
 * on the HTTP response and issuing a direct 302 redirect to /sign-in.
 *
 * IMPORTANT: Every cookie that stores identity must be wiped here. If even one
 * is missed the Zustand auth-store will reload the old user from the cookie on
 * the next app boot and the new account login will appear to have no effect.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const signInUrl = new URL('/sign-in', origin)

  const response = NextResponse.redirect(signInUrl, { status: 302 })

  // ── 1. Core NextAuth JWT session tokens ────────────────────────────────────
  response.cookies.set('next-auth.session-token', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })
  response.cookies.set('__Secure-next-auth.session-token', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    secure: true,
  })

  // ── 2. NextAuth ancillary cookies ──────────────────────────────────────────
  response.cookies.set('next-auth.callback-url', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('__Secure-next-auth.callback-url', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('next-auth.csrf-token', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('__Secure-next-auth.csrf-token', '', { path: '/', expires: new Date(0), maxAge: 0 })

  // ── 3. Custom auth-store identity cookies ──────────────────────────────────
  // These are written by auth-store.ts via setCookie(USER_DATA, ...) and setCookie(ACCESS_TOKEN, ...)
  // Failing to clear these is the PRIMARY cause of the "old account" bug.
  response.cookies.set('auth_user_data', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('thisisjustarandomstring', '', { path: '/', expires: new Date(0), maxAge: 0 })

  // ── 4. Mobile-auth utility cookies ────────────────────────────────────────
  response.cookies.set('mobile_auth', '', { path: '/', expires: new Date(0), maxAge: 0 })

  // ── 5. Purge any Supabase / sb-* cookies found in the incoming request ────
  const cookieHeader = request.headers.get('cookie') || ''
  for (const pair of cookieHeader.split(';')) {
    const cookieName = pair.split('=')[0]?.trim()
    if (
      cookieName &&
      (cookieName.startsWith('sb-') ||
        cookieName.includes('supabase') ||
        cookieName.includes('auth') ||
        cookieName === 'auth_user_data' ||
        cookieName === 'thisisjustarandomstring')
    ) {
      response.cookies.set(cookieName, '', { path: '/', expires: new Date(0), maxAge: 0 })
    }
  }

  console.log('📱 [Mobile Logout] All session cookies purged. Redirecting to /sign-in.')
  return response
}
