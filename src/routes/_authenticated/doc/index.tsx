import { createFileRoute } from '@tanstack/react-router'
import DocTemplate from '@/features/doctemplate';

export const Route = createFileRoute('/_authenticated/doc/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DocTemplate />
} 
