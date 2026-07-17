import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'
import { Contact } from './contacts.types'
import { mapToContact } from './contacts.mapper'
import { triggerContactAlert } from '@/services/db-alert.service'

/**
 * Fetch all contacts for a specific owner/user.
 */
export async function getContacts(userId: string): Promise<Contact[]> {
  try {
    const query = createQuery()
      .select(`
        id,
        owner_id,
        contact_user_id,
        nickname,
        email,
        created_at,
        contact_user:profiles!contacts_contact_user_id_fkey (
          id,
          name,
          email,
          avatar,
          company,
          mobile
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    const data = await apiClient.get<any[]>(`/rest/v1/contacts${query.toString()}`)
    if (!data) return []

    return data.map(mapToContact)
  } catch (error) {
    console.error('[Contacts API] Failed to get user contacts:', error)
    return []
  }
}

/**
 * Creates a new contact for the specified owner.
 */
export async function createContact(
  ownerId: string,
  contactEmail: string,
  nickname?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailLower = contactEmail.trim().toLowerCase()

    // 1. Search for existing profile by email
    const profileQuery = createQuery()
      .select('id, name, email, avatar, company, mobile')
      .eq('email', emailLower)
      .limit(1)

    const profiles = await apiClient.get<any[]>(`/rest/v1/profiles${profileQuery.toString()}`)
    const profile = profiles[0] || null

    // 2. Prevent adding yourself
    if (profile && profile.id === ownerId) {
      return { success: false, error: 'You cannot add yourself as a contact.' }
    }

    // 3. Check if contact already exists (by email case-insensitively OR by contact_user_id)
    if (profile) {
      const existingQuery = createQuery()
        .select('id')
        .eq('owner_id', ownerId)
        .or(`email.ilike.${emailLower},contact_user_id.eq.${profile.id}`)
        .limit(1)

      const existing = await apiClient.get<any[]>(`/rest/v1/contacts${existingQuery.toString()}`)
      if (existing.length > 0) {
        return { success: false, error: 'This contact is already in your list.' }
      }
    } else {
      const existingQuery = createQuery()
        .select('id')
        .eq('owner_id', ownerId)
        .ilike('email', emailLower)
        .limit(1)

      const existing = await apiClient.get<any[]>(`/rest/v1/contacts${existingQuery.toString()}`)
      if (existing.length > 0) {
        return { success: false, error: 'This contact is already in your list.' }
      }
    }

    let contactUserId: string

    if (profile) {
      // User is registered - use existing profile ID
      contactUserId = profile.id
    } else {
      // User is NOT registered - create a new profile for them
      const displayName = nickname || emailLower.split('@')[0]
      
      const newUserId = crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })

      // Insert new profile for unregistered user
      const newProfileData = {
        id: newUserId,
        email: emailLower,
        name: displayName,
        avatar: null,
        company: null,
        mobile: null,
        status: 'offline',
        online: false,
        offline: true,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const insertedProfiles = await apiClient.post<any[]>('/rest/v1/profiles', newProfileData)
      const newProfile = insertedProfiles[0] || null

      if (!newProfile) {
        return { success: false, error: 'Failed to create contact profile.' }
      }

      contactUserId = newProfile.id
    }

    // 4. Create the contact entry with user_uuid
    const contactData = {
      owner_id: ownerId,
      contact_user_id: contactUserId,
      nickname: nickname?.trim() || null,
      email: emailLower,
      user_uuid: ownerId
    }

    await apiClient.post('/rest/v1/contacts', contactData)

    // Trigger DB Alert (async)
    triggerContactAlert('create', ownerId, contactUserId).catch((err) =>
      console.error('[DB Alerts] Error sending contact created alert:', err)
    )

    return { success: true }
  } catch (error) {
    console.error('[Contacts API] Failed to create contact:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create contact' }
  }
}

/**
 * Updates a contact's nickname.
 */
export async function updateContact(
  contactId: string,
  ownerId: string,
  nickname: string
): Promise<boolean> {
  try {
    // Fetch contact details to resolve contactUserId for alert
    const contactQuery = createQuery()
      .select('contact_user_id')
      .eq('id', contactId)
      .limit(1)

    const contacts = await apiClient.get<any[]>(`/rest/v1/contacts${contactQuery.toString()}`)
    const contactData = contacts[0] || null

    // Update nickname
    const updateQuery = createQuery()
      .eq('id', contactId)
      .eq('owner_id', ownerId)

    await apiClient.patch(`/rest/v1/contacts${updateQuery.toString()}`, {
      nickname: nickname.trim() || null
    })

    if (contactData) {
      triggerContactAlert('update', ownerId, contactData.contact_user_id).catch((err) =>
        console.error('[DB Alerts] Error sending contact updated alert:', err)
      )
    }

    return true
  } catch (error) {
    console.error('[Contacts API] Failed to update contact nickname:', error)
    return false
  }
}

/**
 * Deletes a contact.
 */
export async function deleteContact(contactId: string, ownerId: string): Promise<boolean> {
  try {
    // Fetch contact details to resolve contactUserId for alert
    const contactQuery = createQuery()
      .select('contact_user_id')
      .eq('id', contactId)
      .limit(1)

    const contacts = await apiClient.get<any[]>(`/rest/v1/contacts${contactQuery.toString()}`)
    const contactData = contacts[0] || null

    // Delete contact
    const deleteQuery = createQuery()
      .eq('id', contactId)
      .eq('owner_id', ownerId)

    await apiClient.delete(`/rest/v1/contacts${deleteQuery.toString()}`)

    if (contactData) {
      triggerContactAlert('delete', ownerId, contactData.contact_user_id).catch((err) =>
        console.error('[DB Alerts] Error sending contact deleted alert:', err)
      )
    }

    return true
  } catch (error) {
    console.error('[Contacts API] Failed to delete contact:', error)
    return false
  }
}
