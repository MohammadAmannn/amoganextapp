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
