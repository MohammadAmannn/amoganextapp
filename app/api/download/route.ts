import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/download?url=...&name=...
 * Proxy route to download cross-origin or local files directly as attachments
 * with proper Content-Disposition header and filename.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const fileName = request.nextUrl.searchParams.get('name') || 'document'

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  try {
    // Convert relative URLs to absolute origin URLs for Node.js fetch compatibility
    let targetUrl = url
    if (url.startsWith('/')) {
      targetUrl = `${request.nextUrl.origin}${url}`
    }

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    })

    if (!res.ok) {
      console.error(`Download proxy fetch failed for ${targetUrl}: ${res.status} ${res.statusText}`)
      return NextResponse.json(
        { error: `Failed to fetch file: ${res.statusText}` },
        { status: res.status }
      )
    }

    const arrayBuffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    // Clean up filename for Content-Disposition header
    const cleanFileName = fileName.replace(/["'\r\n]/g, '_')

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(cleanFileName)}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (err: any) {
    console.error('Download proxy error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to proxy file download' },
      { status: 500 }
    )
  }
}
