import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

/**
 * POST /api/convert/photo-to-pdf
 * Accepts multipart/form-data with:
 *   - file or files: One or more image files (JPEG, PNG, WEBP)
 *   - fileName: Optional target PDF filename (defaults to converted_photo.pdf)
 *
 * Converts image(s) to a single PDF document, uploads to Supabase Storage bucket `chat-files`
 * inside folder `converted/`, and returns the converted PDF metadata.
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
    const files = formData.getAll('file') as File[]
    const fallbackFiles = formData.getAll('files') as File[]
    const allFiles = (files.length > 0 ? files : fallbackFiles).filter(
      (f) => f && typeof f.arrayBuffer === 'function'
    )

    if (allFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one image file is required (form key: "file" or "files")' },
        { status: 400 }
      )
    }

    const customName = formData.get('fileName') as string | null
    const baseName = customName
      ? customName.replace(/\.[^/.]+$/, '')
      : `converted_${Date.now()}`
    const finalPdfName = `${baseName}.pdf`

    let pdfBytes: Uint8Array

    // High performance image to PDF converter using pdf-lib
    const pdfDoc = await PDFDocument.create()

    for (const file of allFiles) {
      const buffer = await file.arrayBuffer()
      const mimeType = file.type.toLowerCase()

      let image: any
      if (mimeType.includes('png')) {
        image = await pdfDoc.embedPng(buffer)
      } else if (
        mimeType.includes('jpeg') ||
        mimeType.includes('jpg') ||
        mimeType.includes('webp')
      ) {
        image = await pdfDoc.embedJpg(buffer)
      } else {
        // Fallback: try embedding JPG first, then PNG
        try {
          image = await pdfDoc.embedJpg(buffer)
        } catch {
          image = await pdfDoc.embedPng(buffer)
        }
      }

      const page = pdfDoc.addPage([image.width, image.height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })
    }

    pdfBytes = await pdfDoc.save()

    // Upload converted PDF to Supabase Storage bucket `chat-files/converted/`
    const uniqueName = `${crypto.randomUUID()}.pdf`
    const storagePath = `converted/${uniqueName}`
    const uploadUrl = `${supabaseUrl}/storage/v1/object/chat-files/${storagePath}`

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/pdf',
      },
      body: Buffer.from(pdfBytes),
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
        fileName: finalPdfName,
        fileSize: pdfBytes.byteLength,
        mimeType: 'application/pdf',
        storagePath,
        folder: 'converted',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/convert/photo-to-pdf error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
