import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

const INVOICE_PARSE_PROMPT = `
You are an expert invoice data extraction assistant. You will be given raw OCR text extracted from an invoice, bill, or financial document.

Your task is to return ONLY a valid JSON object with the following structured fields extracted from the raw text:

{
  "invoiceNumber": "string or null",
  "invoiceDate": "string or null",
  "dueDate": "string or null",
  "paymentTerms": "string or null",
  "vendor": "string - the company/person issuing the invoice, or null",
  "vendorAddress": "string or null",
  "vendorEmail": "string or null",
  "vendorPhone": "string or null",
  "vatId": "string or null",
  "taxId": "string or null",
  "purchaseOrder": "string or null",
  "customerName": "string - the bill-to / customer name, or null",
  "customerAddress": "string or null",
  "customerEmail": "string or null",
  "customerPhone": "string or null",
  "items": [
    {
      "description": "string",
      "quantity": "number or string",
      "unitPrice": "string or number",
      "amount": "string or number"
    }
  ],
  "subtotal": "string or null",
  "discount": "string or null",
  "tax": "string or null",
  "total": "string or null",
  "notes": "string or null",
  "currency": "string e.g. USD or null"
}

RULES:
- Return ONLY the JSON object. No explanations, no markdown, no extra text.
- If a field is not found in the raw text, set it to null.
- Extract items array if products/services are listed.
- Do not add any fields not listed above.
- Do not guess values. Only extract what is clearly present in the raw text.
`

export async function POST(request: NextRequest) {
  try {
    const { rawText } = await request.json()

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'rawText is required' }, { status: 400 })
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      )
    }

    const openrouter = createOpenRouter({ apiKey: openRouterApiKey })

    const { text } = await generateText({
      model: openrouter.chat('google/gemini-2.5-flash'),
      system: INVOICE_PARSE_PROMPT,
      prompt: `Extract structured invoice data from this raw OCR text:\n\n${rawText}`,
      maxTokens: 2048,
    })

    // Strip markdown code fences if present
    let cleaned = text.trim()
    if (cleaned.includes('```')) {
      const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (match?.[1]) cleaned = match[1].trim()
    }
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }

    const parsed = JSON.parse(cleaned)

    // Clean out null fields for a lean JSON
    const cleaned_parsed = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => {
        if (v === null || v === undefined || v === '') return false
        if (Array.isArray(v) && v.length === 0) return false
        return true
      })
    )

    return NextResponse.json({ data: cleaned_parsed })
  } catch (error: any) {
    console.error('[parse-invoice] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to parse invoice' },
      { status: 500 }
    )
  }
}
