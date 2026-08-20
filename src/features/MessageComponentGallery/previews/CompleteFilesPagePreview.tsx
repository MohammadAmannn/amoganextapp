'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FolderOpen } from 'lucide-react'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SubTabsBar } from '@/features/Message/components/sidebar/sub-tabs-bar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { FolderTreeItem } from '@/features/Message/components/sidebar/folder-tree-item'
import { UserFileCardsView } from '@/features/Message/components/files/user-file-cards-view'
import { FileUploadForm } from '@/features/Message/components/files/file-upload-form'
import { mockFolders, mockStorageFiles } from '../mocks'
import { UserFolder } from '@/features/Message/services/user-storage-files.service'

interface PagePreviewProps {
  isMobileView?: boolean
}

export function CompleteFilesPagePreview({ isMobileView = false }: PagePreviewProps) {
  const [selectedFolder, setSelectedFolder] = useState<UserFolder>(mockFolders[1] || mockFolders[0])
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    Chat: true,
    'user-alex': true,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('file')
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const handleSelectFolder = (folder: UserFolder) => {
    setSelectedFolder(folder)
    setIsUploadingFile(false)
    setIsMobileDetailOpen(true)
  }

  return (
    <div className='flex h-full w-full overflow-hidden bg-background select-none relative'>
      {/* ── LEFT SIDEBAR (Hidden on mobile when detail is open) ─────────────────── */}
      <div
        className={cn(
          'flex h-full w-full md:w-80 shrink-0 flex-col border-r border-border bg-muted/10 overflow-hidden',
          isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        {/* Header */}
        <div className='p-3 border-b border-border/60'>
          <SidebarHeader
            onSelectEmailSettings={() => toast.info('Settings (preview only)')}
            onSelectNotification={() => toast.info('Notifications (preview only)')}
          />
        </div>

        {/* Category Toolbar (Files / Vouchers active) */}
        <div className='px-3 pt-2.5'>
          <CategoryToolbar
            categoryFilter='vouchers'
            onSelectTasks={() => toast.info('Switch to Tasks')}
            onSelectMail={() => toast.info('Switch to Mail')}
            onSelectChat={() => toast.info('Switch to Chat')}
            onSelectAi={() => toast.info('Switch to AI')}
            onSelectAiAssistant={() => toast.info('Switch to AI Assistant')}
            onSelectVouchers={() => {}}
          />
        </div>

        {/* Sub Tabs */}
        <div className='px-1 py-1'>
          <SubTabsBar
            categoryFilter='vouchers'
            activeTab={activeTab}
            total={mockStorageFiles.length}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        </div>

        {/* Search & Upload Button */}
        <div className='px-3 py-1'>
          <SidebarSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter='vouchers'
            sectionMode='mail'
            onUploadFileClick={() => {
              setIsUploadingFile(true)
              setIsMobileDetailOpen(true)
            }}
          />
        </div>

        {/* Section Label */}
        <div className='px-4 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
          <div className='flex items-center gap-1.5'>
            <FolderOpen className='h-3.5 w-3.5' />
            <span>Storage Explorer</span>
          </div>
          <span className='text-[10px] font-mono'>{mockFolders.length} Folders</span>
        </div>

        {/* Folders Tree List */}
        <div className='flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin'>
          {mockFolders.map((folder) => (
            <FolderTreeItem
              key={folder.id}
              folder={folder}
              isFolderActive={selectedFolder?.id === folder.id && !isUploadingFile}
              isExpanded={!!expandedFolders[folder.id]}
              onToggleExpand={(id) => toggleFolder(id)}
              onSelectFolder={handleSelectFolder}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL (Hidden on mobile when viewing folder list) ───────── */}
      <div
        className={cn(
          'flex-1 min-w-0 h-full overflow-y-auto bg-background flex flex-col',
          !isMobileDetailOpen ? 'hidden md:flex' : 'flex',
          isMobileView && (!isMobileDetailOpen ? 'hidden' : 'flex w-full')
        )}
      >
        {isUploadingFile ? (
          <FileUploadForm
            userEmail="user@amoga.app"
            onClose={() => setIsUploadingFile(false)}
            onUploadSuccess={() => {
              setIsUploadingFile(false)
              toast.success('File uploaded successfully!')
            }}
          />
        ) : (
          <UserFileCardsView
            folder={selectedFolder}
            files={mockStorageFiles}
            onSelectFileForPreview={(file) => toast.info(`Previewing: ${file.fileName}`)}
            onBack={() => setIsMobileDetailOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
