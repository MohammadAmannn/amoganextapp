import { createFileRoute } from '@tanstack/react-router'
import App from '@/features/chart/index'

export const Route = createFileRoute('/_authenticated/chart')({
    component: App,
})
