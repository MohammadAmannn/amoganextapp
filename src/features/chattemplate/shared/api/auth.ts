import { createClient } from '@/lib/supabase/client'

/**
 * Retrieves the current session's access token (JWT) from Supabase auth.
 * Falls back to the publishable anon key if no active user session exists.
 */
export async function getAccessToken(): Promise<string> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  } catch (error) {
    console.error('[Auth Core] Failed to get session access token:', error)
    return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  }
}

/**
 * Retrieves the current authenticated user's profile details.
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('[Auth Core] Failed to get current user:', error)
    return null
  }
}
