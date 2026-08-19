'use client'

import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore } from '@/stores/notification-store'

type AppHeaderProps = {
  title: string
  fixed?: boolean
  iconsPosition?: 'left' | 'right'
  children?: React.ReactNode
}

export function AppHeader({
  title,
  fixed = true,
  iconsPosition = 'right',
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
      <div className='flex flex-1 items-center justify-between w-full'>
        {iconsPosition === 'left' ? (
          <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
            <h1 className='min-w-0 truncate text-base font-semibold sm:text-lg'>
              {title}
            </h1>

            <div className='flex items-center gap-1 sm:gap-2 shrink-0 ml-1'>
              <Search iconOnly />

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
            </div>
          </div>
        ) : (
          <>
            <h1 className='min-w-0 truncate text-base font-semibold sm:text-lg'>
              {title}
            </h1>

            <div className='ml-auto flex items-center gap-2 sm:gap-3'>
              <Search iconOnly />

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
            </div>
          </>
        )}
      </div>
    </Header>
  )
}
