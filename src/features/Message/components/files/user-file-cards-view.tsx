'use client'

import React, { useState, useMemo } from 'react'
import {
  Eye,
  Download,
  FileText,
  Image as ImageIcon,
  Film,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Search,
  X,
  FolderOpen,
  ArrowLeft,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  MoreHorizontal,
  ArrowLeftRight,
  Copy,
  Trash2,
  Check,
  Pencil,
  Share2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { StorageFileItem, UserFolder } from '../../services/user-storage-files.service'
import { HeaderActions } from '../chat/header-actions'
import { useDownloadFile } from '@/components/DocumentViewer/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UserFileCardsViewProps {
  folder: UserFolder | null
  files: StorageFileItem[]
  onSelectFileForPreview: (file: StorageFileItem) => void
  onBack?: () => void
}

function getFileCategoryColor(category: string): { bg: string; text: string; border: string; gradient: string } {
  switch (category) {
    case 'Pdf':
      return {
        bg: 'bg-red-500/10 dark:bg-red-950/40',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200/40 dark:border-red-900/40',
        gradient: 'from-red-500/20 to-orange-500/10',
      }
    case 'Doc':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200/40 dark:border-blue-900/40',
        gradient: 'from-blue-500/20 to-indigo-500/10',
      }
    case 'Xls':
    case 'Csv':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200/40 dark:border-emerald-900/40',
        gradient: 'from-emerald-500/20 to-teal-500/10',
      }
    case 'Images':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/40',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200/40 dark:border-amber-900/40',
        gradient: 'from-amber-500/20 to-yellow-500/10',
      }
    case 'Videos':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-950/40',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200/40 dark:border-purple-900/40',
        gradient: 'from-purple-500/20 to-pink-500/10',
      }
    case 'Zip':
      return {
        bg: 'bg-orange-500/10 dark:bg-orange-950/40',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200/40 dark:border-orange-900/40',
        gradient: 'from-orange-500/20 to-amber-500/10',
      }
    default:
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200/40 dark:border-indigo-900/40',
        gradient: 'from-indigo-500/20 to-purple-500/10',
      }
  }
}

function renderFileIcon(category: string, url: string, name: string) {
  const isImage = category === 'Images' || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(name)

  if (isImage && url) {
    return (
      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-muted/30 border border-border/50 group-hover:border-indigo-400/40 transition-colors">
        <img
          src={url}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
          <Badge className="bg-background/90 text-foreground text-[9px] font-bold backdrop-blur-xs">
            IMAGE
          </Badge>
        </div>
      </div>
    )
  }

  const colors = getFileCategoryColor(category)

  return (
    <div
      className={cn(
        'relative h-28 w-full rounded-lg border flex flex-col items-center justify-center gap-2 bg-gradient-to-br transition-all shadow-2xs',
        colors.border,
        colors.gradient,
        colors.bg
      )}
    >
      {category === 'Pdf' ? (
        <FileText className={cn('h-10 w-10', colors.text)} />
      ) : category === 'Doc' ? (
        <FileText className={cn('h-10 w-10', colors.text)} />
      ) : category === 'Xls' || category === 'Csv' ? (
        <FileSpreadsheet className={cn('h-10 w-10', colors.text)} />
      ) : category === 'Videos' ? (
        <Film className={cn('h-10 w-10', colors.text)} />
      ) : category === 'Zip' ? (
        <FileArchive className={cn('h-10 w-10', colors.text)} />
      ) : (
        <FileCode className={cn('h-10 w-10', colors.text)} />
      )}
      <Badge className={cn('h-4 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide border', colors.border, colors.bg, colors.text)}>
        {category}
      </Badge>
    </div>
  )
}

