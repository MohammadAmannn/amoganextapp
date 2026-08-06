import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// 1. Initialize @cle-does-things/pdfitdown (PdfItDownConverter from pdfitdown.eu)
let pdfItDownConverter: any = null
try {
  const dynamicRequire = typeof eval !== 'undefined' ? eval('require') : require
  const { PdfItDownConverter } = dynamicRequire('@cle-does-things/pdfitdown')
  pdfItDownConverter = new PdfItDownConverter()
} catch (e) {
  console.warn('PdfItDownConverter module initialization warning:', e)
}

// 2. Pure JS PDF Parser
let pdfParse: any = null
try {
  pdfParse = require('pdf-parse/lib/pdf-parse.js')
} catch (e) {
  try {
    pdfParse = require('pdf-parse')
  } catch (e2) {
    console.warn('pdf-parse module initialization warning:', e2)
  }
}

// 3. Pure JS DOCX HTML/Text Parser
let mammoth: any = null
try {
  mammoth = require('mammoth')
} catch (e) {
  console.warn('mammoth module initialization warning:', e)
}

// 4. Pure JS XLSX / Excel Parser (SheetJS)
let XLSX: any = null
try {
  XLSX = require('xlsx')
} catch (e) {
  console.warn('XLSX module initialization warning:', e)
}

function isPdfBuffer(buf: Buffer): boolean {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 // %PDF
}

/**
 * Sanitizes strings for pdf-lib's standard fonts (WinAnsi encoding)
 * Prevents "WinAnsi cannot encode" crashes
 */
