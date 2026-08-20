'use client'

import React from 'react'
import { Stats } from '@/features/dashboard/components/stats'

export function StatsPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-4 md:p-6 overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="max-w-7xl w-full mx-auto space-y-6">
        <Stats />
      </div>
    </div>
  )
}

export default StatsPreview
