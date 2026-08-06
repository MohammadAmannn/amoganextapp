/**
 * @file app/api/process-pdf/route.ts
 * @description In-memory pure JavaScript PDF Processing REST API.
 * 
 * WHY IT EXISTS:
 * Processes PDF documents asynchronously after the chat message is successfully saved.
 * It extracts plain text and structured JSON from the uploaded PDF without blocking
 * the user session or spawning heavy Python cli shell commands.
 * 
 * WHAT IT DOES:
 * 1. Accepts POST request with { messageId } (identifying the message copy).
 * 2. Transition processing_status to 'processing' for all message copies.
 * 3. Downloads the PDF binary from Supabase Storage bucket in-memory.
 * 4. Parses the PDF buffer via Node.js 'pdf2json' library.
 * 5. Reconstructs the plain text directly from the parsed layout JSON.
 * 6. Updates all copies in the database with the extracted text, JSON, and sets processing_status to 'completed'.
 * 7. Gracefully handles failures by transitioning the status to 'failed'.
 * 
 * WHEN IT RUNS:
 * Executed as an asynchronous, non-blocking fire-and-forget HTTP request triggered
 * from the client-side createMessage API or the server-side messages API route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import * as nextServer from 'next/server'
import PDFParser from 'pdf2json'

/**
 * Parses the bucket and path from the public or private file URL.
 */
function parseFileUrl(fileUrl: string): { bucket: string; storagePath: string } {
  try {
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/')
    // Path format: /storage/v1/object/public/chat-files/documents/file.pdf
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
    console.error('[Process PDF] Failed to parse file URL:', e)
  }
  return { bucket: 'chat-files', storagePath: '' }
}

/**
 * Creates a Supabase server client.
 * If SUPABASE_SERVICE_ROLE_KEY is configured in the environment, it uses it to create
 * an admin client that bypasses Row-Level Security (RLS).
 * Otherwise, it falls back to the serialized user cookies.
 */
async function createProcessClient(serializedCookies: { name: string; value: string }[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }

  // A. Admin Client (Bypasses RLS)
  if (serviceRoleKey) {
    return createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    })
  }

  // B. Standard client (Uses User Cookies)
  if (!publishableKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return serializedCookies
      },
      setAll() {},
    },
  })
}

/**
 * Runs a background function using Next.js native after() API if supported,
 * falling back to non-blocking microtask queues in standard node runtimes.
 */
function runAfter(fn: () => Promise<void>) {
  const afterFn = (nextServer as any).after || (nextServer as any).unstable_after
  if (afterFn) {
    try {
      afterFn(fn)
      return
    } catch (e) {
      console.warn('[Process PDF] next/server after() scheduler failed, falling back to direct async execution:', e)
    }
  }

  // Fallback to fire-and-forget Promise chain
  Promise.resolve()
    .then(fn)
    .catch((err) => {
      console.error('[Process PDF] Background direct execution failed:', err)
    })
}

/**
 * Reconstructs plain text from the parsed pdf2json structure.
 */
function extractTextFromJson(pdfData: any): string {
  if (!pdfData || !pdfData.Pages) return ''
  let text = ''
  for (const page of pdfData.Pages) {
    let pageText = ''
    if (page.Texts) {
      for (const textItem of page.Texts) {
        if (textItem.R) {
          for (const run of textItem.R) {
            if (run.T) {
              pageText += decodeURIComponent(run.T) + ' '
            }
          }
        }
      }
    }
    text += pageText.trim() + '\n'
  }
  return text.trim()
}

/**
 * Main background execution pipeline for PDF text/JSON extraction.
 */