function toWinAnsi(str: string): string {
  return str
    .replace(/[’‘`]/g, "'")
    .replace(/[“”"]/g, '"')
    .replace(/[—–-]/g, '-')
    .replace(/•/g, '*')
    .replace(/…/g, '...')
    .replace(/\t/g, '    ')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
}

/**
 * Smart Word-Wrap function that splits text at word boundaries (spaces)
 */
function wrapTextWords(text: string, maxCharsPerLine: number = 80): string[] {
  const trimmedText = text.trim()
  if (!trimmedText) return []
  if (trimmedText.length <= maxCharsPerLine) return [trimmedText]

  const words = trimmedText.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine ? currentLine + ' ' + word : word).length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + ' ' + word : word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

/**
 * Parses Excel (.xlsx, .xls, .csv) buffer into structured headers and rows
 */
function parseExcelToGrid(buffer: Buffer): { headers: string[]; rows: string[][] } {
  if (!XLSX) return { headers: [], rows: [] }
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) return { headers: [], rows: [] }

    const sheet = workbook.Sheets[firstSheetName]
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

    if (data.length === 0) return { headers: [], rows: [] }

    const headers = data[0].map((h) => String(h || ''))
    const rows = data.slice(1).map((row) => row.map((cell) => String(cell || '')))

    return { headers, rows }
  } catch (err) {
    console.warn('XLSX workbook parsing warning:', err)
    return { headers: [], rows: [] }
  }
}

/**
 * Renders an Excel workbook sheet into a clean ILovePDF-style PDF Grid Table
 */
async function renderExcelTableToPdf(
  fileName: string,
  headers: string[],
  rows: string[][]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Use A4 landscape orientation for tables if column count > 4 for optimal fit
  const numCols = Math.max(headers.length, 1)
  const isLandscape = numCols > 4
  const pageWidth = isLandscape ? 841.89 : 595.28
  const pageHeight = isLandscape ? 595.28 : 841.89

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let currentY = pageHeight - 40

  const marginX = 40
  const availableWidth = pageWidth - marginX * 2
  const colWidth = availableWidth / numCols
  const rowHeight = 20
  const fontSize = 9

  const drawRow = (cellValues: string[], isHeader: boolean) => {
    if (currentY < 45) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      currentY = pageHeight - 45
    }

    const startY = currentY

    if (isHeader) {
      // Header soft blue background
      page.drawRectangle({
        x: marginX,
        y: startY - rowHeight + 4,
        width: availableWidth,
        height: rowHeight,
        color: rgb(0.92, 0.95, 0.98),
      })
    }

    for (let c = 0; c < numCols; c++) {
      const x = marginX + c * colWidth
      const val = toWinAnsi(cellValues[c] || '')
      const maxChars = Math.max(Math.floor(colWidth / (fontSize * 0.55)) - 1, 3)
      const truncated = val.length > maxChars ? `${val.substring(0, maxChars)}...` : val

      // Draw gridlines
      page.drawRectangle({
        x,
        y: startY - rowHeight + 4,
        width: colWidth,
        height: rowHeight,
        borderColor: rgb(0.82, 0.85, 0.88),
        borderWidth: 0.5,
      })

      // Draw cell text
      page.drawText(truncated, {
        x: x + 5,
        y: startY - rowHeight + 9,
        size: fontSize,
        font: isHeader ? boldFont : font,
        color: isHeader ? rgb(0.08, 0.2, 0.35) : rgb(0.18, 0.22, 0.28),
      })
    }

    currentY -= rowHeight
  }

  // Draw Header Row
  if (headers.length > 0) {
    drawRow(headers, true)
  }

  // Draw Data Rows
  for (const rowData of rows) {
    if (rowData.some((cell) => cell.trim().length > 0)) {
      drawRow(rowData, false)
    }
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

/**
 * Extract clean text content from PDF file using pdf-parse
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!pdfParse) return ''
  try {
    const pdfData = await pdfParse(buffer)
    return pdfData?.text || ''
  } catch (err) {
    console.warn('pdf-parse extraction warning:', err)
    return ''
  }
}

/**
 * Executive-Grade Document to PDF Layout Engine
 * Calculates precise vertical line-heights and section margins to eliminate text overlaps
 */
async function generateValidPdfFromDocument(
  fileName: string,
  buffer: Buffer,
  sourceExt: string
): Promise<Buffer> {
  // If buffer is already a valid PDF, return as-is
  if (isPdfBuffer(buffer)) {
    return buffer
  }

  // Step 0: Excel Spreadsheets (.xlsx, .xls, .csv) Grid Table PDF Renderer
  if (sourceExt === 'xlsx' || sourceExt === 'xls' || sourceExt === 'csv') {
    const { headers, rows } = parseExcelToGrid(buffer)
    if (headers.length > 0 || rows.length > 0) {
      return await renderExcelTableToPdf(fileName, headers, rows)
    }
  }

  let htmlContent = ''
  let textContent = ''

  // Step 1: Extract HTML from DOCX via mammoth for layout preservation
  if ((sourceExt === 'docx' || sourceExt === 'doc') && mammoth) {
    try {
      const htmlResult = await mammoth.convertToHtml({ buffer })
      htmlContent = htmlResult.value || ''
    } catch (err) {
      console.warn('Mammoth HTML conversion fallback warning:', err)
    }
  }

  // Step 2: Extract text from PDF via pdf-parse
  if ((sourceExt === 'pdf' || isPdfBuffer(buffer)) && !textContent) {
    textContent = await extractTextFromPdf(buffer)
  }

  // Step 3: Fallback text extraction for plain text
  if (!htmlContent && !textContent) {
    try {
      const utf8 = buffer.toString('utf-8')
      if (/[a-zA-Z0-9\s]{5,}/.test(utf8)) {
        textContent = utf8
      }
    } catch {
      textContent = ''
    }
  }

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const obliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  let page = pdfDoc.addPage([595.28, 841.89]) // A4 dimensions
  const { width, height } = page.getSize()

  let currentY = height - 55 // Top page margin

  // Render HTML structure if available (from Mammoth DOCX conversion)
  if (htmlContent.length > 0) {
    const tagRegex = /<(h[1-6]|p|li|tr|td|th)[^>]*>(.*?)<\/\1>/gi
    let match: RegExpExecArray | null
    let hasDrawn = false
    let isFirstBlock = true

    while ((match = tagRegex.exec(htmlContent)) !== null) {
      const tag = match[1].toLowerCase()
      const innerHtml = match[2]
      const rawText = innerHtml
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')

      const cleanText = toWinAnsi(rawText.trim())
      if (!cleanText) continue

      hasDrawn = true
      let fontSize = 10
      let activeFont = font
      let fontColor = rgb(0.18, 0.22, 0.28)
      let lineSpacing = 17 // Generous line height
      let topMargin = 0

      const isHeadingText = tag === 'h1' || tag === 'h2' || tag === 'h3' || (cleanText.length < 45 && cleanText === cleanText.toUpperCase() && !cleanText.includes('|'))

      if (isFirstBlock && cleanText.length < 45) {
        // Document Header / Candidate Name
        fontSize = 17
        activeFont = boldFont
        fontColor = rgb(0.06, 0.1, 0.18)
        lineSpacing = 26
        topMargin = 0
      } else if (isHeadingText) {
        // Section Headings (PROFILE SUMMARY, EDUCATION, SKILLS, EXPERIENCE, PROJECTS)
        fontSize = 12
        activeFont = boldFont
        fontColor = rgb(0.1, 0.16, 0.26)
        lineSpacing = 22
        topMargin = 14 // Breathing room before heading
      } else if (tag === 'li' || cleanText.startsWith('•') || cleanText.startsWith('*') || cleanText.startsWith('❖')) {
        // Bullet items
        fontSize = 9.5
        activeFont = font
        fontColor = rgb(0.2, 0.25, 0.3)
        lineSpacing = 16
        topMargin = 2
      } else {
        const isItalicDate = cleanText.includes('start') || cleanText.includes('end') || cleanText.includes('City')
        if (isItalicDate) {
          fontSize = 9
          activeFont = obliqueFont
          fontColor = rgb(0.4, 0.44, 0.5)
          lineSpacing = 15
        }
      }

      isFirstBlock = false

      // Deduct top margin before drawing heading block
      currentY -= topMargin

      const maxChars = Math.floor((width - 80) / (fontSize * 0.55))
      const segments = wrapTextWords(cleanText, maxChars)

      for (let i = 0; i < segments.length; i++) {
        if (currentY < 45) {
          page = pdfDoc.addPage([595.28, 841.89])
          currentY = height - 55
        }

        const isBullet = tag === 'li' || cleanText.startsWith('•') || cleanText.startsWith('*') || cleanText.startsWith('❖')
        const prefix = isBullet && i === 0 ? '•  ' : ''
        const xPos = isBullet ? 55 : 40

        page.drawText(`${prefix}${segments[i]}`, {
          x: xPos,
          y: currentY,
          size: fontSize,
          font: activeFont,
          color: fontColor,
        })
        currentY -= lineSpacing
      }
    }

    if (!hasDrawn) {
      const plainFromHtml = toWinAnsi(htmlContent.replace(/<[^>]+>/g, ' '))
      const lines = plainFromHtml.split(/\r?\n/).filter((l) => l.trim().length > 0)

      for (const line of lines) {
        const segments = wrapTextWords(line, 80)
        for (const seg of segments) {
          if (currentY < 45) {
            page = pdfDoc.addPage([595.28, 841.89])
            currentY = height - 55
          }
          page.drawText(seg, {
            x: 40,
            y: currentY,
            size: 10,
            font,
            color: rgb(0.18, 0.22, 0.28),
          })
          currentY -= 17
        }
      }
    }
  } else {
    // Process text lines (from pdf-parse or plain text)
    const rawLines = textContent.split(/\r?\n/)
    let lineIdx = 0

    for (const rawLine of rawLines) {
      const sanitized = toWinAnsi(rawLine.trim())
      if (sanitized.length > 0) {
        const isFirst = lineIdx === 0
        const isHeading = !isFirst && sanitized.length < 50 && (sanitized === sanitized.toUpperCase() || sanitized.endsWith(':'))
        const isItalicDate = sanitized.includes('start') || sanitized.includes('end') || sanitized.includes('City')

        if (isHeading) {
          currentY -= 14 // Breathing room before heading
        }

        const fontSize = isFirst && sanitized.length < 45 ? 17 : isHeading ? 12 : isItalicDate ? 9 : 10
        const activeFont = isFirst || isHeading ? boldFont : isItalicDate ? obliqueFont : font
        const fontColor = isFirst ? rgb(0.06, 0.1, 0.18) : isHeading ? rgb(0.1, 0.16, 0.26) : isItalicDate ? rgb(0.4, 0.44, 0.5) : rgb(0.2, 0.25, 0.3)
        const lineSpacing = isFirst ? 26 : isHeading ? 22 : 17

        const maxChars = Math.floor((width - 80) / (fontSize * 0.55))
        const segments = wrapTextWords(sanitized, maxChars)

        for (const seg of segments) {
          if (currentY < 45) {
            page = pdfDoc.addPage([595.28, 841.89])
            currentY = height - 55
          }
          page.drawText(seg, {
            x: 40,
            y: currentY,
            size: fontSize,
            font: activeFont,
            color: fontColor,
          })
          currentY -= lineSpacing
        }
        lineIdx++
      }
    }
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

/**
 * POST /api/convert/doc
 * Converts any document format into PDF using Executive Layout Engine & SheetJS Excel Renderer
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
    const customName = formData.get('fileName') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'file is required (multipart/form-data)' },
        { status: 400 }
      )
    }

    const sourceExt = file.name.split('.').pop()?.toLowerCase() || 'doc'
    const baseName = customName && customName.trim()
      ? customName.trim().replace(/\.[^/.]+$/, '')
      : 'editable'
    const finalDocName = `${baseName}.pdf`

    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)
    let convertedPdfBuffer: Buffer | null = null

    // Step 1: For Excel files (.xlsx, .xls, .csv), use SheetJS Excel Table Renderer for ILovePDF grid styling
    if (sourceExt === 'xlsx' || sourceExt === 'xls' || sourceExt === 'csv') {
      const { headers, rows } = parseExcelToGrid(inputBuffer)
      if (headers.length > 0 || rows.length > 0) {
        convertedPdfBuffer = await renderExcelTableToPdf(finalDocName, headers, rows)
      }
    }

    // Step 2: For DOCX / DOC / Text / PDF, use Executive Layout Engine for perfect line heights without overlap
    if (!convertedPdfBuffer || !isPdfBuffer(convertedPdfBuffer)) {
      convertedPdfBuffer = await generateValidPdfFromDocument(finalDocName, inputBuffer, sourceExt)
    }

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
        'x-upsert': 'true',
      },
      body: new Uint8Array(convertedPdfBuffer),
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
        fileSize: convertedPdfBuffer.byteLength,
        mimeType: 'application/pdf',
        storagePath,
        folder: 'converted',
        sourceFormat: sourceExt,
        targetFormat: 'pdf',
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
