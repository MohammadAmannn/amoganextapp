import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore } from '@/stores/notification-store'

type AppHeaderProps = {
  title: string
  fixed?: boolean
  children?: React.ReactNode
}

export function AppHeader({
  title,
  fixed = true,
  children,
}: AppHeaderProps) {
  const router = useRouter()
  const currentUser = useAuthStore((state) => state.auth.user)
  const { unreadCount, fetchNotifications, subscribeToNotifications, unsubscribe } = useNotificationStore()

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(currentUser.accountNo)
      subscribeToNotifications(currentUser.accountNo)
    }
    return () => {
      unsubscribe()
    }
  }, [currentUser, fetchNotifications, subscribeToNotifications, unsubscribe])

  return (
    <Header fixed={fixed} className='border-b bg-background'>
      {/* Left */}
      <h1 className='min-w-0 truncate text-base font-semibold sm:text-lg'>
        {title}
      </h1>

      {/* Desktop-only centered search */}
      <div className='absolute left-1/2 hidden -translate-x-1/2 md:block'>
        <Search />
      </div>

      {/* Right */}
      <div className='ms-auto flex shrink-0 items-center gap-1 sm:gap-2'>
        {/* Mobile search stays where it is */}
        <div className='md:hidden'>
          <Search />
        </div>

        {children}

        <Button
          variant='ghost'
          size='icon'
          className='relative size-8 shrink-0'
          aria-label='Notifications'
          onClick={() => router.push('/notification')}
        >
          <Bell className='size-5' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white shadow-xs'>
              {unreadCount > 5 ? '5+' : unreadCount}
            </span>
          )}
        </Button>

        <ProfileDropdown />
      </div>
    </Header>
  )
}
