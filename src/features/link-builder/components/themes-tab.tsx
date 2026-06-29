import React from 'react'
import { useLinkBuilderStore } from '../store'
import { THEME_PRESETS } from '../themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Palette, Check } from 'lucide-react'

export function ThemesTab() {
  const { config, updateTheme } = useLinkBuilderStore()
  const { preset, fontFamily, buttonStyle, buttonShape, customBg, bgType } = config.theme

  const handlePresetSelect = (presetId: string) => {
    if (presetId === 'custom') {
      updateTheme({ preset: 'custom' })
    } else {
      const presetTheme = THEME_PRESETS[presetId]
      if (presetTheme) {
        updateTheme({
          preset: presetId as any,
          buttonStyle: presetTheme.buttonStyle,
          buttonShape: presetTheme.buttonShape,
          fontFamily: presetTheme.fontFamily as any,
          customBg: undefined
        })
      }
    }
  }

  const handleCustomBgChange = (value: string) => {
    updateTheme({ customBg: value, preset: 'custom' })
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-500" />
          Themes & Design
        </CardTitle>
        <CardDescription>
          Choose an aesthetic template preset or design your own customized layout style from scratch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Selection Grid */}
        <div className="space-y-3">
          <Label className="font-semibold text-sm">Select Theme Preset</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(THEME_PRESETS).map((p) => {
              const isActive = preset === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`relative flex flex-col p-3 rounded-xl border text-left overflow-hidden transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md scale-[1.02]'
                      : 'border-muted hover:border-indigo-500/50 hover:bg-muted/10'
                  }`}
                >
                  <div className={`h-12 w-full rounded-md mb-2 flex items-center justify-center relative ${p.classBg}`}>
                    <span className={`text-[10px] truncate max-w-[80%] px-2 py-1 rounded shadow-sm border border-white/10 ${p.classButton}`}>
                      Preview Button
                    </span>
                  </div>
                  <span className="text-xs font-bold truncate block w-full">{p.name}</span>

                  {isActive && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              )
            })}

            {/* Custom Theme Card */}
            <button
              onClick={() => handlePresetSelect('custom')}
              className={`relative flex flex-col p-3 rounded-xl border text-left overflow-hidden transition-all duration-200 cursor-pointer ${
                preset === 'custom'
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md scale-[1.02]'
                  : 'border-muted hover:border-indigo-500/50 hover:bg-muted/10'
              }`}
            >
              <div className="h-12 w-full rounded-md mb-2 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono">
                {customBg ? 'Custom Color' : 'Click to design'}
              </div>
              <span className="text-xs font-bold">Custom Designer</span>
              {preset === 'custom' && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center text-white shrink-0">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Custom Customizer Settings (shows when preset is 'custom' or as override controls) */}
        <div className="border-t border-muted pt-6 space-y-4">
          <Label className="font-semibold text-sm block">Visual Overrides</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Custom Background Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Background Theme</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customBg && customBg.startsWith('#') ? customBg : '#4f46e5'}
                  onChange={(e) => handleCustomBgChange(e.target.value)}
                  className="w-10 h-10 p-0.5 border rounded cursor-pointer shrink-0"
                  title="Pick solid background color"
                />
                <Input
                  placeholder="Hex color or CSS Gradient string..."
                  value={customBg || ''}
                  onChange={(e) => handleCustomBgChange(e.target.value)}
                  className="bg-background/80 h-10 text-xs flex-1"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Examples: `#0d0d0d`, `linear-gradient(135deg, #1f1235, #000000)`
              </p>
            </div>

            {/* Font Family selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Typography Font</Label>
              <Select
                value={fontFamily || 'font-sans'}
                onValueChange={(val) => updateTheme({ fontFamily: val as any, preset: 'custom' })}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select Font Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="font-sans">Sans-Serif (Modern & Clean)</SelectItem>
                  <SelectItem value="font-serif">Serif (Elegant & Classic)</SelectItem>
                  <SelectItem value="font-mono">Monospace (Developer & Tech)</SelectItem>
                  <SelectItem value="font-display">Display (Bold & Trendy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Button Style selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Button Design Style</Label>
              <Select
                value={buttonStyle || 'solid'}
                onValueChange={(val) => updateTheme({ buttonStyle: val as any, preset: 'custom' })}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select Button Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid Filled</SelectItem>
                  <SelectItem value="outline">Outline Border</SelectItem>
                  <SelectItem value="glass">Glassmorphism Blur</SelectItem>
                  <SelectItem value="neon">Glowing Neon Outline</SelectItem>
                  <SelectItem value="brutalism">Brutalist (Sharp shadow)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Button Shape selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Button Edge Shape</Label>
              <Select
                value={buttonShape || 'rounded'}
                onValueChange={(val) => updateTheme({ buttonShape: val as any, preset: 'custom' })}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select Button Shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (Hard corners)</SelectItem>
                  <SelectItem value="rounded">Rounded (Medium corners)</SelectItem>
                  <SelectItem value="pill">Pill (Fully rounded)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}
