export interface DBAlertConfig {
  groupName: string
  groupImage?: string
  adminEmails: string[]
}

export type DBAlertType = 'contact' | 'group'
export type DBAlertAction = 'create' | 'update' | 'delete'

export const DB_ALERTS_CONFIG: DBAlertConfig = {
  groupName: 'DB Alerts',
  groupImage: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=128&h=128&fit=crop&auto=format&q=80',
  adminEmails: [
 
   
    'n.rajukrishna@gmail.com' // Let's include the default user emails so they get added during testing
  ],
}
