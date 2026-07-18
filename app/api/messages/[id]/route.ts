import { NextRequest, NextResponse } from 'next/server'
import {
  updateMessageBooleanAction,
  deleteMessageForMe,
} from '@/features/chattemplate/chat/repositories/message-repository'

export const runtime = 'nodejs'

/**
 * PATCH /api/messages/[id]
 * Updates a boolean action on a message (star, pin, flag, thumb, favorite, archive, action_this).
 *
 * Body: { "action": "star", "value": true }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const validActions = ['thumb', 'favorite', 'flag', 'star', 'pin', 'archive', 'action_this']
    if (!body.action || !validActions.includes(body.action)) {
      return NextResponse.json(
        { error: `action is required and must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    if (typeof body.value !== 'boolean') {
      return NextResponse.json(
        { error: 'value (boolean) is required' },
        { status: 400 }
      )
    }

    const success = await updateMessageBooleanAction(id, body.action, body.value)
    if (!success) {
      return NextResponse.json({ error: 'Failed to update message action' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: id, action: body.action, value: body.value })
  } catch (err) {
    console.error('PATCH message error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/messages/[id]
 * Soft-deletes a message for the caller only ("delete for me").
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const success = await deleteMessageForMe(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: id })
  } catch (err) {
    console.error('DELETE message error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
