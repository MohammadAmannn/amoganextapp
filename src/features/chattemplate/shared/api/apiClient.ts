import { getHeaders } from './headers'
import { handleError } from './errorHandler'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

// Clean base URL trailing slash
const BASE_URL = SUPABASE_URL.endsWith('/') ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL

interface RequestOptions {
  headers?: Record<string, string>
  body?: any
}

/**
 * Helper to safely parse JSON response, handling empty bodies.
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  return (text ? JSON.parse(text) : {}) as T
}

/**
 * postgREST API Client wrapper using standard HTTP calls via fetch.
 */
export const apiClient = {
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const headers = await getHeaders(options?.headers)
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      await handleError(response)
    }
    
    return parseResponse<T>(response)
  },

  async post<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    const defaultHeaders = {
      'Prefer': 'return=representation'
    }
    const headers = await getHeaders({ ...defaultHeaders, ...options?.headers })
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      await handleError(response)
    }

    return parseResponse<T>(response)
  },

  async patch<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    const defaultHeaders = {
      'Prefer': 'return=representation'
    }
    const headers = await getHeaders({ ...defaultHeaders, ...options?.headers })
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      await handleError(response)
    }

    return parseResponse<T>(response)
  },

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const defaultHeaders = {
      'Prefer': 'return=representation'
    }
    const headers = await getHeaders({ ...defaultHeaders, ...options?.headers })
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      await handleError(response)
    }

    return parseResponse<T>(response)
  }
}
