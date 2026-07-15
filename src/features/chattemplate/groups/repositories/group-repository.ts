import { createClient } from '@/lib/supabase/client'
import { Group } from '../types/group.types'
import { triggerGroupAlert } from '@/services/db-alert.service'

export async function getGroups(): Promise<Group[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('chat_group')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        groupName: d.name,
        description: d.description || '',
        groupImage: d.image_url || '',
        users: Array.isArray(d.users) ? d.users : [],
        status: d.status as 'Active' | 'Inactive',
        email: d.email || undefined,
        userUuid: d.user_uuid || undefined,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
    }
  } catch (e) {
    console.error('Supabase getGroups error:', e)
  }
  return []
}export async function saveGroup(group: Omit<Group, 'id'> & { id?: string }): Promise<Group | null> {
  const supabase = createClient()
  const id = group.id || crypto.randomUUID()
  const now = new Date().toISOString()
  
  let userUuid: string | null = null
  const groupEmail = group.email?.trim().toLowerCase()
  
  // ✅ Check if userUuid is already provided (for existing users)
  if (group.userUuid) {
    userUuid = group.userUuid
  } else if (groupEmail) {
    // If not provided, try to find/create from email
    try {
      const { data: existing, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', groupEmail)
        .maybeSingle()

      if (searchError) throw searchError

      if (existing) {
        userUuid = existing.id
      } else {
        // Create new profile if doesn't exist
        const newUserId = crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          })

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            email: groupEmail,
            name: group.groupName || groupEmail.split('@')[0],
            avatar: group.groupImage || null,
            status: 'offline',
            online: false,
            offline: true,
            last_seen: now,
            updated_at: now
          })
          .select('id')
          .maybeSingle()

        if (!insertError && inserted) {
          userUuid = inserted.id
        }
      }
    } catch (err) {
      console.error('[group-repository] Failed to get or create group user:', err)
    }
  }

  // ✅ Log to debug
  console.log('[group-repository] Saving group with userUuid:', userUuid)

  // ✅ Prepare the record with user_uuid
  const record = {
    id,
    name: group.groupName,
    description: group.description || null,
    image_url: group.groupImage || null,
    users: group.users || [],
    status: group.status || 'Active',
    email: groupEmail || null,
    user_uuid: userUuid,  // ✅ This should now have a value
    created_at: group.createdAt || now,
    updated_at: now
  }

  // Check if group exists to determine create vs update
  let isNew = true
  try {
    const { data: existingGroup } = await supabase
      .from('chat_group')
      .select('id')
      .eq('id', id)
      .maybeSingle()
    if (existingGroup) {
      isNew = false
    }
  } catch (err) {
    // Ignore and assume new if check fails
  }

  try {
    const { error } = await supabase
      .from('chat_group')
      .upsert(record)
    
    if (error) throw error
    
    // Trigger Group Alert
    triggerGroupAlert(isNew ? 'create' : 'update', userUuid || '', group.groupName).catch((err) =>
      console.error('[DB Alerts] Error sending group saved alert:', err)
    )

    return {
      id,
      groupName: group.groupName,
      description: group.description || '',
      groupImage: group.groupImage || '',
      users: group.users || [],
      status: group.status || 'Active',
      email: groupEmail || undefined,
      userUuid: userUuid || undefined,
      createdAt: now,
      updatedAt: now,
    }
  } catch (e) {
    console.error('Supabase saveGroup error:', e)
    return null
  }
}

export async function deleteGroup(id: string): Promise<boolean> {
  const supabase = createClient()
  try {
    // Fetch group details before deleting to resolve name for alert
    const { data: groupData } = await supabase
      .from('chat_group')
      .select('name, user_uuid')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase
      .from('chat_group')
      .delete()
      .eq('id', id)
    
    if (error) throw error

    // Fetch current user details to determine actorId
    let actorId = groupData?.user_uuid || ''
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (authData?.user) {
        actorId = authData.user.id
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
  } catch (e) {
    console.error('Supabase deleteGroup error:', e)
    return false
  }
}