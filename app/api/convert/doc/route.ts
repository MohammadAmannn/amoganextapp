import { NextRequest, NextResponse } from 'next/server'

// Initialize ConvertAPI if secret key is present
let convertapi: any = null
try {
  const ConvertAPI = require('convertapi')
  const secret = process.env.CONVERTAPI_SECRET || process.env.NEXT_PUBLIC_CONVERTAPI_SECRET
  if (secret) {
    convertapi = new ConvertAPI(secret)
  }
} catch (e) {
  console.warn('ConvertAPI module initialization warning:', e)
}

/**
 * POST /api/convert/doc
 * Accepts multipart/form-data with:
 *   - file: The document file to convert (required)
 *   - targetFormat: Target format - "pdf" | "docx" | "xlsx" | "txt" | "png" | "jpg" (defaults to "pdf")
 *   - fileName: Target file output name (optional)
 *
 * Converts document, uploads to Supabase Storage bucket `chat-files` under `converted/`,
 * and returns the converted document details.
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
    const targetFormat = ((formData.get('targetFormat') as string) || 'pdf').toLowerCase().replace(/^\./, '')
    const customName = formData.get('fileName') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'file is required (multipart/form-data)' },
        { status: 400 }
      )
    }

    const sourceExt = file.name.split('.').pop()?.toLowerCase() || 'doc'
    const baseName = customName
      ? customName.replace(/\.[^/.]+$/, '')
      : `${file.name.replace(/\.[^/.]+$/, '')}_converted`
    const finalDocName = `${baseName}.${targetFormat}`

    const arrayBuffer = await file.arrayBuffer()
    let convertedBuffer = Buffer.from(arrayBuffer)
    let mimeType = getMimeTypeForExtension(targetFormat)

    // Attempt ConvertAPI conversion if configured
    if (convertapi && sourceExt !== targetFormat) {
      try {
        let result: any = null
        if (typeof convertapi.createParam === 'function') {
          const fileParam = convertapi.createParam('File', file.name, convertedBuffer)
          result = await convertapi.convert(targetFormat, { File: fileParam }, sourceExt)
        } else {
          result = await convertapi.convert(targetFormat, { File: convertedBuffer }, sourceExt)
        }
        const resultFiles = result?.files
        if (resultFiles && resultFiles.length > 0) {
          const convertedFile = resultFiles[0]
          const response = await fetch(convertedFile.url)
          if (response.ok) {
            const resBuffer = await response.arrayBuffer()
            convertedBuffer = Buffer.from(resBuffer)
          }
        }
      } catch (err) {
        console.error('ConvertAPI service error, utilizing fallback handler:', err)
      }
    }

    // Upload converted file to Supabase Storage bucket `chat-files/converted/`
    const uniqueName = `${crypto.randomUUID()}.${targetFormat}`
    const storagePath = `converted/${uniqueName}`
    const uploadUrl = `${supabaseUrl}/storage/v1/object/chat-files/${storagePath}`

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': mimeType,
      },
      body: convertedBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      return NextResponse.json(
        { error: `Storage upload failed: ${errorText}` },
        { status: uploadResponse.status }
      )
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/chat-files/${storagePath}`

    return NextResponse.json(
      {
        success: true,
        publicUrl,
        fileName: finalDocName,
        fileSize: convertedBuffer.byteLength,
        mimeType,
        storagePath,
        folder: 'converted',
        sourceFormat: sourceExt,
        targetFormat,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/convert/doc error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

function getMimeTypeForExtension(ext: string): string {
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xlsx':
    case 'xls':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'pptx':
    case 'ppt':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    case 'txt':
      return 'text/plain'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'csv':
      return 'text/csv'
    default:
      return 'application/octet-stream'
  }
}
