import { createFileRoute } from '@tanstack/react-router'
import App from '@/features/charttemplate/index'

export const Route = createFileRoute('/_authenticated/charttemplate')({
    component: App,
})
