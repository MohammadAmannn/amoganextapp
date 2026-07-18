import { NextRequest, NextResponse } from 'next/server'
import { getUserConversations } from '@/features/chattemplate/chat/repositories/conversation-repository'

export const runtime = 'nodejs'

/**
 * GET /api/conversations?userId=YOUR_USER_ID
 * Fetches all conversations (direct + group) for the specified user,
 * including members, last message, and unread counts.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const conversations = await getUserConversations(userId)
    return NextResponse.json(conversations)
  } catch (err) {
    console.error('GET conversations error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
