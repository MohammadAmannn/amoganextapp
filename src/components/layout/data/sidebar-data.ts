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
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  // Footer me dikhne wala current user data.
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  // Sidebar header team switcher ke dropdown options.
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
   
    // {
    //   name: 'Acme Corp.',
    //   logo: AudioWaveform,
    //   plan: 'Startup',
    // },
  ],
  navGroups: [
    {
      // Primary work/navigation group.
      title: 'General',
      items: [
        {
          // Landing page / overview screen.
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          // Task management module.
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          // Inbox with unread count badge.
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
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      // Auth aur error pages ko group karke dikhata hai.
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
      // Support/utility section (settings + help).
      title: 'Other',
      items: [
        {
          // Settings ke andar sub-pages nested menu me show hote hain.
          title: 'Settings',
          icon: Settings,
          items: [

            // Settings ke andar sub-pages aagynge 
   
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
