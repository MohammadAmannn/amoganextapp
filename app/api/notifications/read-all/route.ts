import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/features/chattemplate/shared/api/apiClient'

export const runtime = 'nodejs'

/**
 * PATCH /api/notifications/read-all
 * Marks ALL unread notifications as read for a user.
 *
 * Body: { "userId": "YOUR_USER_ID" }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    await apiClient.patch(
      `/rest/v1/notifications?user_id=eq.${body.userId}&read=eq.false`,
      { read: true }
    )

    return NextResponse.json({
      success: true,
      userId: body.userId,
      markedAllAsRead: true,
    })
  } catch (err) {
    console.error('PATCH read-all error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to mark all as read' },
      { status: 500 }
    )
  }
}
