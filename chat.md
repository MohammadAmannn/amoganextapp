# Database Schema & Data Flows: Chat Application

This document provides a comprehensive overview of the database tables, constraints, index optimizations, example payloads, and update triggers for the Chat application.

---

## ✅ REST API Status Tracker

### Chats (Messages)
| Endpoint | Method | Status | Description |
|---|---|---|---|
| `/api/messages` | `GET` | ✅ Done | Fetch messages for a conversation |
| `/api/messages` | `POST` | ✅ Done | Send a message (creates copies for all members) |
| `/api/messages/[id]` | `PATCH` | ✅ Done | Star, pin, flag, like, archive a message |
| `/api/messages/[id]` | `DELETE` | ✅ Done | Delete message for me (soft delete) |
| `/api/messages/[id]/everyone` | `DELETE` | ✅ Done | Delete message for everyone |
| `/api/messages/[id]/forward` | `POST` | ✅ Done | Forward message to conversations |
| `/api/messages/delivery` | `PATCH` | ✅ Done | Mark messages as delivered or read |

### Contacts
| Endpoint | Method | Status | Description |
|---|---|---|---|
| `/api/contacts` | `GET` | ✅ Done | List all contacts for a user |
| `/api/contacts` | `POST` | ✅ Done | Add a new contact |
| `/api/contacts/[id]` | `PATCH` | ✅ Done | Update contact nickname |
| `/api/contacts/[id]` | `DELETE` | ✅ Done | Delete a contact |

### Group Chat (Conversations)
| Endpoint | Method | Status | Description |
|---|---|---|---|
| `/api/conversations` | `GET` | ✅ Done | List all conversations for a user |
| `/api/conversations/direct` | `POST` | ✅ Done | Get or create a direct conversation |
| `/api/conversations/group` | `POST` | ✅ Done | Create a group conversation |
| `/api/conversations/[id]/read` | `PATCH` | ✅ Done | Clear unread count |
| `/api/conversations/[id]` | `DELETE` | ✅ Done | Delete conversation for user |
| `/api/conversations/[id]/members/[memberId]` | `DELETE` | ✅ Done | Remove group member (Admin only) |

### Groups Tab (chat_group)
| Endpoint | Method | Status | Description |
|---|---|---|---|
| `/api/groups` | `GET` | ✅ Done | List groups by email |
| `/api/groups` | `POST` | ✅ Done | Create/upsert a group |
| `/api/groups/[id]` | `PUT` | ✅ Done | Update a group |
| `/api/groups/[id]` | `DELETE` | ✅ Done | Delete a group |

### Profiles
| Endpoint | Method | Status | Description |
|---|---|---|---|
| `/api/profiles` | `GET` | ✅ Done | List all profiles (or by email) |
| `/api/profiles/[id]` | `GET` | ✅ Done | Get profile by ID |
| `/api/profiles/[id]` | `PATCH` | ✅ Done | Update profile details / presence status |

### Storage / File Upload
| Endpoint | Method | Status | Description |
|---|---|---|---|
| `/api/upload` | `POST` | ✅ Done | Upload file to Supabase Storage (multipart/form-data) |
| `/api/upload` | `DELETE` | ✅ Done | Delete file from Supabase Storage |

### Notifications
| Endpoint | Method | Status | Description |
|---|---|---|---|
| `/api/notifications` | `GET` | ✅ Done | List notifications for a user |
| `/api/notifications` | `POST` | ✅ Done | Create a notification |
| `/api/notifications/[id]` | `PATCH` | ✅ Done | Mark notification as read |
| `/api/notifications/[id]` | `DELETE` | ✅ Done | Delete a notification |
| `/api/notifications/read-all` | `PATCH` | ✅ Done | Mark all notifications as read |

---

## 🧪 Postman Test Checklist

Use this table to verify every API operation step-by-step. Replace placeholder UUIDs with your real IDs.

