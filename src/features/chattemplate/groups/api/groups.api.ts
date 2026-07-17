import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'
import { getCurrentUser } from '../../shared/api/auth'
import { Group } from './groups.types'
import { mapToGroup } from './groups.mapper'
import { triggerGroupAlert } from '@/services/db-alert.service'

/**
 * Fetch all chat groups.
 */
export async function getGroups(): Promise<Group[]> {
  try {
    const query = createQuery().order('created_at', { ascending: false })
    const data = await apiClient.get<any[]>(`/rest/v1/chat_group${query.toString()}`)
    if (!data) return []

    return data.map(mapToGroup)
  } catch (error) {
    console.error('[Groups API] Supabase getGroups error:', error)
    return []
  }
}

/**
 * Saves a group (Create or Update).
 */
export async function saveGroup(group: Omit<Group, 'id'> & { id?: string }): Promise<Group | null> {
  const id = group.id || crypto.randomUUID()
  const now = new Date().toISOString()
  
  let userUuid: string | null = null
  const groupEmail = group.email?.trim().toLowerCase()
  
  // 1. Check if userUuid is already provided
  if (group.userUuid) {
    userUuid = group.userUuid
  } else if (groupEmail) {
    // If not provided, try to find/create from email
    try {
      const profileQuery = createQuery()
        .select('id')
        .eq('email', groupEmail)
        .limit(1)

      const profiles = await apiClient.get<any[]>(`/rest/v1/profiles${profileQuery.toString()}`)
      const existing = profiles[0] || null

      if (existing) {
        userUuid = existing.id
      } else {
        // Create new profile if it doesn't exist
        const newUserId = crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          })

        const newProfile = {
          id: newUserId,
          email: groupEmail,
          name: group.groupName || groupEmail.split('@')[0],
          avatar: group.groupImage || null,
          status: 'offline',
          online: false,
          offline: true,
          last_seen: now,
          updated_at: now
        }

        const inserted = await apiClient.post<any[]>('/rest/v1/profiles', newProfile)
        if (inserted && inserted[0]) {
          userUuid = inserted[0].id
        }
      }
    } catch (err) {
      console.error('[Groups API] Failed to get or create group user:', err)
    }
  }

  console.log('[Groups API] Saving group with userUuid:', userUuid)

  // 2. Prepare group record
  const record = {
    id,
    name: group.groupName,
    description: group.description || null,
    image_url: group.groupImage || null,
    users: group.users || [],
    status: group.status || 'Active',
    email: groupEmail || null,
    user_uuid: userUuid,
    created_at: group.createdAt || now,
    updated_at: now
  }

  // Check if group exists to determine create vs update
  let isNew = true
  try {
    const checkQuery = createQuery()
      .select('id')
      .eq('id', id)
      .limit(1)

    const existing = await apiClient.get<any[]>(`/rest/v1/chat_group${checkQuery.toString()}`)
    if (existing && existing.length > 0) {
      isNew = false
    }
  } catch (err) {
    // Ignore and assume new
  }

  try {
    // Perform Upsert in PostgREST using resolution=merge-duplicates Prefer header
    const data = await apiClient.post<any[]>('/rest/v1/chat_group', record, {
      headers: {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      }
    })
    
    const savedRecord = data && data[0] ? data[0] : null
    if (!savedRecord) {
      return null
    }

    // Trigger Group Alert (async)
    triggerGroupAlert(isNew ? 'create' : 'update', userUuid || '', group.groupName).catch((err) =>
      console.error('[DB Alerts] Error sending group saved alert:', err)
    )

    return mapToGroup(savedRecord)
  } catch (error) {
    console.error('[Groups API] Supabase saveGroup error:', error)
    return null
  }
}

/**
 * Deletes a chat group.
 */
export async function deleteGroup(id: string): Promise<boolean> {
  try {
    // Fetch group details before deleting to resolve name for alert
    const checkQuery = createQuery()
      .select('name, user_uuid')
      .eq('id', id)
      .limit(1)

    const groups = await apiClient.get<any[]>(`/rest/v1/chat_group${checkQuery.toString()}`)
    const groupData = groups[0] || null

    // Delete group
    const deleteQuery = createQuery().eq('id', id)
    await apiClient.delete(`/rest/v1/chat_group${deleteQuery.toString()}`)

    // Fetch current user details to determine actorId
    let actorId = groupData?.user_uuid || ''
    try {
      const user = await getCurrentUser()
      if (user) {
        actorId = user.id
      }
    } catch {
      // Ignore
    }

    if (groupData) {
      triggerGroupAlert('delete', actorId, groupData.name).catch((err) =>
        console.error('[DB Alerts] Error sending group deleted alert:', err)
      )
    }

    return true
  } catch (error) {
    console.error('[Groups API] Supabase deleteGroup error:', error)
    return false
  }
}
