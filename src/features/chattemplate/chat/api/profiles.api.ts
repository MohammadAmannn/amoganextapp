import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'
import { Profile } from '../types/chat.types'
import { autoSubscribeAdmin } from '@/services/db-alert.service'

/**
 * Ensures a profile exists for a user and triggers alerts if they are an admin.
 */
export async function ensureProfileExists(user: {
  accountNo: string
  email: string
  name?: string
  picture?: string
}): Promise<Profile | null> {
  const profile = await ensureProfileExistsInternal(user)
  if (profile) {
    autoSubscribeAdmin(profile.id, profile.email).catch((err) =>
      console.error('[DB Alerts] Error checking admin auto-subscribe:', err)
    )
  }
  return profile
}

async function ensureProfileExistsInternal(user: {
  accountNo: string
  email: string
  name?: string
  picture?: string
}): Promise<Profile | null> {
  try {
    // 1. First, check if the profile exists by ID
    const checkIdQuery = createQuery().select('*').eq('id', user.accountNo).limit(1)
    const profilesById = await apiClient.get<any[]>(`/rest/v1/profiles${checkIdQuery.toString()}`)
    const byId = profilesById[0] || null

    if (byId) {
      return {
        id: byId.id,
        name: byId.name || user.name || user.email.split('@')[0],
        email: byId.email || user.email,
        avatar_url: byId.avatar || user.picture || undefined,
      }
    }

    // 2. If not found by ID, check if a profile with this email already exists case-insensitively
    const checkEmailQuery = createQuery().select('*').ilike('email', user.email.trim()).limit(1)
    const profilesByEmail = await apiClient.get<any[]>(`/rest/v1/profiles${checkEmailQuery.toString()}`)
    const byEmail = profilesByEmail[0] || null

    if (byEmail) {
      console.log(`[profiles.api] Profile with email ${user.email} already exists with ID: ${byEmail.id}. Attempting to update ID.`)
      
      const updateQuery = createQuery().eq('id', byEmail.id).limit(1)
      try {
        const updated = await apiClient.patch<any[]>(`/rest/v1/profiles${updateQuery.toString()}`, {
          id: user.accountNo
        })
        const updatedProfile = updated[0] || null

        if (updatedProfile) {
          return {
            id: updatedProfile.id,
            name: updatedProfile.name || user.name || user.email.split('@')[0],
            email: updatedProfile.email,
            avatar_url: updatedProfile.avatar || user.picture || undefined,
          }
        }
      } catch (err) {
        // If update failed (e.g. FK constraint block), return the existing profile
        console.warn('[profiles.api] FK constraint prevent ID update, returning existing profile.')
      }

      return {
        id: byEmail.id,
        name: byEmail.name || user.name || user.email.split('@')[0],
        email: byEmail.email,
        avatar_url: byEmail.avatar || user.picture || undefined,
      }
    }

    // 3. Insert new profile
    const name = user.name || user.email.split('@')[0]
    const avatar = user.picture || null

    try {
      const inserted = await apiClient.post<any[]>('/rest/v1/profiles', {
        id: user.accountNo,
        name,
        avatar,
        email: user.email,
      })
      const newProfile = inserted[0] || null

      if (!newProfile) {
        throw new Error('Failed to create new profile record.')
      }

      return {
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        avatar_url: newProfile.avatar || undefined,
      }
    } catch (insertError: any) {
      if (insertError.code === '23505') {
        // Fallback select by email in case of race condition
        const fallbackQuery = createQuery().select('*').ilike('email', user.email.trim()).limit(1)
        const fallbacks = await apiClient.get<any[]>(`/rest/v1/profiles${fallbackQuery.toString()}`)
        const fallback = fallbacks[0] || null
        
        if (fallback) {
          return {
            id: fallback.id,
            name: fallback.name || name,
            email: fallback.email,
            avatar_url: fallback.avatar || undefined,
          }
        }
      }
      throw insertError
    }
  } catch (err) {
    console.error('[profiles.api] Failed in ensureProfileExists:', err)
    return null
  }
}

/**
 * Fetch profile by email.
 */
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  try {
    const query = createQuery().select('*').eq('email', email).limit(1)
    const profiles = await apiClient.get<any[]>(`/rest/v1/profiles${query.toString()}`)
    const data = profiles[0] || null
    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar_url: data.avatar || undefined,
    }
  } catch (err) {
    console.error('[profiles.api] Failed to get profile by email:', err)
    return null
  }
}

/**
 * Fetch all profiles.
 */
export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const query = createQuery().select('*').order('name', { ascending: true })
    const data = await apiClient.get<any[]>(`/rest/v1/profiles${query.toString()}`)
    if (!data) return []

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      avatar_url: d.avatar || undefined,
    }))
  } catch (err) {
    console.error('[profiles.api] Failed to get all profiles:', err)
    return []
  }
}

/**
 * Get or create a placeholder profile for a contact.
 */
export async function getOrCreateProfileForContact(email: string, name: string): Promise<Profile | null> {
  const existing = await getProfileByEmail(email)
  if (existing) return existing

  const placeholderId = crypto.randomUUID()
  try {
    const data = await apiClient.post<any[]>('/rest/v1/profiles', {
      id: placeholderId,
      name,
      email,
    })
    const inserted = data[0] || null
    if (inserted) {
      return {
        id: inserted.id,
        name: inserted.name,
        email: inserted.email,
        avatar_url: inserted.avatar || undefined,
      }
    }
  } catch (err) {
    console.error('[profiles.api] Failed to create placeholder profile:', err)
  }
  return null
}