| Step | Feature | API | Expected Result |
|------|---------|-----|------------------|
| ✅ 1 | Send text message | `POST /api/messages` | Receiver gets message |
| ✅ 2 | Fetch messages | `GET /api/messages` | New message appears |
| ✅ 3 | Delete for me | `DELETE /api/messages/:id` | Message hidden only for sender |
| ✅ 4 | Delete for everyone | `DELETE /api/messages/:id/everyone` | Message removed for both users |
| ✅ 5 | Upload image file | `POST /api/upload` (folder=images) | Returns publicUrl |
| ✅ 6 | Send image message | `POST /api/messages` (messageType=image) | Image appears in chat |
| ✅ 7 | Upload video file | `POST /api/upload` (folder=videos) | Returns publicUrl |
| ✅ 8 | Send video message | `POST /api/messages` (messageType=video) | Video appears in chat |
| ✅ 9 | Upload document | `POST /api/upload` (folder=documents) | Returns publicUrl |
| ✅ 10 | Send document message | `POST /api/messages` (messageType=document) | File card appears in chat |
| ✅ 11 | Upload audio file | `POST /api/upload` (folder=audio) | Returns publicUrl |
| ✅ 12 | Send audio message | `POST /api/messages` (messageType=audio) | Audio player appears |
| ✅ 13 | Star message | `PATCH /api/messages/:id` (action=star) | Star updated |
| ✅ 14 | Flag message | `PATCH /api/messages/:id` (action=flag) | Flag updated |
| ✅ 15 | Pin message | `PATCH /api/messages/:id` (action=pin) | Pin updated |
| ✅ 16 | Favorite message | `PATCH /api/messages/:id` (action=favorite) | Favorite updated |
| ✅ 17 | Thumb/Like message | `PATCH /api/messages/:id` (action=thumb) | Like updated |
| ✅ 18 | Archive message | `PATCH /api/messages/:id` (action=archive) | Archived |
| ✅ 19 | Reply to message | `POST /api/messages` (with replyMetadata) | Reply metadata saved |
| ✅ 20 | Forward message | `POST /api/messages/:id/forward` | Message copied to target convos |
| ✅ 21 | Mark as delivered | `PATCH /api/messages/delivery` (status=delivered) | Status updated |
| ✅ 22 | Mark as read | `PATCH /api/messages/delivery` (status=read) | Status updated |
| ✅ 23 | List contacts | `GET /api/contacts?userId=...` | Contacts list returned |
| ✅ 24 | Add contact | `POST /api/contacts` | Contact created |
| ✅ 25 | Update nickname | `PATCH /api/contacts/:id` | Nickname changed |
| ✅ 26 | Delete contact | `DELETE /api/contacts/:id?ownerId=...` | Contact removed |
| ✅ 27 | List conversations | `GET /api/conversations?userId=...` | Convos with members returned |
| ✅ 28 | Create DM | `POST /api/conversations/direct` | Conversation ID returned |
| ✅ 29 | Create group convo | `POST /api/conversations/group` | Group convo + system msgs created |
| ✅ 30 | Clear unread | `PATCH /api/conversations/:id/read` | Unread count reset to 0 |
| ✅ 31 | List groups | `GET /api/groups?email=...` | Groups list returned |
| ✅ 32 | Create group | `POST /api/groups` | Group created |
| ✅ 33 | Update group | `PUT /api/groups/:id` | Group updated |
| ✅ 34 | Delete group | `DELETE /api/groups/:id` | Group removed |
| ✅ 35 | List profiles | `GET /api/profiles` | All profiles returned |
| ✅ 36 | Get profile by ID | `GET /api/profiles/:id` | Profile details returned |
| ✅ 37 | Delete uploaded file | `DELETE /api/upload?path=...` | File removed from storage |
| ✅ 38 | List notifications | `GET /api/notifications?userId=...` | Notifications returned |
| ✅ 39 | Create notification | `POST /api/notifications` | Notification created |
| ✅ 40 | Mark notification read | `PATCH /api/notifications/:id` | Read status updated |
| ✅ 41 | Mark all read | `PATCH /api/notifications/read-all` | All unread → read |
| ✅ 42 | Delete notification | `DELETE /api/notifications/:id` | Notification removed |
| ✅ 43 | Update profile status | `PATCH /api/profiles/:id` | Profile / presence updated |

---

## Postman Testing Guide

### Authentication Setup

