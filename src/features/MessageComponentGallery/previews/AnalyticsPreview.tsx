'use client'

import React from 'react'
import { Analytics } from '@/features/dashboard/components/analytics'

export function AnalyticsPreview({ stateIndex = 0 }: { stateIndex?: number }) {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-4 md:p-6 overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="max-w-7xl w-full mx-auto space-y-4">
        <Analytics />
      </div>
    </div>
  )
}

export default AnalyticsPreview
