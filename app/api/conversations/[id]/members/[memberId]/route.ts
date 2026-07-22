import { NextResponse } from 'next/server'
import { removeGroupMember } from '@/features/chattemplate/chat/repositories/conversation-repository'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const conversationId = params.id
    const memberId = params.memberId

    if (!conversationId || !memberId) {
      return NextResponse.json(
        { error: 'Missing required parameters: conversationId and memberId' },
        { status: 400 }
      )
    }

    const success = await removeGroupMember(conversationId, memberId)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove group member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Member removed from group successfully' })
  } catch (error: any) {
    console.error('[API /api/conversations/[id]/members/[memberId]] Error removing member:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
