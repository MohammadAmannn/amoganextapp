import { NextResponse } from 'next/server'

/**
 * GET /api/auth/mobile-logout
 * Handles instant sign-out for mobile & web by purging all session cookies
 * on the HTTP response and issuing a direct 302 redirect to /sign-in.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const signInUrl = new URL('/sign-in', origin)
  
  const response = NextResponse.redirect(signInUrl, {
    status: 302,
  })

  // Purge all NextAuth session cookies
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

  // Purge callback and state cookies
  response.cookies.set('next-auth.callback-url', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('__Secure-next-auth.callback-url', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('next-auth.csrf-token', '', { path: '/', expires: new Date(0), maxAge: 0 })

  // Purge legacy auth cookies
  response.cookies.set('auth_user_data', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('mobile_auth', '', { path: '/', expires: new Date(0), maxAge: 0 })
  response.cookies.set('thisisjustarandomstring', '', { path: '/', expires: new Date(0), maxAge: 0 })

  console.log('📱 [Mobile Logout] Purged all session cookies and issued 302 redirect to /sign-in')
  return response
}
