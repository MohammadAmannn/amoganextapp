import { NextRequest, NextResponse } from 'next/server'
import { getShortUrl } from '@/lib/short-url-store'

export const runtime = 'nodejs'

function getOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return request.nextUrl.origin
}

function resolveRedirectUrl(urlStr: string, currentOrigin: string): string {
  try {
    const parsed = new URL(urlStr)
    // If the path belongs to link builder or the redirect route, redirect using current request's origin
    if (parsed.pathname.startsWith('/l') || parsed.pathname.startsWith('/link-builder')) {
      return `${currentOrigin}${parsed.pathname}${parsed.search}`
    }
    return urlStr
  } catch {
    return urlStr
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const origin = getOrigin(request)

  if (!id) {
    return NextResponse.redirect(`${origin}/link-builder`)
  }

  const entry = await getShortUrl(id)

  if (entry) {
    const expiresAtMs = new Date(entry.expiresAt).getTime()
    if (!isNaN(expiresAtMs) && Date.now() > expiresAtMs) {
      return NextResponse.redirect(`${origin}/link-builder?error=link-expired`)
    }
    const finalUrl = resolveRedirectUrl(entry.targetUrl, origin)
    return NextResponse.redirect(finalUrl, { status: 302 })
  }

  // Self-contained fallback when no persistent store is available (Vercel without KV)
  const encodedTarget = request.nextUrl.searchParams.get('r')
  if (encodedTarget) {
    try {
      const targetUrl = Buffer.from(encodedTarget, 'base64url').toString('utf-8')
      const expMatch = targetUrl.match(/[?&]exp=(\d+)/)
      if (expMatch) {
        const expTime = parseInt(expMatch[1], 10)
        if (!isNaN(expTime) && Date.now() > expTime) {
          return NextResponse.redirect(`${origin}/link-builder?error=link-expired`)
        }
      }
      const finalUrl = resolveRedirectUrl(targetUrl, origin)
      return NextResponse.redirect(finalUrl, { status: 302 })
    } catch {
      // fall through to not-found
    }
  }

  return NextResponse.redirect(`${origin}/link-builder?error=link-not-found`)
}
