import React, { useState } from 'react'
import { useLinkBuilderStore } from '../store'
import { IconSelector } from './icon-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as LucideIcons from 'lucide-react'
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Link2, Sparkles } from 'lucide-react'

export function LinksTab() {
  const { config, addLink, updateLink, removeLink, reorderLinks } = useLinkBuilderStore()
  const { links } = config
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedLinkId(expandedLinkId === id ? null : id)
  }

  const handleLinkChange = (id: string, field: string, value: any) => {
    updateLink(id, { [field]: value })
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Link2 className="h-5 w-5 text-indigo-500" />
            Social Links Manager
          </CardTitle>
          <CardDescription>
            Add, reorder, style, and manage click animations for individual hyperlinks.
          </CardDescription>
        </div>
        <Button onClick={addLink} size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/10">
            <p className="text-muted-foreground mb-4">No social links added yet.</p>
            <Button onClick={addLink} variant="outline" className="gap-1 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
              <Plus className="h-4 w-4" /> Add your first link
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => {
              const isExpanded = expandedLinkId === link.id
              const IconComponent = link.icon ? ((LucideIcons as any)[link.icon] || LucideIcons.HelpCircle) : LucideIcons.Link2

              return (
                <div 
                  key={link.id} 
                  className={`border rounded-xl bg-background/50 overflow-hidden transition-all duration-200 shadow-sm ${
                    link.isEnabled ? 'border-muted' : 'border-muted-foreground/20 opacity-60'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between p-3 gap-2 bg-muted/10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer shrink-0"
                        onClick={() => toggleExpand(link.id)}
                      >
                        <IconComponent className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                      </Button>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{link.title || 'Untitled Link'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[280px]">{link.url || 'https://'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <Switch
                        checked={link.isEnabled}
                        onCheckedChange={(checked) => handleLinkChange(link.id, 'isEnabled', checked)}
                        title={link.isEnabled ? "Disable Link" : "Enable Link"}
                        className="scale-90"
                      />

                      {/* Sorting Actions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        disabled={index === 0}
                        onClick={() => reorderLinks(index, 'up')}
                        title="Move Up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        disabled={index === links.length - 1}
                        onClick={() => reorderLinks(index, 'down')}
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>

                      {/* Expand Toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => toggleExpand(link.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                        onClick={() => removeLink(link.id)}
                        title="Delete Link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Edit Panel */}
                  {isExpanded && (
                    <div className="border-t border-muted/50 p-4 space-y-4 bg-muted/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Link Title</Label>
                          <Input
                            placeholder="e.g. Follow me on Twitter"
                            value={link.title}
                            onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                            className="bg-background/80 h-9 text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Destination URL</Label>
                          <Input
                            placeholder="e.g. https://twitter.com/username"
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                            className="bg-background/80 h-9 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Icon Picker */}
                        <div className="space-y-2 flex flex-col justify-end">
                          <Label className="text-xs font-semibold mb-2">Display Icon</Label>
                          <IconSelector
                            currentIcon={link.icon}
                            onSelect={(iconName) => handleLinkChange(link.id, 'icon', iconName)}
                            trigger={
                              <Button variant="outline" className="w-full justify-between h-9 text-sm font-normal">
                                <span className="flex items-center gap-2 truncate">
                                  {link.icon ? (
                                    <>
                                      {React.createElement((LucideIcons as any)[link.icon] || LucideIcons.HelpCircle, { className: 'h-4 w-4' })}
                                      {link.icon}
                                    </>
                                  ) : (
                                    'No Icon Selected'
                                  )}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                              </Button>
                            }
                          />
                        </div>

                        {/* Animation Pick */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Highlight Effect</Label>
                          <Select
                            value={link.animation || 'none'}
                            onValueChange={(val) => handleLinkChange(link.id, 'animation', val === 'none' ? undefined : val)}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Select highlight effect" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None (Standard hover)</SelectItem>
                              <SelectItem value="pulse">Pulse (Breathing glow)</SelectItem>
                              <SelectItem value="bounce">Bounce (Playful jumps)</SelectItem>
                              <SelectItem value="wiggle">Wiggle (Side to side)</SelectItem>
                              <SelectItem value="glow">Neon Glow Pulse</SelectItem>
                              <SelectItem value="shake">Shake (Attention draw)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Custom colors */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Custom Bg</Label>
                            <div className="flex gap-2 items-center">
                              <Input
                                type="color"
                                value={link.bg || '#ffffff'}
                                onChange={(e) => handleLinkChange(link.id, 'bg', e.target.value)}
                                className="w-9 h-9 p-0.5 border rounded cursor-pointer"
                                title="Pick background color"
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-1 text-[10px] text-muted-foreground"
                                onClick={() => handleLinkChange(link.id, 'bg', undefined)}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Custom Text</Label>
                            <div className="flex gap-2 items-center">
                              <Input
                                type="color"
                                value={link.text || '#000000'}
                                onChange={(e) => handleLinkChange(link.id, 'text', e.target.value)}
                                className="w-9 h-9 p-0.5 border rounded cursor-pointer"
                                title="Pick text color"
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-1 text-[10px] text-muted-foreground"
                                onClick={() => handleLinkChange(link.id, 'text', undefined)}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
