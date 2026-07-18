import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/features/chattemplate/shared/api/apiClient'
import { createQuery } from '@/features/chattemplate/shared/api/queryBuilder'

export const runtime = 'nodejs'

/**
 * GET /api/notifications?userId=YOUR_USER_ID
 * Fetches all notifications for the specified user, newest first.
 *
 * Optional: &read=false to get only unread
 * Optional: &limit=50 to limit results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const readFilter = searchParams.get('read')
    const limit = searchParams.get('limit')

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const query = createQuery()
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (readFilter !== null) {
      query.eq('read', readFilter)
    }

    if (limit) {
      query.limit(parseInt(limit, 10))
    }

    const notifications = await apiClient.get<any[]>(`/rest/v1/notifications${query.toString()}`)
    return NextResponse.json(notifications)
  } catch (err) {
    console.error('GET notifications error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Creates a new notification manually (useful for testing or external triggers).
 *
 * Body: {
 *   "userId": "TARGET_USER_UUID",
 *   "senderId": "SENDER_UUID" (optional),
 *   "messageId": "MSG_UUID" (optional),
 *   "messageText": "You have a new message!"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!body.messageText) {
      return NextResponse.json({ error: 'messageText is required' }, { status: 400 })
    }

    const notification = {
      user_id: body.userId,
      sender_id: body.senderId || null,
      message_id: body.messageId || null,
      message_text: body.messageText,
      read: false,
    }

    const result = await apiClient.post<any[]>('/rest/v1/notifications', notification)

    return NextResponse.json(result[0] || notification, { status: 201 })
  } catch (err) {
    console.error('POST notification error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
