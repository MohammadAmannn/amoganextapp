'use client'

import React, { useState, useMemo } from 'react'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  Layers,
  Wand2,
  Ticket,
  Kanban,
  CreditCard,
  BarChart3,
  TrendingUp,
  PieChart,
  MapPin,
  Mail,
  MessageSquare,
  Bell,
  FileText,
  CalendarDays,
  Calendar,
  FileEdit,
  ScanLine,
  Sliders,
  Palette,
  Settings,
  User,
  Users,
  Shield,
  Folder,
  FolderOpen,
  UploadCloud,
  Download,
  Printer,
  Trash2,
  Plus,
  Minus,
  Edit,
  Edit2,
  Edit3,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  RefreshCw,
  Share2,
  Lock,
  Unlock,
  Key,
  Globe,
  Terminal,
  Code2,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  X,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Filter,
  SlidersHorizontal,
  Heart,
  Star,
  Bookmark,
  Send,
  Inbox,
  Paperclip,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  Camera,
  Sun,
  Moon,
  Zap,
  Flame,
  Activity,
  Award,
  Gift,
  Tag,
  Package,
  ShoppingCart,
  DollarSign,
  Percent,
  Wallet,
  Building,
  Home,
  Compass,
  Navigation,
  Map,
  Volume2,
  VolumeX,
  Wifi,
  Radio,
  FileCheck,
  FileQuestion,
  FileCode,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
} from 'lucide-react'

interface IconItem {
  name: string
  component: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
  category: string
  tags: string[]
}