export function UserFileCardsView({
  folder,
  files,
  onSelectFileForPreview,
  onBack,
}: UserFileCardsViewProps) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-desc'>('newest')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isLtr, setIsLtr] = useState<boolean>(true)

  const { downloadFile } = useDownloadFile()

  // Filter & sort files
  const filteredFiles = useMemo(() => {
    let result = files

    // Folder filtering
    if (folder) {
      if (folder.category) {
        result = result.filter((f) => f.category === folder.category)
      } else if (folder.path && folder.path !== 'Chat' && folder.path !== 'Files') {
        const folderPathLower = folder.path.toLowerCase()
        const userPart = folder.name.toLowerCase()
        result = result.filter(
          (f) =>
            f.folderPath.toLowerCase().includes(folderPathLower) ||
            f.folderPath.toLowerCase().includes(userPart) ||
            (f.senderName && f.senderName.toLowerCase().includes(userPart))
        )
      } else if (folder.id !== 'all' && folder.section) {
        result = result.filter(
          (f) => f.section.toLowerCase() === folder.section.toLowerCase()
        )
      }
    }

    // Category filter override from navbar
    if (filterCategory !== 'all') {
      result = result.filter((f) => f.category === filterCategory)
    }

    // Search filtering
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (f) =>
          f.fileName.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          f.folderPath.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.version && f.version.toLowerCase().includes(q)) ||
          (f.senderName && f.senderName.toLowerCase().includes(q))
      )
    }

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      } else if (sortBy === 'name-asc') {
        return a.fileName.localeCompare(b.fileName)
      } else if (sortBy === 'name-desc') {
        return b.fileName.localeCompare(a.fileName)
      } else if (sortBy === 'size-desc') {
        return (b.fileSize || 0) - (a.fileSize || 0)
      }
      return 0
    })

    return result
  }, [files, folder, search, filterCategory, sortBy])

  const [page, setPage] = useState(1)
  const pageSize = 20

  React.useEffect(() => {
    setPage(1)
  }, [search, filterCategory, sortBy, folder?.id])

  const total = filteredFiles.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const startRange = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endRange = Math.min(safePage * pageSize, total)

  const paginatedFiles = useMemo(() => {
    return filteredFiles.slice((safePage - 1) * pageSize, safePage * pageSize)
  }, [filteredFiles, safePage, pageSize])

  if (!folder) {
    return (
      <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center p-6 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200/50 bg-indigo-500/10 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 mb-4 shadow-sm">
          <FolderOpen className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">
          Select a category folder to view files
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Click a specific file category folder (Images, Pdf, Doc, Xls, Videos, etc.) from the sidebar to view its files.
        </p>
      </div>
    )
  }

  const folderTitle = folder ? folder.name : 'All Files'

  const copyFileLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('File link copied to clipboard!')
  }

  const handleShareFile = (file: StorageFileItem) => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: file.fileName,
          url: file.fileUrl,
        })
        .catch(() => {
          navigator.clipboard.writeText(file.fileUrl)
          toast.success('Share link copied to clipboard!')
        })
    } else {
      navigator.clipboard.writeText(file.fileUrl)
      toast.success('Share link copied to clipboard!')
    }
  }

  return (
    <div className={cn("flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background", !isLtr && "dir-rtl")}>
      {/* 1. Top Header Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card px-4 py-2.5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-indigo-200/50 bg-indigo-500/10 text-indigo-600 dark:border-indigo-900/40 dark:text-indigo-400">
            <FolderOpen className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {folderTitle}
              </h2>
              <Badge variant="outline" className="h-4.5 px-1.5 py-0 text-[10px] font-semibold text-muted-foreground">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {folder ? `Storage folder: ${folder.path}` : 'Current user storage space'}
            </p>
          </div>
        </div>

        {/* Action Header Tools on Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <HeaderActions
            onClose={onBack}
            onDownload={() => {
              if (filteredFiles.length > 0) {
                downloadFile(filteredFiles[0].fileUrl, filteredFiles[0].fileName)
              } else {
                toast.info('No files to download in this folder')
              }
            }}
            onShare={() => toast.success('Folder link copied to clipboard!')}
          />
        </div>
      </div>

      {/* 2. Action Toolbar Navbar: LTR, FILTER, SORT, SHORT, VIEW Dropdown Menu (No bottom border, reduced space) */}
      <div className="flex shrink-0 items-center justify-between px-4 sm:px-6 pt-2.5 pb-1 gap-2 flex-wrap text-xs select-none">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* LTR Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLtr(!isLtr)}
            className="h-7.5 px-2.5 text-xs font-semibold gap-1.5 border-border/70 bg-background hover:bg-muted"
            title="Toggle Text Direction (LTR / RTL)"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">LTR</span>
          </Button>

          {/* FILTER Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7.5 px-2.5 text-xs font-semibold gap-1.5 border-border/70 bg-background hover:bg-muted"
              >
                <Filter className="h-3.5 w-3.5 text-indigo-500" />
                <span>FILTER</span>
                {filterCategory !== 'all' && (
                  <Badge className="h-4 px-1 text-[9px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    {filterCategory}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Filter Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterCategory('all')} className="justify-between text-xs">
                <span>All Formats</span>
                {filterCategory === 'all' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory('Images')} className="justify-between text-xs">
                <span>🖼️ Images</span>
                {filterCategory === 'Images' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory('Pdf')} className="justify-between text-xs">
                <span>📄 PDF</span>
                {filterCategory === 'Pdf' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory('Doc')} className="justify-between text-xs">
                <span>📝 Word Doc</span>
                {filterCategory === 'Doc' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory('Xls')} className="justify-between text-xs">
                <span>📊 Excel</span>
                {filterCategory === 'Xls' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory('Videos')} className="justify-between text-xs">
                <span>🎬 Videos</span>
                {filterCategory === 'Videos' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SORT Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7.5 px-2.5 text-xs font-semibold gap-1.5 border-border/70 bg-background hover:bg-muted"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-indigo-500" />
                <span>SORT</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('newest')} className="justify-between text-xs">
                <span>Date: Newest First</span>
                {sortBy === 'newest' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')} className="justify-between text-xs">
                <span>Date: Oldest First</span>
                {sortBy === 'oldest' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name-asc')} className="justify-between text-xs">
                <span>Name: A to Z</span>
                {sortBy === 'name-asc' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name-desc')} className="justify-between text-xs">
                <span>Name: Z to A</span>
                {sortBy === 'name-desc' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('size-desc')} className="justify-between text-xs">
                <span>Size: Largest First</span>
                {sortBy === 'size-desc' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SHORT Quick Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('')
              setFilterCategory('all')
              setSortBy('newest')
              toast.info('Filters reset to default')
            }}
            className="h-7.5 px-2.5 text-xs font-semibold gap-1.5 border-border/70 bg-background hover:bg-muted"
            title="Reset Search and Filters"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
            <span>SHORT</span>
          </Button>
        </div>

        {/* VIEW Dropdown Menu (Card vs Table) */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-7.5 px-3 text-xs font-bold gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
              >
                {viewMode === 'card' ? (
                  <>
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>VIEW: CARD</span>
                  </>
                ) : (
                  <>
                    <TableIcon className="h-3.5 w-3.5" />
                    <span>VIEW: TABLE</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Select View</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setViewMode('card')} className="justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-indigo-600" />
                  <span>Card View</span>
                </div>
                {viewMode === 'card' && <Check className="h-4 w-4 text-indigo-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('table')} className="justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-indigo-600" />
                  <span>Table View</span>
                </div>
                {viewMode === 'table' && <Check className="h-4 w-4 text-indigo-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 3. Search Bar (Clean styling, no harsh lines or unnecessary padding) */}
      <div className="shrink-0 px-4 sm:px-6 py-1">
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search files by name, format, or sender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8.5 w-full rounded-xl border-border/70 bg-background/80 pr-9 pl-9 text-xs sm:text-sm shadow-2xs focus-visible:ring-1 focus-visible:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Pagination & Total Files Sub-bar (Directly below search bar) */}
      {total > 0 && (
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-6 py-1 text-xs text-muted-foreground select-none">
          <span className="text-[11px] font-medium text-muted-foreground/70">
            {total} {total === 1 ? 'file' : 'files'}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-medium text-muted-foreground/80 whitespace-nowrap">
              {startRange}–{endRange} of {total}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Files Container (Card View vs Table View) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 bg-background">
        {filteredFiles.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mb-3">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No files in this folder</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              {search
                ? `No files matching "${search}" found in ${folderTitle}.`
                : `Upload documents or share attachments in Chat to populate ${folderTitle}.`}
            </p>
          </div>
        ) : viewMode === 'card' ? (
          /* CARD VIEW: Responsive Grid Container */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full">
            {paginatedFiles.map((file) => {
              const categoryColor = getFileCategoryColor(file.category)

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFileForPreview(file)}
                  className="group relative flex w-full flex-col justify-between rounded-xl border border-border/80 bg-card p-3 shadow-2xs hover:shadow-md hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all duration-200 cursor-pointer select-none"
                >
                  {/* File Visual Header / Icon Thumbnail */}
                  <div className="mb-3 w-full">
                    {renderFileIcon(file.category, file.fileUrl, file.fileName)}
                  </div>

                  {/* File Details */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4
                      className="text-xs font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="truncate font-medium">
                        {file.folderPath}
                      </span>
                      {file.updatedAt && (
                        <span className="shrink-0 opacity-80">
                          {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-2 h-px w-full bg-border/60" />

                  {/* Card Action Footer: Eye Icon (Preview) & Download Icon (Download next to Preview), Right 3-Dot Menu (Edit, View, Share) */}
                  <div className="flex items-center justify-between gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                    {/* Left: Preview + Download Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Eye Preview Button */}
                      <button
                        type="button"
                        onClick={() => onSelectFileForPreview(file)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer border border-indigo-200/30 dark:border-indigo-900/30"
                        title="Preview file"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </button>

                      {/* Download Button (Next to Preview) */}
                      <button
                        type="button"
                        onClick={() => downloadFile(file.fileUrl, file.fileName)}
                        className="flex items-center justify-center h-6.5 w-6.5 rounded-md bg-muted/60 text-muted-foreground hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer border border-border/50"
                        title="Download file"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Right: 3-Dot Options Menu (Edit, View, Share) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center h-6.5 w-6.5 rounded-md bg-muted/60 text-muted-foreground hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer border border-border/50"
                          title="More options"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={() => {
                            onSelectFileForPreview(file)
                            toast.info(`Editing ${file.fileName}`)
                          }}
                          className="gap-2 text-xs cursor-pointer font-medium"
                        >
                          <Pencil className="h-3.5 w-3.5 text-amber-500" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onSelectFileForPreview(file)}
                          className="gap-2 text-xs cursor-pointer font-medium"
                        >
                          <Eye className="h-3.5 w-3.5 text-indigo-500" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShareFile(file)}
                          className="gap-2 text-xs cursor-pointer font-medium"
                        >
                          <Share2 className="h-3.5 w-3.5 text-blue-500" />
                          <span>Share</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* TABLE VIEW: Tablecn Data Grid Table */
          <div className="w-full max-w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
            <div className="w-full overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    <th className="px-4 py-3 font-semibold">File Id (UUID)</th>
                    <th className="px-4 py-3 font-semibold">File Name</th>
                    <th className="px-4 py-3 font-semibold">Main Folder Name</th>
                    <th className="px-4 py-3 font-semibold">Sub Folder Name</th>
                    <th className="px-4 py-3 font-semibold">Version No</th>
                    <th className="px-4 py-3 font-semibold">Date & Time Stamp</th>
                    <th className="px-4 py-3 font-semibold">User Name</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedFiles.map((file) => {
                    const fileUuid = file.id
                    const displayUuid = fileUuid.length > 16 ? `${fileUuid.slice(0, 8)}...${fileUuid.slice(-4)}` : fileUuid
                    const mainFolder = file.section || 'Chat'
                    const subFolder = file.category || 'Other'
                    const versionStr = file.version || 'v1.0'
                    const formattedDate = file.updatedAt
                      ? format(new Date(file.updatedAt), 'MMM dd, yyyy hh:mm a')
                      : 'N/A'
                    const userName = file.senderName || 'Aman'

                    return (
                      <tr
                        key={file.id}
                        onClick={() => onSelectFileForPreview(file)}
                        className="group transition-colors hover:bg-indigo-500/5 cursor-pointer"
                      >
                        {/* 1. File Id (Real UUID) */}
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold text-muted-foreground" title={`Click to copy UUID: ${fileUuid}`}>
                          <Badge
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(fileUuid)
                              toast.success('File UUID copied to clipboard!')
                            }}
                            className="h-5 px-1.5 text-[10px] font-mono border-border/70 cursor-pointer hover:bg-muted"
                          >
                            {displayUuid}
                          </Badge>
                        </td>

                        {/* 2. File Name */}
                        <td className="px-4 py-3 font-bold text-foreground">
                          <div className="flex items-center gap-2.5 min-w-0 max-w-[240px]">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-200/40 bg-indigo-500/10 text-indigo-600 dark:border-indigo-900/40 dark:text-indigo-400">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={file.fileName}>
                              {file.fileName}
                            </span>
                          </div>
                        </td>

                        {/* 3. Main Folder Name */}
                        <td className="px-4 py-3 font-semibold text-foreground/80">
                          <Badge className="bg-muted text-foreground text-[10px] font-bold border-border/60">
                            📁 {mainFolder}
                          </Badge>
                        </td>

                        {/* 4. Sub Folder Name */}
                        <td className="px-4 py-3 font-semibold text-foreground/80">
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            📂 {subFolder}
                          </Badge>
                        </td>

                        {/* 5. Version No */}
                        <td className="px-4 py-3 font-semibold text-foreground/80">
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-mono font-bold border-indigo-200/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {versionStr}
                          </Badge>
                        </td>

                        {/* 6. Date & Time Stamp */}
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* 7. User Name */}
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-2xs">
                              {userName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate">{userName}</span>
                          </div>
                        </td>

                        {/* 7. 3-Dot Actions Menu (...) */}
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => onSelectFileForPreview(file)}
                                className="gap-2 text-xs cursor-pointer font-medium"
                              >
                                <Eye className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Preview</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => downloadFile(file.fileUrl, file.fileName)}
                                className="gap-2 text-xs cursor-pointer font-medium"
                              >
                                <Download className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Download</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShareFile(file)}
                                className="gap-2 text-xs cursor-pointer font-medium"
                              >
                                <Share2 className="h-3.5 w-3.5 text-blue-500" />
                                <span>Share</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => toast.info('File removed from local list')}
                                className="gap-2 text-xs cursor-pointer font-medium text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
