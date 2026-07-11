import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventName, url, referrer, userAgent } = body

    const webAppUrl = process.env.GOOGLE_SHEET_WEBAPP_URL
    if (!webAppUrl) {
      console.warn('⚠️ GOOGLE_SHEET_WEBAPP_URL is not configured in environment variables. Logging skipped.')
      return NextResponse.json({ success: true, message: 'Logging skipped (no config)' }, { status: 200 })
    }

    // Forward payload to Google Sheets Web App
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: eventName || 'page_view',
        url: url || '',
        referrer: referrer || '',
        userAgent: userAgent || '',
      }),
      // Set a reasonable timeout so analytics don't block requests indefinitely
      signal: AbortSignal.timeout(6000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to log to Google Sheets Web App:', response.status, errorText)
      // Return 202 Accepted to the client so that external log script failures do not break client-side site usage.
      return NextResponse.json({ success: false, error: 'External logging script returned error status' }, { status: 202 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('❌ Analytics log endpoint exception:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 202 }
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
