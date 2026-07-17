import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'

/**
 * Looks up a user's permanent business UUID from the `users` table using their auth UUID.
 */
export async function resolveBusinessId(authUserId: string): Promise<string | null> {
  try {
    const query = createQuery().select('id').eq('auth_user_id', authUserId).limit(1)
    const users = await apiClient.get<any[]>(`/rest/v1/users${query.toString()}`)
    const data = users[0] || null
    return data?.id ?? null
  } catch (error) {
    console.error('[Users API] Failed to resolve business ID:', error)
    return null
  }
}

/**
 * Looks up or creates a Pending user record by email.
 * Executes a server-side RPC (SECURITY DEFINER) to bypass RLS.
 */
export async function getOrCreatePendingUser(
  email: string,
  name: string
): Promise<{ id: string; status: string } | null> {
  try {
    // Call the security definer function via PostgREST RPC endpoint
    const data = await apiClient.post<any>('/rest/v1/rpc/get_or_create_pending_user', {
      p_email: email.trim().toLowerCase(),
      p_name: name.trim() || email.split('@')[0],
    })

    if (!data) return null
    return { id: data.id, status: data.status }
  } catch (error) {
    console.error('[Users API] Failed to get/create pending user via RPC:', error)
    return null
  }
}

/**
 * Looks up a user's business ID by email.
 */
export async function getUserByEmail(email: string): Promise<{ id: string; name: string; email: string; avatar?: string } | null> {
  try {
    const query = createQuery().select('id, name, email, avatar').ilike('email', email.trim()).limit(1)
    const users = await apiClient.get<any[]>(`/rest/v1/users${query.toString()}`)
    const data = users[0] || null
    
    if (!data) return null
    return {
      id: data.id,
      name: data.name || data.email.split('@')[0],
      email: data.email,
      avatar: data.avatar || undefined,
    }
  } catch (error) {
    console.error('[Users API] Failed to get user by email:', error)
    return null
  }
}

/**
 * Ensures a user record exists for the given auth user.
 */
export async function ensureUserExists(authUser: {
  authUserId: string
  email: string
  name?: string
  picture?: string
}): Promise<string | null> {
  try {
    // Try to find by email first
    const checkQuery = createQuery().select('id, auth_user_id').ilike('email', authUser.email.trim()).limit(1)
    const users = await apiClient.get<any[]>(`/rest/v1/users${checkQuery.toString()}`)
    const byEmail = users[0] || null

    if (byEmail) {
      // If auth_user_id doesn't match, update it
      if (byEmail.auth_user_id !== authUser.authUserId) {
        const updateQuery = createQuery().eq('id', byEmail.id).limit(1)
        await apiClient.patch(`/rest/v1/users${updateQuery.toString()}`, {
          auth_user_id: authUser.authUserId,
          status: 'Active',
          updated_at: new Date().toISOString(),
        })
      }
      return byEmail.id
    }

    // Create a new user row
    const inserted = await apiClient.post<any[]>('/rest/v1/users', {
      email: authUser.email.trim().toLowerCase(),
      name: authUser.name || authUser.email.split('@')[0],
      avatar: authUser.picture || null,
      status: 'Active',
      auth_user_id: authUser.authUserId,
    })
    
    const created = inserted[0] || null
    return created?.id ?? null
  } catch (error) {
    console.error('[Users API] Failed to ensure user exists:', error)
    return null
  }
}
