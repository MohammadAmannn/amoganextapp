import { NextRequest, NextResponse } from 'next/server'
import { getShortUrl } from '@/lib/short-url-store'
import { parseBrowser, parseOS, parseDevice, parseReferrer, cleanReferrerName } from '@/lib/ua-parser'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

async function logClick(linkId: string, request: NextRequest) {
  if (!supabase) return

  try {
    const userAgent = request.headers.get('user-agent') || ''
    const referrerRaw = request.headers.get('referer') || ''
    
    // Parse geo from Vercel headers
    let country = request.headers.get('x-vercel-ip-country') || ''
    let city = request.headers.get('x-vercel-ip-city') || ''
    let region = request.headers.get('x-vercel-ip-country-region') || ''
    
    // Extract IP address to do fallback geolocation if Vercel misses city
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               '';

    if (!city && ip && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(2000) })
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData.status === 'success') {
            city = geoData.city || ''
            region = geoData.region || ''
            country = geoData.countryCode || country
          }
        }
      } catch (e) {
        console.error('Failed to look up IP fallback geo:', e)
      }
    }

    // Decode URL safe URI components (like Ho%20Chi%20Minh%20City)
    if (city) {
      try { city = decodeURIComponent(city) } catch {}
    }
    if (region) {
      try { region = decodeURIComponent(region) } catch {}
    }
    
    // Local development fallback
    if (!country && process.env.NODE_ENV === 'development') {
      country = 'IN'
      city = 'New Delhi'
      region = 'DL'
    }
    
    const browser = parseBrowser(userAgent)
    const os = parseOS(userAgent)
    const device = parseDevice(userAgent, os)
    
    // Check for query-based share parameters (e.g. ?ref=whatsapp)
    const queryRef = request.nextUrl.searchParams.get('ref') || request.nextUrl.searchParams.get('utm_source')
    const referrer = queryRef ? cleanReferrerName(queryRef) : parseReferrer(referrerRaw)
    
    // Check if clicked from QR code
    const isQr = request.nextUrl.searchParams.get('qr') === '1'

    const { error } = await supabase
      .from('clicks')
      .insert({
        link_id: linkId,
        country: country || null,
        city: city || null,
        region: region || null,
        device,
        os,
        browser,
        referrer,
        referrer_raw: referrerRaw || null,
        user_agent: userAgent || null,
        qr: isQr
      })

    if (error) {
      console.error('Error saving click log to Supabase:', error)
    } else {
      console.log(`Logged click event in Supabase for short link: ${linkId} (QR: ${isQr}, Ref: ${referrer}, City: ${city})`)
    }
  } catch (err) {
    console.error('Exception in logClick tracking:', err)
  }
}


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
    if (parsed.pathname.startsWith('/l') || parsed.pathname.startsWith('/link-builder') || parsed.pathname.startsWith('/link-maker')) {
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
  console.log("🔥 SHORT RESOLVER ROUTE HIT (/go)");
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
    
    // Log the click event to Supabase
    await logClick(id, request)

    const finalUrl = resolveRedirectUrl(entry.targetUrl, origin)
    return NextResponse.redirect(finalUrl, { status: 302 })
  }
  
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
      
      // Log the click event to Supabase
      await logClick(id, request)

      const finalUrl = resolveRedirectUrl(targetUrl, origin)
      return NextResponse.redirect(finalUrl, { status: 302 })
    } catch {
      // fall through to not-found
    }
  }
  
  return NextResponse.redirect(`${origin}/link-builder?error=link-not-found`)
}
