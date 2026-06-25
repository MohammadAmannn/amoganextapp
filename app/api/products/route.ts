import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

async function getConfig() {
  let key = process.env.consumer_key
  let secret = process.env.consumer_secret
  let wooUrl = process.env.WOOCOMMERCE_URL

  // Fallback to reading .env directly if process.env lacks credentials
  if (!key || !secret || !wooUrl) {
    try {
      const envPath = path.resolve(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8')
        const keyMatch = envContent.match(/^consumer_key\s*=\s*["']?(.*?)["']?$/m)
        const secretMatch = envContent.match(/^consumer_secret\s*=\s*["']?(.*?)["']?$/m)
        const urlMatch = envContent.match(/^WOOCOMMERCE_URL\s*=\s*["']?(.*?)["']?$/m)
        if (keyMatch && !key) key = keyMatch[1].trim()
        if (secretMatch && !secret) secret = secretMatch[1].trim()
        if (urlMatch && !wooUrl) wooUrl = urlMatch[1].trim()
      }
    } catch (e) {
      console.error('Failed to parse .env file dynamically in products proxy:', e)
    }
  }

  // Default WooCommerce store URL
  if (!wooUrl) wooUrl = 'https://stor.chat'

  return { key, secret, wooUrl }
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT')
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

async function handleRequest(request: NextRequest, method: string) {
  const { key, secret, wooUrl } = await getConfig()

  if (!key || !secret) {
    return NextResponse.json(
      { error: 'WooCommerce credentials (consumer_key or consumer_secret) are missing from the environment configuration.' },
      { status: 500 }
    )
  }

  try {
    const authString = Buffer.from(`${key}:${secret}`).toString('base64')

    const { searchParams } = new URL(request.url)
    let targetUrl: URL

    const endpoint = searchParams.get('endpoint')
    const productId = searchParams.get('id')

    if (endpoint === 'categories') {
      // Fetch WooCommerce product categories
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/products/categories`)
      searchParams.delete('endpoint')
      // Ensure we get all categories
      if (!targetUrl.searchParams.has('per_page')) {
        targetUrl.searchParams.set('per_page', '100')
      }
    } else if (endpoint === 'orders') {
      // Create/fetch WooCommerce orders
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/orders`)
      searchParams.delete('endpoint')
    } else if (productId) {
      // Fetch a single product by ID using the correct REST endpoint /products/{id}
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/products/${productId}`)
      searchParams.delete('id')
    } else {
      // Fetch all products
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/products`)
    }

    // Copy remaining search params (e.g. search, category, page, per_page)
    searchParams.forEach((val, name) => {
      targetUrl.searchParams.set(name, val)
    })

    // Default per_page for product listings
    if (!targetUrl.searchParams.has('per_page') && !endpoint && !productId) {
      targetUrl.searchParams.set('per_page', '100')
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    }

    if (method === 'POST' || method === 'PUT') {
      fetchOptions.body = await request.text()
    }

    console.log(`[WooCommerce Proxy] ${method} ${targetUrl.toString()}`)

    const response = await fetch(targetUrl.toString(), fetchOptions)
    const data = await response.json()

    if (!response.ok) {
      console.error('[WooCommerce Proxy] API error:', response.status, JSON.stringify(data))
      return NextResponse.json(data, { status: response.status })
    }

    // For single product fetches, wrap in array for backwards compatibility with hooks
    // that expect an array response
    const responseData = productId && !Array.isArray(data) ? [data] : data

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (err) {
    console.error('[WooCommerce Proxy] Exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal WooCommerce Proxy Server Error' },
      { status: 500 }
    )
  }
}
