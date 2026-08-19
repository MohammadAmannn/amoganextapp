'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Copy,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  X,
  Menu,
  ChevronRight,
  Code2,
  Eye,
  Layers,
  Tag,
  LayoutGrid,
  Calendar,
  Mail,
  MessageSquare,
  Sparkles,
  Bell,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { AppLogo } from '@/components/layout/app-logo'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { galleryRegistry, GALLERY_CATEGORIES, GalleryCategory, GalleryEntry } from './registry'

// ─── Viewport config ─────────────────────────────────────────────────────────
type Viewport = 'desktop' | 'tablet' | 'mobile'
const VIEWPORT_WIDTHS: Record<Viewport, number | null> = {
  desktop: null,
  tablet: 768,
  mobile: 375,
}

// ─── Category badge colors (shadcn design tokens) ────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Mail: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50 dark:border-indigo-900/40 dark:text-indigo-400',
  AI: 'bg-amber-500/10 text-amber-600 border-amber-200/50 dark:border-amber-900/40 dark:text-amber-400',
  Chat: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-900/40 dark:text-emerald-400',
  Task: 'bg-purple-500/10 text-purple-600 border-purple-200/50 dark:border-purple-900/40 dark:text-purple-400',
  Files: 'bg-sky-500/10 text-sky-600 border-sky-200/50 dark:border-sky-900/40 dark:text-sky-400',
  Notifications: 'bg-rose-500/10 text-rose-600 border-rose-200/50 dark:border-rose-900/40 dark:text-rose-400',
  Shared: 'bg-slate-500/10 text-slate-600 border-slate-200/50 dark:border-slate-800 dark:text-slate-400',
}

// ─── Category icons & styles matching Message Page CategoryToolbar ────────────
const CATEGORY_CONFIG: Record<
  GalleryCategory,
  {
    icon: React.ComponentType<{ className?: string }>
    activeClass: string
    badgeClass: string
  }
> = {
  All: {
    icon: LayoutGrid,
    activeClass:
      'bg-primary/15 text-primary border-primary/30 font-semibold shadow-2xs',
    badgeClass: 'bg-primary/20 text-primary',
  },
  Task: {
    icon: Calendar,
    activeClass:
      'bg-purple-500/15 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-300/60 dark:border-purple-800/40 font-semibold shadow-2xs',
    badgeClass: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  },
  Mail: {
    icon: Mail,
    activeClass:
      'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-300/60 dark:border-indigo-800/40 font-semibold shadow-2xs',
    badgeClass: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  },
  Chat: {
    icon: MessageSquare,
    activeClass:
      'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300/60 dark:border-emerald-800/40 font-semibold shadow-2xs',
    badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  },
  AI: {
    icon: Sparkles,
    activeClass:
      'bg-violet-500/15 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border-violet-300/60 dark:border-violet-800/40 font-semibold shadow-2xs',
    badgeClass: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
  },
  Notifications: {
    icon: Bell,
    activeClass:
      'bg-rose-500/15 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-300/60 dark:border-rose-800/40 font-semibold shadow-2xs',
    badgeClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
  },
  Files: {
    icon: FileText,
    activeClass:
      'bg-sky-500/15 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-300/60 dark:border-sky-800/40 font-semibold shadow-2xs',
    badgeClass: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  },
  Shared: {
    icon: Layers,
    activeClass:
      'bg-slate-500/15 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold shadow-2xs',
    badgeClass: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
  },
}

// ─── Count per category ───────────────────────────────────────────────────────
function getCategoryCount(cat: GalleryCategory) {
  if (cat === 'All') return galleryRegistry.length
  return galleryRegistry.filter((c) => c.category === cat).length
}

