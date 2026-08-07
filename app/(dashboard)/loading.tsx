import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className='flex h-full w-full items-center justify-center p-8 bg-background'>
      <Loader2 className='h-6 w-6 animate-spin text-primary' />
    </div>
  )
}
