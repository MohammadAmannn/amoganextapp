import {
  ChevronsUpDown,
  LogOut,
  User,
  Bell,
  MessageCircle,
  CreditCard,
  ShoppingBag,
  Settings,
  Palette,
} from 'lucide-react'
import Link from 'next/link'
import useDialogState from '@/hooks/use-dialog-state'
import { useAuthStore } from '@/stores/auth-store'
import { useLayout } from '@/context/layout-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user: fallbackUser }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  const { auth } = useAuthStore()
  const { setShowInlineNotFound } = useLayout()

  const userName = auth.user?.name || auth.user?.email?.split('@')[0] || fallbackUser.name
  const userEmail = auth.user?.email || fallbackUser.email
  const userAvatar = auth.user?.picture || fallbackUser.avatar
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                tooltip={userName}
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className='rounded-lg'>{userInitials}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{userName}</span>
                  <span className='truncate text-xs text-muted-foreground'>{userEmail}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4 shrink-0' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className='rounded-lg'>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{userName}</span>
                    <span className='truncate text-xs text-muted-foreground'>{userEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* My Profile */}
              <DropdownMenuItem onClick={() => setShowInlineNotFound(true)}>
                <User className='mr-2 h-4 w-4' />
                My Profile
              </DropdownMenuItem>

              {/* Notifications */}
              <DropdownMenuItem onClick={() => setShowInlineNotFound(true)}>
                <Bell className='mr-2 h-4 w-4' />
                Notifications
              </DropdownMenuItem>

              {/* Help */}
              <DropdownMenuItem onClick={() => setShowInlineNotFound(true)}>
                <MessageCircle className='mr-2 h-4 w-4' />
                Help & Support
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Subscription */}
              <DropdownMenuItem onClick={() => setShowInlineNotFound(true)}>
                <CreditCard className='mr-2 h-4 w-4' />
                Subscriptions
              </DropdownMenuItem>

              {/* Buy Apps */}
              <DropdownMenuItem asChild>
                <Link href='/apps'>
                  <ShoppingBag className='mr-2 h-4 w-4' />
                  Buy Apps
                </Link>
              </DropdownMenuItem>

              {/* Theme Settings */}
              <ConfigDrawer
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Palette className='mr-2 h-4 w-4' />
                    Theme Settings
                  </DropdownMenuItem>
                }
              />

              {/* Settings */}
              <DropdownMenuItem onClick={() => setShowInlineNotFound(true)}>
                <Settings className='mr-2 h-4 w-4' />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Sign Out */}
              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut className='mr-2 h-4 w-4' />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
