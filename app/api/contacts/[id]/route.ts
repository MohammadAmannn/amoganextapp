import { NextRequest, NextResponse } from 'next/server'
import {
  updateContactNickname,
  deleteContact,
} from '@/features/chattemplate/contacts/repositories/contact-repository'

export const runtime = 'nodejs'

/**
 * PATCH /api/contacts/[id]
 * Updates a contact's nickname.
 *
 * Body: { "ownerId": "YOUR_USER_ID", "nickname": "New Nickname" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.ownerId) {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 })
    }

    if (body.nickname === undefined) {
      return NextResponse.json({ error: 'nickname is required' }, { status: 400 })
    }

    const success = await updateContactNickname(id, body.ownerId, body.nickname)
    if (!success) {
      return NextResponse.json({ error: 'Failed to update contact nickname' }, { status: 500 })
    }

    return NextResponse.json({ success: true, contactId: id, nickname: body.nickname })
  } catch (err) {
    console.error('PATCH contact error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/contacts/[id]
 * Deletes a contact.
 *
 * Query: ?ownerId=YOUR_USER_ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId query parameter is required' }, { status: 400 })
    }

    const success = await deleteContact(id, ownerId)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
    }

    return NextResponse.json({ success: true, contactId: id })
  } catch (err) {
    console.error('DELETE contact error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
