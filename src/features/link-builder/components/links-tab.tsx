import React, { useState } from 'react'
import { useLinkBuilderStore } from '../store'
import { IconSelector } from './icon-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import * as LucideIcons from 'lucide-react'
import { Plus, Trash2, Edit, Save, X, Link2, ChevronDown } from 'lucide-react'

export function LinksTab() {
  const { config, addLink, updateLink, removeLink } = useLinkBuilderStore()
  const { links } = config
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>(null)

  const openEditModal = (link: any) => {
    setEditingLinkId(link.id)
    setEditFormData({ ...link })
  }

  const closeEditModal = () => {
    setEditingLinkId(null)
    setEditFormData(null)
  }

  const saveEdit = () => {
    if (editingLinkId && editFormData) {
      updateLink(editingLinkId, editFormData)
      closeEditModal()
    }
  }

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }))
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
          <>
            <div className="space-y-3">
              {links.map((link) => {
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
                        <div className="h-8 w-8 flex items-center justify-center shrink-0">
                          <IconComponent className="h-4.5 w-4.5 text-indigo-400" />
                        </div>
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

                        {/* Edit Button - Opens Modal */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 shrink-0"
                          onClick={() => openEditModal(link)}
                          title="Edit Link"
                        >
                          <Edit className="h-4 w-4" />
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
                  </div>
                )
              })}
            </div>
            
            {/* Add Link button moved here - below the links list */}
            <div className="pt-2">
              <Button 
                onClick={addLink} 
                size="sm" 
                className="w-full gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Edit Modal/Dialog */}
      <Dialog open={!!editingLinkId} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Social Link
            </DialogTitle>
            <DialogDescription>
              Update the details for this social link. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Link Title</Label>
                  <Input
                    placeholder="e.g. Follow me on Twitter"
                    value={editFormData.title || ''}
                    onChange={(e) => handleEditFieldChange('title', e.target.value)}
                    className="bg-background/80 h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Destination URL</Label>
                  <Input
                    placeholder="e.g. https://twitter.com/username"
                    value={editFormData.url || ''}
                    onChange={(e) => handleEditFieldChange('url', e.target.value)}
                    className="bg-background/80 h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Icon Picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Display Icon</Label>
                  <IconSelector
                    currentIcon={editFormData.icon}
                    onSelect={(iconName) => handleEditFieldChange('icon', iconName)}
                    trigger={
                      <Button variant="outline" className="w-full justify-between h-9 text-sm font-normal">
                        <span className="flex items-center gap-2 truncate">
                          {editFormData.icon ? (
                            <>
                              {React.createElement((LucideIcons as any)[editFormData.icon] || LucideIcons.HelpCircle, { className: 'h-4 w-4' })}
                              {editFormData.icon}
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
                    value={editFormData.animation || 'none'}
                    onValueChange={(val) => handleEditFieldChange('animation', val === 'none' ? undefined : val)}
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

                {/* Enabled Toggle */}
                <div className="space-y-2 flex flex-col justify-end">
                  <Label className="text-xs font-semibold">Link Status</Label>
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      checked={editFormData.isEnabled !== false}
                      onCheckedChange={(checked) => handleEditFieldChange('isEnabled', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {editFormData.isEnabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Custom Background Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={editFormData.bg || '#ffffff'}
                      onChange={(e) => handleEditFieldChange('bg', e.target.value)}
                      className="w-9 h-9 p-0.5 border rounded cursor-pointer"
                      title="Pick background color"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => handleEditFieldChange('bg', undefined)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Custom Text Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={editFormData.text || '#000000'}
                      onChange={(e) => handleEditFieldChange('text', e.target.value)}
                      className="w-9 h-9 p-0.5 border rounded cursor-pointer"
                      title="Pick text color"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => handleEditFieldChange('text', undefined)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={saveEdit}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}