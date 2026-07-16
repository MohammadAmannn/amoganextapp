import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Email } from '../data/emails'

interface EmailListProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (email: Email) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  mode: 'inbox' | 'done'
  setMode: (mode: 'inbox' | 'done') => void
}

function getLabelVariant(label: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (label) {
    case 'important':
      return 'default'
    case 'work':
      return 'outline'
    case 'personal':
      return 'secondary'
    case 'meeting':
      return 'outline'
    case 'budget':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  searchQuery,
  setSearchQuery,
  mode,
  setMode,
}: EmailListProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'to_act'>('all')

  // Filter by search query and active toggle buttons
  const filtered = emails.filter((email) => {
    const matchesSearch =
      email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesMode = mode === 'done' ? email.done : !email.done

    let matchesFilter = true
    if (filterMode === 'unread') {
      matchesFilter = !email.read
    } else if (filterMode === 'to_act') {
      matchesFilter = !email.read || email.labels.includes('important') || email.labels.includes('meeting')
    }

    return matchesSearch && matchesMode && matchesFilter
  })

  return (
    <div className='flex h-full w-full flex-col bg-background border-r border-border overflow-hidden shrink-0'>
      {/* 2 Hip buttons above search bar */}
      <div className='p-3 pb-1 shrink-0 flex items-center bg-background'>
        <div className='w-full bg-muted/40 p-1 rounded-lg flex gap-1 h-9 shrink-0'>
          <button
            onClick={() => setFilterMode(filterMode === 'unread' ? 'all' : 'unread')}
            className={cn(
              'flex-1 text-xs font-semibold rounded-md transition-all select-none cursor-pointer flex items-center justify-center',
              filterMode === 'unread'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterMode(filterMode === 'to_act' ? 'all' : 'to_act')}
            className={cn(
              'flex-1 text-xs font-semibold rounded-md transition-all select-none cursor-pointer flex items-center justify-center',
              filterMode === 'to_act'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            To Act
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className='p-3 pt-1 border-b border-border shrink-0 flex items-center gap-2 bg-background'>
        <div className='relative w-full'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/75' />
          <Input
            placeholder='Search Emails...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9 pr-8 h-9 text-sm rounded-md bg-muted/20 border-border focus-visible:ring-1 focus-visible:ring-ring'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Email list */}
      <div className='flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-background'>
        <div className='flex flex-col py-2 gap-1'>
          {filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground'>
              <p className='text-sm font-medium'>No messages found</p>
              <p className='text-xs text-muted-foreground/60 mt-1'>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filtered.map((email) => {
              const isSelected = selectedEmailId === email.id

              return (
                <div
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  className={cn(
                    'group relative flex flex-col gap-2 rounded-xl p-4 transition-all duration-200 cursor-pointer border border-transparent mx-2 my-0.5 select-none',
                    'hover:bg-muted/50 hover:shadow-xs',
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-900/30'
                      : 'bg-background hover:bg-muted/30',
                      !email.read && 'bg-primary/5'
                  )}
                >
                  {/* Left Accent vertical line for selected state */}
                  {isSelected && (
                    <div className='absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-xl' />
                  )}

                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1 flex-wrap'>
                          <span className={cn(
                            'text-sm font-medium text-foreground truncate',
                            !email.read && 'font-semibold'
                          )}>
                            {email.name}
                          </span>
                          {!email.read && (
                            <span className='inline-flex h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0' />
                          )}
                          {email.labels.length > 0 && (
                            <div className='flex flex-wrap gap-1'>
                              {email.labels.slice(0, 2).map((label) => (
                                <Badge
                                  key={label}
                                  variant={getLabelVariant(label)}
                                  className='rounded-md px-2 py-0 text-[10px] font-medium'
                                >
                                  {label}
                                </Badge>
                              ))}
                              {email.labels.length > 2 && (
                                <Badge variant='outline' className='rounded-md px-1.5 py-0 text-[10px]'>
                                  +{email.labels.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Subject */}
                        <p className={cn(
                          'text-sm truncate',
                          !email.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                        )}>
                          {email.subject}
                        </p>

                        {/* Preview Snippet */}
                        <p className='text-xs text-muted-foreground/70 line-clamp-2 mt-1.5 leading-relaxed'>
                          {email.preview}
                        </p>
                      </div>

                      <div className='flex flex-col items-end gap-2 flex-shrink-0'>
                        <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                          {formatDistanceToNow(email.date, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}