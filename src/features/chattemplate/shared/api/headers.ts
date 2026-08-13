import { getAccessToken } from './auth'

/**
 * Builds HTTP headers required for Supabase PostgREST API requests.
 * Automatically attaches apikey, Authorization, and default content-types.
 * Validates JWT tokens so invalid tokens (like 'next-auth-session') fallback to Supabase anon key.
 */
export async function getHeaders(customHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getAccessToken()
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  
  const is3PartJwt = typeof token === 'string' && token.split('.').length === 3
  const validBearerToken = is3PartJwt ? token : apiKey

  return {
    'apikey': apiKey,
    'Authorization': `Bearer ${validBearerToken}`,
    'Content-Type': 'application/json',
    ...customHeaders
  }
}
