import React, { useState } from 'react'
import { Search } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ICON_LIST = [
  'Link2', 'Globe', 'Github', 'Linkedin', 'Twitter', 'Instagram', 'Youtube', 'Facebook', 
  'BookOpen', 'Figma', 'Code', 'Sparkles', 'Smartphone', 'Play', 'Send', 'Share2', 
  'FileText', 'Mail', 'Phone', 'MapPin', 'ShoppingCart', 'Coffee', 'Heart', 'Camera', 
  'Music', 'Gamepad2', 'Rss', 'Award', 'Briefcase', 'Calendar', 'Hash', 'User',
  'PenTool', 'GraduationCap', 'Video', 'MessageSquare', 'Layers', 'Terminal', 'Cpu', 'Zap'
]

interface IconSelectorProps {
  currentIcon?: string
  onSelect: (iconName: string) => void
  trigger: React.ReactNode
}

export function IconSelector({ currentIcon, onSelect, trigger }: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIcons = ICON_LIST.filter(icon => 
    icon.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (iconName: string) => {
    onSelect(iconName)
    setOpen(false)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Link Icon</DialogTitle>
        </DialogHeader>
        <div className="relative my-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-1">
          {filteredIcons.map((iconName) => {
            // Dynamically resolve icon from LucideIcons library safely
            const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle
            
            return (
              <Button
                key={iconName}
                variant={currentIcon === iconName ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center p-1 gap-1"
                onClick={() => handleSelect(iconName)}
                title={iconName}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                  {iconName}
                </span>
              </Button>
            )
          })}
          {filteredIcons.length === 0 && (
            <div className="col-span-5 text-center py-6 text-sm text-muted-foreground">
              No icons found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
