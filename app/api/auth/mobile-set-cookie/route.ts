import { NextResponse } from 'next/server'

/**
 * GET /api/auth/mobile-set-cookie
 * Called by native Capacitor webview after deep link return to set NextAuth session cookie
 * in the native webview cookie store.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const next = searchParams.get('next') || '/'

  const destinationUrl = new URL(next, origin)
  const response = NextResponse.redirect(destinationUrl)

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
    response.cookies.set('__Secure-next-auth.session-token', token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
    })

    console.log('📱 [Mobile Set Cookie] Successfully attached NextAuth session cookie to native webview response')
  } else {
    console.warn('⚠️ [Mobile Set Cookie] No token provided in query params')
  }

  return response
}
