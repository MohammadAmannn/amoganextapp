# Real-Time Typing & Voice Recording Indicator Documentation

This document explains the architecture, folder structure, Supabase Realtime Broadcast mechanism, and UI components used to implement WhatsApp/Telegram-style real-time typing and voice message recording indicators.

---

## 📁 Clean Folder Structure Breakdown

All chat-related code follows clean feature-driven architecture under `src/features/chattemplate/chat/`:

```
src/features/chattemplate/chat/
├── components/
│   ├── chat-layout.tsx         # Main layout orchestrator (Wires up hooks & state)
│   ├── chat-sidebar.tsx        # Conversation list sidebar (Renders typing/recording subtitles)
│   ├── chat-window.tsx         # Chat window (Header status, input triggers, mic handlers)
│   └── typing-indicator.tsx    # WhatsApp/Telegram glassmorphic typing & recording bubble
├── hooks/
│   ├── use-typing-broadcast.ts # Custom hook managing Supabase Broadcast events & auto-cleanup
│   ├── use-realtime.ts         # Supabase Postgres changes listener (for messages)
│   └── use-presence.ts         # Online/offline presence heartbeat & tracking
├── types/
│   ├── chat.types.ts           # Core conversation & message data models
│   └── typing.types.ts         # TypingStatus, TypingBroadcastPayload & UserTypingState schemas
```

---

## 🚀 Technical Overview & Architecture

Unlike message history or user presence stored in Postgres, typing and recording indicators are **ephemeral** (short-lived). Storing them in the database would create unnecessary database writes.

We use **Supabase Realtime Broadcast Channels**:
1. Clients connect to a shared Supabase broadcast channel (`chat-typing-room`).
2. When User A types or holds the microphone button to record a voice note, a lightweight JSON payload is broadcasted directly over WebSocket.
3. Connected clients receive the event instantly without querying Postgres.
4. If User A stops typing, clears the input, finishes recording, or disconnects, an `idle` event is sent, or a client-side auto-cleanup timer automatically clears the indicator after 4 seconds.

---

## 🛠️ Step-by-Step Implementation Details

### Step 1: Define Type Contracts (`typing.types.ts`)

[typing.types.ts](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/types/typing.types.ts)

```typescript
export type TypingStatus = 'idle' | 'typing' | 'recording'

export interface TypingBroadcastPayload {
  userId: string
  userName: string
  conversationId: string
  status: TypingStatus
  timestamp: number
}

export interface UserTypingState {
  userId: string
  userName: string
  status: TypingStatus
  timestamp: number
}
```

---

### Step 2: Build Supabase Broadcast Hook (`use-typing-broadcast.ts`)

[use-typing-broadcast.ts](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/hooks/use-typing-broadcast.ts)

- Listens on `chat-typing-room` for `typing_status` broadcast events.
- Ignores self-broadcasted events (`payload.userId === userId`).
- Maintains a map: `conversationTypingMap` (`Record<conversationId, UserTypingState[]>`).
- Runs a 1.5s interval to filter out stale indicators older than 4 seconds.
- Provides `sendTypingStatus(conversationId, status)` to broadcast status updates (`typing` | `recording` | `idle`).

---

### Step 3: Create Indicator UI Component (`typing-indicator.tsx`)

[typing-indicator.tsx](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/typing-indicator.tsx)

- Renders a glassmorphic floating bubble at the bottom of the active chat window.
- **For Text Typing**: Displays user initials/avatar, user name, and 3 bouncing dots (`animate-bounce` with staggered animation delays).
- **For Voice Recording**: Displays user initials/avatar, user name, animated red microphone icon (`animate-pulse`), and animated soundwave bars.

---

### Step 4: Integrate Triggers in `ChatWindow` (`chat-window.tsx`)

[chat-window.tsx](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-window.tsx)

- **Input Typing Trigger**:
  - On `input` change, broadcasts `typing` once every 1.5s (throttled).
  - Starts a 3s timer to automatically broadcast `idle` if user stops typing.
  - Clears timer and sends `idle` immediately upon message submission.
- **Voice Note Recording Trigger**:
  - `handleStartRecording`: Broadcasts `recording` immediately and starts a 1.5s interval to keep status alive.
  - `handleStopAndSendRecording` & `handleDiscardRecording`: Clears broadcast interval and sends `idle` immediately.
- **Header Subtitle Display**:
  - Under conversation name in header, displays animated text:
    - Text: `User A is typing...` (emerald green text + pulsing dot)
    - Audio: `User A is recording audio...` (red text + pulsing mic icon)
- **In-Stream Bubble Display**:
  - Renders `<TypingIndicator typingUsers={typingUsers} />` in the chat scroll area.

---

### Step 5: Render Subtitles in Conversation Sidebar (`chat-sidebar.tsx`)

[chat-sidebar.tsx](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-sidebar.tsx)

- Receives `conversationTypingMap` prop.
- In each conversation item, checks if another user is typing/recording in that specific conversation.
- Replaces last message preview text with real-time indicator:
  - **Direct Chat**: `typing...` or `recording audio...` with mic icon.
  - **Group Chat**: `John: typing...` or `John: recording audio...`.

---

### Step 6: Orchestrate in Main Layout (`chat-layout.tsx`)

[chat-layout.tsx](file:///e:/morrai/shadcn-admin-main/src/features/chattemplate/chat/components/chat-layout.tsx)

- Calls `useTypingBroadcast(currentUser.accountNo, currentUser.name)` at the layout level.
- Passes `conversationTypingMap` to `ChatSidebar`.
- Passes `activeTypingUsers` and `sendTypingStatus` handler to `ChatWindow`.

---

## 🎨 UI Display Modes Summary

| Location | Status: Text Typing | Status: Voice Recording |
|---|---|---|
| **Chat Header** | `User A is typing...` (Emerald) | 🎤 `User A is recording audio...` (Red) |
| **Chat Window Bottom** | Glassmorphic bubble with 3 bouncing dots | Glassmorphic bubble with animated soundwave |
| **Sidebar Chat List** | `typing...` / `Name: typing...` | 🎤 `recording audio...` / `Name: recording audio...` |

---

## 🧪 Verification & Testing Steps

1. Open two browser windows (User A and User B).
2. Start typing in User A's chat window:
   - Verify User B instantly sees `User A is typing...` in the header, chat bubble, and sidebar.
3. Pause typing for 3 seconds:
   - Verify typing indicator automatically disappears for User B.
4. Press and hold the Microphone icon on User A:
   - Verify User B instantly sees 🎤 `User A is recording audio...` with soundwave animation.
5. Release/send or slide to delete the voice note:
   - Verify recording indicator clears immediately.
