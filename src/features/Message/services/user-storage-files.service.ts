import { createClient, getStorageSupabaseClient, getStorageSupabaseUrl } from '@/lib/supabase/client'
import {
  normalizeContactEmail,
  getChatFileCategory,
  ChatFileCategory,
} from '@/features/chattemplate/chat/services/chat-storage.service'

export interface StorageFileItem {
  id: string // Real Supabase Storage object UUID or Database Voucher UUID
  fileName: string
  fileUrl: string
  fileSize?: number
  updatedAt?: string
  category: ChatFileCategory
  section: string // e.g. 'Chat'
  folderPath: string // e.g. 'Chat/john@company.com/Images'
  senderName?: string
  senderAvatar?: string
  version?: string // File version e.g. 'v1.0'
  editedJson?: any
}

export interface UserFolder {
  id: string
  name: string
  path: string // e.g. 'Chat', 'Chat/john@company.com', 'Chat/john@company.com/Images'
  section: string
  category?: ChatFileCategory
  fileCount: number
  parentId?: string | null
  level: number // 0 for root Chat, 1 for user email, 2 for category subfolders
}

export const DEFAULT_USER_FOLDERS: UserFolder[] = [
  { id: 'Chat', name: 'Chat', path: 'Chat', section: 'Chat', fileCount: 0, level: 0 },
  { id: 'user-email', name: 'my-space@storage.com', path: 'Chat/user', section: 'Chat', parentId: 'Chat', fileCount: 0, level: 1 },
]

/**
 * Fetches all storage files and folders for the current user's email space in Supabase Storage (`chat-files` bucket).
 * Builds a clean File Explorer tree: Chat -> {userEmail} -> {categorySubfolder}
 */
