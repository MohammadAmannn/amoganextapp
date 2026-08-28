'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { HeaderActions } from '../chat/header-actions'
import { ProfileTab } from '@/features/email-settings/components/profile-tab'
import { FilesTab } from '@/features/email-settings/components/files-tab'
import { LinksTab } from '@/features/email-settings/components/accounts-tab'
import { ThemesTab } from '@/features/email-settings/components/themes-tab'
import { PhonePreview } from '@/features/email-settings/components/phone-preview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ComingSoon } from '@/components/coming-soon'
import { ContactManagerTab } from '../tabs/contact-manager-tab'
import { GroupManagerTab } from '../tabs/group-manager-tab'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'

interface MessageEmailSettingsProps {
  contacts?: Contact[]
  groups?: any[]
  onRefreshContactsAndGroups?: () => void
  onSelectContact?: (contact: Contact) => void
  onSelectGroup?: (group: any) => void
  onBack?: () => void
  onClose?: () => void
}

export function MessageEmailSettings({
  contacts = [],
  groups = [],
  onRefreshContactsAndGroups,
  onSelectContact,
  onSelectGroup,
  onBack,
  onClose,
}: MessageEmailSettingsProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const handleBack = onBack || onClose

  return (
    <div className='flex h-full flex-col w-full overflow-hidden bg-background text-foreground'>
      {/* ── Header matching screenshot layout ─────────────────────── */}
      <div className='shrink-0 flex items-center justify-between border-b border-border bg-background px-3 py-2.5 sm:px-4 sm:py-3'>
        {/* Left side: Avatar + Title + Subtitle */}
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <Avatar className='h-9 w-9 shrink-0 rounded-full'>
            <AvatarImage src='/avatars/01.png' alt='App Settings' />
            <AvatarFallback className='rounded-full bg-primary/10 text-primary font-bold text-xs'>
              AS
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 truncate'>
            <h2 className='truncate text-sm font-bold tracking-tight text-foreground sm:text-base leading-snug'>
              App Settings
            </h2>
          </div>
        </div>

        {/* Right side: Header Action Icons via HeaderActions + Close X */}
        <div className='flex items-center gap-1.5 shrink-0'>
          <HeaderActions />
          {handleBack && (
            <button
              type='button'
              onClick={handleBack}
              className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              title='Close'
              aria-label='Close app settings'
            >
              <X className='h-5 w-5' />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className='flex-1 min-h-0 overflow-hidden px-3 pt-2 pb-3 sm:px-4 sm:pt-2.5 sm:pb-4 md:px-6 md:pt-3 md:pb-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 w-full h-full overflow-hidden'>
          {/* Left Panel: Tabs Control Panel */}
          <div className='lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-col h-full min-h-0 overflow-hidden'>

              {/* Reverted original tabs bar */}
              <div className='w-full overflow-x-auto pb-1 mb-2 lg:mb-3 shrink-0 no-scrollbar'>
                <TabsList className='h-auto gap-4 sm:gap-6 border-b border-border bg-transparent p-0 shadow-none justify-start flex w-max min-w-full rounded-none'>
                  {[
                    { id: 'profile', label: 'Profile' },
                    { id: 'files', label: 'Files' },
                    { id: 'links', label: 'Links' },
                    { id: 'folder', label: 'Folder' },
                    { id: 'contact', label: 'Contact' },
                    { id: 'groups', label: 'Groups' },
                    { id: 'inbox', label: 'Inbox' },
                    { id: 'theme', label: 'Theme' },
                    { id: 'campaign', label: 'Campaign' },
                    { id: 'history', label: 'History' },
                    { id: 'analytics', label: 'Analytics' },
                    { id: 'logs', label: 'Logs' },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold text-xs whitespace-nowrap cursor-pointer'
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className='flex-1 overflow-y-auto no-scrollbar pr-0 sm:pr-1 pb-6 space-y-4'>
                <TabsContent value='profile' className='mt-0 focus-visible:outline-none'>
                  <ProfileTab />
                </TabsContent>
                <TabsContent value='files' className='mt-0 focus-visible:outline-none'>
                  <FilesTab />
                </TabsContent>
                <TabsContent value='links' className='mt-0 focus-visible:outline-none'>
                  <LinksTab />
                </TabsContent>
                <TabsContent value='folder' className='mt-0 focus-visible:outline-none'>
                  <div className='w-full'>
                    <LinksTab />
                  </div>
                </TabsContent>
                <TabsContent value='contact' className='mt-0 focus-visible:outline-none'>
                  <ContactManagerTab
                    contacts={contacts}
                    onRefresh={onRefreshContactsAndGroups || (() => {})}
                    onSelectContact={onSelectContact}
                  />
                </TabsContent>
                <TabsContent value='groups' className='mt-0 focus-visible:outline-none'>
                  <GroupManagerTab
                    groups={groups}
                    contacts={contacts}
                    onRefresh={onRefreshContactsAndGroups || (() => {})}
                    onSelectGroup={onSelectGroup}
                  />
                </TabsContent>
                <TabsContent value='inbox' className='mt-0 focus-visible:outline-none'>
                  <div className='border border-muted rounded-xl bg-card/60 backdrop-blur-md p-6'>
                    <ComingSoon />
                  </div>
                </TabsContent>
                <TabsContent value='theme' className='mt-0 focus-visible:outline-none'>
                  <ThemesTab />
                </TabsContent>
                <TabsContent value='campaign' className='mt-0 focus-visible:outline-none'>
                  <div className='border border-muted rounded-xl bg-card/60 backdrop-blur-md p-6'>
                    <ComingSoon />
                  </div>
                </TabsContent>
                <TabsContent value='history' className='mt-0 focus-visible:outline-none'>
                  <div className='border border-muted rounded-xl bg-card/60 backdrop-blur-md p-6'>
                    <ComingSoon />
                  </div>
                </TabsContent>
                <TabsContent value='analytics' className='mt-0 focus-visible:outline-none'>
                  <div className='border border-muted rounded-xl bg-card/60 backdrop-blur-md p-6'>
                    <ComingSoon />
                  </div>
                </TabsContent>
                <TabsContent value='logs' className='mt-0 focus-visible:outline-none'>
                  <div className='border border-muted rounded-xl bg-card/60 backdrop-blur-md p-6'>
                    <ComingSoon />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel: Phone Live Mockup */}
          <div className='hidden lg:flex lg:col-span-5 min-h-0 overflow-y-auto overflow-x-hidden bg-muted/10 border rounded-2xl flex-col items-center px-4 py-10 shadow-inner'>
            <PhonePreview />
          </div>
        </div>
      </div>
    </div>
  )
}
