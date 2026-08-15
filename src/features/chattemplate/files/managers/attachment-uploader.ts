import {
  getChatFileCategory,
  generateUniqueFileName,
  normalizeContactEmail,
} from '@/features/chattemplate/chat/services/chat-storage.service'
import { useAuthStore } from '@/stores/auth-store'
import { getCookie } from '@/lib/cookies'

export interface UploadProgressCallback {
  (progress: number): void
}

function getFallbackUserEmail(): string | null {
  try {
    const storeEmail = useAuthStore.getState?.()?.auth?.user?.email
    if (storeEmail && storeEmail.includes('@')) return storeEmail.trim().toLowerCase()
  } catch {}

  try {
    const userCookie = getCookie('auth_user_data')
    if (userCookie) {
      const parsed = JSON.parse(decodeURIComponent(userCookie))
      if (parsed?.email && parsed.email.includes('@')) return parsed.email.trim().toLowerCase()
    }
  } catch {}

  return null
}

export function uploadAttachment(
  file: File,
  senderEmailOrOptions?: string | { senderEmail?: string; receiverEmail?: string },
  receiverEmailParam?: string,
  onProgress?: UploadProgressCallback
): { xhr: XMLHttpRequest; promise: Promise<string> } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing')
  }

  let rawSenderEmail = ''
  let rawReceiverEmail = ''

  if (typeof senderEmailOrOptions === 'object' && senderEmailOrOptions !== null) {
    rawSenderEmail = senderEmailOrOptions.senderEmail || ''
    rawReceiverEmail = senderEmailOrOptions.receiverEmail || ''
  } else if (typeof senderEmailOrOptions === 'string') {
    rawSenderEmail = senderEmailOrOptions
    rawReceiverEmail = receiverEmailParam || ''
  }

  let senderEmail = normalizeContactEmail(rawSenderEmail)
  let receiverEmail = normalizeContactEmail(rawReceiverEmail)

  // Fallback to logged-in user email if sender email could not be resolved from argument
  if (!senderEmail) {
    senderEmail = normalizeContactEmail(getFallbackUserEmail())
  }

  const primaryEmail = senderEmail || receiverEmail

  if (!primaryEmail) {
    console.error('[Attachment Uploader] Failed: Neither sender nor receiver email could be resolved.', {
      rawSenderEmail,
      rawReceiverEmail,
    })
    throw new Error('No valid sender or receiver email provided for storage upload')
  }

  const category = getChatFileCategory(file)
  const uniqueName = generateUniqueFileName(file.name)

  const primaryPath = `${primaryEmail}/Chat/${category}/${uniqueName}`
  const primaryUrl = `${supabaseUrl}/storage/v1/object/chat-files/${primaryPath}`

  const xhr = new XMLHttpRequest()

  const promise = new Promise<string>((resolve, reject) => {
    xhr.open('POST', primaryUrl, true)
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`)
    xhr.setRequestHeader('apikey', supabaseAnonKey)
    xhr.setRequestHeader('x-upsert', 'true')
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = async () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const primaryPublicUrl = `${supabaseUrl}/storage/v1/object/public/chat-files/${primaryPath}`

        // If a separate receiver email exists and is different from sender, upload a copy into receiver's folder
        if (receiverEmail && senderEmail && receiverEmail !== senderEmail) {
          const secondaryPath = `${receiverEmail}/Chat/${category}/${uniqueName}`
          const secondaryUrl = `${supabaseUrl}/storage/v1/object/chat-files/${secondaryPath}`
          try {
            await fetch(secondaryUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${supabaseAnonKey}`,
                apikey: supabaseAnonKey,
                'x-upsert': 'true',
                'Content-Type': file.type || 'application/octet-stream',
              },
              body: file,
            })
          } catch (err) {
            console.warn(`[Attachment Uploader] Secondary upload copy failed for ${secondaryPath}:`, err)
          }
        }

        resolve(primaryPublicUrl)
      } else {
        console.error(`[Attachment Uploader] Storage upload error (${xhr.status}):`, xhr.responseText)
        let errMessage = `Storage upload failed: ${xhr.statusText || xhr.status}`
        try {
          const parsed = JSON.parse(xhr.responseText)
          if (parsed.message || parsed.error) {
            errMessage = parsed.message || parsed.error
          }
        } catch {}
        reject(new Error(errMessage))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))

    xhr.send(file)
  })

  return { xhr, promise }
}
