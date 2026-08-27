import {
  Mail,
  HelpCircle,
  Settings,
  Command,
  Bot,
  SearchIcon,
  ChartArea,
  Map,
  Route,
  Link,
  Ticket
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },

  teams: [
    {
      name: 'Amoga App',
      logo: Command,
      plan: 'Demo Company',
    },
  ],

  navGroups: [
    {
      title: 'Menu',
      items: [
        {
          title: 'Message',
          url: '/message',
          icon: Mail,
        },
        {
          title: 'Email Settings',
          url: '/email-settings',
          icon: Settings,
        },
        {
          title: 'Design System',
          url: '/design-system',
          icon: Settings,
        },
      
        {
          title: 'Vouchers',
          url: '/vouchers',
          icon: Ticket,
        },
        {
          title: 'AI Chat',
          url: '/ai_chat',
          icon: Bot,
        },
        {
          title: 'AI Search',
          url: '/ai_search',
          icon: SearchIcon,
        },
        {
          title: 'Chart Template',
          url: '/charttemplate',
          icon: ChartArea,
        },
        {
          title: 'Map Template',
          url: '/map',
          icon: Map,
        },
        {
          title: 'Route Doc',
          url: '/routedoc',
          icon: Route,
        },
        {
          title: 'Link Maker',
          url: '/link-maker',
          icon: Link,
        },
      ],
    },

    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            // Add settings pages here
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
