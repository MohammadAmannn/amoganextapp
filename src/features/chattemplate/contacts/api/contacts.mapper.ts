import { Contact } from './contacts.types'

/**
 * Maps database contact record objects into the application Contact representation.
 */
export function mapToContact(dbRecord: any): Contact {
  const u = dbRecord.contact_user || {}
  const contactEmail = dbRecord.email || u.email || ''
  
  return {
    id: dbRecord.id,
    ownerId: dbRecord.owner_id,
    contactUserId: dbRecord.contact_user_id,
    fullName: dbRecord.nickname || u.name || contactEmail.split('@')[0] || 'Unknown',
    email: contactEmail,
    avatarUrl: u.avatar || undefined,
    company: u.company || undefined,
    mobile: u.mobile || undefined,
    status: 'Active',
    nickname: dbRecord.nickname || undefined,
    createdAt: dbRecord.created_at,
  }
}
