import { getApps, getApp, initializeApp, cert, type App } from 'firebase-admin/app'
import { getMessaging, type Messaging } from 'firebase-admin/messaging'
import * as fs from 'fs'
import * as path from 'path'

let adminApp: App | null = null
let messagingInstance: Messaging | null = null

/**
 * Initializes Firebase Admin SDK singleton instance using Service Account credentials.
 * Supports loading from environment variable JSON string (FIREBASE_SERVICE_ACCOUNT_KEY)
 * or relative file path (FIREBASE_SERVICE_ACCOUNT_PATH).
 */
export function getFirebaseAdminApp(): App | null {
  if (adminApp) {
    return adminApp
  }

  if (getApps().length > 0) {
    adminApp = getApp()
    return adminApp
  }

  try {
    let serviceAccount: any = null

    // 1. Try loading from environment variable JSON string
    const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    if (envKey) {
      try {
        serviceAccount = typeof envKey === 'string' ? JSON.parse(envKey) : envKey
      } catch (e) {
        console.warn('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string:', e)
      }
    }

    // 2. Fallback: Load from service account JSON file on root
    if (!serviceAccount) {
      const fileName = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'amogaapp-56698-firebase-adminsdk-fbsvc-316c575199.json'
      const filePath = path.isAbsolute(fileName)
        ? fileName
        : path.join(/*turbopackIgnore: true*/ process.cwd(), fileName)

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        serviceAccount = JSON.parse(fileContent)
      } else {
        console.warn(`[FirebaseAdmin] Service account file not found at path: ${filePath}`)
      }
    }

    if (!serviceAccount) {
      console.warn('[FirebaseAdmin] Firebase Service Account credentials not provided.')
      return null
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'amogaapp-56698',
    })

    console.log(`[FirebaseAdmin] Successfully initialized Firebase Admin SDK for project: ${serviceAccount.project_id}`)
    return adminApp
  } catch (error) {
    console.error('[FirebaseAdmin] Error initializing Firebase Admin SDK:', error)
    return null
  }
}

/**
 * Returns Firebase Admin Messaging instance for FCM HTTP v1 notifications.
 */
export function getFirebaseAdminMessaging(): Messaging | null {
  if (messagingInstance) {
    return messagingInstance
  }

  const app = getFirebaseAdminApp()
  if (!app) {
    return null
  }

  try {
    messagingInstance = getMessaging(app)
    return messagingInstance
  } catch (error) {
    console.error('[FirebaseAdmin] Failed to get Firebase Messaging instance:', error)
    return null
  }
}
