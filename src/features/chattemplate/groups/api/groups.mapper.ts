import { Group } from './groups.types'

/**
 * Maps database group record objects into the application Group representation.
 */
export function mapToGroup(dbRecord: any): Group {
  return {
    id: dbRecord.id,
    groupName: dbRecord.name,
    description: dbRecord.description || '',
    groupImage: dbRecord.image_url || '',
    users: Array.isArray(dbRecord.users) ? dbRecord.users : [],
    status: dbRecord.status as 'Active' | 'Inactive',
    email: dbRecord.email || undefined,
    userUuid: dbRecord.user_uuid || undefined,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  }
}
