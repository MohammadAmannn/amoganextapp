# AmogDS — Universal Platform Architecture & Developer Integration Guide
**Version 1.0.2** | *Central Design System, Headless Backend & Multi-Platform SDK*

---

## 1. Executive Summary & Core Philosophy

**AmogDS (`@amogads/ui`)** is the central design system and unified frontend/backend platform for Amoga. It is engineered to solve a common enterprise problem: **fragmentation and duplication** across web apps, mobile apps, and backend services.

Instead of writing UI components, standard business pages, database queries, and realtime stores separately for each application:
- **AmogDS acts as the Single Source of Truth**.
- Any application (Next.js, React Web, React Native, Capacitor, Node.js Backend) imports pre-built UI components, full-page standard features, state stores, or serverless API handlers from `@amogads/ui`.

```
                        ┌──────────────────────────────────────────────────────────┐
                        │                         AmogDS                           │
                        │                    (@amogads/ui)                         │
                        └────────────────────────────┬─────────────────────────────┘
                                                     │
        ┌──────────────────────────┬─────────────────┴───────────────┬─────────────────────────┐
        ▼                          ▼                                 ▼                         ▼
 ┌──────────────┐         ┌──────────────────┐             ┌──────────────────┐       ┌─────────────────┐
 │   AmogaNext  │         │  New Next.js App │             │   React Native   │       │ Node.js/Server  │
 │ (Full Suite) │         │ (Portal/Consumer)│             │   (Mobile App)   │       │ (APIs/Backend)  │
 └──────────────┘         └──────────────────┘             └──────────────────┘       └─────────────────┘
```

---

## 2. Package Architecture & Module Exports

AmogDS is published and consumed as the `@amogads/ui` package with dedicated subpath exports:

| Subpath Export | Purpose & Contents | Primary Consumers |
| :--- | :--- | :--- |
| **`@amogads/ui`** | Core UI library (`Button`, `Dialog`, `Sidebar`, `Input`, `Table`, `Header`, etc.) | Next.js, React Web |
| **`@amogads/ui/theme.css`** | CSS Design Tokens, Color Palettes, Tailwind utilities | Next.js, React Web |
| **`@amogads/ui/tokens`** | Raw design tokens (colors, typography, spacing, breakpoints) as JS objects | React Native, Web, Figma |
| **`@amogads/ui/pages`** | Full Standard Pages (`MessagePage`, `AiChatPage`, `AiSearchPage`, `VouchersPage`, `LinkMakerPage`, `MapTemplatePage`, `ChatTemplatePage`) | Next.js, React Web |
| **`@amogads/ui/server`** | Backend route handlers (`handleMessagesGet`, `handleContactsPost`, `handleMailInboxGet`, `handleChatPost`, etc.) | Next.js API Routes, Express |
| **`@amogads/ui/stores`** | Global state & realtime hooks (`useAuthStore`, `useNotificationStore`, `useChatStore`) | Next.js, React Native |
| **`@amogads/ui/services`** | Client/Server business service layer (`chatService`, `voucherService`, `geoService`, `urlService`) | Web, Mobile, Node.js |
| **`@amogads/ui/sdk`** | High-level Client SDK (`AmogaChatSDK`, `AmogaVoucherSDK`, `AmogaMailSDK`) | Web, Mobile, CLI |

---

## 3. Integrating with a New Next.js Project

### Step 3.1: Installation
In your new Next.js project root:
```bash
npm install @amogads/ui
```

### Step 3.2: Configure Styles (`globals.css`)
Import the AmogDS theme in your root `app/globals.css` or layout:
```css
@import "tailwindcss";
@import "@amogads/ui/theme.css";
```

### Step 3.3: Embedding Standard Pages (Zero-Boilerplate)
To add full-fledged standard capabilities like **Message / Mail**, **AI Chat**, **Vouchers**, or **Link Maker**, simply create the page in your Next.js `app` directory:

```tsx
// app/(dashboard)/message/page.tsx
'use client'

import { MessagePage } from '@amogads/ui/pages'

export default function Page() {
  return <MessagePage />
}
```

