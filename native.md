# Mobile-First Hybrid Architecture & SQLite Implementation Guide

This document contains full technical details, architecture diagrams, database schemas, synchronization engine specifications, API usage mapping, testing steps, and command references for the **Mobile-First Hybrid Application** built with **Next.js (App Router) + Capacitor + Supabase + SQLite**.

---

## 1. Overview & Architecture

### High-Level Design
The project uses a **Platform-Isolated Mobile Hybrid Architecture**:
* **Web Browser Application**: Unchanged 100% production web application (`https://amoganextapp.vercel.app`).
* **Mobile Native Shell**: Runs inside a Capacitor WebView container using a local offline-first **SQLite Database** (`@capacitor-community/sqlite`) and automatic background **Synchronization Engine**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS UNIFIED CODEBASE                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    Is Native Platform? (isCapacitor())
                                    │
            ┌───────────────────────┴───────────────────────┐
            │ YES (Android Native Shell)                    │ NO (Web Browser Client)
            ▼                                               ▼
┌──────────────────────────────────────┐        ┌───────────────────────┐
│ NATIVE MOBILE HYBRID SHELL           │        │ STANDARD WEB FLOW     │
│ 1. Local SQLite Cache & Storage      │        │ 1. Direct Web Routes  │
│ 2. Offline-First Message Pipeline    │        │ 2. Standard Web UI    │
│ 3. Automatic Background Sync Engine  │        │ 3. 100% Zero          │
│ 4. Native Camera & Push Notifications│        │    Regression         │
└──────────────────────────────────────┘        └───────────────────────┘
```

---

## 2. Directory Structure & Files Created

| Directory / File | Purpose |
|---|---|
| `src/mobile/types/index.ts` | TypeScript interfaces for mobile data structures (`MobileUser`, `MobileProfile`, `MobileConversation`, `MobileMessage`, `PendingMessage`, `PendingUpload`, `MobileSetting`). |
| `src/mobile/database/sqlite/schema.ts` | SQLite DDL schema establishing all 8 required offline tables and indices. |
| `src/mobile/database/sqlite/connection.ts` | Connection manager for `@capacitor-community/sqlite` with automatic Web/IndexedDB fallback engine. |
| `src/mobile/repositories/profile.repository.ts` | Repository layer for User & Profile SQLite CRUD operations. |
| `src/mobile/repositories/chat.repository.ts` | Repository layer for Conversation & Message SQLite CRUD operations. |
| `src/mobile/repositories/pending.repository.ts` | Repository layer for Offline `pending_messages` and `pending_uploads` sync queues. |
| `src/mobile/services/storage/storageService.ts` | Secure local storage manager leveraging `@capacitor/preferences` for session tokens and preferences. |
| `src/mobile/services/sync/syncService.ts` | Automatic offline/online Synchronization Engine with backoff, file upload pipeline, and server delta fetching. |
| `src/mobile/services/notifications/notificationService.ts` | Push notification service using `@capacitor/push-notifications` with local token storage and deep link tap routing. |
| `src/mobile/auth/Splash.tsx` | Mobile Splash screen with session check. |
| `src/mobile/auth/Login.tsx` | Mobile Login screen with Supabase auth and local session caching. |
| `src/mobile/auth/Signup.tsx` | Mobile Signup screen. |
| `src/mobile/auth/ForgotPassword.tsx` | Mobile Forgot Password screen. |
| `src/mobile/profile/ProfileScreen.tsx` | Mobile Profile screen with avatar camera capture (`@capacitor/camera`), SQLite cache, and server sync. |
| `src/mobile/chat/ConversationList.tsx` | Offline-first Conversation List reading directly from SQLite database. |
| `src/mobile/chat/ChatScreen.tsx` | Offline-first Chat Screen reading/writing to local SQLite database with pending queueing. |
| `src/mobile/components/MobileContainer.tsx` | Root container managing platform isolation, app lifecycle events (`cold start`, `resume`, `background`), and screen routing. |
| `src/components/providers.tsx` | Wrapped `{children}` inside `MobileContainer` for platform-isolated execution. |
| `native.md` | Developer documentation & implementation guide. |

---

## 3. Database Schemas

### A. Server Database (PostgreSQL / Supabase - Single Source of Truth)
- `public.profiles` (`id`, `name`, `email`, `avatar`, `phone`, `bio`, `status`)
- `public.conversations` (`id`, `type`, `name`, `image`, `created_by`, `created_at`)
- `public.conversation_members` (`id`, `conversation_id`, `user_id`, `joined_at`)
- `public.chat_messages` (`id`, `conversation_id`, `owner_user_id`, `sender_user_id`, `message`, `message_type`, `direction`, `sent`, `received`, `message_status`, `client_message_id`, `file_url`, `created_at`)
- `public.notifications` (`id`, `user_id`, `sender_id`, `message_id`, `message_text`, `read`)

### B. Mobile Local Offline Database (SQLite Schema)
The local SQLite database stores data in 8 dedicated tables:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  status TEXT DEFAULT 'offline',
  last_seen TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  name TEXT,
  image TEXT,
  unread_count INTEGER DEFAULT 0,
  last_message_text TEXT,
  last_message_at TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL,
  conversation_id TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  sender_user_id TEXT NOT NULL,
  message TEXT,
  message_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  sent INTEGER DEFAULT 1,
  received INTEGER DEFAULT 1,
  message_status TEXT DEFAULT 'sent',
  client_message_id TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  duration REAL,
  replyto_message_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  contact_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pending_messages (
  id TEXT PRIMARY KEY NOT NULL,
  client_message_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  message TEXT,
  message_type TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  reply_metadata TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pending_uploads (
  id TEXT PRIMARY KEY NOT NULL,
  local_path TEXT NOT NULL,
  folder TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Offline-First Synchronization Engine Flow

```
User Sends Message in Mobile Chat
              │
              ▼
   1. Save Immediately to SQLite (`messages` & `conversations`)
   2. Render instantly in UI (Status: 'pending' if offline)
              │
              ▼
     Is Network Online? (SyncService.isOnline())
            ┌─┴─┐
            │   │
      YES   │   │ NO
      ▼     │   ▼
   3. Send  │  3. Add to SQLite `pending_messages` table
   to API   │  4. Wait for Network Listener (`@capacitor/network`)
      │     │   │
      ▼     │   ▼
   4. Update│  5. Network returns online -> Trigger `SyncService.syncAll()`
   Status   │  6. Read pending_messages -> Upload to API
   'sent'   │  7. Remove from pending_messages -> Mark status 'sent'
