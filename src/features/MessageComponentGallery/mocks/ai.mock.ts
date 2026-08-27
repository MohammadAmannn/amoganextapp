'use client'

/**
 * Mock data for Message Component Gallery
 * AI Chat & Assistant mocks
 */
import { Message } from '@/features/ai-chat/types'

export const mockAiMessages: Message[] = [
  {
    role: 'user',
    content: 'Explain the new features of React 19 with examples of Server Actions and the use() hook.',
  },
  {
    role: 'assistant',
    content: `### 🚀 React 19 Key Features

React 19 introduces major enhancements for server-driven UI, async state transitions, and asset management:

#### 1. Server Actions & \`useActionState\`
Server Actions allow you to run asynchronous functions directly on the server from your UI components without writing explicit API routes:

\`\`\`tsx
'use server'

export async function updateProfile(prevState: any, formData: FormData) {
  const name = formData.get('name');
  await db.user.update({ name });
  return { success: true };
}
\`\`\`

#### 2. The \`use()\` Hook
The new \`use\` API can unwrap Promises and read React Context conditionally inside render functions:

\`\`\`tsx
import { use } from 'react';

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>Hello, {user.name}</div>;
}
\`\`\`

#### 3. Automatic Memoization
The React Compiler automatically optimizes rendering without requiring manual \`useMemo\` or \`useCallback\` everywhere.`,
    sources: [
      { title: 'React 19 Official Release Notes', url: 'https://react.dev/blog/2024/12/05/react-19' },
      { title: 'Server Actions & Mutations Guide', url: 'https://react.dev/reference/rsc/server-actions' },
      { title: 'The use() API Reference', url: 'https://react.dev/reference/react/use' },
    ],
  },
]

export const mockAiWebSearchMessages: Message[] = [
  {
    role: 'user',
    content: 'What are the top UI component galleries and design system trends in 2026?',
  },
  {
    role: 'assistant',
    content: `Based on current web development trends, here are the top design systems and UI component gallery patterns:

1. **Blocks & Component Registries (e.g., blocks.so, shadcn/ui):**
   - Copy-paste component architectures over bloated npm packages
   - Full TypeScript safety, custom Tailwind / Vanilla CSS tokens
   - Responsive live preview frames with instant code snippets

2. **Server-Component Ready Architecture:**
   - Separation of client-side interactive blocks from server-rendered layouts
   - Zero client bundle overhead for static display components

3. **Multi-Platform Consistency (Web + Mobile / Capacitor):**
   - Universal design tokens and unified responsive viewports (Desktop, Tablet, Mobile)`,
    sources: [
      { title: 'Modern UI Component Libraries 2026', url: 'https://shadcn.com' },
      { title: 'Next.js Design Patterns', url: 'https://nextjs.org/docs' },
    ],
  },
]