Add these headers to **every** request in Postman:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**How to get your access token:**
1. Sign in to the app at `http://localhost:3000`
2. Open DevTools (F12) → Application → Local Storage
3. Find the key `sb-abxwugpdvhmuxoesmumq-auth-token`
4. Copy the `access_token` value

---

## Postman Examples

### 1. Send a Text Message

```
POST http://localhost:3000/api/messages
```

**Body (JSON):**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "recipientId": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
  "message": "Hello from Postman!",
  "messageType": "text"
}
```

> **Note:** If you already know the `conversationId`, pass it instead of `recipientId`:
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "conversationId": "CONVO_UUID_HERE",
  "message": "Hello from Postman!",
  "messageType": "text"
}
```

---

### 2. Send a Message with Reply

```
POST http://localhost:3000/api/messages
```

**Body (JSON):**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "conversationId": "CONVO_UUID",
  "message": "This is a reply!",
  "messageType": "text",
  "replyMetadata": {
    "replyto_message_id": "ORIGINAL_MSG_UUID",
    "replyto_user_id": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
    "parent_message_id": null
  }
}
```

---

### 3. Send a File/Image Message

```
POST http://localhost:3000/api/messages
```

**Body (JSON):**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "conversationId": "CONVO_UUID",
  "message": "",
  "messageType": "image",
  "fileUrl": "https://example.com/photo.jpg",
  "fileName": "photo.jpg",
  "fileSize": 204800,
  "mimeType": "image/jpeg",
  "thumbnail": "https://example.com/photo_thumb.jpg"
}
```

---

### 4. Fetch Messages

```
GET http://localhost:3000/api/messages?conversationId=CONVO_UUID&senderId=238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

Or auto-resolve conversation by recipient:
```
GET http://localhost:3000/api/messages?recipientId=386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a&senderId=238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

---

### 5. Star / Pin / Flag a Message

```
PATCH http://localhost:3000/api/messages/MESSAGE_UUID
```

**Body (JSON):**
```json
{
  "action": "star",
  "value": true
}
```

Other valid actions: `"thumb"`, `"favorite"`, `"flag"`, `"pin"`, `"archive"`, `"action_this"`

---

### 6. Delete Message for Me

```
DELETE http://localhost:3000/api/messages/MESSAGE_UUID
```

No body needed.

---

### 7. Delete Message for Everyone

```
DELETE http://localhost:3000/api/messages/MESSAGE_UUID/everyone
```

**Body (JSON):**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

---

### 8. Forward a Message

```
POST http://localhost:3000/api/messages/MESSAGE_UUID/forward
```

**Body (JSON):**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "targetConversationIds": ["CONVO_UUID_1", "CONVO_UUID_2"]
}
```

---

### 9. Mark Messages as Read / Delivered

```
PATCH http://localhost:3000/api/messages/delivery
```

**Body (JSON) — Mark as Read:**
```json
{
  "conversationId": "CONVO_UUID",
  "userId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "status": "read"
}
```

**Body (JSON) — Mark as Delivered:**
```json
{
  "conversationId": "CONVO_UUID",
  "userId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "status": "delivered"
}
```

---

### 10. List My Contacts

```
GET http://localhost:3000/api/contacts?userId=238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

---

### 11. Add a New Contact

```
POST http://localhost:3000/api/contacts
```

**Body (JSON):**
```json
{
  "ownerId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "email": "newcontact@example.com",
  "nickname": "New Friend"
}
```

---

### 12. Update Contact Nickname

```
PATCH http://localhost:3000/api/contacts/CONTACT_ROW_UUID
```

**Body (JSON):**
```json
{
  "ownerId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "nickname": "Updated Nickname"
}
```

---

### 13. Delete a Contact

```
DELETE http://localhost:3000/api/contacts/CONTACT_ROW_UUID?ownerId=238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

---

### 14. List All Conversations

```
GET http://localhost:3000/api/conversations?userId=238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

---

### 15. Get or Create a Direct Conversation

```
POST http://localhost:3000/api/conversations/direct
```

**Body (JSON):**
```json
{
  "userAId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "userBId": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a"
}
```

---

### 16. Create a Group Conversation

