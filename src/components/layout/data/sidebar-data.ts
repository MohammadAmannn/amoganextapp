import {
  Construction,
  LayoutDashboard,
  Mail,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Package,
  ServerOff,
  Settings,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  Command,
  Bot,
  SearchIcon,
  ChartArea,
  Map,
  FileText,
  Store,
  Kanban,
  Route,
  LayoutTemplate,
  Link,
  CalendarDays,
  Bell
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
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Email',
          url: '/email',
          icon: Mail,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Inbox',
          url: '/inbox',
          badge: '4',
          icon: Mail,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
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
          title:"Map Template",
          url:"/map",
          icon: Map
        },
        {
          title:"Document Template",
          url:"/doc",
          icon: FileText
        },
        {
          title: "My Order Template",
          url: "/myordertemplate",
          icon: Store
        },
        {
          title: 'Kanban Template',
          url: '/kanbantemplate',
          icon: Kanban,
        },
        {
          title: 'Calendar Template',
          url: '/calendartemplate',
          icon: CalendarDays,
        },
        {
          title:"Route Doc",
          url:"/routedoc",
          icon: Route
        },
        {
          title: "UI Template",
          url: "/uibuilder",
          icon: LayoutTemplate
        },
        {
          title: "Link Builder",
          url: "/link-builder",
          icon: Link
        },
        {
          title: "Link Maker",
          url: "/link-maker",
          icon: Link
        },

        {
          title: "Email Template",
          url: "/email-template",
          icon:Mail
        },
        {
          title: "Chat Template",
          url: "/chattemplate",
          icon: MessagesSquare,
        },
        {
          title: "Notification",
          url: "/notification",
          icon: Bell,
        },

        
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },

    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
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
