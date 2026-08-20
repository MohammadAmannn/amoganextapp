'use client'

import React from 'react'
import { AreaChartCard } from '@/features/charttemplate/components/AreaChartCard'
import { BarChartCard } from '@/features/charttemplate/components/BarChartCard'
import { LineChartCard } from '@/features/charttemplate/components/LineChartCard'
import { PieChartCard } from '@/features/charttemplate/components/PieChartCard'
import { RadarChartCard } from '@/features/charttemplate/components/RadarChartCard'
import { RadialChartCard } from '@/features/charttemplate/components/RadialChartCard'
import { TooltipChartCard } from '@/features/charttemplate/components/TooltipChartCard'

export function AreaChartPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-background overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="w-full max-w-3xl">
        <AreaChartCard />
      </div>
    </div>
  )
}

export function BarChartPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-background overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="w-full max-w-3xl">
        <BarChartCard />
      </div>
    </div>
  )
}

export function LineChartPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-background overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="w-full max-w-3xl">
        <LineChartCard />
      </div>
    </div>
  )
}

export function PieChartPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-background overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="w-full max-w-3xl">
        <PieChartCard />
      </div>
    </div>
  )
}

export function RadarChartPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-background overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="w-full max-w-3xl">
        <RadarChartCard />
      </div>
    </div>
  )
}

export function RadialChartPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-background overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="w-full max-w-3xl">
        <RadialChartCard />
      </div>
    </div>
  )
}

export function TooltipChartPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-background overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="w-full max-w-3xl">
        <TooltipChartCard />
      </div>
    </div>
  )
}
