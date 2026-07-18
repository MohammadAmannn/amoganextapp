import { NextRequest, NextResponse } from 'next/server'
import { forwardMessage } from '@/features/chattemplate/chat/repositories/message-repository'

export const runtime = 'nodejs'

/**
 * POST /api/messages/[id]/forward
 * Forwards a message to one or more target conversations.
 *
 * Body: { "senderId": "YOUR_USER_ID", "targetConversationIds": ["convo1", "convo2"] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.senderId) {
      return NextResponse.json({ error: 'senderId is required' }, { status: 400 })
    }

    if (!body.targetConversationIds || !Array.isArray(body.targetConversationIds) || body.targetConversationIds.length === 0) {
      return NextResponse.json(
        { error: 'targetConversationIds (non-empty array) is required' },
        { status: 400 }
      )
    }

    const success = await forwardMessage(id, body.targetConversationIds, body.senderId)
    if (!success) {
      return NextResponse.json({ error: 'Failed to forward message' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: id,
      forwardedTo: body.targetConversationIds,
    })
  } catch (err) {
    console.error('POST forward message error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
