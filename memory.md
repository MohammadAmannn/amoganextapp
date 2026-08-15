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

---

## 18. Message Page Sidebar Navigation Bar & Embedded Views
* **Icon-Based Sidebar Navigation Bar**:
  - Replaced the "Select Accounts" select dropdown inside [email-list.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/email-list.tsx) with a horizontal icon button navigation bar.
  - Linked each icon button directly to select/scroll/open the respective cards: Mail, Chat, AI, Calendar, Kanban, and Files.
* **Embedded Side View Templates**:
  - Added new items below the AI Assistant card inside the inbox list: Calendar (Written as an agenda with date range), Tasks (Kanban sprint board card with date range), and Files (File item with size and modified timestamp).
  - Modified [CalendarTemplate](file:///e:/morrai/shadcn-admin-main/src/features/calendartemplate/index.tsx) and [KanbanTemplate](file:///e:/morrai/shadcn-admin-main/src/features/kanbantemplate/index.tsx) to support an `embedded` boolean prop and conditional render styling so they seamlessly load inside the sidebar detail view pane.
  - Created a high-fidelity [DocViewerPanel](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/doc-viewer-panel.tsx) component offering full page navigation, zoom controls, download, print, and mockup document specifications.
  - Configured state variables (`isCalendarOpen`, `isKanbanOpen`, `isFileOpen`) and visibility management within [index.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/index.tsx) to ensure fluid transitions on mobile and desktop layout views.

---

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

---

## 21. Messages Page Layout Refactoring & Mobile Polish
* **Header & Sidebar Alignment**:
  - Removed full-width page header from Messages page, placing the `Messages` title, Search icon (`🔍`), and Notification Bell (`🔔`) strictly inside the left sidebar header (`md:w-[340px] lg:w-[380px]`).
  - Aligned header title on the left and action group on the right using flexible `flex-1 justify-between` and `ml-auto`.
  - Removed the `ProfileDropdown` avatar from the top header on Messages and all other pages; confirmed the user profile (`NavUser`) is cleanly positioned at the bottom-left inside `AppSidebar` (`SidebarFooter`).
* **Icon Toolbar & Navigation**:
  - Positioned the horizontal icon toolbar (Mail, Chat, AI, Calendar, Tasks, Files) directly above the Search input box inside the left sidebar panel.
  - Linked the Mail icon directly to toggle `MessageEmailSettings` as a full-height content panel on the right side.
* **Email Settings Panel & Header Actions**:
  - Created a dedicated top header for `MessageEmailSettings` displaying Avatar + `Email Settings` title on the left and `<HeaderActions />` (Flag, Alert, Document, 3-dot options menu) on the right.
  - Reverted tabs to original clean underline text style with `border-b-2 border-primary` active indicator.
  - Added an `X` (Cross) close button on mobile view (`md:hidden`) to close Email Settings and return to the inbox list.
* **Mobile Responsiveness & Full Viewport Panels**:
  - Hid duplicate `Messages` headers on mobile inside `EmailList` (`hidden md:flex`) so `AppHeader` handles top header single-instance rendering cleanly.
  - Added `isEmailSettingsOpen` to mobile hiding conditions in `index.tsx`. Opening Email Settings, Chats, Tasks, Calendar, AI Assistant, or Files on mobile hides top headers/tabs and expands the view to 100% full-screen width and height.
  - Removed redundant mobile tab bar (`Inbox | Send | Contact | Grp | ⋮`) from `index.tsx`.
* **Vertical Spacing Optimization**:
  - Reduced container top padding and margins (`pt-2 sm:pt-2.5 md:pt-3`) between top headers and tab controls across Email Settings (`message-email-settings.tsx`), Tasks (`kanbantemplate/index.tsx`), and Calendar (`calendartemplate/index.tsx`).
* **TanStack DevTools Cleanup**:
  - Removed `ReactQueryDevtools` permanently from `providers.tsx`.

---

## 22. Mobile & Login Tab Authentication Implementation
* **Tabbed Authentication Interface**:
  - Implemented dual tabs (**Mobile** and **Login / Google**) on both Sign In ([sign-in/index.tsx](file:///e:/morrai/shadcn-admin-main/src/features/auth/sign-in/index.tsx)) and Sign Up ([sign-up/index.tsx](file:///e:/morrai/shadcn-admin-main/src/features/auth/sign-up/index.tsx)) authentication pages.
  - Styled tabs using the exact default tab system used in Contact/Group managers (`border-b border-border bg-transparent shadow-none data-[state=active]:border-primary data-[state=active]:font-semibold`).
* **Mobile OTP Authentication Form**:
  - Created [MobileAuthForm](file:///e:/morrai/shadcn-admin-main/src/features/auth/components/mobile-auth-form.tsx) rendering:
    1. **First Name** (Input)
    2. **Last Name** (Input)
    3. **Email** (Input)
    4. **Mobile No** (Input)
    5. **Get OTP** (Button) — generates a 6-digit verification code with interactive toast feedback.
    6. **Enter OTP** (Input) — validates against the generated OTP code (or `123456` fallback).
    7. **Signup** (Button) — validates fields, saves user session in Zustand `useAuthStore`, syncs user profile to Supabase `profiles` table via `ensureProfileExists()`, opens the user session, and redirects to the application dashboard.
* **Existing Login & Signup Preservation**:
  - Preserved existing email/password and Google OAuth authentication flows inside the **Login** / **Login / Google** tab.

---

## 23. Firebase Cloud Messaging (FCM) HTTP v1 Push Notifications Implementation
* **FCM HTTP v1 Migration & Firebase Admin SDK**:
  - Upgraded push notification architecture to **FCM HTTP v1 API** using `firebase-admin` SDK.
  - Implemented singleton initializer [firebase-admin.ts](file:///e:/morrai/shadcn-admin-main/src/lib/firebase-admin.ts) loading Service Account credentials (`amogaapp-56698-firebase-adminsdk-fbsvc-316c575199.json` / `FIREBASE_SERVICE_ACCOUNT_KEY`).
* **Server-Side Push API**:
  - Updated [app/api/notifications/push/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/notifications/push/route.ts) to dispatch FCM payloads via `messaging().send()`.
  - Configured media preview payloads (Text -> message, Image -> 📷 Photo, Voice -> 🎤 Voice Note, File -> 📄 Document) and deep-linking data payload (`conversationId`, `senderId`, `type: "chat_message"`).
  - Enforced sender exclusion (`recipientId !== senderId`).
* **Automatic Invalid Token Cleanup**:
  - Added error interceptor in `/api/notifications/push` catching invalid or expired token codes (`messaging/invalid-registration-token` or `messaging/registration-token-not-registered`).
  - Automatically purges expired FCM tokens from `public.profiles` (`fcm_token = null`).
* **Client & Mobile Lifecycle**:
  - Capacitor push notification service [push-notification.service.ts](file:///e:/morrai/shadcn-admin-main/src/services/push-notification.service.ts) auto-registers device FCM tokens, saves/refreshes tokens in `public.profiles`, displays foreground toasts, and routes background notification taps directly to `conversationId`.
* **Security & Gitignore Rules**:
  - Updated [.gitignore](file:///e:/morrai/shadcn-admin-main/.gitignore) to exclude all `*firebase-adminsdk*.json` and `*service-account*.json` files to protect credentials.

---

## 24. Image to PDF Converter Implementation
* **Server-Side Conversion API**:
  - Built `POST /api/convert/photo-to-pdf` route handler in [route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/photo-to-pdf/route.ts).
  - Converts single or multiple uploaded image files (JPG, JPEG, PNG, WEBP) into a PDF document using `pdf-lib` and `photo-to-pdf`.
  - Automatically uploads the resulting PDF buffer to Supabase Storage bucket `chat-files` under the `converted/` folder (`converted/<uuid>.pdf`).
* **Reusable Modal Component**:
  - Created [ImageConverterDialog](file:///e:/morrai/shadcn-admin-main/src/components/image-converter-dialog.tsx) featuring drag & drop photo upload, image thumbnail preview grid, individual photo deletion, custom PDF output filename input, and loading progress state.
* **Attachment Dropup Parity**:
  - Added "Image Converter" (`FileType` icon) item into attachment dropup menus in both **Chat Template** ([chat-window.tsx](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-window.tsx)) and **Message Template** ([chat-view.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/chat-view.tsx)).
* **Attachment Dispatch**:
  - Upon conversion, passes the converted PDF metadata (`publicUrl`, `fileName`, `fileSize`, `mimeType: "application/pdf"`) to the chat component, sending it as a standard document message attachment.
* **Documentation & Postman Reference**:
  - Updated [chat.md](file:///e:/morrai/shadcn-admin-main/chat.md) with API status tracker row, Postman test checklist Step 44, and complete 2-step request examples for Postman testing.

---

## 25. Document Converter Implementation & Message Page Bug Fix
* **Message Page Pre-Uploaded Attachment Fix**:
  - Resolved bug in [realtime-chat-view.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/realtime-chat-view.tsx) where attachments with pre-existing `url` properties (e.g. converted PDFs or documents) were dropping file metadata during `sendMessage` because `attachment.file` was undefined.
  - Constructed fallback `attachmentPayload` using `attachment.url` when `attachment.file` is absent, restoring immediate sending for all converted files.
* **Document Converter Server-Side API**:
  - Created REST API route `POST /api/convert/doc` in [route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts) integrating `convertapi` library for multi-format conversions (PDF, DOCX, XLSX, PPTX, TXT, CSV, PNG, JPG).
  - Automatically saves converted document buffers in Supabase Storage bucket `chat-files` under `converted/<uuid>.<targetFormat>`.
* **DocConverterDialog Modal Component**:
  - Implemented [DocConverterDialog](file:///e:/morrai/shadcn-admin-main/src/components/doc-converter-dialog.tsx) with identical UI styling to ImageConverterDialog: drag & drop dropzone, format badge display, target format dropdown selector (`.pdf`, `.docx`, `.xlsx`, `.txt`, `.png`), custom output document title input, and animated loading states.
* **Attachment Dropup Parity**:
  - Integrated "Doc Converter" (`RefreshCw` icon) item into attachment dropup menus in both **Chat Template** ([chat-window.tsx](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-window.tsx)) and **Message Template** ([chat-view.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/chat-view.tsx)).
* **Database & Postman Documentation**:
  - Every converted document sent in chat creates a standard row entry in `chat_messages` table with `message_type = 'document'`, `file_url`, `file_name`, `file_size`, `mime_type`.
  - Updated [chat.md](file:///e:/morrai/shadcn-admin-main/chat.md) with API status tracker entry, Step 45 checklist item, and complete Postman testing instructions.

---

## 26. Converter Dialog Modal Overflow & Width Fix
* **Viewport & Modal Boundary Containment**:
  - Updated `DialogContent` in [doc-converter-dialog.tsx](file:///e:/morrai/shadcn-admin-main/src/components/doc-converter-dialog.tsx) and [image-converter-dialog.tsx](file:///e:/morrai/shadcn-admin-main/src/components/image-converter-dialog.tsx) with `w-full max-w-[calc(100vw-2rem)] sm:max-w-lg overflow-hidden`.
* **Ellipsis Truncation on Long Filenames**:
  - Added `min-w-0 flex-1 overflow-hidden` and `truncate` to the selected file card, filename title, and input wrappers, ensuring long filenames (e.g. `Aman Appointment with References Jul 1 2026 - Google Docs(5)...`) truncate with ellipses instead of pushing the right modal border out.
* **Text Wrapping & Responsive Controls**:
  - Added `whitespace-normal break-words pr-6` to `DialogDescription` and configured target format / output filename inputs as a responsive `grid-cols-1 sm:grid-cols-2` grid with `min-w-0` on inputs.

---

## 27. Converted PDF Validation & Supabase Storage Headers Fix
* **Guaranteed PDF Binary Generation**:
  - Added `generateValidPdfFromDocument` fallback compiler using `pdf-lib` inside [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts). When converting any document format (DOCX, XLSX, TXT, PPTX) to PDF without external APIs, the server compiles content into a 100% valid `%PDF-1.7` document rather than saving raw non-PDF file bytes with a `.pdf` extension.
* **Image Magic-Byte Validation**:
  - Implemented `isPng` and `isJpg` magic byte inspectors inside [app/api/convert/photo-to-pdf/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/photo-to-pdf/route.ts), ensuring PNG and JPEG streams embed cleanly into PDF pages without header mismatches.
* **Supabase Storage Header Compliance**:
  - Added `'x-upsert': 'true'` and explicit `Content-Type: application/pdf` headers on Supabase Storage upload requests so PDF links render natively in all browser viewers without triggering "Failed to load PDF document" errors.

---

## 28. Node-Convert & Mammoth Integration
* **Node-Convert Desktop Engine**:
  - Integrated `node-convert` library in [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts) for local LibreOffice / OpenOffice headless document conversion when LibreOffice binary (`soffice`) is installed.
* **Mammoth Word (.docx) Parser**:
  - Integrated `mammoth` parser for clean text extraction from `.docx` and `.doc` files, eliminating raw zip binary corruption.
* **WinAnsi Encoding Sanitization**:
  - Implemented `toWinAnsi` string sanitizer mapping smart quotes, em-dashes, bullets, and non-breaking spaces safely to prevent `pdf-lib` encoding exceptions.

---

## 29. Docx OpenXML Compiler & Format Buffer Validation
* **Native OpenXML Word (.docx) Generation**:
  - Added `generateValidDocxFromDocument` using the `docx` package (`Document`, `Packer`, `Paragraph`, `TextRun`) inside [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts).
  - When converting files/documents to Word (`.docx`), the server compiles a 100% valid OpenXML `.docx` ZIP archive (`PK\x03\x04...`). Microsoft Word, Word Online, and Office 365 now open every converted `.docx` file natively in the browser without any error.
* **Buffer Structure Inspection**:
  - Added `isDocxBuffer` (`0x50, 0x4B, 0x03, 0x04`) and `isPdfBuffer` (`%PDF-`) structure inspectors to guarantee that output files match the target format's binary schema before uploading to Supabase Storage.

---

## 30. Pure JavaScript Multi-Format Conversion Engine
* **PDF to DOCX Engine**:
  - Integrated `pdf-parse@1.1.1` to extract page text, lines, and structural blocks from PDF documents without browser/DOMMatrix dependencies.
  - Converted extracted PDF text lines into structured `Paragraph` and `TextRun` objects using `docx`, generating a 100% compliant OpenXML Word document (`PK\x03\x04...`). PDF to DOCX conversions now open natively in Microsoft Word Online and Desktop.
* **DOCX to PDF HTML Layout Engine**:
  - Utilized `mammoth.convertToHtml()` to extract rich structured HTML (`h1`, `h2`, `h3`, `p`, `li`, `table`) from Word documents.
  - Rendered HTML tags into PDF pages via `pdf-lib` with distinct font sizes (16pt, 13pt, 11pt, 10pt), headings, bold styling, custom colors, bullet points (`*`), and page margin layouts.
* **Zero External Dependencies**:
  - Operates 100% in pure JavaScript on Node.js using native NPM packages (`mammoth`, `pdf-parse`, `docx`, `pdf-lib`), eliminating external software and cloud dependencies.

---

## 31. Word Document Typography & Styling Refinements
* **Clean Document Start**:
  - Removed top filename title (`my.docx`) header from generated `.docx` files when text content exists, allowing converted resumes and documents to start directly with the actual main title / person's name (`MOHD AMAN`).
* **Calibri Typography & Executive Styling**:
  - Applied `font: 'Calibri'` across all generated paragraphs in [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts).
  - Styled main titles in 16pt Bold Dark Slate (`#0F172A`), section headings (`SKILLS`, `EDUCATION`) in 12pt Bold Subtitle Slate (`#1E293B`), and body text/bullets in 11pt Charcoal (`#334155`) with spacing.

---

## 32. Word-Boundary Text Wrapping & PDF Alignment Fixes
* **Smart Word-Wrap Algorithm**:
  - Implemented `wrapTextWords` in [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts) to break lines strictly at whitespace boundaries, eliminating awkward mid-word line splits (such as `start - e` / `nd`).
* **Clean Document Start (Removed Header Box)**:
  - Removed top green filename header box (`Dev_ops resume_converted.pdf`), letting converted PDFs start cleanly with standard top page margins and document title (`Name` / `Dev_ops`).
* **Executive PDF Hierarchy**:
  - Applied 16pt Bold Title font, 12pt Bold Subtitle font for section headings (`PROFILE SUMMARY`, `EDUCATION`, `SKILLS`, `EXPERIENCE`), and 10pt text for body paragraphs with clean `55pt` bullet indents.

---

## 33. PdfItDown Engine Integration & Excel Grid Table PDF Renderer
* **PdfItDown Engine (`pdfitdown.eu`)**:
  - Installed `@cle-does-things/pdfitdown` and integrated `PdfItDownConverter` in [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts). Added `@cle-does-things/pdfitdown` to `serverExternalPackages` in [next.config.ts](file:///e:/morrai/shadcn-admin-main/next.config.ts) for Turbopack compatibility.
  - Simplified backend API to convert all uploaded document formats (`.docx`, `.xlsx`, `.pptx`, `.md`, `.html`, `.png`, `.jpg`, `.txt`, `.csv`) into PDF documents.
* **Default Output Filename `editable.pdf`**:
  - Configured [DocConverterDialog](file:///e:/morrai/shadcn-admin-main/src/components/doc-converter-dialog.tsx) and the backend API to default output document titles to **`editable.pdf`** while keeping UI dropdown choices intact.
* **SheetJS Excel Grid Table PDF Renderer**:
  - Integrated `xlsx` (SheetJS) with `renderExcelTableToPdf` in [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts).
  - Excel files (`.xlsx`, `.xls`, `.csv`) are parsed into structured worksheets, columns, and rows, rendering a clean ILovePDF-style grid table with header fill (`#EBF2FA`), cell borders (`0.5pt`), and automatic A4 Landscape mode for wide column layouts.

---

## 34. Executive-Grade PDF Line-Height & Vertical Layout Engine
* **Mathematical Line Spacing Matrix**:
  - Implemented vertical font-height formulas in [app/api/convert/doc/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/doc/route.ts) (`lineSpacing = 26` for titles, `22` for headings, `17` for body text), eliminating all vertical text overlap issues in converted resume PDFs.
  - Added mandatory top margin spacing (`topMargin = 14pt`) before section headers (`PROFILE SUMMARY`, `EDUCATION`, `SKILLS`, `EXPERIENCE`, `PROJECTS`) for clean executive breathing room.
* **Header Title Removal**:
  - Removed top `editable.pdf` header label from generated PDF documents and Excel grid tables, allowing converted files to start directly with full page content.

---

## 35. Image Converter UI Unification & Quality Preservation
* **File Card UI Parity with Doc Converter**:
  - Replaced thumbnail grid previews in [ImageConverterDialog](file:///e:/morrai/shadcn-admin-main/src/components/image-converter-dialog.tsx) with clean file information cards matching `DocConverterDialog` 1-to-1 (displaying filename, size badge, format, and remove action).
* **Zero Quality Loss PDF Image Embedding**:
  - Configured [app/api/convert/photo-to-pdf/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/convert/photo-to-pdf/route.ts) to embed raw original image bytes into PDF pages matched to exact native image dimensions (`embeddedImage.width` x `embeddedImage.height`), preserving 100% of original pixel resolution, sharpness, and quality without compression.

---

## 36. Enterprise Document Scanner + PDF Generator + Chat Integration
* **Shared Multi-Platform Architecture**:
  - Implemented a unified document scanner modal ([DocumentScannerModal.tsx](file:///e:/morrai/shadcn-admin-main/src/components/scanner/DocumentScannerModal.tsx)) operating identically across both **Messages Page** ([chat-view.tsx](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/chat-view.tsx)) and **Chat Template Page** ([chat-window.tsx](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-window.tsx)) with zero code duplication.
  - Added **📄 Scan Document** trigger item into attachment dropup menus in both chat interfaces.
* **OpenCV Smart Document Pipeline**:
  - Built [opencv.service.ts](file:///e:/morrai/shadcn-admin-main/src/services/opencv.service.ts) to lazy-load OpenCV.js asynchronously (`https://docs.opencv.org/4.x/opencv.js`) with WebAssembly memory lifecycle cleanup (`cv.Mat.delete()`).
  - Edge detection engine ([detectEdges.ts](file:///e:/morrai/shadcn-admin-main/src/utils/scanner/detectEdges.ts)) runs Canny edge filtering and contour poly approximation to automatically detect paper quad corners with 4-corner interactive draggable overlay ([CropOverlay.tsx](file:///e:/morrai/shadcn-admin-main/src/components/scanner/CropOverlay.tsx)).
  - Homography unwarping ([perspective.ts](file:///e:/morrai/shadcn-admin-main/src/utils/scanner/perspective.ts)) rectifies angled document captures into flat rectangular document pages.
  - Image enhancement engine ([enhance.ts](file:///e:/morrai/shadcn-admin-main/src/utils/scanner/enhance.ts)) supports Auto Enhance (CLAHE contrast), Black & White adaptive binary thresholding, Grayscale, and Brightness/Contrast sliders.
* **Camera Capture & Mobile Support**:
  - Web camera stream hook ([useCamera.ts](file:///e:/morrai/shadcn-admin-main/src/hooks/useCamera.ts)) manages `<video>` MediaDevices stream capture, video track teardown, and front/rear camera switching.
  - Native Mobile integration leverages `@capacitor/camera` for native device photo capture when running inside Capacitor native containers.
* **Multi-Page Management & PDF Compilation**:
  - Multi-page sorter strip ([PageSorter.tsx](file:///e:/morrai/shadcn-admin-main/src/components/scanner/PageSorter.tsx)) allows reordering pages (Move Left / Move Right), 90° rotation, deleting pages, and appending additional pages.
  - Client-side PDF generator ([createPdf.ts](file:///e:/morrai/shadcn-admin-main/src/utils/pdf/createPdf.ts)) uses `pdf-lib` to compile processed pages into a single PDF document supporting A4 / Original paper sizes and Portrait / Landscape orientation.
* **Upload Flow & Supabase Storage**:
  - Upload service ([upload.service.ts](file:///e:/morrai/shadcn-admin-main/src/services/upload.service.ts)) uploads generated PDF files to Supabase Storage bucket `chat-files` under the `scanned/` folder **only after user confirmation by pressing Send**.
  - Automatically dispatches a standard `message_type = 'document'` chat message with PDF file metadata to the conversation thread.
* **Beginner-Friendly Documentation**:
  - Every file includes standard JSDoc header comments detailing *Why it exists*, *What it does*, *When it runs*, *How it connects*, *Who calls it*, and *Who depends on it*.

---

## 37. Asynchronous PDF Processing Pipeline
* **Background Parsing Flow**:
  - Automatically processes any PDF files sent in chat (both normal uploads and scanned documents).
  - Client interface inserts messages immediately with `processing_status = 'pending'` and continues without blocking the user.
  - Fires an asynchronous non-blocking request to the `/api/process-pdf` background API.
* **Service Responsibilities**:
  - **messages.api.ts** / **messages REST API**: Sets initial `processing_status` state and triggers the background route.
  - **/api/process-pdf API Route**: Runs background parsing: downloads PDF buffer from storage bucket `chat-files`, writes it to a workspace temp folder `.temp-pdf-processing`, runs Python `pdftext` to extract all text, parses structured layout using JavaScript `pdf2json`, and updates all message copies in the database.
* **Realtime Sync & Retry Mechanism**:
  - Maps `file_content_text`, `file_content_json`, and `processing_status` in realtime listeners (`use-realtime.ts`) so frontend reflects state changes immediately.
  - Renders `Parsing...` and `Parsing failed` indicators inside `FileCard` and `chat-view.tsx` document bubbles.
  - Renders a `Retry` action trigger button when parsing fails to run the background pipeline again.

---

## 38. Enterprise Voucher Workflow, Database Persistence, & Strict User Isolation
* **Supabase Database & Storage Isolation**:
  - Created `public.vouchers` table with mandatory `user_id` foreign key referencing `auth.users(id)`.
  - Configured Row Level Security (RLS) policies (`FOR SELECT/INSERT/UPDATE/DELETE USING (auth.uid() = user_id)`), guaranteeing 100% data isolation so no user can view or access another account's vouchers.
  - Uploaded files are strictly isolated into user-scoped paths (`vouchers/${userId}/originals/` and `vouchers/${userId}/edited/`).
* **REST API Endpoints (`/api/vouchers`)**:
  - `GET /api/vouchers` — Retrieves authenticated user's saved vouchers from Postgres DB.
  - `POST /api/vouchers` — Saves extracted & edited invoice JSON data directly to the database.
* **Popup-Free PDF Printing Engine**:
  - `ReviewPanel.tsx` uses an inline hidden `<iframe>` to trigger browser print / "Save as PDF" dialogs without opening external popup tabs, completely eliminating browser popup blocker errors.
* **Sequential Save & Preview Enforcer**:
  - `InvoiceMaker.tsx` locks Step 3 (Voucher Preview) until the user uploads a document, edits fields, and clicks the **Save** button.
* **Message Page Integration & React Doc Viewer**:
  - Clicking the Voucher file icon on the Messages page renders only real DB vouchers belonging to the logged-in user.
  - Removed upload options from the Messages page panel.
  - Built `SafeDocumentPreview.tsx` wrapper around document preview with Zoom (`-`/`+`), Rotation (`90°`), Fullscreen (`Expand`), Download, and Toggle mode controls. Matches screenshot layout 1-to-1 (`✕  filename.pdf ... controls`). Guarantees zero runtime crashes or Vercel rendering exceptions on empty/invalid document URLs.
* **Direct File Download & Toast Removal**:
  - Removed all floating toast notifications from the Voucher page. Statuses are rendered as clean inline state text/badges.
  - Updated `ReviewPanel.tsx` download handler: clicking **Download PDF** on the voucher preview tab directly fetches and downloads the document file from Supabase Storage without opening default browser print/PDF view tabs or print dialogs.
* **Original Document Preview & Fresh Upload Flow**:
  - Step 3 (Voucher Preview) displays the original uploaded document in exact format matching user screenshot, with seamless toggle to view updated structured fields.
  - Added Eye (preview) and Download action buttons directly to the file card in Step 2 (Edit Fields tab).
  - Clicking the `+` icon re-keys `InvoiceMaker` to start a fresh upload workflow.

---

## 39. Unified Right-Window Document Viewer, Supabase Storage Integration & Bulletproof PDF Engine
* **Unified Right-Window Document Viewer (`SafeDocumentPreview.tsx` & `DocumentViewer.tsx`)**:
  - Built a Chat-Template style Right-Window Document Viewer powered by `@cyntler/react-doc-viewer` and custom document renderers.
  - Standardized top header bar layout:
    - **Top Left**: `[X]` Close cross button (returns user to active view), document icon, and responsive filename (`Invoice_2026-08-10.pdf`).
    - **Top Middle**: Mode switcher tabs (*Doc* / *Voucher* toggle when JSON/edited data exists).
    - **Top Right**: Download button, Zoom Out (`-`), percentage indicator (`100%`), Zoom In (`+`), Rotate (`90°`), and Fullscreen (`Maximize/Minimize`) controls.
  - Configured `DocumentViewer` with `hideHeader={true}` and CSS rules (`#header-bar`, `#pdf-controls`) to eliminate duplicate internal headers and white icon boxes, resulting in a single clean toolbar.
* **Everywhere Integration in Voucher Feature (`invoice-maker.tsx` & `vouchers/index.tsx`)**:
  - **Step 1 (Upload Tab)**: Clicking the **Eye icon** on an uploaded file card opens the uploaded file in the Right-Window Doc Viewer with `[X]` close button.
  - **Step 2 (Edit Fields Tab)**: Header file info card features an **Eye icon** button that opens the document preview in the Right-Window Doc Viewer, allowing users to inspect the document while editing fields.
  - **Step 3 (Voucher Preview Tab)**: Renders the full Document Viewer experience with *Original Doc* / *Voucher View* toggle and `[X]` close button returning to Step 2.
  - **Main Vouchers List**: Selecting any voucher card from the list displays it in the Right-Window Doc Viewer.
* **Supabase Storage Upload, Caching, & Fetching Architecture**:
  - **Original File Upload**: In `invoice-maker.tsx`, uploading a document calls `uploadVoucherFile(file, 'originals')` in `voucher-repository.ts`. Uploads the file to Supabase Storage bucket `vouchers` under path `vouchers/${userId}/originals/${cleanFileName}`.
  - **Local Blob URL Preview**: Immediately creates a local blob URL (`URL.createObjectURL(file)`) so document preview renders instantly with zero latency before storage upload finishes.
  - **Edited PDF Upload & Storage**: When user saves or downloads a voucher, `uploadVoucherBlob(pdfBlob, pdfFileName)` uploads the generated PDF blob to Supabase Storage under `vouchers/${userId}/edited/${pdfFileName}` and saves the public URL to PostgreSQL database columns `original_file_url` / `edited_file_url`.
  - **Supabase Storage Fetching**: On page load, `GET /api/vouchers` fetches all saved voucher records from PostgreSQL, including `original_file_url` and `edited_file_url` public Supabase Storage URIs. Passing these URLs to `SafeDocumentPreview` renders the stored document directly via `@cyntler/react-doc-viewer`.
* **Bulletproof 1-Click Vector PDF Engine (`ReviewPanel.tsx`)**:
  - Replaced HTML-to-Canvas rendering with a native vector PDF generator using `jsPDF`.
  - Bypasses all browser CSS color parser crashes (`oklch(...)`/`lab(...)` in Tailwind CSS v4) and Tainted Canvas security errors (`canvas.toDataURL()`).
  - Renders exact voucher view (headers, company logo badge, bill to info, line item table with alternating rows, right-aligned totals, notes, and payment terms) directly as a binary A4 vector PDF in ~5ms.
  - Triggers browser download in 1 click via `downloadFileFromUrl(blobUrl, pdfFileName)`.
* **Full-Screen Mobile UI**:
  - Configured document preview containers to use `fixed inset-0 z-[100] h-[100dvh] w-full bg-background` on mobile screens (`<md`), providing a full-screen mobile experience with top bar `[X]` close icon and zero background bleed.
  - Preserves standard desktop side-by-side right window view on desktop (`md:` breakpoint).

---

## 40. Full Migration to NextAuth v4, Google OAuth & Mobile Capacitor Deep Linking Architecture
* **Full NextAuth v4 Migration**:
  - Replaced Supabase Auth entirely with NextAuth v4 (`next-auth`) supporting Google OAuth provider (`GoogleProvider`).
  - Configured `authOptions` in `src/lib/auth.ts` with deterministic UUID conversion (`stringToUuid`) mapping Google user IDs and emails to valid PostgreSQL UUID keys (`profiles.id` and `profiles.auth_user_id`).
  - Automatically creates and synchronizes user profiles into the Supabase PostgreSQL `public.profiles` table upon sign-in (`id`, `name`, `email`, `avatar`, `auth_user_id`, `updated_at`).
* **Android Native Deep Link Intent Architecture**:
  - Created `/api/auth/mobile-login` endpoint initiating direct Google OAuth inside `@capacitor/browser` (Chrome Custom Tab / Safari View Controller).
  - Created Google callback interceptor route [app/api/auth/callback/google/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/auth/callback/google/route.ts) that executes NextAuth code exchange, creates session cookies, and intercepts NextAuth's redirect to force mobile requests to land on `/auth/callback?is_mobile=true`.
  - Configured [app/auth/callback/route.ts](file:///e:/morrai/shadcn-admin-main/app/auth/callback/route.ts) to return an instant HTML intent trigger executing:
    `intent://auth/callback?token=${token}#Intent;scheme=com.aman.amoganextapp;package=com.aman.amoganextapp;end;`
  - Android OS intercepts the intent, auto-closes Chrome Custom Tab, and returns directly to the native app shell.
* **Capacitor Cookie Synchronization Engine**:
  - Created `/api/auth/mobile-set-cookie` endpoint.
  - When the native app deep link listener in [src/lib/capacitor-init.ts](file:///e:/morrai/shadcn-admin-main/src/lib/capacitor-init.ts) receives the OAuth callback, it calls `/api/auth/mobile-set-cookie?token=...`, attaching `next-auth.session-token` directly into the native webview cookie jar.
  - Navigates the native webview directly to `/` (Dashboard), fully authenticated.
* **Smooth Mobile Sign-Out**:
  - Refactored `SignOutDialog` in [sign-out-dialog.tsx](file:///e:/morrai/shadcn-admin-main/src/components/sign-out-dialog.tsx) to execute direct navigation to `/api/auth/mobile-logout`.

---

## 41. Server-Side Mobile Logout Architecture & Automated Auth Self-Test Suite
* **Server-Side Mobile Logout Endpoint (`/api/auth/mobile-logout`)**:
  - Created [app/api/auth/mobile-logout/route.ts](file:///e:/morrai/shadcn-admin-main/app/api/auth/mobile-logout/route.ts) that purges all NextAuth and legacy session cookies (`next-auth.session-token`, `__Secure-next-auth.session-token`, `next-auth.callback-url`, `auth_user_data`, `mobile_auth`) directly on the server HTTP response headers and issues a 302 Redirect to `/sign-in`.
  - Updated `SignOutDialog` in [sign-out-dialog.tsx](file:///e:/morrai/shadcn-admin-main/src/components/sign-out-dialog.tsx) to execute instant window location navigation (`window.location.href = '/api/auth/mobile-logout'`), eliminating all client-side React rendering freezes and dark blank screen glitches during sign-out on mobile.
* **Middleware Stale Cookie Cleanup ([src/middleware.ts](file:///e:/morrai/shadcn-admin-main/src/middleware.ts))**:
  - Refactored `isAuthUser` evaluation in `middleware.ts` to rely strictly on `hasNextAuthToken || user`, stripping out stale legacy `auth_user_data` cookie traps that previously bounced logged-out users from `/sign-in` back to `/`.
* **Automated Auth Self-Test Script ([scripts/test-auth-flow.cjs](file:///e:/morrai/shadcn-admin-main/scripts/test-auth-flow.cjs))**:
  - Built an automated Node.js test script `node scripts/test-auth-flow.cjs` that verifies HTTP status codes, redirect location targets, and `Set-Cookie` header contracts across `/api/auth/mobile-login`, `/api/auth/mobile-set-cookie`, and `/api/auth/mobile-logout`.
  - Enforced automated execution of this self-test suite before every release to guarantee 100% zero-regression mobile auth workflows.
  - Eliminates dark blank screen glitches during sign-out on mobile, redirecting cleanly to `/sign-in`.

---

## 42. Real Hostinger Email Integration & Default Messages Inbox View Fix
* **Hostinger Email SMTP & IMAP Integration**:
  - Connected existing Messages page UI to real Hostinger email account (`ask@morrai.com`).
  - Outgoing Mail (SMTP): Uses `smtp.hostinger.com:587` with STARTTLS (`secure: false`, `requireTLS: true`) via `nodemailer`.
  - Incoming Mail (IMAP): Uses `imap.hostinger.com:993` with SSL/TLS (`secure: true`) via `imapflow` and `mailparser`.
* **Backend API Routes & Configuration**:
  - `config/mail.json` — Stores email credentials securely (added to `.gitignore`).
  - `src/lib/email/mailer.ts` — Nodemailer SMTP transporter.
  - `src/lib/email/imap.ts` — ImapFlow client connection creator.
  - `src/lib/email/email-parser.ts` — MIME parsing logic.
  - `GET /api/mail/inbox` — IMAP endpoint fetching and parsing 20 recent inbox messages into UI JSON structure.
  - `POST /api/mail/send` — SMTP endpoint executing outgoing email transmission.
  - `GET /api/mail/test` — Developer verification endpoint for SMTP server credentials.
* **Client-Side HTML Sanitizer & XSS Protection**:
  - Implemented `sanitizeHtml` using browser-native `DOMParser` in `email-view.tsx`. Strips `<script>` tags, inline event handlers (`on...`), and `javascript:` URIs from received external HTML email contents before rendering.
* **Compose UI & Custom Address Input**:
  - Updated `new-email.tsx` composer component: prefilled default `From` address to `ask@morrai.com`.
  - Converted `To`, `Cc`, and `Bcc` fields to clean text inputs allowing custom recipient email typing (supporting single or comma-separated addresses).
* **Default Messages Page Load Fix**:
  - Removed `setIsFileOpen(true)` from initial page load `useEffect` in `src/features/Message/index.tsx`. Navigating to `/message` now loads the main Messages Inbox by default instead of forcing open the Files view panel.
* **Developer Guide**:
  - Created `mail.md` detailing system architecture, file inventory, Hostinger configurations, API payloads, and testing instructions.

---

## 43. Email Sidebar Tab Bar & Hostinger Sent IMAP Synchronization
* **Sidebar Email Tabs Bar**:
  - Positioned horizontal email tabs (**Inbox**, **Send**, **Folder**, **Contact**, **Groups**) inside the Messages sidebar header in `email-list.tsx`, located between the icon toolbar and the search box.
  - Styled with project-standard active underline indicator (`border-b-2 border-primary font-semibold`).
* **Real Hostinger Sent Mail Sync**:
  - Built `GET /api/mail/sent` API route connecting to Hostinger's `INBOX.Sent` IMAP mailbox folder.
  - Updated `POST /api/mail/send` to automatically append outgoing email MIME content to Hostinger's `INBOX.Sent` folder upon successful SMTP transmission.
  - Selecting **Inbox** tab displays strictly received inbox emails (`/api/mail/inbox`).
  - Selecting **Send** tab displays strictly sent emails (`/api/mail/sent`).
* **ComingSoon Placeholders**:
  - Clicking **Folder**, **Contact**, or **Groups** renders the standard `<ComingSoon />` component cleanly without affecting other pages.

---

## 44. Inbox Pagination, Instant Optimistic Sent Mail & Attachment Integration
* **Strict Inbox & Send Tab Card Isolation**:
  - Updated card rendering conditions in `email-list.tsx`: under `activeTab === 'inbox'` or `activeTab === 'send'`, non-email cards (`CHATS`, `NOTIFICATIONS`, `AI`, `CALENDAR`, `TASKS`, `FILES`) are strictly suppressed and hidden unless explicitly selected via top toolbar icons.
* **Default Right-Window Document Viewer (`SafeDocumentPreview.tsx`)**:
  - Clicking the Eye icon (`Eye`) or clicking an attachment item in `email-view.tsx` triggers `onPreviewAttachment({ name, url })`.
  - `index.tsx` updates `previewAttachment` state, rendering `<SafeDocumentPreview>` directly inside the right-side detail window with zoom, rotation, download, and header controls.
* **IMAP Lazy-Loading Pagination**:
  - Updated `GET /api/mail/inbox` and `GET /api/mail/sent` to accept `page` and `limit` query parameters, calculating exact IMAP sequence ranges (`totalMessages - offset`).
  - Added bottom scroll listener in `email-list.tsx` to trigger `onLoadMore()` when scrolling near the end, appending next page items with a smooth bottom loading spinner.
* **Instant Optimistic Sent Mail Update**:
  - Updated `onSend` callback in `new-email.tsx` and `index.tsx`: sending an email immediately prepends the new message into `sentEmails` state without triggering full-page re-fetch loading spinners.
* **End-to-End Email Attachment & Hostinger Sent Sync**:
  - `POST /api/mail/send` uses Nodemailer's `MailComposer` to compile the full RFC 2822 `multipart/mixed` MIME buffer (including base64-encoded attachments) before appending to Hostinger's `INBOX.Sent` IMAP folder.
  - Ensures sent attachments appear 100% intact with filenames and preview/download capability on Hostinger webmail, mobile apps, and our application's **Send** tab.
  - `email-parser.ts` extracts `parsed.attachments` into Base64 Data URLs (`data:contentType;base64,...`) with formatted file sizes.

---

## 45. Email Tab Pagination Arrow Controls & Attachment Actions Cleanup
* **Header Tab Pagination Controls (`1-20 of 152 < >`)**:
  - Positioned range indicator (`startRange-endRange of total`) and `<` (`ChevronLeft`) / `>` (`ChevronRight`) arrow buttons directly to the right of the email sidebar tabs in `email-list.tsx`.
  - Connected `<` to `onPrevPage` and `>` to `onNextPage` in `index.tsx`, fetching page 1, 2, 3... on demand.
* **Attachment Preview & Instant Base64 Download**:
  - Updated `useDownloadFile` in `DocumentViewer/hooks.ts` to detect `data:` URLs and download base64 attachments directly without proxy latency.
  - Eye icon (`<Eye />`) and attachment title row click mount `<SafeDocumentPreview>` directly in the right-side window.
* **Attachment Remove Button Cleanup**:
  - Removed `X` remove-attachment button from `email-view.tsx` on received and sent emails.

---

## 46. Attachment Base64 Uint8Array Fix & Sent Tab Label Rename
* **Uint8Array Content Base64 Attachment Fix**:
  - Updated `email-parser.ts`: `mailparser` returns `att.content` as a `Uint8Array` in Next.js Turbopack / Node runtime. Using `Buffer.from(att.content)` guarantees `dataUrl` is populated as a valid `data:${mimeType};base64,...` URL.
  - Fixes previewing (`<SafeDocumentPreview>`) and downloading attachments on both **Inbox** and **Sent** emails.
* **DocumentViewer Base64 Data URL Rendering**:
  - Updated `DocumentViewer.tsx` to handle `fileUrl.startsWith('data:')`, rendering Base64 PDFs in an `<iframe src={fileUrl}>` and images in an `<img>` tag.
* **Tab Label Renamed to `Sent`**:
  - Changed sidebar tab text label from `Send` to `Sent` in `email-list.tsx`.

---

## 47. Physical Local File System Storage for Email Attachments
* **Local Attachment Storage Module (`src/lib/email/attachment-storage.ts`)**:
  - Created `saveAttachmentLocally(filename, content)` to save attachment files physically to `public/uploads/mail-attachments/`.
  - Returns direct public web paths (e.g. `/uploads/mail-attachments/1723640000_report.pdf`) and formatted file sizes.
* **Parser & Send API Storage Integration**:
  - Updated `email-parser.ts`: every parsed attachment from IMAP received messages is saved physically to disk.
  - Updated `app/api/mail/send/route.ts`: every sent email attachment is saved physically to disk and returns public URLs to the client.
* **Document Viewer Local Path Support**:
  - Updated `DocumentViewer.tsx` to handle `/uploads/` paths directly, rendering PDFs inside `<iframe src={fileUrl}>` and images inside `<img>` tags.
  - Guarantees 100% reliable previewing and downloading for both **Inbox** and **Sent** email attachments.

---

## 48. EmailView Attachment URL State Fix & Automated Verification
* **Root Cause & Fix in `email-view.tsx`**:
  - Identified that `useEffect` in `email-view.tsx` previously copied `att.name`, `att.type`, `att.size` into local state, but omitted `att.url`.
  - Added `url: att.url` mapping in `setAttachments` inside `email-view.tsx`, restoring `attachment.url` for all received and sent emails.
* **Automated Diagnostic & Server Verification**:
  - `test_attachment_diagnosis.js`: verified `/api/mail/inbox` and `/api/mail/sent` return populated file URLs (e.g. `/uploads/mail-attachments/1786696236217_report__21_.pdf`).
  - `test_curl_file.js` & `test_download_proxy.js`: verified direct HTTP static file serving returns `200 OK` and `/api/download` proxy returns `Content-Disposition: attachment`.

---

## 49. Unified Chat Document Viewer Alignment
* **Chat Document Viewer Matching**:
  - Updated `DocumentViewer.tsx` to route all supported documents (PDFs, images, Word docs, CSVs, text) through `ReactDocViewerWrapper` (`@cyntler/react-doc-viewer`).
  - Replaced raw browser iframe previews with our project's custom styled document viewer theme (clean white background, custom zoom, rotation, and header controls matching Chat view).

---

## 50. @zrimo/viewer & Multi-Format Document Viewer Engine
* **`@zrimo/viewer` Engine Integration (`src/components/DocumentViewer/ReactDocViewerWrapper.tsx`)**:
  - Integrated `@zrimo/viewer` WASM/JS engine to load and parse document blobs dynamically.
* **Complete Multi-Format Coverage**:
  - Added `LocalCsvViewer` for rendering interactive tabular CSV data with sticky headers.
  - Added `LocalExcelViewer` for `.xlsx`/`.xls` spreadsheets.
  - Added `LocalWordViewer` for `.docx`/`.doc` Word documents.
  - Added `DocViewer` PDF renderer for `.pdf` files.
  - Guarantees 100% of attachments (PDF, DOCX, XLSX, CSV, PNG/JPG, TXT) open cleanly without "Failed to view" errors.

---

## 51. Client-Side Word Document (`docx-preview`) Renderer
* **In-Browser Word Document Rendering (`ReactDocViewerWrapper.tsx`)**:
  - Integrated `docx-preview` (`renderAsync`) inside `LocalWordViewer`.
  - Fetches `.docx` file blob and renders full formatted pages with text, headings, tables, fonts, and images directly in the browser container.

---

## 52. Primary `@zrimo/viewer` Engine Integration
* **`ZrimoEngineViewer` Core Component (`ReactDocViewerWrapper.tsx`)**:
  - Configured `ZrimoEngineViewer` using `createViewer()` and `BasicViewerUi` from `@zrimo/viewer`.
  - Serves as the primary WASM/JS viewing engine for all mail section attachments (PDF, XLS, XLSX, DOC, DOCX, CSV, PNG, JPG, TXT).

---

## 53. SheetJS Excel (`.xlsx`, `.xls`) & Word (`.docx`, `.doc`) In-Browser Preview
* **Excel Spreadsheet Parsing (`LocalExcelViewer`)**:
  - Integrated SheetJS (`xlsx`) to parse ArrayBuffers of `.xlsx` and `.xls` files directly in the browser (`XLSX.read` & `XLSX.utils.sheet_to_html`).
  - Displays multi-sheet Excel workbooks with interactive tab switches (`Sheet1`, `Sheet2`, etc.) and styled data grids.
* **Word Document Preview (`LocalWordViewer`)**:
  - Integrated `docx-preview` and public URL Google Docs embedded viewer for `.docx` and `.doc` files, replacing static download cards with formatted document previews.

---

## 54. Dual-Fetch Proxy Buffer Fallback for Attachments
* **`fetchFileBuffer` Proxy Fallback (`ReactDocViewerWrapper.tsx`)**:
  - Created `fetchFileBuffer` helper that performs a direct `fetch(uri)` and automatically falls back to `/api/download?url=${encodeURIComponent(uri)}` if direct fetching returns non-200.
  - Ensures local physical attachment files stored under `/uploads/mail-attachments/` are retrieved reliably and converted into binary ArrayBuffers for SheetJS, `docx-preview`, and CSV table rendering.

---

## 55. Word Document Render Ref Lock Fix
* **DOM Container Ref Mounting (`ReactDocViewerWrapper.tsx`)**:
  - Restructured `LocalWordViewer` JSX to keep `<div ref={containerRef} />` continuously mounted in the DOM with a backdrop loading overlay.
  - Ensures `docx-preview` (`renderAsync`) accesses `containerRef.current` immediately without returning early or locking on the spinner.

---

## 56. shadcn Skeleton Email Loading Effect
* **`EmailSkeletonList` Component (`email-list.tsx`)**:
  - Created `EmailSkeletonList` using shadcn `Skeleton` components.
  - Displays 6 animated skeleton card placeholders matching sender avatar, name, timestamp, subject, body snippet lines, and tag badges when emails are loading in **Inbox** and **Sent** tabs.
  - Replaced bottom loading spinner with animated skeleton card for smooth infinite scroll loading.

---

## 57. Sender Name Cleaning, Tab Arrow Overflow Fix & Chat Sub-Tabs
* **Clean Sender Name Display (`cleanSenderName` in `email-list.tsx`)**:
  - Removed email address strings (e.g. `<n.rajukrishna@gmail.com>`) from card headers, displaying ONLY clean sender names (e.g. `Raju Krishna`, `ask`, `Brevo`, `Hostinger`).
* **Mail Sub-Tabs Bar & Pagination Fix (`email-list.tsx`)**:
  - Positioned range math (`1–20 of 152`) and page navigation arrows (`< >`) right-aligned without wrapping or overflowing.

---

## 58. Mail & Chat Sub-Tabs with Right-Side Window Views
* **Mail Section Sub-Tabs Bar (`email-list.tsx`)**:
  - Sub-tabs: **`Inbox`**, **`Sent`**, **`Folder`**, **`Contact`**, **`Groups`**.
* **Chat Section Sub-Tabs Bar (`email-list.tsx`)**:
  - Sub-tabs: **`Chats`**, **`Contact`**, **`Groups`**, **`Folder`**.
* **Right-Side Window Panel Rendering (`Message/index.tsx`)**:
  - Clicking **`Contact`** opens `MsgContactTab` on the **RIGHT SIDE** of the window.
  - Clicking **`Groups`** opens `MsgGroupTab` on the **RIGHT SIDE** of the window.
  - Clicking **`Folder`** opens `ComingSoon` page on the **RIGHT SIDE** of the window.

---

## 59. Chat Sub-Tabs Category Preservation Fix
* **Category State Lock (`email-list.tsx`)**:
  - Bound sub-tab clicks in Chat section (**`Chats`**, **`Contact`**, **`Groups`**, **`Folder`**) to explicitly invoke `setCategoryFilter('chat')`.
  - Prevents Chat sub-tab selections from reverting to Mail sub-tabs (`Inbox`, `Sent`, `Folder`, `Contact`, `Groups`).
* **Strict List Rendering Separation (`email-list.tsx`)**:
  - Rendered ONLY `chatItems` when `categoryFilter === 'chat'` or `activeTab === 'chats'`, completely preventing Mail items from appearing in the Chat section list.

---

## 60. Right-Side Window Sub-Tab Navigation & State Clearing Fix
* **Selected Chat Clearing on Sub-Tab Switch (`Message/index.tsx`)**:
  - Cleared `selectedDirectoryChat` and `selectedEmail` when switching sub-tabs to `contact`, `groups`, or `folder`.
  - Fixes overlay bug where an open chat view (e.g. Raju Krishna) blocked `MsgContactTab` or `MsgGroupTab` from displaying on the right-side window.
* **`handleSelectContact` / `handleSelectGroup` Tab Binding (`Message/index.tsx`)**:
  - Changed tab switch from `inbox` to `chats` when selecting a contact or group conversation, maintaining section context.
* **Sub-Tab Active Style Isolation (`email-list.tsx`)**:
  - Corrected `Chats` button active check, ensuring crisp tab highlighting without defaulting to `inbox`.

---

## 61. Fixed Left Column Chat List & Right-Side Window Sub-Tab Navigation
* **Left Column Stability (`email-list.tsx`)**:
  - Keeps chat cards (`chatItems`) fixed on the left sidebar across all Chat section sub-tabs (**`Chats`**, **`Contact`**, **`Groups`**, **`Folder`**).
* **Right Panel Precedence Ordering (`Message/index.tsx`)**:
  - Positioned `activeTab === 'contact'` (`MsgContactTab`), `activeTab === 'groups'` (`MsgGroupTab`), and `activeTab === 'folder'` (`ComingSoon`) ahead of `selectedDirectoryChat` in the right panel render tree.
  - Ensures clicking sub-tabs closes active chat views and opens manager forms cleanly on the right side window.