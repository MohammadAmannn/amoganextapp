import { NextRequest, NextResponse } from 'next/server'
import { clearConversationUnreadCount } from '@/features/chattemplate/chat/repositories/conversation-repository'

export const runtime = 'nodejs'

/**
 * PATCH /api/conversations/[id]/read
 * Clears the unread message count for the specified user in the conversation.
 *
 * Body: { "userId": "YOUR_USER_ID" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const success = await clearConversationUnreadCount(id, body.userId)
    if (!success) {
      return NextResponse.json({ error: 'Failed to clear unread count' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      conversationId: id,
      unreadCount: 0,
    })
  } catch (err) {
    console.error('PATCH clear unread error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
