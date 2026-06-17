// ✅ ADDED: Bell icon import
import { Bell } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'

// ✅ ADDED: Button component for bell icon
import { Button } from '@/components/ui/button'

export type DashboardNavId =
  | 'overview'
  | 'customers'
  | 'products'
  | 'settings'

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

export function DashboardHeader({
  activeNav,
  onNavChange,
}: DashboardHeaderProps) {
  const links = topNavItems.map((item) => ({
    title: item.title,
    isActive: activeNav === item.id,
    onClick: () => onNavChange(item.id),
  }))

  return (
    <Header>
      {/* Search */}
      <Search className='min-w-0 flex-1 md:flex-none md:pe-12' />

      {/* Top Navigation */}
      <TopNav links={links} className='me-auto' />

      {/* Right Side Controls */}
   {/* Bell Notification Icon */}
   <Button variant='ghost' size='icon' className='h-10 w-10'>
   <Bell className='h-10 w-10' />
</Button>

{/* ADDED: Extra spacing before profile */}
<div className='ml-2'>
  <ProfileDropdown />
</div>
    </Header>
  )
}