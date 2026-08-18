import React from 'react'
import { MessageSquare } from 'lucide-react'

export function ChatEmptyState() {
  return (
    <div className='flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-background p-8 text-muted-foreground'>
      <MessageSquare className='h-10 w-10 opacity-20' />
      <p className='text-sm'>Select a message to view its content</p>
    </div>
  )
}
