# Database Schema & Data Flows: Chat Application

This document provides a comprehensive overview of the database tables, constraints, index optimizations, example payloads, and update triggers for the Chat application.

---

## 1. Profiles Table (`public.profiles`)

Stores profile information for registered users and placeholder records created for unregistered contacts.

### 1.1. SQL Definition
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text NULL,
  email text NULL,
  avatar text NULL,
  company text NULL,
  mobile text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  status text NULL DEFAULT 'offline'::text,
  online boolean NULL DEFAULT false,
  offline boolean NULL DEFAULT true,
  last_seen timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  auth_user_id uuid NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT unique_profile_email UNIQUE (email),
  CONSTRAINT profiles_status_check CHECK (status = any (array['online'::text, 'offline'::text]))
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_profiles_presence ON public.profiles USING btree (status, last_seen) TABLESPACE pg_default;
```

### 1.2. Example Record
```json
{
  "id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "name": "Mohammed Aman",
  "email": "itsaman00786@gmail.com",
  "avatar": "https://lh3.googleusercontent.com/a/ACg8ocIDYOePrjZ...",
  "company": "Amoga App",
  "mobile": "+1234567890",
  "created_at": "2026-07-17T08:00:00.000Z",
  "status": "online",
  "online": true,
  "offline": false,
  "last_seen": "2026-07-17T15:40:00.000Z",
  "updated_at": "2026-07-17T15:40:00.000Z",
  "auth_user_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

### 1.3. Column Update Lifecycle

| Column | Trigger / When it updates | How it updates |
| --- | --- | --- |
| `id` | Row Insertion (Signup / Unregistered user initialization) | Set to the user's Auth UUID or generated via UUID generator. |
| `status`, `online`, `offline` | Real-time presence channels / heartbeat loops | Heartbeat loop runs client-side every 30 seconds, calling RPC or updating columns (`status = 'online'`, `online = true`, `offline = false`). |
| `last_seen` | User activity / presence heartbeat | Updated to `now()` dynamically alongside presence updates. |
| `updated_at` | Profile details change (Settings edits) | Set to current timestamp whenever Name, Bio, Avatar, Mobile, or Company changes. |
| `auth_user_id` | OAuth sign-in sync trigger | Linked to the Supabase internal auth ID upon user registration. |

---

## 2. Contacts Table (`public.contacts`)

Represents private, directional social contact links. User A adding User B creates a row owned by User A.

### 2.1. SQL Definition
```sql
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  contact_user_id uuid NOT NULL,
  nickname text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_uuid uuid NULL,
  email text NULL,
  CONSTRAINT contacts_pkey PRIMARY KEY (id),
  CONSTRAINT unique_owner_contact UNIQUE (owner_id, contact_user_id),
  CONSTRAINT unique_owner_email UNIQUE (owner_id, email),
  CONSTRAINT contacts_contact_user_id_fkey FOREIGN KEY (contact_user_id) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT contacts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_contacts_owner_email ON public.contacts USING btree (owner_id, email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON public.contacts USING btree (owner_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_contacts_contact_user_id ON public.contacts USING btree (contact_user_id) TABLESPACE pg_default;
```

### 2.2. Example Record
```json
{
  "id": "7acfa90d-c01d-4eb2-a9b0-13f64c679aab",
  "owner_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "contact_user_id": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
  "nickname": "John",
  "email": "aman_239225@saitm.ac.in",
  "created_at": "2026-07-17T09:12:00.000Z",
  "user_uuid": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

### 2.3. Column Update Lifecycle

| Column | Trigger / When it updates | How it updates |
| --- | --- | --- |
| `owner_id` | Contact Addition (Insert) | Set to the logged-in user's profile ID (`auth.uid()`). Does not change. |
| `contact_user_id` | Contact Addition (Insert) | Set to the target contact user's profile ID. Does not change. |
| `nickname` | Nickname Customization | Modified in Settings panel or contact detail card; can be updated to any custom string or set to `NULL` to fall back to the user's name. |
| `email` | Contact Addition (Insert) | Filled with target email. Primarily used to match unregistered contacts once they sign up. |
| `user_uuid` | Contact Addition (Insert) | Set to the owner's ID to satisfy the RLS policies configuration (`auth.uid() = user_uuid`). |

---

## 3. Database Constraints Explained

### 3.1. `unique_owner_contact`
- **What it does**: Ensures that `owner_id` and `contact_user_id` are unique together.
- **Why it matters**: Prevents User A from adding the exact same User B as a contact twice. Any subsequent attempt to insert a duplicate contact throws code `23505` (Unique Constraint Violation).

### 3.2. `unique_owner_email`
- **What it does**: Restricts `owner_id` and `email` to be unique together.
- **Why it matters**: Prevents User A from adding two separate contact records with the exact same email address.

### 3.3. `contacts_contact_user_id_fkey` and `contacts_owner_id_fkey`
- **What it does**: Restricts both fields to valid keys in `public.profiles(id)` using `ON DELETE CASCADE`.
- **Why it matters**: Ensures data integrity. If a profile is deleted, all contact records linking to it are automatically removed by the database engine.
