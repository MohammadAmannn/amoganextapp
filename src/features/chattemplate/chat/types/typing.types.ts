export type TypingStatus = 'idle' | 'typing' | 'recording'

export interface TypingBroadcastPayload {
  userId: string
  userName: string
  conversationId: string
  status: TypingStatus
  timestamp: number
}

export interface UserTypingState {
  userId: string
  userName: string
  status: TypingStatus
  timestamp: number
}