```
POST http://localhost:3000/api/conversations/group
```

**Body (JSON):**
```json
{
  "groupName": "Design Team",
  "groupImage": null,
  "memberIds": [
    "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
    "6866ec7b-3448-482f-a7c0-0c4683377014"
  ],
  "creatorId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "type": "group"
}
```

---

### 17. Clear Unread Count

```
PATCH http://localhost:3000/api/conversations/CONVO_UUID/read
```

**Body (JSON):**
```json
{
  "userId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

---

### 18. List Groups

```
GET http://localhost:3000/api/groups?email=itsaman00786@gmail.com
```

---

### 19. Create a Group (chat_group Tab)

```
POST http://localhost:3000/api/groups
```

**Body (JSON):**
```json
{
  "groupName": "Marketing Team",
  "description": "Marketing campaign discussions",
  "groupImage": "",
  "users": ["itsaman00786@gmail.com", "john@example.com"],
  "status": "Active",
  "email": "itsaman00786@gmail.com",
  "userUuid": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

---

### 20. Update a Group

```
PUT http://localhost:3000/api/groups/GROUP_UUID
```

**Body (JSON):**
```json
{
  "groupName": "Updated Team Name",
  "description": "Updated description",
  "groupImage": "",
  "users": ["itsaman00786@gmail.com", "john@example.com", "new@example.com"],
  "status": "Active",
  "email": "itsaman00786@gmail.com",
  "userUuid": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

---

### 21. Delete a Group

```
DELETE http://localhost:3000/api/groups/GROUP_UUID
```

---

### 22. List All Profiles

```
GET http://localhost:3000/api/profiles
```

---

### 23. Get Profile by Email

```
GET http://localhost:3000/api/profiles?email=itsaman00786@gmail.com
```

---

### 24. Get Profile by ID

```
GET http://localhost:3000/api/profiles/238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

---

### 25. Upload a File (Image/Video/Document/Audio)

```
POST http://localhost:3000/api/upload
```

**Content-Type:** `multipart/form-data` (Postman auto-sets this when you use Body → form-data)

**Form-Data Fields:**
| Key | Type | Value |
|-----|------|-------|
| `file` | File | Select your file |
| `folder` | Text | `images` (or `videos`, `documents`, `audio`) |

**Postman Steps:**
1. Set method to `POST`
2. Go to **Body** tab → select **form-data**
3. Add key `file` → change type dropdown to **File** → select your file
4. Add key `folder` → type `images` (or `videos`, `documents`, `audio`)
5. Hit Send

**Response:**
```json
{
  "success": true,
  "publicUrl": "https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/public/chat-files/images/uuid.jpg",
  "fileName": "photo.jpg",
  "fileSize": 204800,
  "mimeType": "image/jpeg",
  "storagePath": "images/uuid.jpg",
  "folder": "images"
}
```

---

### 26. Upload Image + Send as Chat Message (2-Step Flow)

**Step 1: Upload the file**
```
POST http://localhost:3000/api/upload
```
Form-data: `file` = your-image.jpg, `folder` = images

→ Copy `publicUrl` from response

**Step 2: Send the message with the uploaded URL**
```
POST http://localhost:3000/api/messages
```
**Body (JSON):**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "conversationId": "CONVO_UUID",
  "message": "",
  "messageType": "image",
  "fileUrl": "PASTE_PUBLIC_URL_FROM_STEP_1",
  "fileName": "photo.jpg",
  "fileSize": 204800,
  "mimeType": "image/jpeg"
}
```

---

### 27. Upload Video + Send as Chat Message

**Step 1:** Upload with `folder` = `videos`
**Step 2:**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "conversationId": "CONVO_UUID",
  "message": "",
  "messageType": "video",
  "fileUrl": "PASTE_PUBLIC_URL_FROM_STEP_1",
  "fileName": "recording.mp4",
  "fileSize": 5242880,
  "mimeType": "video/mp4",
  "duration": 30,
  "thumbnail": "PASTE_THUMBNAIL_URL_IF_ANY"
}
```

---

### 28. Upload Document + Send as Chat Message

