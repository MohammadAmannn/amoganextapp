import { useEffect } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore } from '@/stores/notification-store'

export function AppSidebar() {
  const { collapsible } = useLayout()
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

  // Map sidebarData to inject dynamic unreadCount badge for Notification item
  const dynamicSidebarData = {
    ...sidebarData,
    navGroups: sidebarData.navGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.title === 'Notification') {
          return {
            ...item,
            badge: unreadCount > 0 ? (unreadCount > 5 ? '5+' : String(unreadCount)) : undefined,
          }
        }
        return item
      }),
    })),
  }

  return (
    // Sidebar ko fixed "sidebar" variant par lock kiya gaya hai (floating remove).
    <Sidebar collapsible={collapsible} variant='sidebar'>
      {/* Logo */}
      <SidebarHeader>
        <TeamSwitcher teams={dynamicSidebarData.teams} />
      </SidebarHeader>

      {/* NEW: Toggle sits below logo */}
      {/* ==========================================
    Show toggle below logo ONLY when collapsed
========================================== */}
      <div className='hidden group-data-[state=collapsed]:flex justify-center py-2'>
        <SidebarTrigger
          variant='ghost'
          className='h-8 w-8'
          aria-label='Toggle sidebar'
        />
      </div>
      {/* Navigation */}
      <SidebarContent>
        {dynamicSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