export async function getUserStorageFilesAndFolders(userEmail?: string | null): Promise<{
  files: StorageFileItem[]
  folders: UserFolder[]
}> {
  const supabase = getStorageSupabaseClient()
  const normalizedEmail = normalizeContactEmail(userEmail) || 'user@domain.com'
  const displayEmail = normalizedEmail.toLowerCase()

  const filesMap = new Map<string, StorageFileItem>()

  // Helper to construct public Supabase Storage URL
  const getPublicStorageUrl = (path: string): string => {
    const supabaseUrl = getStorageSupabaseUrl()
    return `${supabaseUrl}/storage/v1/object/public/chat-files/${path}`
  }

  // 1. Fetch real files from Supabase Storage `chat-files` bucket under {userEmail}/Chat
  if (normalizedEmail) {
    try {
      const sections = ['Chat', 'Files', 'Email', 'AI Chat', 'Order']

      for (const sec of sections) {
        const { data: secItems } = await supabase.storage
          .from('chat-files')
          .list(`${normalizedEmail}/${sec}`, { limit: 100 })

        if (secItems && secItems.length > 0) {
          for (const item of secItems) {
            if (!item.id && item.name) {
              const subCategory = item.name as ChatFileCategory
              const { data: catFiles } = await supabase.storage
                .from('chat-files')
                .list(`${normalizedEmail}/${sec}/${item.name}`, { limit: 100 })

              if (catFiles && catFiles.length > 0) {
                for (const f of catFiles) {
                  if (f.name && f.name !== '.keep') {
                    const fullPath = `${normalizedEmail}/${sec}/${item.name}/${f.name}`
                    const publicUrl = getPublicStorageUrl(fullPath)
                    const category = getChatFileCategory({ name: f.name })
                    const realUuid = f.id || `stg-${fullPath}`
                    const version = f.metadata?.version ? `v${f.metadata.version}` : 'v1.0'

                    filesMap.set(fullPath, {
                      id: realUuid,
                      fileName: f.name,
                      fileUrl: publicUrl,
                      fileSize: f.metadata?.size,
                      updatedAt: f.updated_at || f.created_at,
                      category: category || subCategory,
                      section: 'Chat',
                      folderPath: `Chat/${displayEmail}/${item.name}`,
                      version,
                    })
                  }
                }
              }
            } else if (item.name && item.name !== '.keep') {
              const fullPath = `${normalizedEmail}/${sec}/${item.name}`
              const publicUrl = getPublicStorageUrl(fullPath)
              const category = getChatFileCategory({ name: item.name })
              const realUuid = item.id || `stg-${fullPath}`
              const version = item.metadata?.version ? `v${item.metadata.version}` : 'v1.0'

              filesMap.set(fullPath, {
                id: realUuid,
                fileName: item.name,
                fileUrl: publicUrl,
                fileSize: item.metadata?.size,
                updatedAt: item.updated_at || item.created_at,
                category,
                section: 'Chat',
                folderPath: `Chat/${displayEmail}/${category}`,
                version,
              })
            }
          }
        }
      }
    } catch (err) {
      console.warn('[getUserStorageFilesAndFolders] Storage bucket list warning:', err)
    }
  }

  // 2. Merge with Database Vouchers API (/api/vouchers) for complete file coverage
  try {
    const res = await fetch('/api/vouchers')
    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data)) {
        for (const v of json.data) {
          const url = v.edited_file_url || v.original_file_url
          const name = v.file_name || 'Voucher Document'
          if (!url) continue

          const category = getChatFileCategory({ name })
          const realUuid = v.id || `vch-${Date.now()}`
          const key = `voucher-${v.id}-${name}`

          if (!filesMap.has(key)) {
            filesMap.set(key, {
              id: realUuid,
              fileName: name,
              fileUrl: url,
              updatedAt: v.created_at,
              category,
              section: 'Chat',
              folderPath: `Chat/${displayEmail}/${category}`,
              senderName: v.vendor_name || v.user_name || 'System User',
              version: v.version ? `v${v.version}` : 'v1.0',
              editedJson: v.edited_json || null,
            })
          }
        }
      }
    }
  } catch (err) {
    console.warn('[getUserStorageFilesAndFolders] Database vouchers fetch warning:', err)
  }

  const allFiles = Array.from(filesMap.values()).sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  )

  // 3. Compute file counts for categories
  const categoryCounts: Record<ChatFileCategory, number> = {
    Images: 0,
    Pdf: 0,
    Doc: 0,
    Xls: 0,
    Videos: 0,
    Ppt: 0,
    Txt: 0,
    Csv: 0,
    Zip: 0,
    Other: 0,
  }

  for (const f of allFiles) {
    if (categoryCounts[f.category] !== undefined) {
      categoryCounts[f.category]++
    }
  }

  // 4. Build File Explorer Nested Tree:
  const userFolderId = `user-${displayEmail}`

  const folders: UserFolder[] = [
    {
      id: 'Chat',
      name: 'Chat',
      path: 'Chat',
      section: 'Chat',
      fileCount: allFiles.length,
      level: 0,
    },
    {
      id: userFolderId,
      name: displayEmail,
      path: `Chat/${displayEmail}`,
      section: 'Chat',
      parentId: 'Chat',
      fileCount: allFiles.length,
      level: 1,
    },
  ]

  // Add category subfolders that have files (fileCount > 0)
  const categoryList: { cat: ChatFileCategory; label: string }[] = [
    { cat: 'Images', label: 'Images' },
    { cat: 'Pdf', label: 'Pdf' },
    { cat: 'Doc', label: 'Doc' },
    { cat: 'Xls', label: 'Xls' },
    { cat: 'Videos', label: 'Videos' },
    { cat: 'Ppt', label: 'Ppt' },
    { cat: 'Txt', label: 'Txt' },
    { cat: 'Csv', label: 'Csv' },
    { cat: 'Zip', label: 'Zip' },
    { cat: 'Other', label: 'Other' },
  ]

  for (const item of categoryList) {
    const count = categoryCounts[item.cat] || 0
    if (count > 0) {
      folders.push({
        id: `${userFolderId}-${item.cat}`,
        name: item.label,
        path: `Chat/${displayEmail}/${item.cat}`,
        section: 'Chat',
        category: item.cat,
        parentId: userFolderId,
        fileCount: count,
        level: 2,
      })
    }
  }

  // If no files exist at all, include standard fallback category subfolders
  if (folders.length === 2) {
    const fallbackCats: ChatFileCategory[] = ['Images', 'Pdf', 'Doc', 'Xls', 'Videos']
    for (const cat of fallbackCats) {
      folders.push({
        id: `${userFolderId}-${cat}`,
        name: cat,
        path: `Chat/${displayEmail}/${cat}`,
        section: 'Chat',
        category: cat,
        parentId: userFolderId,
        fileCount: 0,
        level: 2,
      })
    }
  }

  return { files: allFiles, folders }
}