```tsx
// app/(dashboard)/ai_chat/page.tsx
'use client'

import { AiChatPage } from '@amogads/ui/pages'

export default function Page() {
  return <AiChatPage />
}
```

```tsx
// app/(dashboard)/vouchers/page.tsx
'use client'

import { VouchersPage } from '@amogads/ui/pages'

export default function Page() {
  return <VouchersPage />
}
```

### Step 3.4: Wiring Backend API Endpoints (2 Lines Each)
AmogDS includes complete backend logic. In your Next.js project, connect the standard API routes:

```ts
// app/api/messages/route.ts
import { handleMessagesGet, handleMessagesPost } from '@amogads/ui/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return handleMessagesGet(request as any)
}

export async function POST(request: Request) {
  return handleMessagesPost(request as any)
}
```

```ts
// app/api/mail/inbox/route.ts
import { handleMailInboxGet } from '@amogads/ui/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return handleMailInboxGet(request)
}
```

```ts
// app/api/vouchers/route.ts
import { handleVouchersGet, handleVouchersPost } from '@amogads/ui/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return handleVouchersGet(request as any)
}

export async function POST(request: Request) {
  return handleVouchersPost(request as any)
}
```

---

## 4. Integrating with React Native (Mobile Apps)

AmogDS separates **business logic, stores, services, and SDKs** from DOM dependencies so mobile applications can reuse 100% of the state management and backend communication.

### Step 4.1: Consuming Realtime Chat & Stores
In React Native:
```tsx
import React, { useEffect } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native'
import { useChatStore, useNotificationStore } from '@amogads/ui/stores'
import { tokens } from '@amogads/ui/tokens'

export function MobileChatScreen({ userId, conversationId }: { userId: string; conversationId: string }) {
  const { messages, sendMessage, fetchMessages } = useChatStore()
  const { unreadCount } = useNotificationStore()

  useEffect(() => {
    fetchMessages(conversationId)
  }, [conversationId])

  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.background }}>
      <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.foreground }}>
        Chat ({unreadCount} unread notifications)
      </Text>
      
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: tokens.spacing[2], marginVertical: tokens.spacing[1] }}>
            <Text style={{ color: tokens.colors.primary }}>{item.sender?.name}:</Text>
            <Text>{item.message}</Text>
          </View>
        )}
      />
    </View>
  )
}
```

### Step 4.2: Using the Amoga SDK
```ts
import { AmogaChatSDK, AmogaVoucherSDK } from '@amogads/ui/sdk'

// Initialize SDK with your backend endpoint
const chatSDK = new AmogaChatSDK({ baseUrl: 'https://api.amoga.io' })
const voucherSDK = new AmogaVoucherSDK({ baseUrl: 'https://api.amoga.io' })

// Create a new voucher from mobile app
const voucher = await voucherSDK.createVoucher({
  code: 'SUMMER2026',
  amount: 25,
  currency: 'USD',
})
```

---

## 5. Summary of Standard Features Catalog

1. **Message & Email (`@amogads/ui/pages -> <MessagePage />`)**:
   - Integrated Inbox & Sent mail viewer with live IMAP synchronization.
   - Rich TipTap email composer with file attachments and SMTP sending.
   - Contact and group management dialogs.

2. **AI Chat (`@amogads/ui/pages -> <AiChatPage />`)**:
   - Streaming LLM conversations (OpenAI, Gemini, OpenRouter).
   - Conversation history, context switches, and prompt templates.

3. **AI Search (`@amogads/ui/pages -> <AiSearchPage />`)**:
   - Tavily search integration with intelligent web summarization.
   - Source citations and deep link exploration.

4. **Vouchers (`@amogads/ui/pages -> <VouchersPage />`)**:
   - Complete voucher issuing, code redemption, and balance management.
   - WooCommerce store integration and analytics.

5. **Link Maker (`@amogads/ui/pages -> <LinkMakerPage />`)**:
   - Dynamic short URL generator, click analytics, and custom alias builder.

6. **Map Templates (`@amogads/ui/pages -> <MapTemplatePage />`)**:
   - MapLibre GL geocoding, geolocation markers, and interactive route mapping.
