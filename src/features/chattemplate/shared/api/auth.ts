import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { stringToUuid } from '@/lib/auth'

/**
 * Retrieves the current session's access token (JWT) from Supabase auth or NextAuth store token.
 * Falls back to the publishable anon key if no active valid Supabase JWT session exists.
 */
export async function getAccessToken(): Promise<string> {
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  try {
    const storeToken = useAuthStore.getState().auth.accessToken
    if (storeToken && typeof storeToken === 'string' && storeToken.split('.').length === 3) {
      return storeToken
    }

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token && session.access_token.split('.').length === 3) {
      return session.access_token
    }

    return supabaseKey
  } catch (error) {
    return supabaseKey
  }
}

/**
 * Retrieves the current authenticated user's profile details.
 * Resolves the actual profile UUID from Supabase by email to ensure it matches
 * the UUID stored in chat_messages, vouchers, contacts, etc.
 */
export async function getCurrentUser() {
  try {
    // Try Supabase session first (most reliable UUID)
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (supabaseUser) return supabaseUser

    // NextAuth path: resolve profile UUID via email
    const storeUser = useAuthStore.getState().auth.user
    if (!storeUser) return null

    const email = storeUser.email?.toLowerCase()
    if (email) {
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('id, name, email, avatar')
          .eq('email', email)
          .maybeSingle()

        if (profileRow?.id) {
          return {
            id: profileRow.id,
            email: profileRow.email,
            user_metadata: {
              name: profileRow.name,
              avatar_url: profileRow.avatar,
            },
          }
        }
      } catch {}
    }

    // Last resort: use stringToUuid on storeUser.id
    const validId = stringToUuid(storeUser.id || storeUser.email)
    return {
      id: validId,
      email: storeUser.email,
      user_metadata: {
        name: storeUser.name,
        avatar_url: storeUser.picture,
      },
    }
  } catch (error) {
    console.error('[Auth Core] Failed to get current user:', error)
    return null
  }
}