```

---

## 5. API Usage Mapping Matrix (Zero API Duplication)

| Mobile Action | Backend REST API Route / Provider | Method |
|---|---|---|
| Mobile Login | Supabase Auth `signInWithPassword` | SDK |
| Mobile Signup | Supabase Auth `signUp` | SDK |
| Password Reset | Supabase Auth `resetPasswordForEmail` | SDK |
| Fetch Conversations | `/api/conversations?userId={id}` | `GET` |
| Fetch Messages | `/api/messages?conversationId={id}&userId={userId}` | `GET` |
| Send Message | `/api/messages` | `POST` |
| Upload Avatar / File | `/api/upload` | `POST` |
| Update Profile | `/api/profiles/[id]` | `PATCH` |
| Delivery / Read Receipts | `/api/messages/delivery` / `/api/conversations/[id]/read` | `PATCH` |

---

## 6. Testing & Verification Steps

1. **Authentication Flow**:
   - Open app -> Splash screen checks session.
   - If unauthenticated, displays Mobile Login screen.
   - Login / Signup creates session, stores tokens via `@capacitor/preferences`, and navigates to Chat List.
2. **Profile Screen**:
   - Tap profile avatar -> Opens native Profile Screen.
   - Tap Camera icon -> Triggers `@capacitor/camera` photo capture.
   - Uploads avatar to `/api/upload` and syncs profile to local SQLite & server.
3. **Offline Chat & SQLite Persistence**:
   - Turn off Wi-Fi/Mobile Data.
   - Send message -> Message saves to local SQLite database immediately and displays in UI with clock icon (`pending`).
   - Turn on Wi-Fi/Mobile Data -> `SyncService` detects network reconnect, uploads pending message to server, and updates checkmark (`sent`).
4. **Push Notifications & App Resume**:
   - When backgrounded, `appStateChange` listener triggers auto-sync on app resume.
   - Push notifications tap auto-opens the corresponding chat.

---

## 7. Command Reference for Building & Deploying

```bash
# 1. Install dependencies & Capacitor native plugins
npm install @capacitor/preferences @capacitor-community/sqlite @capacitor/camera @capacitor/filesystem @capacitor/network @capacitor/push-notifications @capacitor/assets

# 2. Generate official Amoga Native app logo, launcher icons & splash screen assets (148 files)
node scripts/generate-assets.js

# 3. Sync native assets to Android container
npx cap sync android

# 4. Build signed Debug APK (for instant testing on Android phone with amoganative branding)
cd android
.\gradlew.bat assembleDebug
# Generated APK: android/app/build/outputs/apk/debug/app-debug.apk

# 5. Build signed Release APK
cd android
.\gradlew.bat assembleRelease
# Generated APK: android/app/build/outputs/apk/release/app-release-unsigned.apk

# 6. Deploy Live Web Updates (Over-The-Air)
npx vercel --prod
```
