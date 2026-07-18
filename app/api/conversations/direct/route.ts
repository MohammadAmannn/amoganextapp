import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateDirectConversation } from '@/features/chattemplate/chat/repositories/conversation-repository'

export const runtime = 'nodejs'

/**
 * POST /api/conversations/direct
 * Gets an existing direct conversation between two users or creates one.
 *
 * Body: { "userAId": "YOUR_USER_ID", "userBId": "OTHER_USER_ID" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userAId) {
      return NextResponse.json({ error: 'userAId is required' }, { status: 400 })
    }

    if (!body.userBId) {
      return NextResponse.json({ error: 'userBId is required' }, { status: 400 })
    }

    const conversationId = await getOrCreateDirectConversation(body.userAId, body.userBId)

    if (!conversationId) {
      return NextResponse.json({ error: 'Failed to get or create direct conversation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      conversationId,
      userAId: body.userAId,
      userBId: body.userBId,
    })
  } catch (err) {
    console.error('POST direct conversation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
