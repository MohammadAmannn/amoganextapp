import { SharedFileMetadata } from '@/types/file'

function parseFileUrl(fileUrl: string): { bucket: string; storagePath: string } {
  try {
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/')
    // Path: /storage/v1/object/public/chat-files/documents/file.pdf
    const publicIndex = pathParts.indexOf('public')
    if (publicIndex !== -1 && publicIndex + 2 < pathParts.length) {
      const bucket = pathParts[publicIndex + 1]
      const storagePath = pathParts.slice(publicIndex + 2).join('/')
      return { bucket, storagePath }
    }
    const authenticatedIndex = pathParts.indexOf('authenticated')
    if (authenticatedIndex !== -1 && authenticatedIndex + 2 < pathParts.length) {
      const bucket = pathParts[authenticatedIndex + 1]
      const storagePath = pathParts.slice(authenticatedIndex + 2).join('/')
      return { bucket, storagePath }
    }
    const chatFilesIndex = pathParts.indexOf('chat-files')
    if (chatFilesIndex !== -1 && chatFilesIndex + 1 < pathParts.length) {
      return { bucket: 'chat-files', storagePath: pathParts.slice(chatFilesIndex + 1).join('/') }
    }
  } catch (e) {
    console.error('Failed to parse file URL:', e)
  }
  return { bucket: 'chat-files', storagePath: '' }
}

export async function getSharedFileMetadata(
  supabase: any,
  fileId: string,
  userId: string
): Promise<{ success: boolean; data?: SharedFileMetadata; error?: string }> {
  console.log(`[DEBUG server] getSharedFileMetadata → fileId: ${fileId}, userId: ${userId}`)
  
  try {
    const { data, error } = await supabase
      .rpc('get_shared_file_metadata', { p_file_id: fileId, p_user_id: userId })
      .maybeSingle()

    if (error) {
      console.error(`[DEBUG server] RPC error:`, error.message, error)
      return { success: false, error: error.message }
    }

    if (!data) {
      console.warn(`[DEBUG server] RPC returned null → file not found or user is not a conversation member. fileId: ${fileId}, userId: ${userId}`)
      return { success: false, error: 'File not found or unauthorized' }
    }

    console.log(`[DEBUG server] RPC success → conversationId: ${data.out_conversation_id}, file: ${data.out_file_name}`)

    const parsed = parseFileUrl(data.out_file_url)
    return {
      success: true,
      data: {
        id: fileId,
        bucket: parsed.bucket,
        storagePath: parsed.storagePath,
        fileName: data.out_file_name || 'document',
        fileSize: data.out_file_size,
        mimeType: data.out_mime_type || 'application/octet-stream',
        conversationId: data.out_conversation_id,
        ownerId: data.out_sender_user_id || '',
        createdAt: data.out_created_at,
      },
    }
  } catch (err: any) {
    console.error(`[DEBUG server] Exception in getSharedFileMetadata:`, err.message || err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}

export async function generateSignedUrl(
  supabase: any,
  bucket: string,
  storagePath: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60) // 1 minute expiry

  if (error || !data) {
    throw new Error(error?.message || 'Failed to generate signed URL')
  }

  return data.signedUrl
}