const ALL_ICONS: IconItem[] = [
  // UI & Navigation
  { name: 'LayoutGrid', component: LayoutGrid, category: 'Navigation', tags: ['grid', 'dashboard', 'apps'] },
  { name: 'Menu', component: Menu, category: 'Navigation', tags: ['hamburger', 'sidebar', 'drawer'] },
  { name: 'ChevronRight', component: ChevronRight, category: 'Navigation', tags: ['arrow', 'next', 'expand'] },
  { name: 'ChevronLeft', component: ChevronLeft, category: 'Navigation', tags: ['arrow', 'back', 'previous'] },
  { name: 'ChevronDown', component: ChevronDown, category: 'Navigation', tags: ['dropdown', 'bottom'] },
  { name: 'ChevronUp', component: ChevronUp, category: 'Navigation', tags: ['top', 'collapse'] },
  { name: 'ArrowLeft', component: ArrowLeft, category: 'Navigation', tags: ['back', 'return'] },
  { name: 'ArrowRight', component: ArrowRight, category: 'Navigation', tags: ['next', 'forward', 'proceed'] },
  { name: 'ArrowUp', component: ArrowUp, category: 'Navigation', tags: ['upload', 'top'] },
  { name: 'ArrowDown', component: ArrowDown, category: 'Navigation', tags: ['download', 'bottom'] },
  { name: 'Home', component: Home, category: 'Navigation', tags: ['main', 'house', 'dashboard'] },
  { name: 'Compass', component: Compass, category: 'Navigation', tags: ['explore', 'guide'] },
  { name: 'Navigation', component: Navigation, category: 'Navigation', tags: ['map', 'location', 'gps'] },

  // Actions & Controls
  { name: 'Search', component: Search, category: 'Actions', tags: ['find', 'query', 'filter'] },
  { name: 'Plus', component: Plus, category: 'Actions', tags: ['add', 'create', 'new'] },
  { name: 'Minus', component: Minus, category: 'Actions', tags: ['remove', 'decrease', 'collapse'] },
  { name: 'X', component: X, category: 'Actions', tags: ['close', 'delete', 'cancel', 'cross'] },
  { name: 'Check', component: Check, category: 'Actions', tags: ['tick', 'confirm', 'success'] },
  { name: 'CheckCircle2', component: CheckCircle2, category: 'Actions', tags: ['approved', 'verified', 'done'] },
  { name: 'Edit', component: Edit, category: 'Actions', tags: ['pencil', 'write', 'modify'] },
  { name: 'Edit3', component: Edit3, category: 'Actions', tags: ['modify', 'compose'] },
  { name: 'Trash2', component: Trash2, category: 'Actions', tags: ['delete', 'remove', 'bin'] },
  { name: 'Eye', component: Eye, category: 'Actions', tags: ['preview', 'view', 'visible'] },
  { name: 'EyeOff', component: EyeOff, category: 'Actions', tags: ['hide', 'hidden', 'invisible'] },
  { name: 'Copy', component: Copy, category: 'Actions', tags: ['duplicate', 'clipboard'] },
  { name: 'Download', component: Download, category: 'Actions', tags: ['save', 'export'] },
  { name: 'UploadCloud', component: UploadCloud, category: 'Actions', tags: ['cloud', 'file', 'attach'] },
  { name: 'Printer', component: Printer, category: 'Actions', tags: ['print', 'pdf', 'paper'] },
  { name: 'RefreshCw', component: RefreshCw, category: 'Actions', tags: ['reload', 'sync', 'rotate'] },
  { name: 'Filter', component: Filter, category: 'Actions', tags: ['sort', 'refine'] },
  { name: 'Share2', component: Share2, category: 'Actions', tags: ['social', 'link', 'forward'] },
  { name: 'MoreHorizontal', component: MoreHorizontal, category: 'Actions', tags: ['dots', 'menu', 'options'] },
  { name: 'MoreVertical', component: MoreVertical, category: 'Actions', tags: ['kebab', 'menu'] },
  { name: 'Maximize2', component: Maximize2, category: 'Actions', tags: ['fullscreen', 'expand'] },
  { name: 'Minimize2', component: Minimize2, category: 'Actions', tags: ['exit', 'collapse'] },

  // Communication & Social
  { name: 'Mail', component: Mail, category: 'Communication', tags: ['email', 'inbox', 'message'] },
  { name: 'Inbox', component: Inbox, category: 'Communication', tags: ['received', 'tray'] },
  { name: 'Send', component: Send, category: 'Communication', tags: ['paperplane', 'submit'] },
  { name: 'MessageSquare', component: MessageSquare, category: 'Communication', tags: ['chat', 'comment', 'discussion'] },
  { name: 'Bell', component: Bell, category: 'Communication', tags: ['notification', 'alert', 'alarm'] },
  { name: 'Sparkles', component: Sparkles, category: 'Communication', tags: ['ai', 'magic', 'generate', 'stars'] },
  { name: 'Wand2', component: Wand2, category: 'Communication', tags: ['wizard', 'ai', 'magic'] },

  // Content, Files & Editor
  { name: 'FileText', component: FileText, category: 'Content & Files', tags: ['document', 'page', 'pdf'] },
  { name: 'FileCheck', component: FileCheck, category: 'Content & Files', tags: ['verified', 'doc'] },
  { name: 'FileCode', component: FileCode, category: 'Content & Files', tags: ['programming', 'source'] },
  { name: 'FileQuestion', component: FileQuestion, category: 'Content & Files', tags: ['unknown', 'help'] },
  { name: 'Folder', component: Folder, category: 'Content & Files', tags: ['directory', 'storage'] },
  { name: 'FolderOpen', component: FolderOpen, category: 'Content & Files', tags: ['opened', 'browse'] },
  { name: 'FileEdit', component: FileEdit, category: 'Content & Files', tags: ['rich editor', 'compose', 'notes'] },
  { name: 'Paperclip', component: Paperclip, category: 'Content & Files', tags: ['attachment', 'link'] },
  { name: 'Bold', component: Bold, category: 'Content & Files', tags: ['font', 'weight'] },
  { name: 'Italic', component: Italic, category: 'Content & Files', tags: ['font', 'slant'] },
  { name: 'Underline', component: Underline, category: 'Content & Files', tags: ['font', 'line'] },
  { name: 'List', component: List, category: 'Content & Files', tags: ['bullet', 'points'] },
  { name: 'ListOrdered', component: ListOrdered, category: 'Content & Files', tags: ['numbered', 'order'] },

  // Analytics & Data
  { name: 'BarChart3', component: BarChart3, category: 'Analytics & Data', tags: ['chart', 'statistics', 'graph'] },
  { name: 'TrendingUp', component: TrendingUp, category: 'Analytics & Data', tags: ['growth', 'stats', 'rise'] },
  { name: 'PieChart', component: PieChart, category: 'Analytics & Data', tags: ['percentage', 'distribution'] },
  { name: 'Activity', component: Activity, category: 'Analytics & Data', tags: ['pulse', 'monitor', 'health'] },
  { name: 'Kanban', component: Kanban, category: 'Analytics & Data', tags: ['columns', 'board', 'tasks'] },
  { name: 'Layers', component: Layers, category: 'Analytics & Data', tags: ['stack', 'shared', 'components'] },

  // Commerce & Finance
  { name: 'Ticket', component: Ticket, category: 'Finance', tags: ['voucher', 'coupon', 'pass'] },
  { name: 'CreditCard', component: CreditCard, category: 'Finance', tags: ['payment', 'bank', 'card'] },
  { name: 'Wallet', component: Wallet, category: 'Finance', tags: ['money', 'crypto', 'funds'] },
  { name: 'DollarSign', component: DollarSign, category: 'Finance', tags: ['currency', 'price', 'usd'] },
  { name: 'Percent', component: Percent, category: 'Finance', tags: ['discount', 'rate', 'tax'] },
  { name: 'ShoppingCart', component: ShoppingCart, category: 'Finance', tags: ['cart', 'order', 'store'] },
  { name: 'Package', component: Package, category: 'Finance', tags: ['box', 'product', 'delivery'] },
  { name: 'Tag', component: Tag, category: 'Finance', tags: ['price', 'label', 'badge'] },
  { name: 'Building', component: Building, category: 'Finance', tags: ['company', 'enterprise', 'office'] },

  // Time & System
  { name: 'Calendar', component: Calendar, category: 'System & Theme', tags: ['date', 'schedule', 'picker'] },
  { name: 'CalendarDays', component: CalendarDays, category: 'System & Theme', tags: ['month', 'agenda'] },
  { name: 'Clock', component: Clock, category: 'System & Theme', tags: ['time', 'duration', 'hour'] },
  { name: 'Palette', component: Palette, category: 'System & Theme', tags: ['theme', 'color', 'paint'] },
  { name: 'Sun', component: Sun, category: 'System & Theme', tags: ['light', 'brightness', 'day'] },
  { name: 'Moon', component: Moon, category: 'System & Theme', tags: ['dark', 'night', 'theme'] },
  { name: 'Settings', component: Settings, category: 'System & Theme', tags: ['gear', 'configure', 'preferences'] },
  { name: 'Sliders', component: Sliders, category: 'System & Theme', tags: ['controls', 'adjust'] },
  { name: 'User', component: User, category: 'System & Theme', tags: ['person', 'profile', 'account'] },
  { name: 'Users', component: Users, category: 'System & Theme', tags: ['team', 'group', 'audience'] },
  { name: 'Shield', component: Shield, category: 'System & Theme', tags: ['security', 'protect', 'auth'] },
  { name: 'Lock', component: Lock, category: 'System & Theme', tags: ['private', 'secure'] },
  { name: 'Unlock', component: Unlock, category: 'System & Theme', tags: ['public', 'open'] },
  { name: 'Key', component: Key, category: 'System & Theme', tags: ['access', 'token'] },
  { name: 'Globe', component: Globe, category: 'System & Theme', tags: ['world', 'web', 'internet'] },
  { name: 'Laptop', component: Laptop, category: 'System & Theme', tags: ['device', 'desktop', 'computer'] },
  { name: 'Smartphone', component: Smartphone, category: 'System & Theme', tags: ['mobile', 'phone'] },
  { name: 'Tablet', component: Tablet, category: 'System & Theme', tags: ['ipad', 'device'] },
  { name: 'ScanLine', component: ScanLine, category: 'System & Theme', tags: ['ocr', 'scanner', 'barcode'] },
]