export function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<GalleryEntry | null>(
    galleryRegistry[0] || null
  )
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [stateIndex, setStateIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [copiedPath, setCopiedPath] = useState(false)
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Filter components
  const filteredComponents = useMemo(() => {
    return galleryRegistry.filter((entry) => {
      const matchesCategory =
        activeCategory === 'All' || entry.category === activeCategory
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  // Reset state index when entry changes
  const handleSelectEntry = (entry: GalleryEntry) => {
    setSelectedEntry(entry)
    setStateIndex(0)
    setActiveTab('preview')
    setIsMobileDetailOpen(true)
  }

  const handleCopyCode = () => {
    if (!selectedEntry) return
    const code = selectedEntry.usageCode(stateIndex)
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleCopyPath = () => {
    if (!selectedEntry) return
    navigator.clipboard.writeText(selectedEntry.filePath).then(() => {
      setCopiedPath(true)
      toast.success('File path copied!')
      setTimeout(() => setCopiedPath(false), 2000)
    })
  }

  const previewWidth = selectedEntry ? VIEWPORT_WIDTHS[viewport] : null

  return (
    <div className='flex h-svh w-full flex-col overflow-hidden bg-background text-foreground font-sans antialiased select-none'>
      {/* ── DUAL PANE WORKSPACE (2-Column full height layout matching Message page) ── */}
      <div className='flex flex-1 min-h-0 w-full overflow-hidden relative'>
        {/* ── LEFT COMPONENT NAVIGATOR SIDEBAR (Visible by default on mobile) ──── */}
        <aside
          className={cn(
            'flex h-full shrink-0 flex-col border-r border-border bg-card/95 backdrop-blur-md overflow-hidden transition-all duration-200',
            'w-full md:w-72 sm:w-80',
            isMobileDetailOpen ? 'hidden md:flex' : 'flex',
            isFullscreen && 'hidden md:hidden'
          )}
        >
          {/* Top Left Sidebar Header: AppLogo (mobile) + Design System title + Search & Bell icons */}
          <div className='flex h-12 shrink-0 items-center justify-between px-3.5 border-b border-border/60 bg-background'>
            <div className='flex items-center gap-2 min-w-0'>
              <AppLogo className='shrink-0 md:hidden' />
              <h1 className='text-base font-bold text-foreground tracking-tight truncate'>
                Design System
              </h1>
            </div>
            <div className='flex items-center gap-1 shrink-0'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer'
                onClick={() => {
                  const input = document.getElementById('gallery-search-input')
                  input?.focus()
                }}
                title='Search components'
              >
                <Search className='h-4 w-4' />
              </Button>

              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer relative'
                onClick={() => toast.info('Notifications')}
                title='Notifications'
              >
                <Bell className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className='p-3 border-b border-border/60'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60' />
              <Input
                id='gallery-search-input'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setActiveCategory('All')
                }}
                placeholder='Search components, files...'
                className='h-9 pl-8 text-sm bg-background/80 border-border/80 focus-visible:ring-1 focus-visible:ring-primary'
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={() => setSearchQuery('')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground p-0.5'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs (Multi-line Wrap — All Visible with Real Icons) */}
          <div className='p-2.5 border-b border-border/60 bg-muted/10'>
            <div className='flex flex-wrap items-center gap-1.5'>
              {GALLERY_CATEGORIES.map((cat) => {
                const count = getCategoryCount(cat)
                if (count === 0 && cat !== 'All') return null
                const isActive = activeCategory === cat
                const config = CATEGORY_CONFIG[cat]
                const IconComponent = config?.icon || LayoutGrid

                return (
                  <button
                    key={cat}
                    type='button'
                    onClick={() => {
                      setActiveCategory(cat)
                      setSearchQuery('')
                      const firstMatch =
                        cat === 'All'
                          ? galleryRegistry[0]
                          : galleryRegistry.find((c) => c.category === cat)
                      if (firstMatch) {
                        setSelectedEntry(firstMatch)
                        setStateIndex(0)
                        setActiveTab('preview')
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer select-none border',
                      isActive
                        ? config?.activeClass ||
                            'bg-primary text-primary-foreground border-primary font-semibold shadow-2xs'
                        : 'border-border/50 bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-95'
                    )}
                  >
                    <IconComponent className='h-3.5 w-3.5 shrink-0' />
                    <span>{cat}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0 text-[10px] font-mono',
                        isActive
                          ? config?.badgeClass ||
                              'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Component List */}
          <div className='flex-1 min-h-0 overflow-y-auto p-2 space-y-1 scrollbar-thin'>
            {filteredComponents.length === 0 ? (
              <div className='py-12 px-4 text-center'>
                <p className='text-xs text-muted-foreground'>
                  No components matching "{searchQuery}"
                </p>
                <button
                  type='button'
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('All')
                  }}
                  className='mt-2 text-xs text-primary underline underline-offset-2 cursor-pointer'
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredComponents.map((entry) => {
                const isSelected = selectedEntry?.id === entry.id
                return (
                  <button
                    key={entry.id}
                    type='button'
                    onClick={() => handleSelectEntry(entry)}
                    className={cn(
                      'group relative flex w-full cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-left transition-all duration-150 select-none border',
                      isSelected
                        ? 'border-primary/20 bg-primary/10 text-primary shadow-2xs'
                        : 'border-transparent text-foreground/80 hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    {isSelected && (
                      <div className='absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-primary' />
                    )}

                    <div className='flex items-center justify-between gap-2 min-w-0'>
                      <span
                        className={cn(
                          'truncate text-sm leading-snug',
                          isSelected ? 'font-semibold text-primary' : 'font-medium text-foreground'
                        )}
                      >
                        {entry.name}
                      </span>
                      <Badge
                        variant='outline'
                        className={cn(
                          'h-4 shrink-0 px-1.5 text-[9px] font-medium uppercase border tracking-wider',
                          CATEGORY_COLORS[entry.category] || ''
                        )}
                      >
                        {entry.category}
                      </Badge>
                    </div>

                    <p className='line-clamp-1 text-xs text-muted-foreground font-normal'>
                      {entry.filePath.split('/').pop()}
                    </p>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer note */}
          <div className='border-t border-border/60 bg-muted/20 px-3 py-2 text-center'>
            <p className='text-[10px] text-muted-foreground font-mono'>
              shadcn/ui • TailwindCSS • React 19
            </p>
          </div>
        </aside>

        {/* ── MAIN STAGE INSPECTOR (Full View on mobile when selected) ────────── */}
        <main
          className={cn(
            'flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background',
            !isMobileDetailOpen ? 'hidden md:flex' : 'flex flex-col fixed inset-0 z-50 md:relative md:inset-auto md:z-auto',
            isFullscreen && 'fixed inset-0 z-50 flex flex-col w-full h-full bg-background md:fixed md:inset-0 md:z-50'
          )}
        >
          {selectedEntry ? (
            <>
              {/* Responsive Stage Control Bar */}
              <div className='flex shrink-0 flex-col border-b border-border bg-background select-none'>
                {/* Main Header Row */}
                <div className='flex h-12 items-center justify-between px-3 sm:px-4 gap-2 min-w-0'>
                  {/* Left: Cross button (on mobile) + Component Name & Badge */}
                  <div className='flex items-center gap-2 min-w-0'>
                    <button
                      type='button'
                      onClick={() => setIsMobileDetailOpen(false)}
                      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-foreground hover:bg-muted cursor-pointer transition-colors md:hidden'
                      title='Close & Back to List'
                      aria-label='Close detail view'
                    >
                      <X className='h-4.5 w-4.5' />
                    </button>

                    <span className='text-sm font-semibold text-foreground truncate'>
                      {selectedEntry.name}
                    </span>

                    <Badge
                      variant='outline'
                      className={cn(
                        'text-[10px] font-semibold h-4.5 px-1.5 border shrink-0',
                        CATEGORY_COLORS[selectedEntry.category] || ''
                      )}
                    >
                      {selectedEntry.category}
                    </Badge>
                  </div>

                  {/* Right: Controls (Preview/Code + Fullscreen + Copy Snippet) */}
                  <div className='flex items-center gap-1.5 shrink-0'>
                    {/* Fullscreen Toggle Button */}
                    <button
                      type='button'
                      onClick={() => {
                        setIsFullscreen((prev) => !prev)
                        toast.info(isFullscreen ? 'Exited Fullscreen View' : 'Full Screen View Enabled')
                      }}
                      title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Open Fullscreen View'}
                      className={cn(
                        'flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium transition-all cursor-pointer select-none shadow-2xs hover:bg-background hover:text-foreground',
                        isFullscreen && 'bg-primary/10 text-primary border-primary/30 font-semibold'
                      )}
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className='h-3.5 w-3.5 text-primary' />
                          <span className='hidden sm:inline'>Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className='h-3.5 w-3.5 text-muted-foreground' />
                          <span className='hidden sm:inline'>Fullscreen</span>
                        </>
                      )}
                    </button>

                    {/* Preview / Code Tab Switcher */}
                    <div className='flex rounded-md border border-border bg-muted/40 p-0.5 shadow-2xs'>
                      <button
                        type='button'
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                          'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-all cursor-pointer select-none',
                          activeTab === 'preview'
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Eye className='h-3 w-3' />
                        <span className='hidden sm:inline'>Preview</span>
                      </button>
                      <button
                        type='button'
                        onClick={() => setActiveTab('code')}
                        className={cn(
                          'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-all cursor-pointer select-none',
                          activeTab === 'code'
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Code2 className='h-3 w-3' />
                        <span className='hidden sm:inline'>Code</span>
                      </button>
                    </div>

                    {/* Responsive Viewport Switcher */}
                    {activeTab === 'preview' && (
                      <div className='hidden sm:flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5 shadow-2xs'>
                        {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((vp) => {
                          const Icon =
                            vp === 'desktop'
                              ? Monitor
                              : vp === 'tablet'
                              ? Tablet
                              : Smartphone
                          const isVpActive = viewport === vp
                          return (
                            <button
                              key={vp}
                              type='button'
                              onClick={() => setViewport(vp)}
                              title={`${
                                vp.charAt(0).toUpperCase() + vp.slice(1)
                              } viewport (${
                                VIEWPORT_WIDTHS[vp]
                                  ? `${VIEWPORT_WIDTHS[vp]}px`
                                  : 'Full width'
                              })`}
                              className={cn(
                                'flex items-center justify-center rounded p-1 transition-all cursor-pointer',
                                isVpActive
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              <Icon className='h-3 w-3' />
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Copy Snippet button */}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCopyCode}
                      className='h-7 px-2 gap-1 text-xs border-border/80 bg-background cursor-pointer hover:bg-muted shrink-0'
                    >
                      {copied ? (
                        <>
                          <Check className='h-3 w-3 text-emerald-500' />
                          <span className='text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] sm:text-xs'>
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className='h-3 w-3 text-muted-foreground' />
                          <span className='text-[11px] sm:text-xs'>Snippet</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* State selector sub-row if component has multiple states */}
                {selectedEntry.states.length > 1 && (
                  <div className='flex items-center gap-1.5 border-t border-border/50 bg-muted/20 px-3 py-1.5 overflow-x-auto scrollbar-none'>
                    <span className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground shrink-0 mr-0.5'>
                      State:
                    </span>
                    {selectedEntry.states.map((state, idx) => (
                      <button
                        key={idx}
                        type='button'
                        onClick={() => setStateIndex(idx)}
                        title={state.description}
                        className={cn(
                          'rounded-md px-2 py-0.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap select-none border shrink-0',
                          stateIndex === idx
                            ? 'border-primary/40 bg-primary/10 text-primary font-semibold shadow-2xs'
                            : 'border-border/50 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Canvas */}
              <div className='min-h-0 flex-1 overflow-auto bg-background'>
                {activeTab === 'preview' ? (
                  /* ── PREVIEW CANVAS ────────────────────────────────────────── */
                  previewWidth ? (
                    /* Tablet / Mobile Device Frame */
                    <div className='flex min-h-full h-full items-start justify-center bg-muted/10 p-2 sm:p-6 overflow-auto'>
                      <div
                        className='w-full max-w-full mx-auto transition-all duration-300 rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden flex flex-col flex-1 min-h-[480px]'
                        style={{ maxWidth: previewWidth }}
                      >
                        {/* Device frame header indicator */}
                        <div className='flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-1.5 shrink-0'>
                          <div className='flex items-center gap-1.5'>
                            <span className='h-2 w-2 rounded-full bg-border' />
                            <span className='h-2 w-2 rounded-full bg-border' />
                            <span className='h-2 w-2 rounded-full bg-border' />
                          </div>
                          <span className='text-[10px] text-muted-foreground font-mono font-medium'>
                            {viewport.toUpperCase()} • {previewWidth}px
                          </span>
                          <span className='text-[10px] text-muted-foreground/60 font-mono hidden sm:inline'>
                            Responsive View
                          </span>
                        </div>

                        {/* Live Component Render inside device frame */}
                        <div className='flex flex-1 h-full w-full max-w-full items-start justify-start p-3 sm:p-4 overflow-auto'>
                          {selectedEntry.renderPreview(stateIndex)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Desktop Full-View: Clean, Borderless, Natural Page Flow */
                    <div className='flex h-full w-full max-w-full flex-col items-start justify-start overflow-auto p-3 sm:p-4'>
                      {selectedEntry.renderPreview(stateIndex)}
                    </div>
                  )
                ) : (
                  /* ── CODE VIEW ─────────────────────────────────────────────── */
                  <div className='p-2.5 sm:p-6 bg-muted/10 min-h-full overflow-x-auto'>
                    <div className='mx-auto w-full max-w-4xl space-y-3 sm:space-y-4'>
                      {/* Code block frame */}
                      <div className='rounded-xl border border-border bg-zinc-950 shadow-md overflow-hidden'>
                        {/* Code frame header */}
                        <div className='flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3 sm:px-4 py-2'>
                          <div className='flex items-center gap-2 min-w-0'>
                            <div className='flex gap-1.5 shrink-0'>
                              <span className='h-2.5 w-2.5 rounded-full bg-rose-500/80' />
                              <span className='h-2.5 w-2.5 rounded-full bg-amber-500/80' />
                              <span className='h-2.5 w-2.5 rounded-full bg-emerald-500/80' />
                            </div>
                            <span className='font-mono text-xs text-zinc-400 ml-1.5 truncate'>
                              {selectedEntry.name} — usage snippet
                            </span>
                          </div>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleCopyCode}
                            className='h-7 px-2 gap-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer shrink-0'
                          >
                            {copied ? (
                              <>
                                <Check className='h-3 w-3 text-emerald-400' />
                                <span className='text-emerald-400 text-[11px] sm:text-xs'>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className='h-3 w-3' />
                                <span className='text-[11px] sm:text-xs'>Copy</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Code container */}
                        <pre className='overflow-x-auto p-3 sm:p-5 text-xs font-mono text-zinc-100 leading-relaxed scrollbar-thin'>
                          <code>{selectedEntry.usageCode(stateIndex)}</code>
                        </pre>
                      </div>

                      {/* Metadata summary */}
                      <div className='rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs space-y-2.5'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                            Component Details & Path
                          </h3>
                          <Badge
                            variant='outline'
                            className={cn(
                              'text-[10px]',
                              CATEGORY_COLORS[selectedEntry.category] || ''
                            )}
                          >
                            {selectedEntry.category}
                          </Badge>
                        </div>

                        <p className='text-xs text-foreground/90 leading-relaxed'>
                          {selectedEntry.description}
                        </p>

                        <div className='flex items-center gap-2 pt-2 border-t border-border/60 flex-wrap min-w-0'>
                          <span className='text-xs text-muted-foreground shrink-0'>File Location:</span>
                          <code className='rounded bg-muted px-2 py-0.5 font-mono text-[11px] sm:text-xs text-foreground break-all max-w-full'>
                            {selectedEntry.filePath}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty state */
            <div className='flex h-full flex-col items-center justify-center gap-3 text-muted-foreground'>
              <Layers className='h-10 w-10 opacity-20' />
              <p className='text-sm font-medium'>
                Select a component from the sidebar to inspect
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

