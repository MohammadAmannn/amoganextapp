import { URL } from 'url'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  let key = process.env.consumer_key
  let secret = process.env.consumer_secret
  let wooUrl = process.env.WOOCOMMERCE_URL

  // Fallback to reading .env directly if process.env lacks credentials (e.g. dev server not restarted)
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

  if (!wooUrl) wooUrl = 'https://stor.chat'

  if (!key || !secret) {
    return res.status(500).json({
      error: 'WooCommerce credentials (consumer_key or consumer_secret) are missing from the environment configuration.',
    })
  }

  try {
    const authString = Buffer.from(`${key}:${secret}`).toString('base64')
    
    // Parse target request parameters
    const parsedUrl = new URL(req.url, 'http://localhost')
    const endpoint = parsedUrl.searchParams.get('endpoint')
    const productId = parsedUrl.searchParams.get('id')
    let targetUrl

    // Direct categories and orders queries to correct WooCommerce endpoints
    if (endpoint === 'categories') {
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/products/categories`)
      parsedUrl.searchParams.delete('endpoint')
      if (!targetUrl.searchParams.has('per_page')) {
        targetUrl.searchParams.set('per_page', '100')
      }
    } else if (endpoint === 'orders') {
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/orders`)
      parsedUrl.searchParams.delete('endpoint')
    } else if (productId) {
      // Single product fetch using the correct REST endpoint
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/products/${productId}`)
      parsedUrl.searchParams.delete('id')
    } else {
      targetUrl = new URL(`${wooUrl}/wp-json/wc/v3/products`)
    }

    // Copy search params (e.g., search, category, page, per_page)
    parsedUrl.searchParams.forEach((val, name) => {
      targetUrl.searchParams.set(name, val)
    })

    // Add default per_page if not specified for product listings
    if (!targetUrl.searchParams.has('per_page') && !endpoint && !productId) {
      targetUrl.searchParams.set('per_page', '100')
    }

    // Prepare fetch options, forwarding body for write operations
    const fetchOptions = {
      method: req.method,
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl.toString(), fetchOptions)
    const data = await response.json()

    if (!response.ok) {
      console.error('WooCommerce API Response Error:', data)
      return res.status(response.status).json(data)
    }

    // Set CORS headers for local environment
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    return res.status(200).json(data)
  } catch (err) {
    console.error('WooCommerce Proxy Exception:', err)
    return res.status(500).json({
      error: err.message || 'Internal WooCommerce Proxy Server Error',
    })
  }
}