**Step 1:** Upload with `folder` = `documents`
**Step 2:**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "conversationId": "CONVO_UUID",
  "message": "",
  "messageType": "document",
  "fileUrl": "PASTE_PUBLIC_URL_FROM_STEP_1",
  "fileName": "report.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf"
}
```

---

### 29. Upload Audio + Send as Chat Message

**Step 1:** Upload with `folder` = `audio`
**Step 2:**
```json
{
  "senderId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "conversationId": "CONVO_UUID",
  "message": "",
  "messageType": "audio",
  "fileUrl": "PASTE_PUBLIC_URL_FROM_STEP_1",
  "fileName": "voice.mp3",
  "fileSize": 512000,
  "mimeType": "audio/mpeg",
  "duration": 15
}
```

---

### 30. Delete an Uploaded File

```
DELETE http://localhost:3000/api/upload?path=images/uuid-filename.jpg
```

> Use the `storagePath` value from the upload response.

---

### 31. List Notifications

```
GET http://localhost:3000/api/notifications?userId=238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

Optional filters:
```
GET http://localhost:3000/api/notifications?userId=238d94d2-cfd3-4c47-9bbf-1c43f206d998&read=false
GET http://localhost:3000/api/notifications?userId=238d94d2-cfd3-4c47-9bbf-1c43f206d998&limit=10
```

---

### 32. Create a Notification

```
POST http://localhost:3000/api/notifications
```

**Body (JSON):**
```json
{
  "userId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "senderId": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
  "messageId": "MSG_UUID_HERE",
  "messageText": "John send you a msg"
}
```

**Response:**
```json
{
  "id": "GENERATED_UUID",
  "user_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "sender_id": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
  "message_id": "MSG_UUID_HERE",
  "message_text": "John send you a msg",
  "read": false,
  "created_at": "2026-07-18T12:00:00.000Z"
}
```

---

### 33. Mark Notification as Read

```
PATCH http://localhost:3000/api/notifications/NOTIFICATION_UUID
```

No body needed — automatically marks `read: true`.

---

### 34. Mark ALL Notifications as Read

```
PATCH http://localhost:3000/api/notifications/read-all
```

**Body (JSON):**
```json
{
  "userId": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

---

### 35. Delete a Notification

```
DELETE http://localhost:3000/api/notifications/NOTIFICATION_UUID
```

---

### 36. Update Profile Status / Presence

```
PATCH http://localhost:3000/api/profiles/USER_UUID
```

**Body (JSON):**
```json
{
  "status": "offline",
  "online": false,
  "offline": true,
  "last_seen": "2026-07-20T10:00:00.000Z",
  "updated_at": "2026-07-20T10:00:00.000Z"
}
```

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

---

## 4. Direct Supabase PostgREST Examples (Hosted / Production)

Use these examples when you want to test **directly against your Supabase database** without going through your Next.js app. This works whether your website is hosted on Vercel or running locally.

### Base URL
```
https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1
```

### Required Headers (Add to EVERY Request)

| Header | Value |
|---|---|
| `apikey` | `YOUR_SUPABASE_ANON_KEY` |
| `Authorization` | `Bearer YOUR_ACCESS_TOKEN` |
| `Content-Type` | `application/json` |

> **How to get your anon key:** Check your `.env.local` file → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
>
> **How to get your access token:** Sign in to the app → DevTools (F12) → Application → Local Storage → `sb-abxwugpdvhmuxoesmumq-auth-token` → copy `access_token`

---

### 4.1. Profiles

#### List All Profiles
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/profiles?order=name.asc
```

#### Get Profile by ID
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/profiles?id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&limit=1
```

#### Get Profile by Email
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/profiles?email=eq.itsaman00786@gmail.com&limit=1
```

#### Create a Profile
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/profiles
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "id": "a1c2d3e4-b5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "name": "Sarah Connor",
  "email": "sarah@example.com",
  "avatar": null,
  "company": "Cyberdyne Systems",
  "mobile": "+19876543210"
}
```

---

### 4.2. Contacts

#### Fetch My Contacts (with profile details)
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/contacts?owner_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&select=id,owner_id,contact_user_id,nickname,email,created_at,contact_user:profiles!contacts_contact_user_id_fkey(id,name,email,avatar,company,mobile)&order=created_at.desc
```

