import { createClient } from '../lib/supabase/client'
import { createMessage } from '../features/chattemplate/chat/repositories/message-repository'
import { DB_ALERTS_CONFIG, DBAlertAction } from '../lib/db-alerts/types/db-alert'

// Helper to format date like "15 Jul 2026 10:45 AM"
function formatAlertTime(date: Date): string {
  const day = date.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'AM' : 'PM'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`
}

/**
 * Returns the conversation ID of the DB Alerts group conversation.
 * Creates it if it doesn't already exist.
 */
export async function getOrCreateAlertConversation(): Promise<string | null> {
  const supabase = createClient()
  try {
    // 1. Look for existing group conversation named "DB Alerts"
    const { data: existing, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('name', DB_ALERTS_CONFIG.groupName)
      .eq('type', 'group')
      .maybeSingle()

    if (error) throw error
    if (existing) return existing.id

    // 2. Not found - create conversation
    const { data: newConvo, error: createError } = await supabase
      .from('conversations')
      .insert({
        type: 'group',
        name: DB_ALERTS_CONFIG.groupName,
        image: DB_ALERTS_CONFIG.groupImage || null,
      })
      .select('id')
      .single()

    if (createError) throw createError
    if (!newConvo) return null

    // 3. Add configured administrators as members
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('email', DB_ALERTS_CONFIG.adminEmails)

    if (profilesError) throw profilesError

    if (adminProfiles && adminProfiles.length > 0) {
      const membersToInsert = adminProfiles.map((p) => ({
        conversation_id: newConvo.id,
        user_id: p.id,
        role: 'member',
      }))

      const { error: insertError } = await supabase
        .from('conversation_members')
        .insert(membersToInsert)

      if (insertError) {
        console.error('[DB Alerts] Failed to insert initial admin members:', insertError)
      } else {
        console.log(`[DB Alerts] Created group with ${adminProfiles.length} configured admin members`)
      }
    }

    return newConvo.id
  } catch (err) {
    console.error('[DB Alerts] Error in getOrCreateAlertConversation:', err)
    return null
  }
}

const subscribedUsers = new Set<string>()

/**
 * Automatically subscribes a user to the DB Alerts conversation if their email matches
 * the admin emails configuration list.
 */
export async function autoSubscribeAdmin(userId: string, email: string): Promise<void> {
  if (subscribedUsers.has(userId)) return
  subscribedUsers.add(userId)

  const emailLower = email.trim().toLowerCase()
  const isAdmin = DB_ALERTS_CONFIG.adminEmails.some(
    (adminEmail) => adminEmail.toLowerCase() === emailLower
  )

  if (!isAdmin) return

  const supabase = createClient()
  try {
    const convoId = await getOrCreateAlertConversation()
    if (!convoId) return

    // Check if already a member
    const { data: existing, error: checkError } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', convoId)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) throw checkError

    if (!existing) {
      const { error: insertError } = await supabase
        .from('conversation_members')
        .insert({
          conversation_id: convoId,
          user_id: userId,
          role: 'member',
        })

      if (insertError) throw insertError
      console.log(`[DB Alerts] Auto-subscribed admin user: ${email} (${userId})`)
    }

    // Ensure there is at least one message to make the conversation visible in the sidebar list.
    // If the user has no message copy, insert the initialization system message copy.
    const { data: msgs, error: msgsError } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('conversation_id', convoId)
      .eq('owner_user_id', userId)
      .limit(1)

    if (!msgsError && (!msgs || msgs.length === 0)) {
      await createMessage({
        conversationId: convoId,
        senderId: userId,
        message: '🚨 DB Alerts Channel Initialized. Administrative events will be logged here.',
        messageType: 'system',
      })
      console.log(`[DB Alerts] Initialized message feed for user: ${userId}`)
    }
  } catch (err) {
    console.error('[DB Alerts] Failed to auto-subscribe admin user:', err)
  }
}

/**
 * Triggers a DB Alert message for contact operations.
 */
export async function triggerContactAlert(
  action: DBAlertAction,
  ownerId: string,
  contactUserId: string
): Promise<void> {
  const supabase = createClient()
  try {
    const convoId = await getOrCreateAlertConversation()
    if (!convoId) return

    // 1. Resolve owner display name
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', ownerId)
      .maybeSingle()

    const ownerName = ownerProfile?.name || ownerProfile?.email?.split('@')[0] || 'System'

    // 2. Resolve contact display name
    const { data: contactProfile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', contactUserId)
      .maybeSingle()

    const contactName = contactProfile?.name || contactProfile?.email?.split('@')[0] || 'System'

    // 3. Format message based on action
    const timeStr = formatAlertTime(new Date())
    let formattedMessage = ''

    if (action === 'create') {
      formattedMessage = `Contact Created\n🟢 Contact Added\nBy: ${ownerName}\nContact: ${contactName}\nTime: ${timeStr}`
    } else if (action === 'delete') {
      formattedMessage = `Contact Deleted\n🔴 Contact Deleted\nBy: ${ownerName}\nContact: ${contactName}`
    } else if (action === 'update') {
      formattedMessage = `Contact Updated\n🟡 Contact Updated\nBy: ${ownerName}\nContact: ${contactName}\nTime: ${timeStr}`
    }

    // 4. Send message copy to DB Alerts conversation
    await createMessage({
      conversationId: convoId,
      senderId: ownerId,
      message: formattedMessage,
      messageType: 'system',
    })
  } catch (err) {
    console.error('[DB Alerts] Failed to trigger contact alert:', err)
  }
}

/**
 * Triggers a DB Alert message for group operations.
 */
export async function triggerGroupAlert(
  action: DBAlertAction,
  actorId: string,
  groupName: string
): Promise<void> {
  const supabase = createClient()
  try {
    const convoId = await getOrCreateAlertConversation()
    if (!convoId) return

    // 1. Resolve actor display name
    let actorName = 'System'
    if (actorId) {
      const { data: actorProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', actorId)
        .maybeSingle()

      actorName = actorProfile?.name || actorProfile?.email?.split('@')[0] || 'System'
    }

    // 2. Format message based on action
    let formattedMessage = ''

    if (action === 'create') {
      formattedMessage = `Group Created\n🟢 Group Created\nBy: ${actorName}\nGroup: ${groupName}`
    } else if (action === 'delete') {
      formattedMessage = `Group Deleted\n🔴 Group Deleted\nBy: ${actorName}\nGroup: ${groupName}`
    } else if (action === 'update') {
      formattedMessage = `Group Updated\n🟡 Group Updated\nBy: ${actorName}\nGroup: ${groupName}`
    }

    // 3. Send message copy to DB Alerts conversation
    // Actor ID can fallback to any member of DB Alerts or active user if actorId is empty
    let senderId = actorId
    if (!senderId) {
      // Find a member of the conversation to act as sender (must satisfy RLS that sender is member)
      const { data: firstMember } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', convoId)
        .limit(1)
        .maybeSingle()

      senderId = firstMember?.user_id || ''
    }

    if (!senderId) {
      console.warn('[DB Alerts] Cannot send alert because no valid sender ID is available.')
      return
    }

    await createMessage({
      conversationId: convoId,
      senderId: senderId,
      message: formattedMessage,
      messageType: 'system',
    })
  } catch (err) {
    console.error('[DB Alerts] Failed to trigger group alert:', err)
  }
}
