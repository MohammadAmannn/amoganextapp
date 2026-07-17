# Supabase PostgREST API Reference Guide

This document lists all database API operations for the Chat application. You can use these endpoints directly in **Postman** or any HTTP client to test and inspect the data layers.

---

## 1. Setup & Authentication

Attach the following headers to **every** HTTP request:

```http
apikey: YOUR_SUPABASE_ANON_KEY
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

*For mutations (`POST`, `PATCH`, `DELETE`), you can add the `Prefer: return=representation` header to obtain the modified records back in the response body.*

---

## 2. Profiles API (`public.profiles`)

Manages user profile entries.

### 2.1. Get All Profiles
Returns a list of all registered profiles sorted alphabetically by name.
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/profiles?order=name.asc`

### 2.2. Get Profile by ID
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/profiles?id=eq.YOUR_PROFILE_ID&limit=1`

### 2.3. Get Profile by Email
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/profiles?email=eq.user@example.com&limit=1`

### 2.4. Create Profile (Placeholder / Register)
- **Method**: `POST`
- **Headers**: Add `Prefer: return=representation`
- **Body (JSON)**:
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

## 3. Contacts API (`public.contacts`)

Manages private contact records.

### 3.1. Fetch My Contacts
Returns your personal contacts, including full profile details linked to the contact.
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/contacts?owner_id=eq.YOUR_USER_ID&select=id,owner_id,contact_user_id,nickname,email,created_at,contact_user:profiles!contacts_contact_user_id_fkey(id,name,email,avatar,company,mobile)&order=created_at.desc`

### 3.2. Add New Contact
- **Method**: `POST`
- **Headers**: Add `Prefer: return=representation`
- **Body (JSON)**:
```json
{
  "owner_id": "YOUR_USER_ID",
  "contact_user_id": "TARGET_PROFILE_ID",
  "nickname": "John Nickname",
  "email": "john@example.com",
  "user_uuid": "YOUR_USER_ID"
}
```

### 3.3. Update Contact Nickname
- **Method**: `PATCH`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/contacts?id=eq.CONTACT_ROW_ID&owner_id=eq.YOUR_USER_ID`
- **Headers**: Add `Prefer: return=representation`
- **Body (JSON)**:
```json
{
  "nickname": "Updated Nickname"
}
```

### 3.4. Delete Contact
- **Method**: `DELETE`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/contacts?id=eq.CONTACT_ROW_ID&owner_id=eq.YOUR_USER_ID`

---

## 4. Groups API (`public.chat_group`)

Manages group details.

### 4.1. Fetch All Groups
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_group?order=created_at.desc`

### 4.2. Create / Upsert Group
- **Method**: `POST`
- **Headers**: Add `Prefer: resolution=merge-duplicates,return=representation`
- **Body (JSON)**:
```json
{
  "id": "e5b8d223-fa1d-44a3-b4cd-3c6628de9aef",
  "name": "Design Team Chat",
  "description": "Collaborators discussing UI mockups",
  "image_url": "https://avatar-url.png",
  "users": ["member1@example.com", "member2@example.com"],
  "status": "Active",
  "email": "owner@example.com",
  "user_uuid": "YOUR_USER_ID"
}
```

### 4.3. Delete Group
- **Method**: `DELETE`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_group?id=eq.GROUP_UUID`

---

## 5. Users API (`public.users`)

Resolves business user accounts.

### 5.1. Resolve Business ID from Auth UUID
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/users?auth_user_id=eq.YOUR_AUTH_UUID&select=id&limit=1`

### 5.2. Call get_or_create_pending_user RPC
- **Method**: `POST`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/rpc/get_or_create_pending_user`
- **Body (JSON)**:
```json
{
  "p_email": "pending@example.com",
  "p_name": "Pending Name"
}
```

---

## 6. Conversations API (`public.conversations` & `conversation_members`)

Manages direct and group messaging conversations.

### 6.1. Fetch User Conversations
Returns conversations you participate in, along with membership roles and message logs.
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/conversations?select=*,conversation_members(*,profiles(*)),chat_messages(*)&conversation_members.user_id=eq.YOUR_USER_ID`

### 6.2. Clear Unread Counts
- **Method**: `PATCH`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/conversation_members?conversation_id=eq.CONVO_ID&user_id=eq.YOUR_USER_ID`
- **Body (JSON)**:
```json
{
  "unread_count": 0
}
```

---

## 7. Messages API (`public.chat_messages`)

Manages chat message copies.

### 7.1. Get Conversation Messages
- **Method**: `GET`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?conversation_id=eq.CONVO_ID&owner_user_id=eq.YOUR_USER_ID&select=*,sender:profiles!sender_user_id(id,name,email,avatar)&or=(deleted.eq.false,deleted_by.not.is.null)&order=created_at.asc`

### 7.2. Create / Send Message (Insert Copy)
- **Method**: `POST`
- **Headers**: Add `Prefer: return=representation`
- **Body (JSON)**:
```json
{
  "id": "GENERATED_MESSAGE_UUID",
  "conversation_id": "CONVO_ID",
  "owner_user_id": "YOUR_USER_ID",
  "sender_user_id": "YOUR_USER_ID",
  "message": "Hello World!",
  "message_type": "text",
  "direction": "Sent",
  "sent": true,
  "received": true,
  "message_status": "sent"
}
```

### 7.3. Update Message Reaction / Flag (PATCH)
- **Method**: `PATCH`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?id=eq.MESSAGE_UUID`
- **Body (JSON)**:
```json
{
  "star": true
}
```

### 7.4. Delete Message for Me (Soft Delete)
- **Method**: `PATCH`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?id=eq.MESSAGE_UUID`
- **Body (JSON)**:
```json
{
  "deleted": true
}
```

### 7.5. Delete Message for Everyone
- **Method**: `PATCH`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?or=(id.eq.SENDER_MSG_ID,sender_message_id.eq.SENDER_MSG_ID)`
- **Body (JSON)**:
```json
{
  "message": "This message was deleted.",
  "deleted": true,
  "deleted_at": "2026-07-17T12:00:00.000Z",
  "deleted_by": "YOUR_USER_ID"
}
```

---

## 8. Delivery & Receipt API

### 8.1. Mark Messages as Read
Marks incoming messages in a conversation as read.
- **Method**: `PATCH`
- **URL**: `https://abxwugpdvhmuxoesmumq.supabase.co/rest/v1/chat_messages?conversation_id=eq.CONVO_ID&owner_user_id=eq.YOUR_USER_ID&direction=eq.Received&message_status=in.(sent,delivered)`
- **Body (JSON)**:
```json
{
  "message_status": "read",
  "read_at": "2026-07-17T12:00:00.000Z",
  "delivered_at": "2026-07-17T12:00:00.000Z"
}
```
