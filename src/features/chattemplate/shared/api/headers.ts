import { getAccessToken } from './auth'

/**
 * Builds HTTP headers required for Supabase PostgREST API requests.
 * Automatically attaches apikey, Authorization, and default content-types.
 */
export async function getHeaders(customHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getAccessToken()
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  
  return {
    'apikey': apiKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...customHeaders
  }
}
