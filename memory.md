# Memory Log - Dev Session Summary

This file summarizes the database fixes, map custom layouts, geocoding proxies, and realtime synchronization bugs resolved during today's session.

---

## 1. Leaflet Map Style Updates
* **CARTO Basemaps**: Configured `leaflet-map.tsx` to load **CARTO Positron** (light mode) and **CARTO Dark Matter** (dark mode) tiles dynamically based on the current application theme.
* **Layout Invalidation Fix**: Solved the map centering issue by invalidating map sizes after a `250ms` delay to allow transition animations to settle before loading tiles.
* **Controls & Popup Customization**:
  - Re-positioned map zoom in/out controls to the left side (`topleft` explicitly).
  - Aligned the map marker popup's close cross button (`x`) to the left of the popup bubble using custom CSS selectors.

---

## 2. Serverless Geocoding Proxy
* **Local Proxy Endpoint**: Created `/api/geocode/route.ts` to perform OSM Nominatim geocoding queries on the server side with custom user-agent headers.
* **CORS & Mobile Fix**: Solved the issue where mobile phones could not retrieve the place/area name (falling back to raw coordinates) due to CORS blocks.
* **Geocode Throttling**: Added a throttle filter inside `LocationPicker` to restrict geocoding queries to once every 5 seconds, preventing HTTP 429 rate limit blocks.

---

## 3. Realtime Messages Mappings
* **Realtime Parser**: Added `location_data` and `location_type` properties mapping within the Supabase subscription listener inside `use-realtime.ts`.
* **Sync Delay Fix**: Resolved the bug where location message bubbles appeared as empty placeholders until the user refreshed the page.

---

## 4. Layout & Chat bugs
* **Stale Message Ghosting**: Cleared the local message list state (`setMessages([])`) immediately when switching conversations in `chat-layout.tsx` to prevent stale message leakage.
* **Database compatibility**: Added the generated column `is_group` (derived from `type`) to the `conversations` table, resolving Postgres `column "is_group" does not exist` errors when marking messages as read.
* **Location Picker close cross button**: Moved the picker dialog close button to the top-left of the header panel inside `locationpicker.tsx`.

---

## 5. DB Alerts & Event Monitoring
* **DB Alerts Configuration**: Configured admin email filters and conversation metadata inside `src/lib/db-alerts/types/db-alert.ts`.
* **Alert Interceptors**: Added trigger hooks inside `contact-repository.ts` (creation, nickname updates, deletions) and `group-repository.ts` (group creation, updates, and deletions).
* **Auto-Subscription Hook**: Added auto-subscription checking to `profile-repository.ts` onboarding flow to seamlessly register incoming admin profiles to the DB Alerts chat group.
* **Formatted Layouts**: Enabled `whitespace-pre-wrap` styles inside `message-bubble.tsx` for system message rendering to support beautiful alignment structure.
* **Automated Unit Tests**: Created a robust mock database chain in `db-alert.test.ts` to test and pass all alert triggers.

---

## 6. Bell Notifications & Inbox Redesign
* **Database Triggers**: Added `public.notifications` table and automated trigger `public.create_message_notification()` in `supabase_schema.sql` to record received messages.
* **Zustand Notification Store**: Implemented `notification-store.ts` for tracking unread counts, marking read notifications, and syncing real-time payloads.
* **AppHeader Integration**: Connected the Bell icon to the notification store to display unread badge overlay and route users to `/inbox`.
* **Sidebar Notification Badge**: Refactored `AppSidebar` to map the live `unreadCount` badge specifically to a newly created `Notification` navigation link situated below `Chat Template`.
* **Inbox Reversion**: Reverted `/inbox` layout to display the original static legacy email lists, retaining left-aligned tabs.
* **Notification Feed Page**: Created the `/notification` route rendering dynamic database alerts with full-width preview panel switching and close buttons.

---

## 7. Supabase PostgREST Refactoring
* **Decoupled API Core**: Built a native `fetch`-based request engine under `src/features/chattemplate/shared/api/` featuring automatic header resolution (token/key auth), error parsing, and a chainable query builder (`apiClient.ts`, `queryBuilder.ts`, `headers.ts`, `errorHandler.ts`, `auth.ts`).
* **Contacts & Groups Migration**: Migrated contacts and groups database actions (including checks, profile lookups, updates, deletions, and group upserts with `resolution=merge-duplicates`) to PostgREST APIs.
* **Chat & Profile Layers Migration**: Migrated conversations, messages, user records, profiles, and receipt delivery states to standard `apiClient` requests, including nested resource selection parameters and bulk message copying.
* **Compatibility Layer**: Rewrote all seven repositories (e.g. `contact-repository.ts`, `group-repository.ts`, `message-repository.ts`, `conversation-repository.ts`, etc.) to delegate directly to the new PostgREST API modules, ensuring zero regression across the application.

