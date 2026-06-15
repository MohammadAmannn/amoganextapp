import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type Email, emails as emailData } from './data/emails'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export function Inbox() {
  const [emails] = useState<Email[]>(emailData)
  const [searchQuery, setSearchQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')

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
      <Header>
        <div className='flex items-center gap-2'>
          <Mail className='h-5 w-5' />
          <h1 className='text-lg font-semibold'>Inbox</h1>
          {unreadCount > 0 && (
            <Badge variant='default' className='rounded-full px-2 py-0.5 text-xs'>
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] flex-col overflow-hidden rounded-lg border bg-card'>
          {/* Tabs */}
          <div className='flex items-center justify-between px-4 pt-4 pb-2'>
            <h2 className='text-xl font-bold tracking-tight'>Inbox</h2>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'unread')}>
              <TabsList className='h-8'>
                <TabsTrigger value='all' className='text-xs px-3'>
                  All mail
                </TabsTrigger>
                <TabsTrigger value='unread' className='text-xs px-3'>
                  Unread
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Separator />

          {/* Search */}
          <div className='p-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='inbox-search'
                placeholder='Search'
                className='pl-9'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Email list */}
          <ScrollArea className='flex-1'>
            <div className='flex flex-col gap-1 px-4 pb-4'>
              {filteredEmails.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                  <Mail className='mb-3 h-10 w-10 opacity-40' />
                  <p className='text-sm'>No emails found</p>
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    id={`email-item-${email.id}`}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
                      !email.read && 'border-l-2 border-l-primary'
                    )}
                  >
                    <div className='flex w-full flex-col gap-1'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className={cn('font-semibold', !email.read && 'font-bold')}>
                            {email.name}
                          </span>
                          {!email.read && (
                            <span className='h-2 w-2 rounded-full bg-primary' />
                          )}
                        </div>
                        <span className='text-xs text-muted-foreground whitespace-nowrap'>
                          {formatDistanceToNow(email.date, { addSuffix: true })}
                        </span>
                      </div>
                      <span className={cn('text-xs font-medium', !email.read && 'font-semibold')}>
                        {email.subject}
                      </span>
                    </div>
                    <p className='line-clamp-2 text-xs text-muted-foreground leading-relaxed'>
                      {email.preview}
                    </p>
                    {email.labels.length > 0 && (
                      <div className='flex flex-wrap gap-1'>
                        {email.labels.map((label) => (
                          <Badge
                            key={label}
                            variant={getLabelVariant(label)}
                            className='rounded-md px-2 py-0 text-[10px] font-medium'
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
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
