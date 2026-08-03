import { isCapacitor } from '@/lib/platform'
import { updateProfile } from '@/features/chattemplate/chat/repositories/profile-repository'

let isInitialized = false
let cachedToken: string | null = null
let currentUserId: string | null = null

/**
 * Prompts user for all required mobile permissions (Push Notifications, Location, Camera, Storage/Files)
 * seamlessly when the app opens, preventing manual permission settings requirement in Android App Info.
 */
export async function requestNativeAppPermissions() {
  if (!isCapacitor()) return

  try {
    // 1. Push Notifications permission (Android 13+)
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const pushStatus = await PushNotifications.checkPermissions().catch(() => null)
    if (!pushStatus || pushStatus.receive === 'prompt' || pushStatus.receive === 'prompt-with-rationale') {
      await PushNotifications.requestPermissions().catch((err) => {
        console.warn('[Permissions] Push Notification permission request:', err)
      })
    }

    // 2. Location / Geolocation permission (Fine & Coarse GPS)
    const { Geolocation } = await import('@capacitor/geolocation')
    const locationStatus = await Geolocation.checkPermissions().catch(() => null)
    if (!locationStatus || locationStatus.location === 'prompt' || locationStatus.location === 'prompt-with-rationale') {
      await Geolocation.requestPermissions().catch((err) => {
        console.warn('[Permissions] Geolocation permission request:', err)
      })
    }

    // 3. Camera & Photos permission
    const { Camera } = await import('@capacitor/camera')
    const cameraStatus = await Camera.checkPermissions().catch(() => null)
    if (!cameraStatus || cameraStatus.camera === 'prompt' || cameraStatus.photos === 'prompt') {
      await Camera.requestPermissions({ permissions: ['camera', 'photos'] }).catch((err) => {
        console.warn('[Permissions] Camera permission request:', err)
      })
    }

    // 4. Filesystem / Storage permission
    const { Filesystem } = await import('@capacitor/filesystem')
    const fsStatus = await Filesystem.checkPermissions().catch(() => null)
    if (!fsStatus || fsStatus.publicStorage === 'prompt') {
      await Filesystem.requestPermissions().catch((err) => {
        console.warn('[Permissions] Filesystem permission request:', err)
      })
    }

    console.log('[Permissions] Native app permissions (Push, Location, Camera, Storage) requested successfully.')
  } catch (err) {
    console.error('[Permissions] Unexpected error requesting native permissions:', err)
  }
}

/**
 * Initializes Firebase Push Notifications via @capacitor/push-notifications on native mobile devices.
 * Registers FCM device token with Supabase profile table, enables status bar Quick Reply, and handles background tap navigation silently without in-app toasts.
 */
export async function initPushNotifications(userId: string) {
  if (!isCapacitor()) {
    console.log('[PushNotificationService] Skipped: Not running in native Capacitor environment.')
    return
  }

  if (userId) {
    currentUserId = userId
  }

  // Sync token to profile if cached token exists and userId is active
  if (currentUserId && cachedToken) {
    updateProfile(currentUserId, { fcm_token: cachedToken }).then((success) => {
      if (success) {
        console.log('[PushNotificationService] Cached FCM token synced to Supabase profile:', currentUserId)
      }
    })
  }

  // Request native permissions on app open asynchronously
  requestNativeAppPermissions().catch(() => {})

  if (isInitialized) {
    console.log('[PushNotificationService] Push Notification listeners already initialized.')
    return
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // 1. Request Push Notification permissions (Handles POST_NOTIFICATIONS on Android 13+)
    let permStatus = await PushNotifications.checkPermissions()
    if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[PushNotificationService] Push notification permissions were denied by user.')
      return
    }

    // 2. Attach listeners FIRST so token registration and actions are captured reliably!

    // Listener A: FCM Device Token Registration / Refresh
    PushNotifications.addListener('registration', async (token) => {
      console.log('[PushNotificationService] Device registered with FCM token:', token.value)
      if (token.value) {
        cachedToken = token.value
        if (currentUserId) {
          const success = await updateProfile(currentUserId, { fcm_token: token.value })
          if (success) {
            console.log('[PushNotificationService] FCM token saved to Supabase profiles database for user:', currentUserId)
          }
        }
      }
    })

    // Listener B: Registration Error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[PushNotificationService] FCM Registration Error:', error)
    })

    // Listener C: Push Notification Received (App in Foreground - Silent, NO TOAST)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[PushNotificationService] Foreground Push Notification Received (Silent):', notification.title)
    })

    // Listener D: Notification Action Performed (Quick Reply or Tap Notification)
    PushNotifications.addListener('pushNotificationActionPerformed', async (notificationAction) => {
      console.log('[PushNotificationService] Push Notification Action Performed:', notificationAction)

      const data = notificationAction.notification.data
      const actionId = notificationAction.actionId
      const inputValue = notificationAction.inputValue

      // Case 1: Direct Quick Reply typed directly from Android Notification Bar
      if (actionId === 'reply' && inputValue && inputValue.trim()) {
        const convoId = data?.conversationId
        const senderId = currentUserId
        console.log(`[PushNotificationService] Quick reply submitted for convo ${convoId}: "${inputValue}"`)

        if (convoId && senderId) {
          try {
            await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                conversationId: convoId,
                senderId: senderId,
                message: inputValue.trim(),
                messageType: 'text',
              }),
            })
            console.log('[PushNotificationService] Quick reply sent successfully!')
          } catch (err) {
            console.error('[PushNotificationService] Failed to post quick reply:', err)
          }
        }
        return
      }

      // Case 2: Tap Notification Body -> Navigate to Conversation
      if (typeof window !== 'undefined') {
        const convoId = data?.conversationId
        if (convoId) {
          window.location.href = `/chattemplate?conversationId=${convoId}`
        } else {
          window.location.href = '/message'
        }
      }
    })

    // 3. Register Action Types for Android Notification Quick Reply
    PushNotifications.registerActionTypes({
      types: [
        {
          id: 'CHAT_MESSAGE',
          actions: [
            {
              id: 'reply',
              title: 'Reply',
              input: true,
              placeholder: 'Type a reply...',
            },
          ],
        },
      ],
    }).catch((err) => console.warn('[PushNotificationService] registerActionTypes warning:', err))

    // 4. Register device with FCM
    await PushNotifications.register()

    isInitialized = true
    console.log('[PushNotificationService] Firebase Push Notification listeners & Quick Reply attached successfully.')
  } catch (err) {
    console.error('[PushNotificationService] Failed to initialize push notifications:', err)
  }
}
