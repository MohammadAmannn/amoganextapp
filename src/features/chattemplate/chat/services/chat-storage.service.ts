import { createClient } from '../../../../lib/supabase/client'

export type ChatFileCategory =
  | 'Doc'
  | 'Xls'
  | 'Ppt'
  | 'Pdf'
  | 'Txt'
  | 'Csv'
  | 'Images'
  | 'Videos'
  | 'Zip'
  | 'Other'

export type AppStorageSection =
  | 'Files'
  | 'Chat'
  | 'Email'
  | 'AI Chat'
  | 'Order'

export const APP_STORAGE_SECTIONS: AppStorageSection[] = [
  'Files',
  'Chat',
  'Email',
  'AI Chat',
  'Order',
]

export const CHAT_FILE_CATEGORIES: ChatFileCategory[] = [
  'Doc',
  'Xls',
  'Ppt',
  'Pdf',
  'Txt',
  'Csv',
  'Images',
  'Videos',
  'Zip',
  'Other',
]

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase.
 * Returns null if the email is invalid or empty.
 */
export function normalizeContactEmail(email: string | null | undefined): string | null {
  if (!email || !email.trim()) return null
  const cleaned = email.trim().toLowerCase()
  if (cleaned.includes('@') && !cleaned.includes('anonymous')) {
    return cleaned
  }
  return null
}

/**
 * Reusable function to categorize an uploaded file by its MIME type and extension.
 */
export function getChatFileCategory(file: { name: string; type?: string }): ChatFileCategory {
  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : ''
  const mime = (file.type || '').toLowerCase()

  // 1. Doc / Docx
  if (['doc', 'docx'].includes(ext) || mime.includes('wordprocessingml') || mime === 'application/msword') {
    return 'Doc'
  }

  // 2. Xls / Xlsx
  if (['xls', 'xlsx'].includes(ext) || mime.includes('spreadsheetml') || mime === 'application/vnd.ms-excel') {
    return 'Xls'
  }

  // 3. Ppt / Pptx
  if (['ppt', 'pptx'].includes(ext) || mime.includes('presentationml') || mime === 'application/vnd.ms-powerpoint') {
    return 'Ppt'
  }

  // 4. Pdf
  if (ext === 'pdf' || mime === 'application/pdf') {
    return 'Pdf'
  }

  // 5. Txt
  if (ext === 'txt' || mime === 'text/plain') {
    return 'Txt'
  }

  // 6. Csv
  if (ext === 'csv' || mime === 'text/csv' || mime === 'application/csv') {
    return 'Csv'
  }

  // 7. Images
  if (
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'heic', 'heif'].includes(ext) ||
    mime.startsWith('image/')
  ) {
    return 'Images'
  }

  // 8. Videos
  if (
    ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', '3gp', 'flv', 'wmv'].includes(ext) ||
    mime.startsWith('video/')
  ) {
    return 'Videos'
  }

  // 9. Zip
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
    return 'Zip'
  }

  // 10. Anything unknown / unsupported
  return 'Other'
}

/**
 * Generates a safe unique file name while preserving original extension.
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop()?.toLowerCase() || '' : ''
  const baseName = originalName.substring(0, originalName.lastIndexOf('.') > 0 ? originalName.lastIndexOf('.') : originalName.length)
  const sanitizedBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50) || 'file'
  
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })

  const timestamp = Date.now()
  return ext ? `${timestamp}-${uuid}-${sanitizedBase}.${ext}` : `${timestamp}-${uuid}-${sanitizedBase}`
}

/**
 * Universal storage path generator for contact file spaces:
 * {contact-email}/{section}/{file-type}/{filename}
 */
export function getStoragePath(
  contactEmail: string,
  section: AppStorageSection,
  fileType: ChatFileCategory,
  fileName: string
): string | null {
  const normalizedEmail = normalizeContactEmail(contactEmail)
  if (!normalizedEmail) return null
  return `${normalizedEmail}/${section}/${fileType}/${fileName}`
}

/**
 * Generates the full storage path for a chat file belonging to a contact:
 * {contact-email}/Chat/{file-type}/{unique-file-name}
 */
export function generateChatFilePath(contactEmail: string, file: { name: string; type?: string }): string | null {
  const category = getChatFileCategory(file)
  const uniqueName = generateUniqueFileName(file.name)
  return getStoragePath(contactEmail, 'Chat', category, uniqueName)
}

/**
 * Legacy initialization helper (no-op as per user instruction: folders will be created dynamically when files are uploaded, without .keep placeholders).
 */
export async function initializeContactStorage(
  contactEmail: string
): Promise<void> {
  // Folders are created dynamically upon file upload — no .keep placeholders generated.
  return Promise.resolve()
}

export async function initializeUserStorage(userEmail: string): Promise<void> {
  return Promise.resolve()
}

export async function ensureChatStorageStructure(userEmail: string): Promise<void> {
  return Promise.resolve()
}
