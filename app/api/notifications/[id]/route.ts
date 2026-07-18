import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/features/chattemplate/shared/api/apiClient'

export const runtime = 'nodejs'

/**
 * PATCH /api/notifications/[id]
 * Marks a single notification as read.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await apiClient.patch(
      `/rest/v1/notifications?id=eq.${id}`,
      { read: true }
    )

    return NextResponse.json({ success: true, notificationId: id, read: true })
  } catch (err) {
    console.error('PATCH notification error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to mark as read' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Deletes a single notification.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await apiClient.delete(`/rest/v1/notifications?id=eq.${id}`)

    return NextResponse.json({ success: true, notificationId: id, deleted: true })
  } catch (err) {
    console.error('DELETE notification error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
