/**
 * Mock data for Message Component Gallery
 * UserFolder mocks
 */
import { UserFolder } from '@/features/Message/services/user-storage-files.service'

export const mockFolders: UserFolder[] = [
  {
    id: 'Chat',
    name: 'Chat',
    path: 'Chat',
    section: 'Chat',
    fileCount: 24,
    level: 0,
    parentId: null,
  },
  {
    id: 'user-alex',
    name: 'alex@demo.com',
    path: 'Chat/alex@demo.com',
    section: 'Chat',
    fileCount: 12,
    level: 1,
    parentId: 'Chat',
  },
  {
    id: 'user-alex-images',
    name: 'Images',
    path: 'Chat/alex@demo.com/Images',
    section: 'Chat',
    category: 'Images',
    fileCount: 8,
    level: 2,
    parentId: 'user-alex',
  },
  {
    id: 'user-alex-pdf',
    name: 'Pdf',
    path: 'Chat/alex@demo.com/Pdf',
    section: 'Chat',
    category: 'Pdf',
    fileCount: 4,
    level: 2,
    parentId: 'user-alex',
  },
  {
    id: 'user-sam',
    name: 'sam@demo.com',
    path: 'Chat/sam@demo.com',
    section: 'Chat',
    fileCount: 12,
    level: 1,
    parentId: 'Chat',
  },
]
