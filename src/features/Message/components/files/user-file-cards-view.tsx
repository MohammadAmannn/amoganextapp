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
  Sparkles,
  Layers,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { StorageFileItem, UserFolder } from '../../services/user-storage-files.service'
import { useDownloadFile } from '@/components/DocumentViewer/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
            // Fallback icon if image fail to load
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
  const { downloadFile } = useDownloadFile()

  // Filter files by selected folder & search query
  const filteredFiles = useMemo(() => {
    let result = files

    // Folder filtering
    if (folder) {
      if (folder.category) {
        // Strict category match: pdf folder -> pdf files ONLY, doc folder -> doc files ONLY, img folder -> img files ONLY
        result = result.filter((f) => f.category === folder.category)
      } else if (folder.id !== 'all' && folder.section) {
        result = result.filter(
          (f) => f.section.toLowerCase() === folder.section.toLowerCase()
        )
      }
    }

    // Search filtering
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (f) =>
          f.fileName.toLowerCase().includes(q) ||
          f.folderPath.toLowerCase().includes(q) ||
          (f.senderName && f.senderName.toLowerCase().includes(q))
      )
    }

    return result
  }, [files, folder, search])

  if (!folder || !folder.category) {
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

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      {/* Top Header Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 shadow-2xs gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBack && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              className="h-8 w-8 rounded-full md:hidden hover:bg-muted shrink-0"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/50 bg-indigo-500/10 text-indigo-600 dark:border-indigo-900/40 dark:text-indigo-400">
            <FolderOpen className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {folderTitle}
              </h2>
              <Badge variant="outline" className="h-5 px-1.5 py-0 text-[10px] font-semibold text-muted-foreground">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {folder ? `Storage folder: ${folder.path}` : 'Current user storage space'}
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-44 sm:w-56 shrink-0">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-lg border-border bg-muted/20 pr-7 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Files Cards Grid (Horizontally Aligned Cards) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-background">
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
        ) : (
          /* Horizontal Alignment Container */
          <div className="flex flex-row flex-wrap items-start justify-start gap-4 sm:gap-5 w-full">
            {filteredFiles.map((file) => {
              const categoryColor = getFileCategoryColor(file.category)

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFileForPreview(file)}
                  className="group relative flex w-[230px] sm:w-[260px] flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs hover:shadow-md hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all duration-200 cursor-pointer select-none"
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
                  <div className="my-2.5 h-px w-full bg-border/60" />

                  {/* Card Action Footer: Eye Icon (Preview) & Download Icon (Download) */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {/* Left: Eye Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectFileForPreview(file)
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer border border-indigo-200/30 dark:border-indigo-900/30"
                      title="Preview file"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>

                    {/* Right: Download Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadFile(file.fileUrl, file.fileName)
                      }}
                      className="flex items-center justify-center h-7 w-7 rounded-md bg-muted/60 text-muted-foreground hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer border border-border/50"
                      title="Download file"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
