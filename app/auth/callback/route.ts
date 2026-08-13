import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const isMobile = searchParams.get('is_mobile') === 'true' || searchParams.get('mobile') === 'true'
  const next = searchParams.get('next') ?? '/'

  const error = searchParams.get('error')
  if (error) {
    console.error('❌ [Auth Callback] OAuth error:', error)
    const errorDesc = searchParams.get('error_description') || 'Unknown error'
    const errorUrl = new URL('/sign-in', origin)
    errorUrl.searchParams.set('error', error)
    errorUrl.searchParams.set('error_description', errorDesc)
    return NextResponse.redirect(errorUrl)
  }

  if (isMobile) {
    const secret = process.env.NEXTAUTH_SECRET || 'secret_next_auth_shadcn_admin_key_2026_super_secure'

    // Retrieve raw NextAuth JWT session token from request
    let rawToken: string | null = null
    try {
      rawToken = await getToken({ req: request as any, secret, raw: true })
    } catch (e) {
      console.error('❌ [Auth Callback] Error fetching raw token:', e)
    }

    if (!rawToken) {
      try {
        const cookieStore = await cookies()
        rawToken =
          cookieStore.get('next-auth.session-token')?.value ||
          cookieStore.get('__Secure-next-auth.session-token')?.value ||
          null
      } catch (err) {
        console.error('❌ [Auth Callback] Cookie store error:', err)
      }
    }

    const tokenParam = rawToken ? `&token=${encodeURIComponent(rawToken)}` : ''
    const customScheme = `com.aman.amoganextapp://auth/callback?next=${encodeURIComponent(next)}${tokenParam}`
    const androidIntent = `intent://auth/callback?next=${encodeURIComponent(next)}${tokenParam}#Intent;scheme=com.aman.amoganextapp;package=com.aman.amoganextapp;end;`

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Opening App...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    window.location.replace("${androidIntent}");
  </script>
</head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,-apple-system,sans-serif;background:#09090b;color:#fff;text-align:center;margin:0;padding:20px;">
  <div style="max-width:400px;">
    <div style="margin-bottom:16px;font-size:36px;">📱</div>
    <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:600;">Success! Opening App...</h2>
    <p style="margin:0 0 20px 0;font-size:14px;color:#a1a1aa;">Login complete. Returning to your mobile app...</p>
    <a id="intent-btn" href="${androidIntent}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Open Mobile App</a>
  </div>
  <script>
    setTimeout(function() {
      window.location.replace("${customScheme}");
    }, 150);
  </script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  }

  const redirectUrl = new URL(next, origin)
  redirectUrl.searchParams.set('auth', 'success')
  return NextResponse.redirect(redirectUrl)
}