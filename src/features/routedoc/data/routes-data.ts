export interface RouteInfo {
  path: string
  name: string
  description: string
  category: 'General' | 'Auth & Pages' | 'Errors' | 'Other'
  folder: string
  file: string
  auth: 'Public' | 'Authenticated' | 'Admin'
  status: 'Active' | 'Under Development' | 'Deprecated'
  methods: string[]
  priority: number
}

export const ROUTES_DATA: RouteInfo[] = [
  {
    path: '/',
    name: 'Dashboard',
    description: 'The main user dashboard displaying business overview metrics, statistics cards, and sales activity trackers.',
    category: 'General',
    folder: 'dashboard',
    file: 'app/(dashboard)/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 1.0
  },
  {
    path: '/tasks',
    name: 'Tasks',
    description: 'An interactive tasks table to view, edit, and organize task priorities and workflow details.',
    category: 'General',
    folder: 'tasks',
    file: 'app/(dashboard)/tasks/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.8
  },
  {
    path: '/inbox',
    name: 'Inbox',
    description: 'Central message and notification inbox for system messages, chats, and comments.',
    category: 'General',
    folder: 'inbox',
    file: 'app/(dashboard)/inbox/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.7
  },
  {
    path: '/apps',
    name: 'Apps',
    description: 'Browse, manage, and install application modules and tools in the integration workspace.',
    category: 'General',
    folder: 'apps',
    file: 'app/(dashboard)/apps/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.6
  },
  {
    path: '/chats',
    name: 'Chats',
    description: 'Real-time collaborative chat rooms and direct messaging interface for team members.',
    category: 'General',
    folder: 'chats',
    file: 'app/(dashboard)/chats/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.7
  },
  {
    path: '/ai_chat',
    name: 'AI Chat',
    description: 'AI-powered chat companion backed by Google Gemini and OpenRouter for interactive query resolution.',
    category: 'General',
    folder: 'ai-chat',
    file: 'app/(dashboard)/ai_chat/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.8
  },
  {
    path: '/ai_search',
    name: 'AI Search',
    description: 'Semantic vector search interface with real-time documentation retrieval and query summarization.',
    category: 'General',
    folder: 'ai-search',
    file: 'app/(dashboard)/ai_search/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.8
  },
  {
    path: '/charttemplate',
    name: 'Chart Template',
    description: 'A pre-designed template demonstrating responsive dashboard chart types (Bar, Area, Pie, Radar).',
    category: 'General',
    folder: 'templates',
    file: 'app/(dashboard)/charttemplate/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.5
  },
  {
    path: '/map',
    name: 'Map Template',
    description: 'Interactive geographical tracking map integrating coordinates visualization and details.',
    category: 'General',
    folder: 'templates',
    file: 'app/(dashboard)/map/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.5
  },
  {
    path: '/doc',
    name: 'Document Template',
    description: 'Markdown-friendly document and reports rendering engine with custom text highlights.',
    category: 'General',
    folder: 'templates',
    file: 'app/(dashboard)/doc/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.5
  },
  {
    path: '/store',
    name: 'Store Template',
    description: 'An online store template showing e-commerce grids, product details, and category listings.',
    category: 'General',
    folder: 'templates',
    file: 'app/(dashboard)/store/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.6
  },
  {
    path: '/kanbantemplate',
    name: 'Kanban Template',
    description: 'A local-storage backed workspace Kanban template. Drag and drop tasks and columns.',
    category: 'General',
    folder: 'templates',
    file: 'app/(dashboard)/kanbantemplate/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.7
  },
  {
    path: '/routedoc',
    name: 'Route Doc',
    description: 'Route documentation catalog that list routes and APIs configuration in this Next.js app.',
    category: 'General',
    folder: 'templates',
    file: 'app/(dashboard)/routedoc/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.7
  },
  {
    path: '/uibuilder',
    name: 'UI Template',
    description: 'An interactive drag-and-drop UI builder to preview, construct, and customize templates using a registry of blocks and components.',
    category: 'General',
    folder: 'uibuilder',
    file: 'app/(dashboard)/uibuilder/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.8
  },
  {
    path: '/users',
    name: 'Users',
    description: 'Manage users list, credentials, settings, and authorization levels.',
    category: 'General',
    folder: 'users',
    file: 'app/(dashboard)/users/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.7
  },
  {
    path: '/settings',
    name: 'Settings',
    description: 'Application profile, system appearance configurations, integration credentials setup.',
    category: 'Other',
    folder: 'settings',
    file: 'app/(dashboard)/settings/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.5
  },
  {
    path: '/help-center',
    name: 'Help Center',
    description: 'Frequently Asked Questions (FAQ), user manuals, and support system.',
    category: 'Other',
    folder: 'help-center',
    file: 'app/(dashboard)/help-center/page.tsx',
    auth: 'Authenticated',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.5
  },
  {
    path: '/sign-in',
    name: 'Sign In',
    description: 'User login page featuring basic form inputs and Google/GitHub OAuth integrations.',
    category: 'Auth & Pages',
    folder: 'auth',
    file: 'app/(auth)/sign-in/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.9
  },
  {
    path: '/sign-in-2',
    name: 'Sign In (2 Col)',
    description: 'Splitted-column user authentication page with a large marketing banner block.',
    category: 'Auth & Pages',
    folder: 'auth',
    file: 'app/(auth)/sign-in-2/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.9
  },
  {
    path: '/sign-up',
    name: 'Sign Up',
    description: 'Register account page allowing users to register names, credentials, and verify profiles.',
    category: 'Auth & Pages',
    folder: 'auth',
    file: 'app/(auth)/sign-up/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.9
  },
  {
    path: '/forgot-password',
    name: 'Forgot Password',
    description: 'Recover user password page using verification codes or secure links via email.',
    category: 'Auth & Pages',
    folder: 'auth',
    file: 'app/(auth)/forgot-password/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.6
  },
  {
    path: '/otp',
    name: 'OTP Verification',
    description: 'Secure One-Time Password prompt page for multi-factor login authorization.',
    category: 'Auth & Pages',
    folder: 'auth',
    file: 'app/(auth)/otp/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.6
  },
  {
    path: '/errors/unauthorized',
    name: 'Unauthorized (401)',
    description: 'Error page shown when users request pages requiring authentication.',
    category: 'Errors',
    folder: 'errors',
    file: 'app/(errors)/unauthorized/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.3
  },
  {
    path: '/errors/forbidden',
    name: 'Forbidden (403)',
    description: 'Error page shown when users lack access permissions to the requested page.',
    category: 'Errors',
    folder: 'errors',
    file: 'app/(errors)/forbidden/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.3
  },
  {
    path: '/errors/not-found',
    name: 'Not Found (404)',
    description: 'Error page shown when the requested path does not match any static or dynamic route.',
    category: 'Errors',
    folder: 'errors',
    file: 'app/(errors)/not-found/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.3
  },
  {
    path: '/errors/internal-server-error',
    name: 'Internal Server Error (500)',
    description: 'Error page displayed when unhandled runtime exceptions occur during query processing.',
    category: 'Errors',
    folder: 'errors',
    file: 'app/(errors)/internal-server-error/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.3
  },
  {
    path: '/errors/maintenance-error',
    name: 'Maintenance Mode (503)',
    description: 'Alert overlay screen informing users that backend nodes are temporarily undergoing updates.',
    category: 'Errors',
    folder: 'errors',
    file: 'app/(errors)/maintenance-error/page.tsx',
    auth: 'Public',
    status: 'Active',
    methods: ['PAGE'],
    priority: 0.3
  }
]
