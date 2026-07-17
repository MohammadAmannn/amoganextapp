import React from 'react'
import { useEmailSettingsStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { colorThemes, useColorTheme } from '@/context/color-theme-provider'
import { Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemesTab() {
  const { updateTheme } = useEmailSettingsStore()
  const { colorTheme, setColorTheme } = useColorTheme()

  const handleColorChange = (name: string) => {
    setColorTheme(name)
    updateTheme({ appColorTheme: name })
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-500" />
          Themes & Design Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance and accent color of your email workspace and mobile preview mockup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Theme Selector Grid */}
        <div className="space-y-3">
          <Label className="font-semibold text-sm">Accent Color Theme</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
            {colorThemes.map((ct) => {
              const isActive = colorTheme === ct.name
              return (
                <button
                  key={ct.name}
                  onClick={() => handleColorChange(ct.name)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-150 cursor-pointer',
                    isActive
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500 shadow-sm font-semibold'
                      : 'border-muted hover:border-indigo-500/50 hover:bg-muted/10'
                  )}
                >
                  {/* Color dots preview */}
                  <div className="flex gap-0.5 shrink-0">
                    {ct.colors.slice(0, 4).map((color, i) => (
                      <span
                        key={i}
                        className={cn(
                          'size-3.5 rounded-full ring-1 ring-background',
                          isActive ? 'ring-indigo-500/20' : 'ring-border/40'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs truncate">{ct.label}</span>
                  {isActive && (
                    <Check className="ml-auto size-4 text-indigo-500 shrink-0" strokeWidth={3} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
