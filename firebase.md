# Firebase Cloud Messaging (FCM) HTTP v1 Push Notifications Guide

This document explains the implementation of **WhatsApp & Telegram style background push notifications** using **FCM HTTP v1 API**, **Firebase Admin SDK (`firebase-admin`)**, and Service Account credentials for Capacitor Android apps.

---

## 📱 Architecture Overview

When User A sends a chat message to User B:
1. **Frontend / API**: Message is saved in Supabase (`chat_messages` table).
2. **Server Push Trigger**: An asynchronous request is sent to `POST /api/notifications/push`.
3. **Recipient FCM Token Resolution**: The server queries Supabase `public.profiles` for recipient User B's device `fcm_token` (excluding the sender).
4. **FCM HTTP v1 Delivery (`firebase-admin`)**:
   - The server initializes `firebase-admin` using Service Account credentials (`amogaapp-56698-firebase-adminsdk-fbsvc-316c575199.json` / `FIREBASE_SERVICE_ACCOUNT_KEY`).
   - Uses `messaging().send()` (FCM HTTP v1 API) to dispatch push payloads with `clickAction: 'CHAT_MESSAGE'`.
5. **Native Mobile Features**:
   - **No In-App Chat Toast**: In-app toast popups during active chatting have been removed. Messages update smoothly via realtime listeners.
   - **On-Open App Permissions**: Prompts for Camera, Media/Files, Location, and Push Notification runtime permissions when opening the app.
   - **Notification Direct Quick Reply**: Android status bar notification includes an interactive **Reply** input box. Users can type and send replies directly from the status bar notification without opening the app!
   - **App Closed / Background Tap**: Tapping the notification body opens the app directly to `conversationId`.
6. **Automatic Invalid Token Cleanup**:
   - If FCM returns `messaging/invalid-registration-token` or `messaging/registration-token-not-registered`, the server automatically purges the expired `fcm_token` from `public.profiles` (`fcm_token = null`).

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  User A sends   │ ────> │ Message saved   │ ────> │ Firebase Admin  │ ────> │  FCM HTTP v1     │
│  Chat Message   │       │ in Supabase DB  │       │ SDK (ServiceAcc)│       │  messaging.send()│
└─────────────────┘       └─────────────────┘       └─────────────────┘       └────────┬─────────┘
                                                                                       │
                                                                                       ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│ Direct Reply or │ <─── │ User Replies or  │ <─── │ Android Status  │ <─── │ Device Receives  │
│ Open Chat Room  │       │ Taps Notification│       │ Bar Notification│       │ FCM Push Payload │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └──────────────────┘
```

---

## 🛠️ Files & Configuration

| File | Role |
| :--- | :--- |
| **`src/lib/firebase-admin.ts`** | Firebase Admin SDK singleton initializer using Service Account credentials. |
| **`app/api/notifications/push/route.ts`** | Next.js API route handling FCM HTTP v1 push dispatches, `CHAT_MESSAGE` click action, and automatic invalid-token cleanup. |
| **`src/services/push-notification.service.ts`** | Mobile Capacitor service handling permission prompts (Camera, Storage, Location, Push), token registration, direct quick-reply actions, and silent foreground events (no in-chat toasts). |
| **`amogaapp-56698-firebase-adminsdk-fbsvc-316c575199.json`** | Firebase Service Account JSON file (ignored in `.gitignore`). |
| **`.env.local`** | Environment configuration containing `FIREBASE_PROJECT_ID` & `FIREBASE_SERVICE_ACCOUNT_PATH`. |
| **`android/app/google-services.json`** | Android native client config for package `com.aman.amoganextapp`. |
