import React, { useState, useEffect } from 'react'
import { Folder, ChevronDown, ChevronRight, FileText, FolderOpen } from 'lucide-react'
import { RouteInfo } from '../data/routes-data'

interface RouteExplorerProps {
  routes: RouteInfo[]
  selectedRoute: RouteInfo | null
  onSelectRoute: (route: RouteInfo) => void
  searchQuery: string
}

export const RouteExplorer: React.FC<RouteExplorerProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  searchQuery,
}) => {
  // State to track expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  // Group routes by folder
  const folders = Array.from(new Set(routes.map((r) => r.folder)))

  // Automatically expand folders when search query is typed
  useEffect(() => {
    if (searchQuery.trim()) {
      const newExpanded: Record<string, boolean> = {}
      folders.forEach((folder) => {
        newExpanded[folder] = true
      })
      setExpandedFolders(newExpanded)
    }
  }, [searchQuery])

  // Initialize selected route's folder as expanded on mount
  useEffect(() => {
    if (selectedRoute) {
      setExpandedFolders((prev) => ({
        ...prev,
        [selectedRoute.folder]: true,
      }))
    }
  }, [])

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }))
  }

  return (
    <div className='flex flex-col h-full bg-background border-r border-border select-none overflow-hidden'>
      {/* Folder Tree Scrollable area */}
      <div className='flex-1 overflow-y-auto py-3 px-2 space-y-1.5 no-scrollbar'>
        {folders.map((folderName) => {
          const folderRoutes = routes.filter((r) => r.folder === folderName)
          if (folderRoutes.length === 0) return null

          const isExpanded = !!expandedFolders[folderName]

          return (
            <div key={folderName} className='space-y-0.5'>
              {/* Folder Toggle Row */}
              <button
                onClick={() => toggleFolder(folderName)}
                className='w-full flex items-center justify-between py-1.5 px-2 hover:bg-muted/65 rounded-lg text-xs font-semibold text-foreground/85 transition-colors group'
              >
                <div className='flex items-center gap-2'>
                  {isExpanded ? (
                    <FolderOpen className='h-4 w-4 text-muted-foreground/75 group-hover:text-primary transition-colors' />
                  ) : (
                    <Folder className='h-4 w-4 text-muted-foreground/75 group-hover:text-primary transition-colors' />
                  )}
                  <span className='capitalize font-medium'>{folderName}</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  {isExpanded ? (
                    <ChevronDown className='h-3.5 w-3.5 text-muted-foreground/60' />
                  ) : (
                    <ChevronRight className='h-3.5 w-3.5 text-muted-foreground/60' />
                  )}
                </div>
              </button>

              {/* Collapsible Routes List */}
              {isExpanded && (
                <div className='pl-4 border-l border-border/60 ml-3.5 mt-0.5 space-y-0.5'>
                  {folderRoutes.map((route) => {
                    const isSelected = selectedRoute?.path === route.path
                    return (
                      <button
                        key={route.path}
                        onClick={() => onSelectRoute(route)}
                        className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-md text-[11px] font-mono text-left transition-all duration-150 ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground/60'}`} />
                        <span className='truncate select-all'>{route.path}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {folders.length === 0 && (
          <div className='text-center py-8 text-xs text-muted-foreground'>
            No routes matching search.
          </div>
        )}
      </div>
    </div>
  )
}
