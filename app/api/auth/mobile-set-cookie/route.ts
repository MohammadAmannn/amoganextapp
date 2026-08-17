import { NextResponse } from 'next/server'

/**
 * GET /api/auth/mobile-set-cookie
 * Called by native Capacitor webview after deep link return to set NextAuth session cookie
 * in the native webview cookie store.
 *
 * IMPORTANT: We first purge ALL old identity cookies before writing the new token.
 * This prevents a previous account's cookie from coexisting with the new session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const next = searchParams.get('next') || '/'

  const destinationUrl = new URL(next, origin)
  const response = NextResponse.redirect(destinationUrl)

  // ── Always purge old identity cookies first ────────────────────────────────
  const oldCookies = [
    'auth_user_data',
    'thisisjustarandomstring',
    'mobile_auth',
  ]
  for (const name of oldCookies) {
    response.cookies.set(name, '', { path: '/', expires: new Date(0), maxAge: 0 })
  }

  // Also purge any sb-* / supabase cookies from the incoming request
  const cookieHeader = request.headers.get('cookie') || ''
  for (const pair of cookieHeader.split(';')) {
    const cookieName = pair.split('=')[0]?.trim()
    if (
      cookieName &&
      (cookieName.startsWith('sb-') ||
        cookieName.includes('supabase') ||
        cookieName === 'auth_user_data' ||
        cookieName === 'thisisjustarandomstring')
    ) {
      response.cookies.set(cookieName, '', { path: '/', expires: new Date(0), maxAge: 0 })
    }
  }

  if (token) {
    const isProd = process.env.NODE_ENV === 'production' || origin.startsWith('https')

    // Set standard NextAuth session token cookie
    response.cookies.set('next-auth.session-token', token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: true,
      secure: isProd,
    })

    // Set secure variant for production HTTPS environments
    if (isProd) {
      response.cookies.set('__Secure-next-auth.session-token', token, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        sameSite: 'lax',
        httpOnly: true,
        secure: true,
      })
    }

    console.log('📱 [Mobile Set Cookie] Purged old cookies & set new NextAuth session cookie successfully.')
  } else {
    console.warn('⚠️ [Mobile Set Cookie] No token provided in query params')
  }

  return response
}