#### Add a New Contact
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/contacts
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "owner_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "contact_user_id": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
  "nickname": "John",
  "email": "john@example.com",
  "user_uuid": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

> ⚠️ `owner_id` and `user_uuid` MUST both be your own user ID (the one in your Bearer token). `contact_user_id` is the OTHER person's profile ID.

#### Update Contact Nickname
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/contacts?id=eq.CONTACT_ROW_UUID&owner_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "nickname": "Johnny Boy"
}
```

#### Delete a Contact
```
DELETE https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/contacts?id=eq.CONTACT_ROW_UUID&owner_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

---

### 4.3. Messages

#### Fetch Conversation Messages
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?conversation_id=eq.CONVO_UUID&owner_user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&select=*,sender:profiles!sender_user_id(id,name,email,avatar)&or=(deleted.eq.false,deleted_by.not.is.null)&order=created_at.asc
```

#### Send a Message (Insert a Single Copy)
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "id": "GENERATED_UUID_HERE",
  "conversation_id": "CONVO_UUID",
  "owner_user_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "sender_user_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "message": "Hello from Postman via Supabase!",
  "message_type": "text",
  "direction": "Sent",
  "sent": true,
  "received": true,
  "message_status": "sent"
}
```

> ⚠️ **Important:** When using the direct Supabase URL, you insert ONE message copy at a time. To simulate full chat behavior (copies for all members), use the Next.js `/api/messages` route instead, which auto-creates copies for all conversation members.

#### Star a Message
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?id=eq.MESSAGE_UUID
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "star": true
}
```

#### Pin a Message
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?id=eq.MESSAGE_UUID
```
**Body:**
```json
{
  "pin": true
}
```

#### Flag a Message
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?id=eq.MESSAGE_UUID
```
**Body:**
```json
{
  "flag": true
}
```

#### Delete Message for Me (Soft Delete)
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?id=eq.MESSAGE_UUID
```
**Body:**
```json
{
  "deleted": true
}
```

#### Delete Message for Everyone
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?or=(id.eq.SENDER_MSG_ID,sender_message_id.eq.SENDER_MSG_ID)
```
**Body:**
```json
{
  "message": "This message was deleted.",
  "deleted": true,
  "deleted_at": "2026-07-18T12:00:00.000Z",
  "deleted_by": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

---

### 4.4. Conversations & Members

#### Fetch Conversations with Members and Messages
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/conversations?select=*,conversation_members(*,profiles(*)),chat_messages(*)&conversation_members.user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998
```

#### Create a New Conversation
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/conversations
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "type": "direct",
  "created_by": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

#### Add Members to a Conversation
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/conversation_members
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
[
  { "conversation_id": "NEW_CONVO_UUID", "user_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998" },
  { "conversation_id": "NEW_CONVO_UUID", "user_id": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a" }
]
```

#### Clear Unread Count
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/conversation_members?conversation_id=eq.CONVO_UUID&user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998
```
**Body:**
```json
{
  "unread_count": 0
}
```

---

### 4.5. Groups Tab (chat_group)

#### Fetch All Groups
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_group?order=created_at.desc
```

#### Fetch Groups by User Email
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_group?users=cs.["itsaman00786@gmail.com"]&order=created_at.desc
```

#### Create / Upsert a Group
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_group
```
**Header:** Add `Prefer: resolution=merge-duplicates,return=representation`

**Body:**
```json
{
  "id": "e5b8d223-fa1d-44a3-b4cd-3c6628de9aef",
  "name": "Design Team Chat",
  "description": "Collaborators discussing UI mockups",
  "image_url": "https://avatar-url.png",
  "users": ["itsaman00786@gmail.com", "john@example.com"],
  "status": "Active",
  "email": "itsaman00786@gmail.com",
  "user_uuid": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```

#### Update a Group
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_group?id=eq.GROUP_UUID
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "name": "Updated Group Name",
  "description": "New description",
  "users": ["itsaman00786@gmail.com", "john@example.com", "new@example.com"]
}
```

#### Delete a Group
```
DELETE https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_group?id=eq.GROUP_UUID
```

---

### 4.6. Delivery Receipts

#### Mark Messages as Delivered
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?conversation_id=eq.CONVO_UUID&owner_user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&direction=eq.Received&message_status=eq.sent
```
**Body:**
```json
{
  "message_status": "delivered",
  "delivered_at": "2026-07-18T12:00:00.000Z"
}
```