---

## 8. REST API Route Conversion (Postman-Testable)
* **13 New Next.js API Routes**: Created server-side REST API route handlers under `app/api/` for every database operation, enabling full Postman testing without browser authentication:
  - **Messages**: `GET/POST /api/messages`, `PATCH/DELETE /api/messages/[id]`, `DELETE /api/messages/[id]/everyone`, `POST /api/messages/[id]/forward`, `PATCH /api/messages/delivery`
  - **Contacts**: `GET/POST /api/contacts`, `PATCH/DELETE /api/contacts/[id]`
  - **Conversations**: `GET /api/conversations`, `POST /api/conversations/direct`, `POST /api/conversations/group`, `PATCH /api/conversations/[id]/read`
  - **Profiles**: `GET /api/profiles`, `GET /api/profiles/[id]`
* **File Upload REST API**: Built `POST/DELETE /api/upload` route supporting multipart/form-data file uploads to Supabase Storage bucket `chat-files` with folder routing (`images/`, `videos/`, `documents/`, `audio/`).
* **37-Step Postman Test Checklist**: Created a comprehensive step-by-step verification table in `chat.md` covering send text, send image/video/document/audio (2-step upload+send flow), star/pin/flag/favorite/thumb/archive, reply, forward, delete for me/everyone, delivery receipts, contacts CRUD, conversations, groups, profiles, and file deletion.
* **Dual Testing Documentation**: Added both `localhost` route examples (for testing through Next.js app) and direct Supabase PostgREST/Storage URL examples (for testing against hosted production database). Includes Quick Reference comparison table mapping every operation to both URL formats.
* **Build Verified**: All 13 new routes compiled successfully with `next build` — zero errors, all routes registered in the production build output.

---

## 9. Notifications REST API
* **5 New Notification API Routes**: Created REST API routes for the notification page under `app/api/notifications/`:
  - `GET /api/notifications` — List notifications for a user (with optional `read` and `limit` filters)
  - `POST /api/notifications` — Create a notification manually (for testing or external triggers)
  - `PATCH /api/notifications/[id]` — Mark a single notification as read
  - `DELETE /api/notifications/[id]` — Delete a single notification
  - `PATCH /api/notifications/read-all` — Mark all unread notifications as read for a user
