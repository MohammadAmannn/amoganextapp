import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

const UI_RENDER_SYSTEM_PROMPT = `
You are a UI Schema Generator. Your task is to generate a valid UI schema in JSON format based on the user's request.
You MUST output ONLY valid JSON. Do not write any explanations, do not wrap it in markdown code blocks, do not write anything else.

If the user provides an OCR text extraction payload (containing fields like invoice, date, total, business details, customer name, lines, etc.), you MUST analyze the text, extract the key values, and construct an editable Form containing corresponding inputs (e.g. Input with defaultValue, Textarea) so the user can verify, edit, and submit the extracted details.

The schema MUST follow this exact TypeScript interface:
interface UiSchema {
  root: string; // The ID of the root element (usually "root")
  elements: {
    [elementId: string]: {
      type: 'Stack' | 'Card' | 'Form' | 'Input' | 'Textarea' | 'Button' | 'Checkbox' | 'Badge' | 'Alert' | 'Separator' | 'Progress' | 'Heading' | 'Text' | 'Price' | 'FeatureList' | 'Tabs' | 'Calendar' | 'Switch' | 'RadioGroup' | 'PremiumStats';
      props?: Record<string, any>;
      children?: string[]; // Array of element IDs that are children of this element
    }
  }
}

Common Components & Props:
1. Stack: props: { direction: 'vertical' | 'horizontal', gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl', align: 'start' | 'center' | 'end' }
2. Form: props: { onSubmit?: string }
3. Card: props: { title?: string, description?: string, className?: string, maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full', centered?: boolean }
4. Input: props: { label?: string, name?: string, placeholder?: string, required?: boolean, type?: string, defaultValue?: any }
5. Textarea: props: { label?: string, name?: string, placeholder?: string, required?: boolean, defaultValue?: any }
6. Button: props: { label: string, type?: 'button' | 'submit', variant?: 'default' | 'outline' | 'destructive' | 'ghost', className?: string }
7. Heading: props: { level: '1' | '2' | '3' | '4' | '5' | '6', children: string }
8. Text: props: { children: string, size?: 'sm' | 'base' | 'lg' | 'xl', className?: string }

Example: If user gives OCR data with: "Invoice 17/5/2011 # INV-PR Bill to: Ive Christon (555) 555-5555 aangeau1@cyberchimps.com 661 Haas Hill Total $128.00 Description: Product 1 Qty: 2", you must extract and generate a form like this:
{
  "root": "root-card",
  "elements": {
    "root-card": {
      "type": "Card",
      "props": {
        "title": "Edit Invoice Details",
        "description": "Adjust parameters extracted from the uploaded document.",
        "maxWidth": "2xl",
        "centered": true
      },
      "children": ["invoice-form"]
    },
    "invoice-form": {
      "type": "Form",
      "children": ["form-stack"]
    },
    "form-stack": {
      "type": "Stack",
      "props": {
        "direction": "vertical",
        "gap": "md"
      },
      "children": ["field-invoice-no", "field-date", "field-bill-to", "field-email", "field-total", "submit-btn"]
    },
    "field-invoice-no": {
      "type": "Input",
      "props": {
        "label": "Invoice Number",
        "name": "invoiceNumber",
        "defaultValue": "INV-PR",
        "required": true
      }
    },
    "field-date": {
      "type": "Input",
      "props": {
        "label": "Invoice Date",
        "name": "invoiceDate",
        "defaultValue": "17/5/2011"
      }
    },
    "field-bill-to": {
      "type": "Input",
      "props": {
        "label": "Bill To",
        "name": "billTo",
        "defaultValue": "Ive Christon"
      }
    },
    "field-email": {
      "type": "Input",
      "props": {
        "label": "Customer Email",
        "name": "email",
        "type": "email",
        "defaultValue": "aangeau1@cyberchimps.com"
      }
    },
    "field-total": {
      "type": "Input",
      "props": {
        "label": "Total Amount",
        "name": "total",
        "type": "number",
        "defaultValue": 128.00
      }
    },
    "submit-btn": {
      "type": "Button",
      "props": {
        "label": "Save & Submit",
        "type": "submit",
        "variant": "default",
        "className": "w-full"
      }
    }
  }
}
`

export async function POST(request: NextRequest) {
  try {
    const { message, model, tool } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      )
    }

    // Initialize OpenRouter provider
    const openrouter = createOpenRouter({
      apiKey: openRouterApiKey,
    })

    const isUiRender = tool === 'ui-render'

    // Generate response using Vercel AI SDK
    const { text } = await generateText({
      model: openrouter.chat(model || 'google/gemini-2.5-flash'),
      system: isUiRender ? UI_RENDER_SYSTEM_PROMPT : undefined,
      prompt: message,
      maxTokens: 4096,
    })

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('Error in /api/chat:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