#### Mark Messages as Read
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?conversation_id=eq.CONVO_UUID&owner_user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&direction=eq.Received&message_status=in.(sent,delivered)
```
**Body:**
```json
{
  "message_status": "read",
  "read_at": "2026-07-18T12:00:00.000Z",
  "delivered_at": "2026-07-18T12:00:00.000Z"
}
```

---

### 4.7. RPC Endpoints

#### Get or Create Pending User
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/rpc/get_or_create_pending_user
```
**Body:**
```json
{
  "p_email": "pending@example.com",
  "p_name": "Pending Name"
}
```

#### Resolve Business ID from Auth UUID
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/users?auth_user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&select=id&limit=1
```

---

### 4.8. Storage (File Upload / Delete)

#### Upload a File to Supabase Storage (Direct)

```
POST https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/chat-files/images/my-photo.jpg
```

**Headers:**
| Header | Value |
|---|---|
| `apikey` | `YOUR_SUPABASE_ANON_KEY` |
| `Authorization` | `Bearer YOUR_SUPABASE_ANON_KEY` |
| `Content-Type` | `image/jpeg` (match your file's MIME type) |

**Body:** Select `binary` in Postman → choose your file

**Postman Steps (Direct Supabase Upload):**
1. Set method to `POST`
2. URL: `https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/chat-files/FOLDER/FILENAME.EXT`
   - Replace `FOLDER` with: `images`, `videos`, `documents`, or `audio`
   - Replace `FILENAME.EXT` with a unique name (e.g., `my-photo-123.jpg`)
3. Add `apikey` and `Authorization` headers
4. Set `Content-Type` header to match your file type:
   - Images: `image/jpeg`, `image/png`, `image/webp`
   - Videos: `video/mp4`, `video/webm`
   - Documents: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Audio: `audio/mpeg`, `audio/wav`
5. Go to **Body** tab → select **binary** → choose your file
6. Hit Send

**Public URL after upload:**
```
https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/public/chat-files/images/my-photo.jpg
```

#### Upload Different File Types

**Upload an Image:**
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/chat-files/images/photo-001.jpg
Content-Type: image/jpeg
```

**Upload a Video:**
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/chat-files/videos/clip-001.mp4
Content-Type: video/mp4
```

**Upload a Document:**
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/chat-files/documents/report-001.pdf
Content-Type: application/pdf
```

**Upload an Audio:**
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/chat-files/audio/voice-001.mp3
Content-Type: audio/mpeg
```

#### Delete a File from Storage (Direct)

```
DELETE https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/chat-files/images/my-photo.jpg
```

**Headers:**
| Header | Value |
|---|---|
| `apikey` | `YOUR_SUPABASE_ANON_KEY` |
| `Authorization` | `Bearer YOUR_SUPABASE_ANON_KEY` |

#### List Files in a Folder

```
POST https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/list/chat-files
```

**Headers:**
| Header | Value |
|---|---|
| `apikey` | `YOUR_SUPABASE_ANON_KEY` |
| `Authorization` | `Bearer YOUR_SUPABASE_ANON_KEY` |
| `Content-Type` | `application/json` |

**Body:**
```json
{
  "prefix": "images/",
  "limit": 100,
  "offset": 0
}
```

---

### 4.9. Notifications

#### Fetch All Notifications for a User
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/notifications?user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&order=created_at.desc
```

#### Fetch Only Unread Notifications
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/notifications?user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&read=eq.false&order=created_at.desc
```

#### Create a Notification
```
POST https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/notifications
```
**Header:** Add `Prefer: return=representation`

**Body:**
```json
{
  "user_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "sender_id": "386ebb5b-0bf1-4b82-b4b7-4eb73bab7d4a",
  "message_id": "MSG_UUID_HERE",
  "message_text": "John send you a msg",
  "read": false
}
```

#### Mark Single Notification as Read
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/notifications?id=eq.NOTIFICATION_UUID
```
**Body:**
```json
{
  "read": true
}
```

