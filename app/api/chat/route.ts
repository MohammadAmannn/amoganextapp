import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

const UI_RENDER_SYSTEM_PROMPT = `
You are a UI Schema Generator. Your task is to generate a valid UI schema in JSON format based on the user's request.
You MUST output ONLY valid JSON. Do not write any explanations, do not wrap it in markdown code blocks, do not write anything else.

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
9. Switch / Checkbox: props: { label?: string, name?: string, checked?: boolean, required?: boolean }

Example of a Form Schema:
{
  "root": "root-form",
  "elements": {
    "root-form": {
      "type": "Card",
      "props": {
        "title": "Edit Voucher details",
        "description": "Adjust fields extracted from OCR",
        "maxWidth": "2xl",
        "centered": true
      },
      "children": ["voucher-form"]
    },
    "voucher-form": {
      "type": "Form",
      "children": ["form-stack"]
    },
    "form-stack": {
      "type": "Stack",
      "props": {
        "direction": "vertical",
        "gap": "md"
      },
      "children": ["field-voucher-no", "field-date", "field-amount", "submit-btn"]
    },
    "field-voucher-no": {
      "type": "Input",
      "props": {
        "label": "Voucher Number",
        "name": "voucherNo",
        "defaultValue": "VCH-2026-0042",
        "required": true
      }
    },
    "field-date": {
      "type": "Input",
      "props": {
        "label": "Issue Date",
        "name": "date",
        "type": "date",
        "defaultValue": "2026-08-07"
      }
    },
    "field-amount": {
      "type": "Input",
      "props": {
        "label": "Total Amount",
        "name": "total",
        "type": "number",
        "defaultValue": "128.00"
      }
    },
    "submit-btn": {
      "type": "Button",
      "props": {
        "label": "Save Changes",
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
