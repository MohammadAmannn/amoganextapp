import { useLocation } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ThemeSelector } from '@/components/theme-selector'

const topNavLinks = [
  { title: 'Overview', href: '/' },
  { title: 'Customers', href: '/dashboard/customers' },
  { title: 'Products', href: '/dashboard/products' },
  { title: 'Settings', href: '/dashboard/settings' },
]

export function DashboardHeader() {
  const { pathname } = useLocation()

  const links = topNavLinks.map((link) => ({
    ...link,
    isActive: pathname === link.href,
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