#### Mark All Notifications as Read
```
PATCH https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/notifications?user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&read=eq.false
```
**Body:**
```json
{
  "read": true
}
```

#### Delete a Notification
```
DELETE https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/notifications?id=eq.NOTIFICATION_UUID
```

#### Get Unread Count
```
GET https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/notifications?user_id=eq.238d94d2-cfd3-4c47-9bbf-1c43f206d998&read=eq.false&select=id
```
> Count the array length in the response to get the unread count.

---

### Quick Reference: localhost vs Supabase URL

| What You Want | localhost Route | Direct Supabase |
|---|---|---|
| Send message (auto copies) | `POST /api/messages` | N/A (manual copy insertion) |
| Fetch messages | `GET /api/messages?conversationId=...&senderId=...` | `GET .../rest/v1/chat_messages?conversation_id=eq...` |
| Star a message | `PATCH /api/messages/MSG_ID` | `PATCH .../rest/v1/chat_messages?id=eq.MSG_ID` |
| Delete for me | `DELETE /api/messages/MSG_ID` | `PATCH .../rest/v1/chat_messages?id=eq.MSG_ID` |
| Delete for everyone | `DELETE /api/messages/MSG_ID/everyone` | `PATCH .../rest/v1/chat_messages?or=(...)` |
| Forward message | `POST /api/messages/MSG_ID/forward` | N/A (multi-step) |
| **Upload file** | `POST /api/upload` (form-data) | `POST .../storage/v1/object/chat-files/FOLDER/FILE` |
| **Delete file** | `DELETE /api/upload?path=...` | `DELETE .../storage/v1/object/chat-files/PATH` |
| **List files** | N/A | `POST .../storage/v1/object/list/chat-files` |
| List contacts | `GET /api/contacts?userId=...` | `GET .../rest/v1/contacts?owner_id=eq...` |
| Add contact | `POST /api/contacts` | `POST .../rest/v1/contacts` |
| Update nickname | `PATCH /api/contacts/ID` | `PATCH .../rest/v1/contacts?id=eq.ID` |
| Delete contact | `DELETE /api/contacts/ID?ownerId=...` | `DELETE .../rest/v1/contacts?id=eq.ID` |
| List conversations | `GET /api/conversations?userId=...` | `GET .../rest/v1/conversations?select=*,...` |
| Create DM | `POST /api/conversations/direct` | N/A (multi-step) |
| Create group convo | `POST /api/conversations/group` | N/A (multi-step) |
| Clear unread | `PATCH /api/conversations/ID/read` | `PATCH .../rest/v1/conversation_members?...` |
| List groups | `GET /api/groups?email=...` | `GET .../rest/v1/chat_group?...` |
| Create group | `POST /api/groups` | `POST .../rest/v1/chat_group` |
| Update group | `PUT /api/groups/ID` | `PATCH .../rest/v1/chat_group?id=eq.ID` |
| Delete group | `DELETE /api/groups/ID` | `DELETE .../rest/v1/chat_group?id=eq.ID` |
| List profiles | `GET /api/profiles` | `GET .../rest/v1/profiles?order=name.asc` |
| Get profile | `GET /api/profiles/ID` | `GET .../rest/v1/profiles?id=eq.ID` |
| Mark read | `PATCH /api/messages/delivery` | `PATCH .../rest/v1/chat_messages?...` |
| **List notifications** | `GET /api/notifications?userId=...` | `GET .../rest/v1/notifications?user_id=eq...` |
| **Create notification** | `POST /api/notifications` | `POST .../rest/v1/notifications` |
| **Mark notif. read** | `PATCH /api/notifications/ID` | `PATCH .../rest/v1/notifications?id=eq.ID` |
| **Mark all read** | `PATCH /api/notifications/read-all` | `PATCH .../rest/v1/notifications?user_id=eq...&read=eq.false` |
| **Delete notification** | `DELETE /api/notifications/ID` | `DELETE .../rest/v1/notifications?id=eq.ID` |
