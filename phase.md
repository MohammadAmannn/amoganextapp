# Project Development Phases & Tech Stack

This document tracks the technical implementation, phase-by-phase objectives, and the specific libraries, APIs, and frameworks utilized for each feature of the chat application.

---

## Phase 1: Authentication & Onboarding

### Objectives & Architecture
* **Auth Flows & Validation**: User sign-in, signup, registration, and session persistence.
* **Onboarding & Profile Sync**: Automatic user account synchronization to the database upon first signup/sign-in.
* **Security & Permissions**: Access control via Postgres policies preventing cross-user eavesdropping.

### Technologies & Purpose
* **Next.js App Router**: Client-side state transitions and page routing structure (`/sign-in`, `/sign-up`, `/otp`).
* **React Hook Form & Zod**: Form state handling, styling states, and client-side validation schema constraints.
* **Supabase Client SDK (`@supabase/supabase-js`)**: Handshake handling for email/password and authentication session events via `onAuthStateChange`.
* **PostgreSQL Profiles Table**: Database schema tracking user names, email addresses, and avatars.
* **Row-Level Security (RLS)**: PostgreSQL policy filters securing query execution at the database level.

---

## Phase 2: Direct Messaging & Realtime Core

### Objectives & Architecture
* **Direct Messages Layout**: Real-time messaging feed, contact lists, and clean message container view templates.
* **Realtime Sync Feed**: Instant UI feeds syncing incoming and deleted messages without pull/refresh triggers.
* **Presence Tracking**: Online status updates and list synchronization for interactive contacts.
* **Message Delivery States**: Visual statuses indicating whether a message is Sent, Delivered, or Read.

### Technologies & Purpose
* **Zustand (`zustand`)**: Lightweight state management for application-wide states, including `useAuthStore` to track the logged-in session's credentials.
* **Clean Repository Pattern**: Clean decoupling of database operations into specialized repository classes (`message-repository.ts`, `conversation-repository.ts`, `profile-repository.ts`).
* **Supabase Postgres Changes (`postgres_changes`)**: Listening to PostgreSQL database write updates (`INSERT`, `UPDATE`, `DELETE`) on the `chat_messages` table and syncing them immediately to the UI feed.
* **Supabase Presence**: Synchronization of active socket connections in the channel room (`chat-presence-room`) with presence sync callbacks.
* **Heartbeat Cron**: 30-second interval cron script keeping user presence fresh in the DB profiles list.

---

## Phase 3: Media & Offline Capabilities

### Objectives & Architecture
* **Attachment Pipeline**: File handling pipeline supporting images, video, document cards, and audio uploads.
* **Offline Resiliency**: Client-side buffering of messages and assets when socket or internet connection drops.
* **Network Sync Worker**: Automated offline-queue dispatching as soon as connection is recovered.
* **Voice Recorder**: Client-side audio recording and visual waveform player.

### Technologies & Purpose
* **Supabase Storage**: Persistent storage buckets for storing chat attachments (images, audio, videos, documents).
* **IndexedDB**: Local client-side browser database utilized to store unsent messages and metadata during disconnected sessions.
* **Navigator Online API**: Native window listeners (`online` / `offline`) to automatically trigger database queue-sync workflows.
* **Web Audio API (MediaRecorder)**: Standard browser media APIs capturing microphone audio input buffers.
* **Custom Waveform Visualizer**: Dynamic HTML5 Canvas rendering audio frequency bars during recording and playback sessions.

---

## Phase 4: Group Chats & Location sharing

### Objectives & Architecture
* **Group Management**: Multi-user channel conversations, member selection modals, and automated unread indicators.
* **Reverse Geocoder**: Resolving lat/lng coordinates to human-readable street addresses safely.
* **Responsive Map Views**: Adaptive mapping layout matching the active dark/light mode of the application theme.

