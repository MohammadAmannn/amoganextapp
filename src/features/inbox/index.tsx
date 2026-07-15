import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Search as SearchIcon, Filter, ChevronDown, Inbox as InboxIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { type Email, emails as emailData } from './data/emails'
import { Main } from '@/components/layout/main'
import { AppHeader } from '@/components/layout/app-header'
import { ComingSoon } from '@/components/coming-soon'

export function Inbox() {
  const [emails] = useState<Email[]>(emailData)
  const [searchQuery, setSearchQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [activeMenuTab, setActiveMenuTab] = useState('new')

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = tab === 'all' || !email.read
    return matchesSearch && matchesTab
  })

  const unreadCount = emails.filter((e) => !e.read).length

  return (
    <>
      <AppHeader title='Inbox' />

      <Main className='flex flex-1 flex-col p-4 sm:p-6 pt-3 sm:pt-3 bg-background overflow-hidden'>
        <Tabs
          value={activeMenuTab}
          onValueChange={setActiveMenuTab}
          className='flex flex-1 flex-col overflow-hidden space-y-4'
        >
          {/* Aligned Tabs Left with full border-b line */}
          <div className='w-full overflow-x-auto pb-2 shrink-0 border-b border-border px-4 sm:px-0'>
            <TabsList className='h-auto gap-6 border-0 bg-transparent p-0 shadow-none rounded-none'>
              <TabsTrigger
                value='new'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                New
              </TabsTrigger>
              <TabsTrigger
                value='important'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                Important
              </TabsTrigger>
              <TabsTrigger
                value='flow'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                Flow
              </TabsTrigger>
              <TabsTrigger
                value='read'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                Read
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value='new'
            className='flex-1 flex flex-col gap-4 sm:gap-6 overflow-hidden mt-0 focus-visible:outline-none'
          >
            {/* Search Bar - Centered */}
            <div className='flex flex-col items-center justify-center w-full max-w-3xl mx-auto gap-4 shrink-0'>
              <div className='relative w-full'>
                <SearchIcon className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='inbox-search'
                  placeholder='Search your inbox...'
                  className='pl-11 pr-4 py-6 text-base rounded-2xl border-2 border-muted/30 bg-background shadow-sm hover:shadow-md transition-all duration-200 focus:border-primary/50 focus:shadow-lg'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2'>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                    >
                      Clear
                    </button>
                  )}
                  <Badge variant='outline' className='hidden sm:flex text-xs px-2 py-0.5 bg-muted/20'>
                    {filteredEmails.length} {filteredEmails.length === 1 ? 'result' : 'results'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 shrink-0'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <InboxIcon className='h-5 w-5 text-muted-foreground' />
                  <span className='text-sm font-medium'>
                    {filteredEmails.length} {filteredEmails.length === 1 ? 'conversation' : 'conversations'}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <Badge variant='default' className='rounded-full px-3 py-1 text-xs font-medium bg-primary hover:bg-primary'>
                    {unreadCount} unread
                  </Badge>
                )}
              </div>

              <div className='flex items-center gap-2 w-full sm:w-auto'>
                <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'unread')} className='w-full sm:w-auto'>
                  <TabsList className='h-9 w-full sm:w-auto bg-muted/30'>
                    <TabsTrigger value='all' className='text-xs px-4 flex-1 sm:flex-none'>
                      All
                    </TabsTrigger>
                    <TabsTrigger value='unread' className='text-xs px-4 flex-1 sm:flex-none'>
                      Unread
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <button className='hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition-colors text-xs font-medium shadow-xs'>
                  <Filter className='h-3.5 w-3.5' />
                  Filter
                </button>
              </div>
            </div>

            {/* Email List - No outer box */}
            <ScrollArea className='flex-1 overflow-y-auto'>
              <div className='flex flex-col gap-2 pb-4'>
                {filteredEmails.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
                    <div className='rounded-full bg-muted/20 p-6 mb-4'>
                      <Mail className='h-10 w-10 opacity-30' />
                    </div>
                    <p className='text-sm font-medium'>No emails found</p>
                    <p className='text-xs text-muted-foreground/60 mt-1'>Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredEmails.map((email, index) => (
                    <div
                      key={email.id}
                      id={`email-item-${email.id}`}
                      className={cn(
                        'group relative flex flex-col gap-2 rounded-xl p-4 transition-all duration-200 cursor-pointer',
                        'hover:bg-muted/50 hover:shadow-sm',
                        !email.read 
                          ? 'bg-primary/5 border-l-4 border-l-primary' 
                          : 'bg-background hover:bg-muted/30'
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2.5 mb-1 flex-wrap'>
                            <span className={cn(
                              'text-sm font-medium truncate',
                              !email.read && 'font-semibold'
                            )}>
                              {email.name}
                            </span>
                            {!email.read && (
                              <span className='inline-flex h-2 w-2 rounded-full bg-primary flex-shrink-0' />
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
                                  <Badge variant='outline' className='rounded-md px-2 py-0 text-[10px]'>
                                    +{email.labels.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <p className={cn(
                            'text-sm truncate',
                            !email.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                          )}>
                            {email.subject}
                          </p>
                          <p className='text-xs text-muted-foreground/70 line-clamp-2 mt-1.5 leading-relaxed'>
                            {email.preview}
                          </p>
                        </div>
                        <div className='flex flex-col items-end gap-2 flex-shrink-0'>
                          <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                            {formatDistanceToNow(email.date, { addSuffix: true })}
                          </span>
                          <button className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/50'>
                            <span className='sr-only'>More options</span>
                            <ChevronDown className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value='important'
            className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
          >
            <ComingSoon />
          </TabsContent>

          <TabsContent
            value='flow'
            className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
          >
            <ComingSoon />
          </TabsContent>

          <TabsContent
            value='read'
            className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
          >
            <ComingSoon />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
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

export { Inbox as default }