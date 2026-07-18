import { NextRequest, NextResponse } from 'next/server'
import { createGroupConversation } from '@/features/chattemplate/chat/repositories/conversation-repository'

export const runtime = 'nodejs'

/**
 * POST /api/conversations/group
 * Creates a new group conversation with members and auto-generates system messages.
 *
 * Body: {
 *   "groupName": "Design Team",
 *   "groupImage": "https://...",
 *   "memberIds": ["user1-uuid", "user2-uuid"],
 *   "creatorId": "YOUR_USER_ID",
 *   "type": "group"    // optional: "group" | "channel_group" | "message_group"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.groupName) {
      return NextResponse.json({ error: 'groupName is required' }, { status: 400 })
    }

    if (!body.memberIds || !Array.isArray(body.memberIds) || body.memberIds.length === 0) {
      return NextResponse.json({ error: 'memberIds (non-empty array) is required' }, { status: 400 })
    }

    if (!body.creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 })
    }

    const validTypes = ['group', 'channel_group', 'message_group']
    const type = body.type || 'group'
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const conversation = await createGroupConversation(
      body.groupName,
      body.groupImage || null,
      body.memberIds,
      body.creatorId,
      type
    )

    if (!conversation) {
      return NextResponse.json({ error: 'Failed to create group conversation' }, { status: 500 })
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (err) {
    console.error('POST group conversation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
