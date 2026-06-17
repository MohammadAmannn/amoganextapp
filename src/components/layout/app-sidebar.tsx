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
    {/* Logo */}
    <SidebarHeader>
      <TeamSwitcher teams={sidebarData.teams} />
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
      {sidebarData.navGroups.map((props) => (
        <NavGroup key={props.title} {...props} />
      ))}
    </SidebarContent>
  </Sidebar>
  )
}
