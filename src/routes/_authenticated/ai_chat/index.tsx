import { createFileRoute } from '@tanstack/react-router'
import { AiChat } from '@/features/ai-chat'

export const Route = createFileRoute('/_authenticated/ai_chat/')({
  component: AiChat,
})
