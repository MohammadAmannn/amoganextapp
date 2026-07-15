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
