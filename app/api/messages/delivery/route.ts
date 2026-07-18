import { NextRequest, NextResponse } from 'next/server'
import {
  markMessagesAsDelivered,
  markMessagesAsRead,
} from '@/features/chattemplate/chat/repositories/delivery-repository'

export const runtime = 'nodejs'

/**
 * PATCH /api/messages/delivery
 * Marks messages in a conversation as delivered or read.
 *
 * Body: { "conversationId": "...", "userId": "...", "status": "delivered" | "read" }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
    }

    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const validStatuses = ['delivered', 'read']
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `status is required and must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    if (body.status === 'delivered') {
      await markMessagesAsDelivered(body.conversationId, body.userId)
    } else {
      await markMessagesAsRead(body.conversationId, body.userId)
    }

    return NextResponse.json({
      success: true,
      conversationId: body.conversationId,
      markedAs: body.status,
    })
  } catch (err) {
    console.error('PATCH delivery error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
