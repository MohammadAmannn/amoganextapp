import { createFileRoute } from '@tanstack/react-router'
import { DashboardNotFound } from '@/features/dashboard/dashboard-not-found'

export const Route = createFileRoute('/_authenticated/dashboard/settings')({
  component: DashboardNotFound,
})
