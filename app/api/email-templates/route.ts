import { NextRequest, NextResponse } from 'next/server'
import { getTemplates, saveTemplate } from '@/lib/email-template-store'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const templates = await getTemplates()
    return NextResponse.json(templates)
  } catch (err) {
    console.error('GET templates error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || !body.subject || !body.bodyContent) {
      return NextResponse.json(
        { error: 'Name, subject, and bodyContent are required' },
        { status: 400 }
      )
    }

    const saved = await saveTemplate(body)
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
    }

    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('POST template error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
