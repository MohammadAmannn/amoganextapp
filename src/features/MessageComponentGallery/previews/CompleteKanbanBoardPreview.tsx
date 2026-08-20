'use client'

import React from 'react'
import KanbanTemplate from '@/features/kanbantemplate'

export function CompleteKanbanBoardPreview({ stateIndex = 0 }: { stateIndex?: number }) {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-0 m-0 overflow-hidden font-sans select-none">
      <KanbanTemplate embedded={true} />
    </div>
  )
}

export default CompleteKanbanBoardPreview
