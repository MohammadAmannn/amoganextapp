import { NextRequest, NextResponse } from 'next/server'
import { saveShortUrl } from '@/lib/short-url-store'

export const runtime = 'nodejs'

function getOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, durationHours = 1 } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const expiresAtMs = Date.now() + durationHours * 60 * 60 * 1000
    const expiresAt = new Date(expiresAtMs).toISOString()

    let urlWithExpiration = url
    if (url.includes('/l/')) {
      const parts = url.split('/l/')
      const domain = parts[0]
      const config = parts[1]
      urlWithExpiration = `${domain}/l?c=${config}&exp=${expiresAtMs}`
    } else if (url.includes('/l?')) {
      // If it already has query parameters, ensure exp is appended/updated
      const parsed = new URL(url)
      parsed.searchParams.set('exp', String(expiresAtMs))
      urlWithExpiration = parsed.toString()
    } else {
      const separator = url.includes('?') ? '&' : '?'
      urlWithExpiration = `${url}${separator}exp=${expiresAtMs}`
    }

    const origin = getOrigin(request)
    let shortUrl = ''

    // Attempt to shorten using TinyURL for a truly short link
    try {
      const tinyRes = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlWithExpiration)}`,
        { signal: AbortSignal.timeout(4000) }
      )
      if (tinyRes.ok) {
        const text = await tinyRes.text()
        if (text && text.startsWith('http')) {
          shortUrl = text
        }
      }
    } catch (e) {
      console.warn('TinyURL API shortening failed, using fallback:', e)
    }

    // Fallback to our own self-contained /l/s/ link if TinyURL is offline or fails
    if (!shortUrl) {
      const { shortUrlSuffix } = await saveShortUrl(urlWithExpiration, expiresAtMs)
      shortUrl = `${origin}/l/s/${shortUrlSuffix}`
    }

    return NextResponse.json(
      { shortUrl, expiresAt },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (err) {
    console.error('URL shortening API exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
