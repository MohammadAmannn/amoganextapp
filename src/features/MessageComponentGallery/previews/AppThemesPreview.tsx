'use client'

import React from 'react'
import { ThemesTab } from '@/features/email-settings/components/themes-tab'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { Palette, Sparkles, Sliders, CheckCircle2 } from 'lucide-react'
import { useColorTheme } from '@/context/color-theme-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function AppThemesPreview({ stateIndex = 0 }: { stateIndex?: number }) {
  const { colorTheme } = useColorTheme()

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-0 m-0 overflow-hidden font-sans select-none">
      {/* Top Header Bar */}
      <div className="flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none gap-3">
        <div className="flex min-w-0 items-center gap-3 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400 font-bold">
            <Palette className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">App Theme & Accent Colors</p>
            <p className="truncate text-xs text-muted-foreground">
              Dynamic design system theme customizer matching email settings.
            </p>
          </div>
        </div>
        <HeaderActions />
      </div>

      {/* Main Content Area */}
      <div className="relative h-full min-h-0 w-full flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Themes Tab Component */}
          <ThemesTab />
        </div>
      </div>
    </div>
  )
}

export default AppThemesPreview
