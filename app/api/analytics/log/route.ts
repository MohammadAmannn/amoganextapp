import { NextRequest, NextResponse } from 'next/server'



export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventName, url, referrer, userAgent } = body

    const webAppUrl = process.env.GOOGLE_SHEET_WEBAPP_URL
    if (!webAppUrl) {
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
      // Fail silently without dumping HTML / 404 response text into server logs
      return NextResponse.json({ success: false, error: 'External logging script returned error status' }, { status: 202 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (_err) {
    // Fail silently without clogging server console logs
    return NextResponse.json(
      { success: false },
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
