import { NextRequest, NextResponse } from 'next/server'
import { saveContact, deleteContact } from '@/lib/contact-group-store'

export const runtime = 'nodejs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    if (!body.fullName || !body.email || !body.mobile || !body.status) {
      return NextResponse.json(
        { error: 'fullName, email, mobile, and status are required fields' },
        { status: 400 }
      )
    }

    const updated = await saveContact({ ...body, id })
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT contact error:', err)
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
    const success = await deleteContact(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE contact error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