async function processPdfBackground(
  messageId: string,
  serializedCookies: { name: string; value: string }[]
): Promise<void> {
  console.log(`[Process PDF] Background job started for message: ${messageId}`)
  const supabase = await createProcessClient(serializedCookies)

  // 1. Retrieve the message copy details
  const { data: messages, error: fetchErr } = await supabase
    .from('chat_messages')
    .select('id, sender_message_id, file_url, file_name, mime_type, processing_status')
    .eq('id', messageId)
    .limit(1)

  if (fetchErr || !messages || messages.length === 0) {
    console.error(`[Process PDF] Message copy not found for id ${messageId}:`, fetchErr)
    return
  }

  const msg = messages[0]
  const senderMessageId = msg.sender_message_id || msg.id

  // 2. Avoid duplicate processing runs
  if (msg.processing_status === 'completed' || msg.processing_status === 'processing') {
    console.log(`[Process PDF] Skipping message ${messageId} (status is already ${msg.processing_status})`)
    return
  }

  const isPdf =
    msg.mime_type === 'application/pdf' ||
    msg.file_name?.toLowerCase().endsWith('.pdf') ||
    msg.file_url?.toLowerCase().includes('.pdf')

  if (!isPdf || !msg.file_url) {
    console.error(`[Process PDF] Message ${messageId} is not a valid PDF or has no file URL`)
    return
  }

  try {
    // 3. Mark all copies as 'processing'
    console.log(`[Process PDF] Transitioning all copies of ${senderMessageId} to 'processing'`)
    const { error: updateStatusErr } = await supabase
      .from('chat_messages')
      .update({ processing_status: 'processing' })
      .or(`id.eq.${senderMessageId},sender_message_id.eq.${senderMessageId}`)

    if (updateStatusErr) {
      throw new Error(`Failed to update processing status to 'processing': ${updateStatusErr.message}`)
    }

    // 4. Download PDF buffer via SDK storage download in-memory
    console.log(`[Process PDF] Downloading PDF file: ${msg.file_url}`)
    const parsedPath = parseFileUrl(msg.file_url)
    const { data: fileData, error: downloadErr } = await supabase.storage
      .from(parsedPath.bucket)
      .download(parsedPath.storagePath)

    if (downloadErr || !fileData) {
      throw new Error(`Failed to download PDF storage file: ${downloadErr?.message || 'Empty storage response'}`)
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuffer)

    // 5. Run structured JSON extraction via pdf2json (in-memory)
    console.log('[Process PDF] Running pdf2json structured parsing...')
    const parsedJson = await new Promise<any>((resolve, reject) => {
      const pdfParser = new PDFParser()
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData?.parserError || errData))
      })
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        resolve(pdfData)
      })
      pdfParser.parseBuffer(pdfBuffer)
    })
    console.log('[Process PDF] Structured JSON extraction successful!')

    // 6. Reconstruct plain text from parsed JSON (pure JavaScript in-memory)
    console.log('[Process PDF] Reconstructing plain text from JSON structure...')
    const extractedText = extractTextFromJson(parsedJson)
    console.log(`[Process PDF] Text reconstruction successful (length: ${extractedText.length})`)

    // 7. Save extracted text and JSON back to all copies of the message in the database
    console.log('[Process PDF] Updating message copies in database with parsed data')
    const { error: finalUpdateErr } = await supabase
      .from('chat_messages')
      .update({
        file_content_text: extractedText,
        file_content_json: parsedJson,
        processing_status: 'completed',
      })
      .or(`id.eq.${senderMessageId},sender_message_id.eq.${senderMessageId}`)

    if (finalUpdateErr) {
      throw new Error(`Failed to save parsed results to DB: ${finalUpdateErr.message}`)
    }

    console.log(`[Process PDF] Completed PDF processing successfully for message: ${senderMessageId}`)
  } catch (pipelineErr) {
    console.error(`[Process PDF] Pipeline failure on message ${senderMessageId}:`, pipelineErr)
    // Mark processing_status as 'failed' in database for retry purposes
    try {
      await supabase
        .from('chat_messages')
        .update({ processing_status: 'failed' })
        .or(`id.eq.${senderMessageId},sender_message_id.eq.${senderMessageId}`)
    } catch (updateFailedErr) {
      console.error('[Process PDF] Secondary database update failure after pipeline error:', updateFailedErr)
    }
  }
}

/**
 * POST /api/process-pdf
 * Kicks off asynchronous PDF parsing for the specified messageId.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, isRetry } = body

    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 })
    }

    // Read cookies inside active request context
    let serializedCookies: { name: string; value: string }[] = []
    try {
      const cookieStore = await cookies()
      serializedCookies = cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
    } catch (e) {
      console.warn('[Process PDF API] Failed to extract cookies from request:', e)
    }

    // Schedule task to run after response is sent (fire-and-forget)
    runAfter(async () => {
      try {
        await processPdfBackground(messageId, serializedCookies)
      } catch (bgErr) {
        console.error('[Process PDF API] Uncaught background execution error:', bgErr)
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'PDF processing triggered in background',
        messageId,
        isRetry: !!isRetry,
      },
      { status: 202 }
    )
  } catch (err) {
    console.error('[Process PDF API] Request handler error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
