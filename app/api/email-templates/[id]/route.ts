import { NextRequest, NextResponse } from 'next/server'
import { saveTemplate, deleteTemplate } from '@/lib/email-template-store'

export const runtime = 'nodejs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    if (!body.name || !body.subject || !body.bodyContent) {
      return NextResponse.json(
        { error: 'Name, subject, and bodyContent are required' },
        { status: 400 }
      )
    }

    const updated = await saveTemplate({ ...body, id })
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT template error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteTemplate(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE template error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