export function LucideIconsPreview({ stateIndex = 0 }: { stateIndex?: number }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [iconSize, setIconSize] = useState<number>(20)
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null)

  const categories = ['All', 'Navigation', 'Actions', 'Communication', 'Content & Files', 'Analytics & Data', 'Finance', 'System & Theme']

  const filteredIcons = useMemo(() => {
    return ALL_ICONS.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [search, selectedCategory])

  const handleCopy = (iconName: string) => {
    const snippet = `import { ${iconName} } from 'lucide-react'`
    navigator.clipboard.writeText(snippet)
    setCopiedIcon(iconName)
    toast.success(`Copied: ${snippet}`)
    setTimeout(() => setCopiedIcon(null), 2000)
  }

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-0 m-0 overflow-hidden font-sans select-none">
      {/* Top Header Bar */}
      <div className="flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none gap-3">
        <div className="flex min-w-0 items-center gap-3 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400 font-bold">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">Lucide Icons Gallery</p>
            <p className="truncate text-xs text-muted-foreground">
              Official icon set used across the application. Click any icon to copy its JSX component.
            </p>
          </div>
        </div>

        <HeaderActions />
      </div>

      {/* Control Bar: Search + Category Chips + Size Slider */}
      <div className="flex flex-col border-b border-border bg-muted/10 p-4 gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons by name or keywords (e.g. arrow, chat, cloud, edit)..."
              className="pl-9 h-9 text-xs bg-background border-border shadow-2xs"
            />
          </div>

          {/* Size Adjuster */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span className="text-xs text-muted-foreground font-medium">Size: {iconSize}px</span>
            <div className="w-28">
              <Slider
                value={[iconSize]}
                min={16}
                max={36}
                step={2}
                onValueChange={(val) => setIconSize(val[0])}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border',
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                  : 'bg-background border-border/70 text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Canvas */}
      <div className="relative h-full min-h-0 w-full flex-1 overflow-y-auto bg-background p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <strong className="text-foreground">{filteredIcons.length}</strong> icons
          </p>
          <span className="text-[11px] text-muted-foreground">Click card to copy import</span>
        </div>

        {filteredIcons.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto opacity-40 mb-2" />
            <p className="text-sm font-semibold text-foreground">No icons found for "{search}"</p>
            <p className="text-xs mt-1">Try another keyword or explore the categories above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredIcons.map((item) => {
              const IconComp = item.component
              const isCopied = copiedIcon === item.name

              return (
                <button
                  key={item.name}
                  onClick={() => handleCopy(item.name)}
                  className={cn(
                    'group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-sm text-center',
                    isCopied
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                      : 'border-border bg-card hover:border-indigo-400 dark:hover:border-indigo-700 hover:bg-muted/20 text-foreground'
                  )}
                >
                  <div className="h-10 flex items-center justify-center mb-2">
                    <IconComp size={iconSize} className="transition-transform group-hover:scale-110" />
                  </div>

                  <span className="text-[11px] font-semibold truncate w-full group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </span>

                  <span className="text-[9px] text-muted-foreground font-mono mt-0.5 opacity-60">
                    {item.category}
                  </span>

                  {isCopied && (
                    <div className="absolute inset-0 bg-emerald-600/90 text-white rounded-xl flex items-center justify-center gap-1 text-xs font-bold animate-in fade-in duration-100">
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default LucideIconsPreview
