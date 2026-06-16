import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ThemeSelector } from '@/components/theme-selector'

export type DashboardNavId = 'overview' | 'customers' | 'products' | 'settings'

type DashboardHeaderProps = {
  activeNav: DashboardNavId
  onNavChange: (nav: DashboardNavId) => void
}

const topNavItems: { title: string; id: DashboardNavId }[] = [
  { title: 'Overview', id: 'overview' },
  { title: 'Customers', id: 'customers' },
  { title: 'Products', id: 'products' },
  { title: 'Settings', id: 'settings' },
]

export function DashboardHeader({ activeNav, onNavChange }: DashboardHeaderProps) {
  const links = topNavItems.map((item) => ({
    title: item.title,
    isActive: activeNav === item.id,
    onClick: () => onNavChange(item.id),
  }))

  return (
    <Header>
      <TopNav links={links} className='me-auto' />
      <Search />
      <ThemeSelector />
      <ThemeSwitch />
      <ConfigDrawer />
      <ProfileDropdown />
    </Header>
  )
}
