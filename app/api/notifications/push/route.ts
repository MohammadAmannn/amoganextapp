import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { getFirebaseAdminMessaging } from '@/lib/firebase-admin'

/**
 * Server-side REST API handler to dispatch Firebase Cloud Messaging (FCM) HTTP v1 Push Notifications
 * using Firebase Admin SDK with Service Account credentials.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientId, senderId, conversationId, message, messageType, fileName } = body

    if (!senderId || (!recipientId && !conversationId)) {
      return NextResponse.json(
        { error: 'senderId and recipientId (or conversationId) are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 1. Fetch sender's profile details
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', senderId)
      .maybeSingle()

    const senderName = senderProfile?.name || 'New Message'

    // 2. Resolve recipient profiles and FCM tokens (excluding sender)
    interface TargetRecipient {
      userId: string
      fcmToken: string
    }

    const targets: TargetRecipient[] = []

    if (recipientId) {
      // Direct message: Never notify sender if recipientId equals senderId
      if (recipientId !== senderId) {
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('id, fcm_token')
          .eq('id', recipientId)
          .maybeSingle()

        if (recipientProfile?.fcm_token) {
          targets.push({
            userId: recipientProfile.id,
            fcmToken: recipientProfile.fcm_token,
          })
        }
      }
    }

    if (conversationId) {
      // Fetch all member user IDs in this conversation except sender
      const { data: members } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', senderId)

      if (members && members.length > 0) {
        const recipientUserIds = members.map((m: any) => m.user_id)
        
        // Fetch FCM tokens for these members
        const { data: recipientProfiles } = await supabase
          .from('profiles')
          .select('id, fcm_token')
          .in('id', recipientUserIds)

        if (recipientProfiles) {
          for (const profile of recipientProfiles) {
            if (profile.fcm_token && !targets.some((t) => t.userId === profile.id)) {
              targets.push({
                userId: profile.id,
                fcmToken: profile.fcm_token,
              })
            }
          }
        }
      }
    }

    // 3. Return success if no FCM tokens exist
    if (targets.length === 0) {
      console.log(`[FCM Push] No active FCM token found for recipient(s). Sender: ${senderId}, Convo: ${conversationId || recipientId}`)
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'No active FCM token exists for recipient(s). Push notification skipped.',
      })
    }

    // 4. Format WhatsApp/Telegram-style message preview
    let notificationBody = message || ''
    if (messageType === 'image') {
      notificationBody = '📷 Photo'
    } else if (messageType === 'video') {
      notificationBody = '🎥 Video'
    } else if (messageType === 'audio') {
      notificationBody = '🎤 Voice Note'
    } else if (messageType === 'document') {
      notificationBody = `📄 Document: ${fileName || 'Attachment'}`
    } else if (messageType === 'location') {
      notificationBody = '📍 Shared location'
    }

    // 5. Get Firebase Admin Messaging instance (FCM HTTP v1)
    const messaging = getFirebaseAdminMessaging()

    if (!messaging) {
      console.warn('[FCM Push] Firebase Admin SDK is not initialized. Check service account credentials.')
      return NextResponse.json({
        success: true,
        sentCount: 0,
        warning: 'Firebase Admin SDK not initialized. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is configured.',
      })
    }

    // 6. Send push notification using Firebase Admin SDK messaging().send()
    let sentCount = 0
    const errors: string[] = []

    for (const target of targets) {
      const fcmMessage = {
        token: target.fcmToken,
        notification: {
          title: senderName,
          body: notificationBody,
        },
        data: {
          conversationId: String(conversationId || ''),
          senderId: String(senderId || ''),
          messageType: String(messageType || 'text'),
          type: 'chat_message',
        },
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'chat_messages',
            priority: 'high' as const,
          },
        },
      }

      try {
        const responseMessageId = await messaging.send(fcmMessage)
        console.log(`[FCM Push] Successfully sent HTTP v1 push to user ${target.userId}. Message ID: ${responseMessageId}`)
        sentCount++
      } catch (fcmError: any) {
        const errorCode = fcmError.code || ''
        const errorMessage = fcmError.message || String(fcmError)
        console.error(`[FCM Push] Error sending push to user ${target.userId}:`, errorCode, errorMessage)
        errors.push(`${target.userId}: ${errorMessage}`)

        // 7. Error handling: Remove invalid or expired tokens from database
        const isTokenInvalid =
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered' ||
          errorMessage.includes('Requested entity was not found') ||
          errorMessage.includes('not a valid FCM registration token') ||
          errorMessage.includes('registration-token-not-registered')

        if (isTokenInvalid) {
          console.warn(`[FCM Push] Invalid/Expired token detected for user ${target.userId}. Purging token from database...`)
          try {
            await supabase
              .from('profiles')
              .update({ fcm_token: null })
              .eq('id', target.userId)
            console.log(`[FCM Push] Successfully purged invalid token for user ${target.userId}`)
          } catch (dbErr) {
            console.error(`[FCM Push] Failed to purge invalid token for user ${target.userId}:`, dbErr)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalTargets: targets.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('[FCM Push] Unexpected error in /api/notifications/push:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
