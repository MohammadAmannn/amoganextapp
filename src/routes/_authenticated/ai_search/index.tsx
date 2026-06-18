import { createFileRoute } from '@tanstack/react-router'
import AiSearch from '@/features/ai-search'

export const Route = createFileRoute('/_authenticated/ai_search/')({
  component: AiSearch,
})