### Technologies & Purpose
* **Supabase JSON Containment**: PostgreSQL containment check operations (`.contains('users', JSON.stringify([email]))`) to efficiently check user membership in dynamic groups.
* **Next.js Serverless Route (`/api/geocode`)**: Middleware serverless endpoint querying OpenStreetMap's Nominatim geocoding engine without exposing client secrets.
* **MapLibre GL & CARTO Tiles**: Dynamic client-side interactive map using the [Map] component, utilizing **CARTO Positron** (light mode) and **CARTO Dark Matter** (dark mode) tile sheets.
* **LeafletMap Component**: Client-side React lazy-loaded wrapper components ensuring Server-Side Rendering (SSR) safety.

---

## Phase 5: DB Alerts & Event Monitoring

### Objectives & Architecture
* **DB Alerts Conversation**: Creation and configuration of a dedicated group conversation named `DB Alerts` reserved for admins/selected users.
* **Auto-Subscription Onboarding**: Automatic mapping and joining of administrators (matching configuration email filters) when they authenticate.
* **Event Interceptors**: Safe integration inside repository managers (`contact-repository.ts`, `group-repository.ts`) to capture create, update, and delete actions.
* **Multi-Copy Delivery**: Formatted system alerts generated and distributed securely to all members through the existing realtime architecture.

### Technologies & Purpose
* **Clean Architecture Services**: Modular and reusable service definitions inside `db-alert.service.ts` decoupling event formats from core repository files.
* **Supabase Multi-Copy Distribution**: Automatic database insertion of dedicated message copies (`owner_user_id`) to comply with existing Row-Level Security (RLS) policies.
* **Whitespace Pre-wrap Rendering**: Dynamic layout support for system messages rendering formatted line breaks.
* **Vitest Test Suite**: Mocks for database connections verifying 0 duplicate messages and correct structural schemas.

---

## Phase 6: Bell Notifications & Inbox Redesign

### Objectives & Architecture
* **Realtime Notification Dispatching**: Automatic generation of database-level notifications triggered by new message insertions.
* **Global Badge Counter**: Dynamic badge counter on the header's Bell icon, incrementing in real-time and limiting view to `5+`.
* **Redesigned Inbox Feed**: Redesigned master-detail inbox layout replacing email mockups with live chat notifications.
* **Message Previewer & Close Action**: Preview pane allowing user to view the full message body on the same page, equipped with a close cross icon to reset selection.

### Notification Workflow & Trigger Events
1. **The Event (Message Insertion)**: A user sends a message, inserting a row in the `chat_messages` table with `direction = 'Received'` for the recipient.
2. **Database Trigger Interception**: The `on_chat_message_inserted_notification` Postgres trigger intercepts the insert. It filters for `NEW.direction = 'Received'` and ensures the message is not a `system` message (`NEW.message_type != 'system'`).
3. **Notification Logging**: The trigger function resolves the sender's profile name and inserts a notification row in `public.notifications` for the recipient (`NEW.owner_user_id`) containing the text: `[Sender Name] send you a msg click to see`.
4. **Realtime Sync**: The insertion triggers a Supabase Realtime broadcast event on the `notifications` table publication channel.
5. **Zustand State Update**: The React client’s `useNotificationStore` state manager receives the payload over WebSocket, updates the local array, and increments the badge counts dynamically in both the header (`AppHeader`) and sidebar (`AppSidebar`).
6. **Inbox Detail Resolution**: Clicking a notification item in `/inbox` triggers an update query setting `read = true`, fetches the corresponding message text details from `chat_messages`, and displays it in the full-page view container.

### Technologies & Purpose
* **PostgreSQL Triggers & Functions**: Automated database trigger (`public.create_message_notification()`) running after inserts on `chat_messages` to log unread notifications.
* **Zustand Notification Store**: State manager (`notification-store.ts`) tracking unread notifications, handling real-time payload syncing, and marking items as read.
* **Next.js Router Navigation**: Routing user from the header's Bell icon directly to `/inbox` on click.
* **Lucide React Icons & Tailwind/CSS**: Implementation of badge indicator overlays, close cross buttons, and responsive side-by-side preview panels.


