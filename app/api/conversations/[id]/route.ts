import { NextResponse } from 'next/server'
import { deleteConversation } from '@/features/chattemplate/chat/repositories/conversation-repository'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = params.id
    const userId = searchParams.get('userId')

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: conversationId and userId' },
        { status: 400 }
      )
    }

    const success = await deleteConversation(conversationId, userId)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Conversation deleted successfully' })
  } catch (error: any) {
    console.error('[API /api/conversations/[id]] Error deleting conversation:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
