import { NextResponse } from 'next/server'

/**
 * GET /api/auth/mobile-login
 * Direct mobile GET endpoint to initiate Google OAuth in Chrome Custom Tab / Safari View Controller.
 * Redirects directly to Google Authorization server with callbackUrl set to /auth/callback?is_mobile=true.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') || '/'
  const callbackUrl = `${origin}/auth/callback?is_mobile=true&next=${encodeURIComponent(next)}`

  const googleClientId =
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

  if (!googleClientId) {
    console.error('❌ [Mobile Login] Missing GOOGLE_CLIENT_ID environment variable')
    return NextResponse.redirect(`${origin}/sign-in?error=ConfigurationError`)
  }

  const redirectUri = `${origin}/api/auth/callback/google`

  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleUrl.searchParams.set('client_id', googleClientId)
  googleUrl.searchParams.set('redirect_uri', redirectUri)
  googleUrl.searchParams.set('response_type', 'code')
  googleUrl.searchParams.set('scope', 'openid email profile')
  googleUrl.searchParams.set('prompt', 'select_account')
  googleUrl.searchParams.set('state', encodeURIComponent(callbackUrl))

  console.log('📱 [Mobile Login] Redirecting mobile browser directly to Google OAuth:', googleUrl.toString())
  
  const response = NextResponse.redirect(googleUrl.toString())

  // Explicitly set NextAuth callbackUrl and mobile_auth cookies so NextAuth returns to /auth/callback?is_mobile=true
  response.cookies.set('mobile_auth', 'true', {
    path: '/',
    maxAge: 600,
    sameSite: 'lax',
  })
  response.cookies.set('next-auth.callback-url', callbackUrl, {
    path: '/',
    sameSite: 'lax',
  })
  response.cookies.set('__Secure-next-auth.callback-url', callbackUrl, {
    path: '/',
    sameSite: 'lax',
    secure: true,
  })

  return response
}
