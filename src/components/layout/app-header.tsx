// ==========================================
// Shared App Header
// Used across Dashboard, Tasks, Apps, etc.
// ==========================================

import { Bell } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'

type AppHeaderProps = {
  fixed?: boolean
}

export function AppHeader({
  fixed = false,
}: AppHeaderProps) {
  return (
    <Header fixed={fixed}>
      {/* Search */}
      <Search className='me-auto' />

      {/* Notification Bell */}
      <Button
        variant='ghost'
        size='icon'
        className='h-10 w-10'
      >
        <Bell className='h-6 w-6' />
      </Button>

      {/* Extra spacing */}
      <div className='ml-3'>
        <ProfileDropdown />
      </div>
    </Header>
  )
}