/**
 * Mock data for Message Component Gallery
 * Storage File mocks
 */
import { StorageFileItem } from '@/features/Message/services/user-storage-files.service'

export const mockStorageFiles: StorageFileItem[] = [
  {
    id: 'f-001',
    fileName: 'Project-Roadmap-2026.pdf',
    fileUrl: '#',
    fileSize: 2450000,
    category: 'Pdf',
    section: 'Files',
    folderPath: 'Files/my-space/Pdf',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    senderName: 'Alex Johnson',
  },
  {
    id: 'f-002',
    fileName: 'Dashboard-UI-Mockup.png',
    fileUrl: '#',
    fileSize: 1840000,
    category: 'Images',
    section: 'Files',
    folderPath: 'Files/my-space/Images',
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    senderName: 'Sarah Anderson',
  },
  {
    id: 'f-003',
    fileName: 'Sprint-Architecture-Notes.docx',
    fileUrl: '#',
    fileSize: 420000,
    category: 'Doc',
    section: 'Files',
    folderPath: 'Files/my-space/Doc',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    senderName: 'Oliver Smith',
  },
  {
    id: 'f-004',
    fileName: 'Q3-Budget-Forecast.xlsx',
    fileUrl: '#',
    fileSize: 890000,
    category: 'Xls',
    section: 'Files',
    folderPath: 'Files/my-space/Xls',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    senderName: 'John Doe',
  },
]
