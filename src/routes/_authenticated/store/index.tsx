import { createFileRoute } from '@tanstack/react-router'
import StoreTemplate from '@/features/storetemplate'

export const Route = createFileRoute('/_authenticated/store/')({
  component: StoreTemplate,
})
