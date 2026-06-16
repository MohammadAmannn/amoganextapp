import { useState } from 'react'
import { Monitor, Bell, Palette, Wrench, UserCog } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotFoundError } from '@/features/errors/not-found-error'
import { SidebarNav } from './components/sidebar-nav'
import { SettingsProfile } from './profile'

export type SettingsSectionId =
  | 'profile'
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'display'

const sidebarNavItems: {
  id: SettingsSectionId
  title: string
  icon: React.ReactNode
}[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: <UserCog size={18} />,
  },
  {
    id: 'account',
    title: 'Account',
    icon: <Wrench size={18} />,
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: <Palette size={18} />,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <Bell size={18} />,
  },
  {
    id: 'display',
    title: 'Display',
    icon: <Monitor size={18} />,
  },
]

export function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>('profile')

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav
              items={sidebarNavItems}
              activeSection={activeSection}
              onSectionChange={(id) =>
                setActiveSection(id as SettingsSectionId)
              }
            />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            {activeSection === 'profile' ? (
              <SettingsProfile />
            ) : (
              <NotFoundError embedded />
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
