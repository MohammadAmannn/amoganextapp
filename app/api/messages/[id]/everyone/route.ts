import { NextRequest, NextResponse } from 'next/server'
import { deleteMessageForEveryone } from '@/features/chattemplate/chat/repositories/message-repository'

export const runtime = 'nodejs'

/**
 * DELETE /api/messages/[id]/everyone
 * Deletes a message for all conversation members.
 *
 * Body: { "senderId": "YOUR_USER_ID" }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.senderId) {
      return NextResponse.json(
        { error: 'senderId is required (only the sender can delete for everyone)' },
        { status: 400 }
      )
    }

    const success = await deleteMessageForEveryone(id, body.senderId)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete message for everyone. You may not be the original sender.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, messageId: id, deletedForEveryone: true })
  } catch (err) {
    console.error('DELETE message for everyone error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
