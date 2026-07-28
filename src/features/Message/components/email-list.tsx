import React, { useState } from 'react'
import {
  Search,
  X,
  PanelLeft,
  MoreHorizontal,
  CornerUpLeft,
  CornerUpRight,
  Pin,
  Star,
  Heart,
  Flag,
  Archive,
  Bell,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Email } from '../data/emails'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EmailListProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (email: Email) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  mode: 'inbox' | 'done'
  setMode: (mode: 'inbox' | 'done') => void
  isCollapsed: boolean
  onToggleCollapse: () => void
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
  isCollapsed,
  onToggleCollapse,
}: EmailListProps) {
  // State for selected email account
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

  // Get unique email accounts from the emails data
  const emailAccounts = React.useMemo(() => {
    const accounts = new Map()
    emails.forEach(email => {
      if (!accounts.has(email.email)) {
        accounts.set(email.email, {
          email: email.email,
          name: email.name,
          avatarInitials: email.avatarInitials
        })
      }
    })
    return Array.from(accounts.values())
  }, [emails])

  // Filter by search query and selected account
  const filtered = emails.filter((email) => {
    const matchesSearch =
      email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesMode = mode === 'done' ? email.done : !email.done
    
    const matchesAccount = selectedAccount === 'all' || email.email === selectedAccount

    return matchesSearch && matchesMode && matchesAccount
  })

  return (
    <div className='flex h-full w-full flex-col bg-background border-r border-border overflow-hidden shrink-0'>
      {/* Only show Dropdown and Search when NOT collapsed */}
      {!isCollapsed && (
        <div className='px-3 pt-3 pb-2 shrink-0 bg-background border-b border-border'>
          {/* Dropdown - Full width matching search bar style */}
          <div className='relative mb-2'>
            <select 
              className='w-full h-8 px-3 rounded-md bg-muted/10 border border-border text-xs font-medium text-foreground hover:bg-muted/20 transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-primary/30 appearance-none'
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.2em 1.2em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">Select Accounts</option>
              {emailAccounts.map((account) => (
                <option key={account.email} value={account.email}>
                  {account.avatarInitials} {account.name} &lt;{account.email}&gt;
                </option>
              ))}
            </select>
          </div>

          {/* Search Input with toggle button on the right */}
          <div className='flex items-center gap-2'>
            <div className='relative flex-1 min-w-0'>
              <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60' />
              <Input
                placeholder='Search Messages...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-8 pr-7 h-8 text-xs rounded-md bg-muted/10 border-border focus-visible:ring-1 focus-visible:ring-ring w-full'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>

            {/* Toggle button on the right of search bar */}
            <button
              onClick={onToggleCollapse}
              className='p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border bg-background shrink-0 cursor-pointer flex items-center justify-center h-8 w-8'
              title={isCollapsed ? 'Expand list' : 'Collapse list'}
            >
              <PanelLeft className={cn('h-3.5 w-3.5 transition-transform duration-200', isCollapsed ? 'rotate-180' : '')} />
            </button>
          </div>
        </div>
      )}

      {/* When collapsed, only show toggle button centered */}
      {isCollapsed && (
        <div className='px-3 pt-3 pb-2 shrink-0 bg-background border-b border-border flex justify-center'>
          <button
            onClick={onToggleCollapse}
            className='p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border bg-background shrink-0 cursor-pointer flex items-center justify-center h-8 w-8'
            title={isCollapsed ? 'Expand list' : 'Collapse list'}
          >
            <PanelLeft className={cn('h-3.5 w-3.5 transition-transform duration-200', isCollapsed ? 'rotate-180' : '')} />
          </button>
        </div>
      )}

      {/* Scrollable Email list */}
      <div className='flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-background'>
        <div className='flex flex-col py-1 gap-0.5'>
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
                    'group relative flex transition-all duration-200 cursor-pointer select-none',
                    isCollapsed
                      ? 'p-2 justify-center my-0.5 rounded-lg mx-1.5 hover:bg-muted/30'
                      : 'flex-col gap-0.5 rounded-lg px-3 py-2 mx-1.5 my-0.5 hover:bg-muted/40 hover:shadow-xs',
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-900/30'
                      : 'bg-background hover:bg-muted/30',
                    !email.read && 'bg-primary/5',
                    'border border-transparent'
                  )}
                >
                  {/* Left Accent vertical line for selected state */}
                  {isSelected && (
                    <div className='absolute left-0 top-1 bottom-1 w-0.5 bg-indigo-600 rounded-l-full' />
                  )}

                  {isCollapsed ? (
                    // Collapsed state: Only show avatar with initials
                    <div className='relative shrink-0'>
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs border transition-all duration-200',
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-indigo-500/10 text-indigo-600 border-indigo-200/30 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-500/20'
                      )}>
                        {email.avatarInitials || email.name.charAt(0)}
                      </div>
                      {!email.read && (
                        <span className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-indigo-600 border-2 border-background' />
                      )}
                    </div>
                  ) : (
                    // Normal expanded state: Show sender details like in screenshot
                    <>
                      {/* Top row: Name + badges + time */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-1.5 flex-wrap min-w-0'>
                          <span className={cn(
                            'text-sm font-medium text-foreground truncate',
                            !email.read && 'font-semibold'
                          )}>
                            {email.name}
                          </span>
                          {!email.read && (
                            <span className='inline-flex h-1.5 w-1.5 rounded-full bg-indigo-600 flex-shrink-0' />
                          )}
                          {email.labels.length > 0 && (
                            <div className='flex flex-wrap gap-0.5'>
                              {email.labels.slice(0, 2).map((label) => (
                                <Badge
                                  key={label}
                                  variant={getLabelVariant(label)}
                                  className='rounded px-1.5 py-0 text-[9px] font-medium h-4 capitalize'
                                >
                                  {label}
                                </Badge>
                              ))}
                              {email.labels.length > 2 && (
                                <Badge variant='outline' className='rounded px-1 py-0 text-[9px] h-4'>
                                  +{email.labels.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <span className='text-[10px] text-muted-foreground whitespace-nowrap ml-2 shrink-0'>
                          {formatDistanceToNow(email.date, { addSuffix: true })}
                        </span>
                      </div>

                      {/* Subject - single line */}
                      <p className={cn(
                        'text-sm truncate',
                        !email.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}>
                        {email.subject}
                      </p>

                      {/* Preview Snippet - single line */}
                      <p className='text-xs text-muted-foreground/70 line-clamp-1'>
                        {email.preview}
                      </p>

                      {/* More actions dropdown - positioned absolutely */}
                      <div className='absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                              className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center h-6 w-6'
                              title='More actions'
                            >
                              <MoreHorizontal className='h-3.5 w-3.5' />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-[150px] bg-background border border-border p-1 shadow-md rounded-lg'>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5'>
                              <CornerUpLeft className='h-3 w-3 text-blue-500 shrink-0' />
                              <span>Reply</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5'>
                              <CornerUpRight className='h-3 w-3 text-blue-500 shrink-0' />
                              <span>Forward</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5'>
                              <Pin className='h-3 w-3 text-purple-500 shrink-0' />
                              <span>Pin Message</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5'>
                              <Star className='h-3 w-3 text-amber-500 shrink-0' />
                              <span>Star</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5'>
                              <Heart className='h-3 w-3 text-pink-500 shrink-0' />
                              <span>Favorite</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5'>
                              <Flag className='h-3 w-3 text-red-500 shrink-0' />
                              <span>Flag</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5'>
                              <Archive className='h-3 w-3 text-indigo-500 shrink-0' />
                              <span>Archive</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5 justify-between'>
                              <div className='flex items-center gap-2'>
                                <Bell className='h-3 w-3 text-orange-500 shrink-0' />
                                <span>Action This</span>
                              </div>
                              <ChevronRight className='h-3 w-3 text-muted-foreground' />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }} className='cursor-pointer text-xs gap-2 py-1.5 justify-between text-red-500 focus:bg-red-500/10 focus:text-red-500'>
                              <div className='flex items-center gap-2'>
                                <Trash2 className='h-3 w-3 text-red-500 shrink-0' />
                                <span>Delete</span>
                              </div>
                              <ChevronRight className='h-3 w-3 text-red-500' />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}