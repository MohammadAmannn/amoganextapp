import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function GET(request: NextRequest) {
  try {
    const linkId = request.nextUrl.searchParams.get('linkId')
    if (!linkId) {
      return NextResponse.json({ error: 'linkId is required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
    }

    // Fetch all clicks for the link
    const { data: clicks, error } = await supabase
      .from('clicks')
      .select('*')
      .eq('link_id', linkId)
      .order('clicked_at', { ascending: true })

    if (error) {
      console.error('Error fetching analytics from Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch shares data
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select('*')
      .eq('link_id', linkId)

    const totalShares = sharesError || !shares ? 0 : shares.length
    const sharesByPlatform: Record<string, number> = {}

    if (shares && !sharesError) {
      shares.forEach((share) => {
        const platform = share.platform || 'Other'
        // Map platform IDs to user-friendly names
        let name = platform
        if (platform === 'whatsapp') name = 'WhatsApp'
        if (platform === 'linkedin') name = 'LinkedIn'
        if (platform === 'twitter') name = 'Twitter'
        if (platform === 'gmail') name = 'Gmail/Email'
        sharesByPlatform[name] = (sharesByPlatform[name] || 0) + 1
      })
    }

    const totalClicks = clicks.length
    
    // Aggregate data
    const clicksOverTime: Record<string, number> = {}
    const referrers: Record<string, number> = {}
    const countries: Record<string, number> = {}
    const cities: Record<string, number> = {}
    const devices: Record<string, number> = {}
    const osStats: Record<string, number> = {}
    const browsers: Record<string, number> = {}
    let qrClicks = 0

    clicks.forEach((click) => {
      // Date grouping (YYYY-MM-DD)
      const dateStr = new Date(click.clicked_at).toISOString().split('T')[0]
      clicksOverTime[dateStr] = (clicksOverTime[dateStr] || 0) + 1

      // Referrer
      const ref = click.referrer || 'direct'
      referrers[ref] = (referrers[ref] || 0) + 1

      // Location
      const country = click.country || 'Unknown'
      countries[country] = (countries[country] || 0) + 1

      const city = click.city || 'Unknown'
      cities[city] = (cities[city] || 0) + 1

      // Tech specs
      const device = click.device || 'desktop'
      devices[device] = (devices[device] || 0) + 1

      const os = click.os || 'Unknown'
      osStats[os] = (osStats[os] || 0) + 1

      const browser = click.browser || 'Unknown'
      browsers[browser] = (browsers[browser] || 0) + 1

      // QR click
      if (click.qr) {
        qrClicks++
      }
    })

    const formatStats = (stats: Record<string, number>) => {
      return Object.entries(stats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    }

    const timeseriesData = Object.entries(clicksOverTime).map(([date, count]) => {
      // Format date for chart tooltip display (e.g. "Jul 3")
      const parsedDate = new Date(date)
      const formattedDate = parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      return {
        date: formattedDate,
        rawDate: date,
        clicks: count,
      }
    })

    return NextResponse.json({
      totalClicks,
      qrClicks,
      nonQrClicks: totalClicks - qrClicks,
      totalShares,
      sharesByPlatform: formatStats(sharesByPlatform),
      timeseries: timeseriesData,
      referrers: formatStats(referrers),
      countries: formatStats(countries).slice(0, 8),
      cities: formatStats(cities).slice(0, 8),
      devices: formatStats(devices),
      os: formatStats(osStats),
      browsers: formatStats(browsers),
    })
  } catch (err) {
    console.error('Analytics API exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