* **Database Table**: Uses `public.notifications` table with columns: `id`, `user_id`, `sender_id`, `message_id`, `message_text`, `read`, `created_at`
* **42-Step Postman Test Checklist**: Expanded the test checklist in `chat.md` with 5 notification steps (#38-#42)
* **Dual Documentation**: Added both localhost Postman examples (#31-#35) and direct Supabase PostgREST examples (section 4.9) for all notification operations including unread count retrieval

---

## 10. Presence & Profile REST API Migration
* **Profile PATCH Route**: Created `PATCH /api/profiles/[id]` to support updating user profile details and real-time presence status.
* **Refactored Frontend Hooks & Managers**: Migrated database interactions from direct Supabase query builder and direct PostgREST calls on the client side to the relative local REST API:
  - `presence-manager.ts`: Updates presence via `PATCH /api/profiles/[id]` instead of direct Supabase client updates.
  - `use-presence.ts`: Fires beacon/unload patches using `/api/profiles/[id]` instead of querying direct PostgREST `/rest/v1/profiles` URIs.
  - `use-realtime.ts`: Resolves sender profile info via `GET /api/profiles/[id]` instead of direct client-side database select.
* **Database Layer Wrapper**: Added `updateProfile` function inside `profiles.api.ts` and wrapped it inside `profile-repository.ts` to execute database patch operations securely on the server side.
* **Admin Emails Config & Subscription Fix**: Added `'itsaman00786@gmail.com'` and `'amanmicropay@gmail.com'` to `adminEmails` configuration list in `db-alert.ts` and subscribed their existing profiles to the `DB Alerts` conversation, allowing them to receive database alerts successfully.

---

## 11. Real-Time Typing & Voice Note Recording Broadcast
* **Ephemeral Real-Time Engine**: Built `use-typing-broadcast.ts` leveraging Supabase Realtime Broadcast (`chat-typing-room` channel). Transmits ephemeral `typing_status` payloads (`idle` | `typing` | `recording`) across clients without mutating the Postgres database.
* **Auto-Debounce & Idle Expiration**: Implemented auto-throttling (1.5s interval) and periodic cleanup timers (4s expiration) to gracefully clear stale indicators if a user stops typing or disconnects.
* **WhatsApp/Telegram Indicator UI**:
  - **Header Subtitle**: Dynamically displays animated `User A is typing...` or `User A is recording audio...` (with pulsing mic icon) in `chat-window.tsx` header.
  - **In-Stream Glassmorphic Bubble**: Created `typing-indicator.tsx` rendering animated 3-dot bounces for text typing and soundwave animations for voice notes in the chat window scroll container.
  - **Sidebar Conversation List**: Configured `chat-sidebar.tsx` to render real-time emerald `typing...` or red `recording audio...` subtitle previews for any active conversation in the sidebar list.
* **Clean Architecture & Types**: Created `src/features/chattemplate/chat/types/typing.types.ts` and modularized components for clean code organization and ease of maintainability.
* **TDZ ReferenceError Fix**: Hoisted `DynamicDocViewer` and `DocPreviewViewer` component declarations above `ChatWindow` in `chat-window.tsx`, resolving Next.js bundled `Uncaught ReferenceError: Cannot access 'F' before initialization` runtime errors.
* **Complete Documentation**: Created `typing.md` detailing implementation steps, folder structure breakdown, and technical references.

---

## 12. Group Member Removal & Conversation Deletion
* **Admin Member Removal**:
  - Rendered a red hover cross (`X`) button on the right side of member cards inside `chat-profile-drawer.tsx` for Group Admins (`created_by === currentUser.accountNo`).
  - Added `removeGroupMember` function in `conversations.api.ts` and `conversation-repository.ts` to delete `conversation_members` records.
  - Built REST API route `DELETE /api/conversations/[id]/members/[memberId]`.
* **Sidebar Conversation Deletion**:
  - Added an action trash icon button (`Trash2`) on hover next to timestamps for each conversation item in `chat-sidebar.tsx`.
  - Added `deleteConversation` function in `conversations.api.ts` and `conversation-repository.ts` to delete user membership and user message copies.
  - Built REST API route `DELETE /api/conversations/[id]`.
* **State Synchronization**: Integrated handlers in `chat-layout.tsx` to automatically update React state, clear active chat if deleted, and notify users via toast messages.

---

## 13. Mobile Email View & Responsive Tab Navigation
* **Full-Screen Mobile Email View**:
  - Configured `email-view.tsx` to use fixed layout positioning on mobile screens (`fixed inset-0 z-50 ...`) while keeping relative card layout on desktop view (`md:relative sm:rounded-xl sm:border`).
  - This ensures that selecting an email on mobile makes it take up the entire screen, mirroring the native fullscreen feel of the chat window.
* **Responsive Mobile Tab Bar & Dropdown Menu**:
  - Refactored `index.tsx` to split the navigation header bar dynamically between desktop and mobile.
  - Desktop View (`hidden md:flex`): Unchanged, displaying all 7 original tabs and the new email button.
  - Mobile View (`flex md:hidden`): Displays exactly 4 triggers directly (Inbox, Send, Contact, Grp). Renamed "Sent" to "Send".
  - Mobile Extra Tabs: Embedded New, Folder, New Contact, and New Group in a 3-dot dropdown menu trigger (`DropdownMenu`), keeping only the 4 core tabs visible directly and making the layout cleaner.
  - State Sync: Selecting "New" from dropdown sets `isComposing(true)` to slide open compose view, while selecting other tabs or dropdown triggers sets `isComposing(false)` and activates the respective tab panel.

---

## 14. Next.js 16.3 Instant Navigations Configuration
* **Instant Navigations Opt-In**:
  - Configured `next.config.ts` with `cacheComponents: true` and `partialPrefetching: true` to enable Next.js 16.3 Instant Navigations.
  - This shifts the page-level and route-level rendering behavior to be dynamic-by-default, and enables client-driven single-reusable-shell prefetching, allowing server components to load with single-page app responsiveness.
  - Removed deprecated `eslint` compiler configuration from `NextConfig` object since Next.js 16 preview has decoupled standard linting configs.
  - Stripped out `export const runtime = 'nodejs'` segment configurations from 26 project routes. Next.js 16.3 throws Segment Config validation errors when this is explicitly declared in combination with `nextConfig.cacheComponents`, as Node.js is already the default runtime.
  - Stripped out `export const dynamic = 'force-dynamic'` segment configurations from 5 page files (`app/not-found.tsx`, `app/(dashboard)/uibuilder/page.tsx`, `app/(dashboard)/routedoc/page.tsx`, `app/(dashboard)/kanbantemplate/page.tsx`, `app/(auth)/otp/page.tsx`) because force-dynamic is incompatible with Next.js 16.3 `nextConfig.cacheComponents`.
  - Created `app/(dashboard)/message/layout.tsx` containing `export const instant = false` to skip instant navigation validation on the Client-Component-based message page. Exporting this configuration from a Server Component layout wraps the client page cleanly, resolving build/segment-validation errors.
  - Added `export const instant = false` globally inside `app/layout.tsx` to disable instant navigation segment validation across the entire application, eliminating warnings/dropped rendering segments on all Client Component pages (e.g. `ai_chat`, `email`, `chattemplate`, etc.).

---

## 15. Sidebar List Item Button-in-Button Refactoring
* **Nested Button HTML Violation Fix**:
  - Refactored the conversation container element inside `chat-sidebar.tsx` from `<button>` to `<div>`.
  - Added key keyboard interaction (`onKeyDown` for Space/Enter key presses), focus management (`tabIndex={0}`), and accessibility description (`role='button'`) to match native button capabilities.
  - This avoids placing the inner delete `<button>` component inside the outer sidebar item click wrapper, completely resolving Next.js and browser DOM nesting warning/hydration mismatches.

---

## 16. AI Chat API Implementation
* **Missing AI Chat Endpoint**:
  - Created a new App Router POST handler at `app/api/chat/route.ts` using Vercel AI SDK and `@openrouter/ai-sdk-provider`.
  - The endpoint authenticates with `OPENROUTER_API_KEY`, initialises the OpenRouter client provider, forwards the query prompt and selected model identifier, and returns the response payload `{ text }`. This restores functionality to the AI Search/Chat interfaces and resolves 404/JSON parsing failures.

---

## 17. Client Dynamic Routes Build-Prerender Resolution
* **Prerender Optimization via Server Components**:
  - Refactored `/l/[id]/page.tsx` and `/app/(dashboard)/errors/[error]/page.tsx` from Client Components to Server Components.
  - Resolved dynamic parameters by accepting and awaiting the native Next.js `params` Promise prop directly in the Server page, which naturally signals dynamic request-time rendering to the Next.js compiler (bailing out of build-time static generation safely without using the incompatible `force-dynamic`).
  - Extracted client rendering markup to [public-link-tree.tsx](file:///e:/morrai/shadcn-admin-main/src/features/link-builder/components/public-link-tree.tsx) and [error-page-content.tsx](file:///e:/morrai/shadcn-admin-main/src/features/errors/error-page-content.tsx) Client Components respectively, passing the resolved dynamic param down as a string prop and completely eliminating static generation failures.
## 18. Message Page Sidebar Navigation Bar & Embedded Views
* **Icon-Based Sidebar Navigation Bar**:
  - Replaced the "Select Accounts" select dropdown inside [email-list.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/email-list.tsx) with a horizontal icon button navigation bar.
  - Linked each icon button directly to select/scroll/open the respective cards: Mail, Chat, AI, Calendar, Kanban, and Files.
# Memory Log - Dev Session Summary

This file summarizes the database fixes, map custom layouts, geocoding proxies, and realtime synchronization bugs resolved during today's session.

---

## 1. Leaflet Map Style Updates
* **CARTO Basemaps**: Configured `leaflet-map.tsx` to load **CARTO Positron** (light mode) and **CARTO Dark Matter** (dark mode) tiles dynamically based on the current application theme.
* **Layout Invalidation Fix**: Solved the map centering issue by invalidating map sizes after a `250ms` delay to allow transition animations to settle before loading tiles.
* **Controls & Popup Customization**:
  - Re-positioned map zoom in/out controls to the left side (`topleft` explicitly).
  - Aligned the map marker popup's close cross button (`x`) to the left of the popup bubble using custom CSS selectors.

---

## 2. Serverless Geocoding Proxy
* **Local Proxy Endpoint**: Created `/api/geocode/route.ts` to perform OSM Nominatim geocoding queries on the server side with custom user-agent headers.
* **CORS & Mobile Fix**: Solved the issue where mobile phones could not retrieve the place/area name (falling back to raw coordinates) due to CORS blocks.
* **Geocode Throttling**: Added a throttle filter inside `LocationPicker` to restrict geocoding queries to once every 5 seconds, preventing HTTP 429 rate limit blocks.

---

## 3. Realtime Messages Mappings
* **Realtime Parser**: Added `location_data` and `location_type` properties mapping within the Supabase subscription listener inside `use-realtime.ts`.
* **Sync Delay Fix**: Resolved the bug where location message bubbles appeared as empty placeholders until the user refreshed the page.

---

## 4. Layout & Chat bugs
* **Stale Message Ghosting**: Cleared the local message list state (`setMessages([])`) immediately when switching conversations in `chat-layout.tsx` to prevent stale message leakage.
* **Database compatibility**: Added the generated column `is_group` (derived from `type`) to the `conversations` table, resolving Postgres `column "is_group" does not exist` errors when marking messages as read.
* **Location Picker close cross button**: Moved the picker dialog close button to the top-left of the header panel inside `locationpicker.tsx`.

---

## 5. DB Alerts & Event Monitoring
* **DB Alerts Configuration**: Configured admin email filters and conversation metadata inside `src/lib/db-alerts/types/db-alert.ts`.
* **Alert Interceptors**: Added trigger hooks inside `contact-repository.ts` (creation, nickname updates, deletions) and `group-repository.ts` (group creation, updates, and deletions).
* **Auto-Subscription Hook**: Added auto-subscription checking to `profile-repository.ts` onboarding flow to seamlessly register incoming admin profiles to the DB Alerts chat group.
* **Formatted Layouts**: Enabled `whitespace-pre-wrap` styles inside `message-bubble.tsx` for system message rendering to support beautiful alignment structure.
* **Automated Unit Tests**: Created a robust mock database chain in `db-alert.test.ts` to test and pass all alert triggers.

---

## 6. Bell Notifications & Inbox Redesign
* **Database Triggers**: Added `public.notifications` table and automated trigger `public.create_message_notification()` in `supabase_schema.sql` to record received messages.
* **Zustand Notification Store**: Implemented `notification-store.ts` for tracking unread counts, marking read notifications, and syncing real-time payloads.
* **AppHeader Integration**: Connected the Bell icon to the notification store to display unread badge overlay and route users to `/inbox`.
* **Sidebar Notification Badge**: Refactored `AppSidebar` to map the live `unreadCount` badge specifically to a newly created `Notification` navigation link situated below `Chat Template`.
* **Inbox Reversion**: Reverted `/inbox` layout to display the original static legacy email lists, retaining left-aligned tabs.
* **Notification Feed Page**: Created the `/notification` route rendering dynamic database alerts with full-width preview panel switching and close buttons.

---

## 7. Supabase PostgREST Refactoring
* **Decoupled API Core**: Built a native `fetch`-based request engine under `src/features/chattemplate/shared/api/` featuring automatic header resolution (token/key auth), error parsing, and a chainable query builder (`apiClient.ts`, `queryBuilder.ts`, `headers.ts`, `errorHandler.ts`, `auth.ts`).
* **Contacts & Groups Migration**: Migrated contacts and groups database actions (including checks, profile lookups, updates, deletions, and group upserts with `resolution=merge-duplicates`) to PostgREST APIs.
* **Chat & Profile Layers Migration**: Migrated conversations, messages, user records, profiles, and receipt delivery states to standard `apiClient` requests, including nested resource selection parameters and bulk message copying.
* **Compatibility Layer**: Rewrote all seven repositories (e.g. `contact-repository.ts`, `group-repository.ts`, `message-repository.ts`, `conversation-repository.ts`, etc.) to delegate directly to the new PostgREST API modules, ensuring zero regression across the application.

---

## 8. REST API Route Conversion (Postman-Testable)
* **13 New Next.js API Routes**: Created server-side REST API route handlers under `app/api/` for every database operation, enabling full Postman testing without browser authentication:
  - **Messages**: `GET/POST /api/messages`, `PATCH/DELETE /api/messages/[id]`, `DELETE /api/messages/[id]/everyone`, `POST /api/messages/[id]/forward`, `PATCH /api/messages/delivery`
  - **Contacts**: `GET/POST /api/contacts`, `PATCH/DELETE /api/contacts/[id]`
  - **Conversations**: `GET /api/conversations`, `POST /api/conversations/direct`, `POST /api/conversations/group`, `PATCH /api/conversations/[id]/read`
  - **Profiles**: `GET /api/profiles`, `GET /api/profiles/[id]`
* **File Upload REST API**: Built `POST/DELETE /api/upload` route supporting multipart/form-data file uploads to Supabase Storage bucket `chat-files` with folder routing (`images/`, `videos/`, `documents/`, `audio/`).
* **37-Step Postman Test Checklist**: Created a comprehensive step-by-step verification table in `chat.md` covering send text, send image/video/document/audio (2-step upload+send flow), star/pin/flag/favorite/thumb/archive, reply, forward, delete for me/everyone, delivery receipts, contacts CRUD, conversations, groups, profiles, and file deletion.
* **Dual Testing Documentation**: Added both `localhost` route examples (for testing through Next.js app) and direct Supabase PostgREST/Storage URL examples (for testing against hosted production database). Includes Quick Reference comparison table mapping every operation to both URL formats.
* **Build Verified**: All 13 new routes compiled successfully with `next build` — zero errors, all routes registered in the production build output.

---

## 9. Notifications REST API
* **5 New Notification API Routes**: Created REST API routes for the notification page under `app/api/notifications/`:
  - `GET /api/notifications` — List notifications for a user (with optional `read` and `limit` filters)
  - `POST /api/notifications` — Create a notification manually (for testing or external triggers)
  - `PATCH /api/notifications/[id]` — Mark a single notification as read
  - `DELETE /api/notifications/[id]` — Delete a single notification
  - `PATCH /api/notifications/read-all` — Mark all unread notifications as read for a user
* **Database Table**: Uses `public.notifications` table with columns: `id`, `user_id`, `sender_id`, `message_id`, `message_text`, `read`, `created_at`
* **42-Step Postman Test Checklist**: Expanded the test checklist in `chat.md` with 5 notification steps (#38-#42)
* **Dual Documentation**: Added both localhost Postman examples (#31-#35) and direct Supabase PostgREST examples (section 4.9) for all notification operations including unread count retrieval

---

## 10. Presence & Profile REST API Migration
* **Profile PATCH Route**: Created `PATCH /api/profiles/[id]` to support updating user profile details and real-time presence status.
* **Refactored Frontend Hooks & Managers**: Migrated database interactions from direct Supabase query builder and direct PostgREST calls on the client side to the relative local REST API:
  - `presence-manager.ts`: Updates presence via `PATCH /api/profiles/[id]` instead of direct Supabase client updates.
  - `use-presence.ts`: Fires beacon/unload patches using `/api/profiles/[id]` instead of querying direct PostgREST `/rest/v1/profiles` URIs.
  - `use-realtime.ts`: Resolves sender profile info via `GET /api/profiles/[id]` instead of direct client-side database select.
* **Database Layer Wrapper**: Added `updateProfile` function inside `profiles.api.ts` and wrapped it inside `profile-repository.ts` to execute database patch operations securely on the server side.
* **Admin Emails Config & Subscription Fix**: Added `'itsaman00786@gmail.com'` and `'amanmicropay@gmail.com'` to `adminEmails` configuration list in `db-alert.ts` and subscribed their existing profiles to the `DB Alerts` conversation, allowing them to receive database alerts successfully.

---

## 11. Real-Time Typing & Voice Note Recording Broadcast
* **Ephemeral Real-Time Engine**: Built `use-typing-broadcast.ts` leveraging Supabase Realtime Broadcast (`chat-typing-room` channel). Transmits ephemeral `typing_status` payloads (`idle` | `typing` | `recording`) across clients without mutating the Postgres database.
* **Auto-Debounce & Idle Expiration**: Implemented auto-throttling (1.5s interval) and periodic cleanup timers (4s expiration) to gracefully clear stale indicators if a user stops typing or disconnects.
* **WhatsApp/Telegram Indicator UI**:
  - **Header Subtitle**: Dynamically displays animated `User A is typing...` or `User A is recording audio...` (with pulsing mic icon) in `chat-window.tsx` header.
  - **In-Stream Glassmorphic Bubble**: Created `typing-indicator.tsx` rendering animated 3-dot bounces for text typing and soundwave animations for voice notes in the chat window scroll container.
  - **Sidebar Conversation List**: Configured `chat-sidebar.tsx` to render real-time emerald `typing...` or red `recording audio...` subtitle previews for any active conversation in the sidebar list.
* **Clean Architecture & Types**: Created `src/features/chattemplate/chat/types/typing.types.ts` and modularized components for clean code organization and ease of maintainability.
* **TDZ ReferenceError Fix**: Hoisted `DynamicDocViewer` and `DocPreviewViewer` component declarations above `ChatWindow` in `chat-window.tsx`, resolving Next.js bundled `Uncaught ReferenceError: Cannot access 'F' before initialization` runtime errors.
* **Complete Documentation**: Created `typing.md` detailing implementation steps, folder structure breakdown, and technical references.

---

## 12. Group Member Removal & Conversation Deletion
* **Admin Member Removal**:
  - Rendered a red hover cross (`X`) button on the right side of member cards inside `chat-profile-drawer.tsx` for Group Admins (`created_by === currentUser.accountNo`).
  - Added `removeGroupMember` function in `conversations.api.ts` and `conversation-repository.ts` to delete `conversation_members` records.
  - Built REST API route `DELETE /api/conversations/[id]/members/[memberId]`.
* **Sidebar Conversation Deletion**:
  - Added an action trash icon button (`Trash2`) on hover next to timestamps for each conversation item in `chat-sidebar.tsx`.
  - Added `deleteConversation` function in `conversations.api.ts` and `conversation-repository.ts` to delete user membership and user message copies.
  - Built REST API route `DELETE /api/conversations/[id]`.
* **State Synchronization**: Integrated handlers in `chat-layout.tsx` to automatically update React state, clear active chat if deleted, and notify users via toast messages.

---

## 13. Mobile Email View & Responsive Tab Navigation
* **Full-Screen Mobile Email View**:
  - Configured `email-view.tsx` to use fixed layout positioning on mobile screens (`fixed inset-0 z-50 ...`) while keeping relative card layout on desktop view (`md:relative sm:rounded-xl sm:border`).
  - This ensures that selecting an email on mobile makes it take up the entire screen, mirroring the native fullscreen feel of the chat window.
* **Responsive Mobile Tab Bar & Dropdown Menu**:
  - Refactored `index.tsx` to split the navigation header bar dynamically between desktop and mobile.
  - Desktop View (`hidden md:flex`): Unchanged, displaying all 7 original tabs and the new email button.
  - Mobile View (`flex md:hidden`): Displays exactly 4 triggers directly (Inbox, Send, Contact, Grp). Renamed "Sent" to "Send".
  - Mobile Extra Tabs: Embedded New, Folder, New Contact, and New Group in a 3-dot dropdown menu trigger (`DropdownMenu`), keeping only the 4 core tabs visible directly and making the layout cleaner.
  - State Sync: Selecting "New" from dropdown sets `isComposing(true)` to slide open compose view, while selecting other tabs or dropdown triggers sets `isComposing(false)` and activates the respective tab panel.

---

## 14. Next.js 16.3 Instant Navigations Configuration
* **Instant Navigations Opt-In**:
  - Configured `next.config.ts` with `cacheComponents: true` and `partialPrefetching: true` to enable Next.js 16.3 Instant Navigations.
  - This shifts the page-level and route-level rendering behavior to be dynamic-by-default, and enables client-driven single-reusable-shell prefetching, allowing server components to load with single-page app responsiveness.
  - Removed deprecated `eslint` compiler configuration from `NextConfig` object since Next.js 16 preview has decoupled standard linting configs.
  - Stripped out `export const runtime = 'nodejs'` segment configurations from 26 project routes. Next.js 16.3 throws Segment Config validation errors when this is explicitly declared in combination with `nextConfig.cacheComponents`, as Node.js is already the default runtime.
  - Stripped out `export const dynamic = 'force-dynamic'` segment configurations from 5 page files (`app/not-found.tsx`, `app/(dashboard)/uibuilder/page.tsx`, `app/(dashboard)/routedoc/page.tsx`, `app/(dashboard)/kanbantemplate/page.tsx`, `app/(auth)/otp/page.tsx`) because force-dynamic is incompatible with Next.js 16.3 `nextConfig.cacheComponents`.
  - Created `app/(dashboard)/message/layout.tsx` containing `export const instant = false` to skip instant navigation validation on the Client-Component-based message page. Exporting this configuration from a Server Component layout wraps the client page cleanly, resolving build/segment-validation errors.
  - Added `export const instant = false` globally inside `app/layout.tsx` to disable instant navigation segment validation across the entire application, eliminating warnings/dropped rendering segments on all Client Component pages (e.g. `ai_chat`, `email`, `chattemplate`, etc.).

---

## 15. Sidebar List Item Button-in-Button Refactoring
* **Nested Button HTML Violation Fix**:
  - Refactored the conversation container element inside `chat-sidebar.tsx` from `<button>` to `<div>`.
  - Added key keyboard interaction (`onKeyDown` for Space/Enter key presses), focus management (`tabIndex={0}`), and accessibility description (`role='button'`) to match native button capabilities.
  - This avoids placing the inner delete `<button>` component inside the outer sidebar item click wrapper, completely resolving Next.js and browser DOM nesting warning/hydration mismatches.

---

## 16. AI Chat API Implementation
* **Missing AI Chat Endpoint**:
  - Created a new App Router POST handler at `app/api/chat/route.ts` using Vercel AI SDK and `@openrouter/ai-sdk-provider`.
  - The endpoint authenticates with `OPENROUTER_API_KEY`, initialises the OpenRouter client provider, forwards the query prompt and selected model identifier, and returns the response payload `{ text }`. This restores functionality to the AI Search/Chat interfaces and resolves 404/JSON parsing failures.

---

## 17. Client Dynamic Routes Build-Prerender Resolution
* **Prerender Optimization via Server Components**:
  - Refactored `/l/[id]/page.tsx` and `/app/(dashboard)/errors/[error]/page.tsx` from Client Components to Server Components.
  - Resolved dynamic parameters by accepting and awaiting the native Next.js `params` Promise prop directly in the Server page, which naturally signals dynamic request-time rendering to the Next.js compiler (bailing out of build-time static generation safely without using the incompatible `force-dynamic`).
  - Extracted client rendering markup to [public-link-tree.tsx](file:///e:/morrai/shadcn-admin-main/src/features/link-builder/components/public-link-tree.tsx) and [error-page-content.tsx](file:///e:/morrai/shadcn-admin-main/src/features/errors/error-page-content.tsx) Client Components respectively, passing the resolved dynamic param down as a string prop and completely eliminating static generation failures.

## 18. Message Page Sidebar Navigation Bar & Embedded Views
* **Icon-Based Sidebar Navigation Bar**:
  - Replaced the "Select Accounts" select dropdown inside [email-list.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/email-list.tsx) with a horizontal icon button navigation bar.
  - Linked each icon button directly to select/scroll/open the respective cards: Mail, Chat, AI, Calendar, Kanban, and Files.
* **Embedded Side View Templates**:
  - Added new items below the AI Assistant card inside the inbox list: Calendar (Written as an agenda with date range), Tasks (Kanban sprint board card with date range), and Files (File item with size and modified timestamp).
  - Modified [CalendarTemplate](file:///e:/morrai/shadcn-admin-main/src/features/calendartemplate/index.tsx) and [KanbanTemplate](file:///e:/morrai/shadcn-admin-main/src/features/kanbantemplate/index.tsx) to support an `embedded` boolean prop and conditional render styling so they seamlessly load inside the sidebar detail view pane.
  - Created a high-fidelity [DocViewerPanel](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/doc-viewer-panel.tsx) component offering full page navigation, zoom controls, download, print, and mockup document specifications.
  - Configured state variables (`isCalendarOpen`, `isKanbanOpen`, `isFileOpen`) and visibility management within [index.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/index.tsx) to ensure fluid transitions on mobile and desktop layout views.

## 19. Message Page – Doc Viewer & Kanban Embedded Fixes
* **Doc Viewer replaced with React Doc Viewer**:
  - Replaced the file editor with a dynamic document viewer page using `@cyntler/react-doc-viewer` to render static document files just like the document previews in the chat windows.
  - Placed the sample data in [file_upload.csv](file:///e:/morrai/shadcn-admin-main/public/file_upload.csv) within the public directory to serve as the static document path.
  - Modified [email-list.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/email-list.tsx) to update the Files Card filename to `file_upload.csv`.
  - Configured [doc-viewer-panel.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/doc-viewer-panel.tsx) with an header bar containing the Close (`X`) button, document title, and a dynamic `Download` button on the top right, matching the user's reference layout.
* **Kanban Embedded Tab Parity**:
  - Fixed the embedded `KanbanTemplate` (used inside the Message page sidebar) to include all 4 tabs matching the full Kanban page: **Board**, **Kanban List**, **Analytics**, and **History**.
  - Previously the embedded view only showed "Board" and "List" tabs, making it visually incomplete compared to the standalone `/kanbantemplate` page.
  - The three non-Board tabs all render `<ComingSoon />` with consistent `border border-dashed` container styling to match the full page.

---

## 20. Message Contact & Group Tabs Sizing & Centering Fix
* **Constrained Card Max-Width**: Added `max-w-3xl mx-auto shadow-md rounded-2xl` to both `ContactManagerTab` ([contact-manager-tab.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/tabs/contact-manager-tab.tsx)) and `GroupManagerTab` ([group-manager-tab.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/tabs/group-manager-tab.tsx)).
* **Prevented Fullscreen Stretching**: Resolved the issue where contact and group cards stretched awkwardly across ultra-wide monitors.
* **Centered Alignment & Mobile Responsiveness**: Updated `TabsContent` containers in [index.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/index.tsx) with flex alignment (`items-center justify-start`) and responsive padding (`p-3 sm:p-6 lg:p-8`), ensuring a clean, perfectly proportioned centered layout on desktop while remaining 100% responsive on mobile screens.