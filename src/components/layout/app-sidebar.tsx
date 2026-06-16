import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible } = useLayout()

  return (
    // Sidebar ko fixed "sidebar" variant par lock kiya gaya hai (floating remove).
    <Sidebar collapsible={collapsible} variant='sidebar'>
      {/* Top area: app/team identity + desktop par sidebar open/close trigger */}
      <SidebarHeader className='flex-row items-center justify-between gap-2'>
        <TeamSwitcher teams={sidebarData.teams} />
        <SidebarTrigger
          variant='outline'
          className='hidden md:inline-flex'
          aria-label='Toggle sidebar'
        />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      {/* Middle area: yahan General / Pages / Other groups render hote hain */}
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      {/* Edge rail: collapsed sidebar ko mouse se expand/collapse karne ka clickable area */}
      <SidebarRail />
    </Sidebar>
  )
}
