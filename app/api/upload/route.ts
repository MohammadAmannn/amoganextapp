import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/upload
 * Uploads a file to Supabase Storage bucket `chat-files`.
 * Accepts multipart/form-data with:
 *   - file: The file to upload (required)
 *   - folder: Target folder - "images" | "videos" | "documents" | "audio" (optional, defaults to "documents")
 *
 * Returns: { success: true, publicUrl, fileName, fileSize, mimeType, storagePath }
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'documents'

    if (!file) {
      return NextResponse.json({ error: 'file is required (multipart/form-data)' }, { status: 400 })
    }

    const validFolders = ['images', 'videos', 'documents', 'audio']
    if (!validFolders.includes(folder)) {
      return NextResponse.json(
        { error: `folder must be one of: ${validFolders.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'bin'
    const uniqueName = `${crypto.randomUUID()}.${fileExt}`
    const storagePath = `${folder}/${uniqueName}`

    // Read file into ArrayBuffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage via REST API
    const uploadUrl = `${supabaseUrl}/storage/v1/object/chat-files/${storagePath}`
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: fileBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      return NextResponse.json(
        { error: `Storage upload failed: ${errorText}` },
        { status: uploadResponse.status }
      )
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/chat-files/${storagePath}`

    return NextResponse.json({
      success: true,
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      storagePath,
      folder,
    }, { status: 201 })
  } catch (err) {
    console.error('POST upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload?path=images/uuid.jpg
 * Deletes a file from Supabase Storage bucket `chat-files`.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const storagePath = searchParams.get('path')

    if (!storagePath) {
      return NextResponse.json(
        { error: 'path query parameter is required (e.g., images/uuid.jpg)' },
        { status: 400 }
      )
    }

    // Delete from Supabase Storage via REST API
    const deleteUrl = `${supabaseUrl}/storage/v1/object/chat-files/${storagePath}`
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
    })

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      return NextResponse.json(
        { error: `Storage delete failed: ${errorText}` },
        { status: deleteResponse.status }
      )
    }

    return NextResponse.json({ success: true, deleted: storagePath })
  } catch (err) {
    console.error('DELETE upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
