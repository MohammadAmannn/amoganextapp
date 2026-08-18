import React from 'react'
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { UserFolder } from '../../services/user-storage-files.service'

interface FolderTreeItemProps {
  folder: UserFolder
  isFolderActive: boolean
  isExpanded: boolean
  onToggleExpand: (folderId: string, e?: React.MouseEvent) => void
  onSelectFolder: (folder: UserFolder) => void
}

export function FolderTreeItem({
  folder,
  isFolderActive,
  isExpanded,
  onToggleExpand,
  onSelectFolder,
}: FolderTreeItemProps) {
  const isLevel0 = folder.level === 0
  const isLevel1 = folder.level === 1
  const isLevel2 = folder.level === 2
  const hasChildren = isLevel0 || isLevel1

  return (
    <div
      id={`folder-card-${folder.id}`}
      onClick={() => {
        if (hasChildren) {
          onToggleExpand(folder.id)
        } else {
          onSelectFolder(folder)
        }
      }}
      className={cn(
        'group relative flex cursor-pointer items-center justify-between gap-2 rounded-xl py-1.5 px-2 transition-all duration-200 select-none border',
        isLevel0 && 'font-bold bg-muted/20 border-border/50 my-1',
        isLevel1 && 'ml-3 border-border/40 my-0.5',
        isLevel2 && 'ml-6 border-transparent hover:bg-muted/40 my-0.5',
        isFolderActive
          ? 'border-indigo-300 bg-indigo-500/15 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold shadow-2xs'
          : 'bg-card hover:bg-indigo-500/5 hover:border-indigo-200/40'
      )}
    >
      {isFolderActive && (
        <div className='absolute top-1 bottom-1 left-0 w-1 rounded-l-full bg-indigo-600' />
      )}
      <div className='flex items-center gap-1.5 min-w-0 flex-1'>
        {hasChildren && (
          <button
            type='button'
            onClick={(e) => onToggleExpand(folder.id, e)}
            className='flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
          >
            {isExpanded ? (
              <ChevronDown className='h-3 w-3' />
            ) : (
              <ChevronRight className='h-3 w-3' />
            )}
          </button>
        )}
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors',
            isLevel0
              ? 'h-6 w-6 border border-indigo-200/40 bg-indigo-500/10'
              : isLevel1
                ? 'h-5.5 w-5.5 border border-indigo-200/30 bg-indigo-500/5'
                : 'h-5 w-5'
          )}
        >
          <FolderOpen
            className={
              isLevel0
                ? 'h-3.5 w-3.5'
                : isLevel1
                  ? 'h-3 w-3'
                  : 'h-3 w-3 text-indigo-500'
            }
          />
        </div>
        <span
          className={cn(
            'truncate text-foreground',
            isLevel0
              ? 'text-xs font-bold'
              : isLevel1
                ? 'text-[11px] font-semibold'
                : 'text-[11px] font-medium',
            isFolderActive && 'text-indigo-600 dark:text-indigo-400'
          )}
        >
          {folder.name}
        </span>
      </div>

      <Badge
        variant={isFolderActive ? 'default' : 'secondary'}
        className={cn(
          'px-1.5 font-bold shrink-0',
          isLevel0 ? 'h-4 text-[9px]' : 'h-3.5 text-[8px]'
        )}
      >
        {folder.fileCount}
      </Badge>
    </div>
  )
}
