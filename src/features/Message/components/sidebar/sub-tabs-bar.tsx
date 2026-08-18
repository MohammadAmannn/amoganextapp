import React from 'react'
import { cn } from '@/lib/utils'
import { CategoryFilterType } from '../../types/message.types'
import { SidebarPagination } from './sidebar-pagination'

interface SubTabsBarProps {
  categoryFilter: CategoryFilterType
  activeTab?: string
  isCollapsed?: boolean
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
  isEmailsLoading?: boolean
  onTabChange?: (tab: string) => void
  onModeChange?: (mode: 'inbox' | 'done') => void
  onSectionModeChange?: (mode: 'mail' | 'chat') => void
  onSelectFile?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

export function SubTabsBar({
  categoryFilter,
  activeTab,
  isCollapsed = false,
  total = 0,
  page = 1,
  limit = 20,
  hasMore = true,
  isEmailsLoading = false,
  onTabChange,
  onModeChange,
  onSectionModeChange,
  onSelectFile,
  onPrevPage,
  onNextPage,
}: SubTabsBarProps) {
  if (isCollapsed) return null
  if (
    categoryFilter !== 'mail' &&
    categoryFilter !== 'chat' &&
    categoryFilter !== 'ai' &&
    categoryFilter !== 'ai-assistant' &&
    categoryFilter !== 'vouchers'
  ) {
    return null
  }

  return (
    <div className="w-full py-1 border-b border-border/60 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
      {categoryFilter === 'chat' ? (
        <div className="flex items-center gap-3.5 sm:gap-4 text-xs font-medium px-0.5 whitespace-nowrap min-w-max">
          <button
            type="button"
            onClick={() => {
              onSectionModeChange?.('chat')
              onTabChange?.('chats')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'chats' || !activeTab
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Chats
          </button>
          <button
            type="button"
            onClick={() => {
              onSectionModeChange?.('chat')
              onTabChange?.('chat-contact')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'chat-contact'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => {
              onSectionModeChange?.('chat')
              onTabChange?.('chat-groups')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'chat-groups'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Groups
          </button>
          <button
            type="button"
            onClick={() => {
              onSectionModeChange?.('chat')
              onTabChange?.('chat-folder')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'chat-folder'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Folder
          </button>
        </div>
      ) : categoryFilter === 'ai' || categoryFilter === 'ai-assistant' ? (
        <div className="flex items-center gap-3.5 sm:gap-4 text-xs font-medium px-0.5 whitespace-nowrap min-w-max">
          <button
            type="button"
            onClick={() => {
              onTabChange?.('ai-chat')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'ai-chat' ||
                !activeTab ||
                activeTab === 'inbox' ||
                activeTab === 'chats'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            AI Chat
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange?.('ai-recent')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'ai-recent'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange?.('ai-prompts')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'ai-prompts'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            My Prompts
          </button>
        </div>
      ) : categoryFilter === 'vouchers' ? (
        <div className="flex items-center gap-3.5 sm:gap-4 text-xs font-medium px-0.5 whitespace-nowrap min-w-max">
          <button
            type="button"
            onClick={() => {
              onTabChange?.('vouchers')
              onSelectFile?.()
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'vouchers' ||
                activeTab === 'file-list' ||
                !activeTab ||
                activeTab === 'inbox' ||
                activeTab === 'chats'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            File
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange?.('file-recent')
            }}
            className={cn(
              'pb-1 border-b-2 transition-all cursor-pointer select-none',
              activeTab === 'file-recent'
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Recent
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-3 sm:gap-3.5 text-xs font-medium px-0.5 whitespace-nowrap shrink-0 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                onSectionModeChange?.('mail')
                onTabChange?.('inbox')
                onModeChange?.('inbox')
              }}
              className={cn(
                'pb-1 border-b-2 transition-all cursor-pointer select-none',
                activeTab === 'inbox' || !activeTab
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Inbox
            </button>
            <button
              type="button"
              onClick={() => {
                onSectionModeChange?.('mail')
                onTabChange?.('send')
                onModeChange?.('done')
              }}
              className={cn(
                'pb-1 border-b-2 transition-all cursor-pointer select-none',
                activeTab === 'send'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Sent
            </button>
            <button
              type="button"
              onClick={() => {
                onTabChange?.('folder')
              }}
              className={cn(
                'pb-1 border-b-2 transition-all cursor-pointer select-none',
                activeTab === 'folder'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Folder
            </button>
            <button
              type="button"
              onClick={() => {
                onTabChange?.('contact')
              }}
              className={cn(
                'pb-1 border-b-2 transition-all cursor-pointer select-none',
                activeTab === 'contact'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => {
                onTabChange?.('groups')
              }}
              className={cn(
                'pb-1 border-b-2 transition-all cursor-pointer select-none',
                activeTab === 'groups'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Groups
            </button>
          </div>

          {/* Pagination Range & Arrow Controls strictly right-aligned */}
          {(activeTab === 'inbox' || activeTab === 'send' || !activeTab) && total > 0 && (
            <SidebarPagination
              page={page}
              limit={limit}
              total={total}
              hasMore={hasMore}
              isLoading={isEmailsLoading}
              onPrevPage={onPrevPage}
              onNextPage={onNextPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
