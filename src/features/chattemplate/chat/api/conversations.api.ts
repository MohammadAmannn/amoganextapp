import { apiClient } from '../../shared/api/apiClient'
import { createQuery } from '../../shared/api/queryBuilder'
import { Conversation, Profile, Message } from '../types/chat.types'
import { createMessage } from './messages.api'

/**
 * Fetch all conversations for a specific user.
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const businessUserId = userId

    // 1. Get the list of conversation IDs the user belongs to
    const memberQuery = createQuery().select('conversation_id').eq('user_id', businessUserId)
    const memberOf = await apiClient.get<any[]>(`/rest/v1/conversation_members${memberQuery.toString()}`)
    
    if (!memberOf || memberOf.length === 0) return []
    const convoIds = memberOf.map((m: any) => m.conversation_id)

    // 2. Fetch conversations including their members and message copies for this user
    // We construct a specific nested resource selection using PostgREST syntax
    const convosQuery = createQuery()
      .select(`
        *,
        conversation_members (
          role,
          joined_at,
          user_id,
          unread_count,
          profiles (
            id,
            name,
            email,
            avatar,
            last_seen
          )
        ),
        chat_messages (
          id,
          conversation_id,
          sender_user_id,
          message,
          message_type,
          file_url,
          file_name,
          file_size,
          mime_type,
          duration,
          created_at,
          deleted,
          deleted_by,
          message_status
        )
      `)
      .in('id', convoIds)
      .eq('chat_messages.owner_user_id', businessUserId)

    const convos = await apiClient.get<any[]>(`/rest/v1/conversations${convosQuery.toString()}`)
    if (!convos) return []

    const mapped = convos.map((c: any) => {
      const members: Profile[] = (c.conversation_members || [])
        .map((cm: any) => {
          if (!cm.profiles) return null
          return {
            id: cm.profiles.id,
            name: cm.profiles.name,
            email: cm.profiles.email,
            avatar_url: cm.profiles.avatar || undefined,
            last_seen: cm.profiles.last_seen || undefined,
          }
        })
        .filter(Boolean)

      // Sort message copies and filter out messages deleted for me
      const messageCopies = [...(c.chat_messages || [])]
        .filter((m: any) => !m.deleted || m.deleted_by !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      const lastMessage = messageCopies[0] || undefined

      let displayName = c.name || ''
      let displayImage = c.image || ''

      if (c.type === 'direct') {
        const otherMember = members.find(m => m.id !== businessUserId)
        if (otherMember) {
          displayName = otherMember.name
          displayImage = otherMember.avatar_url || ''
        } else {
          displayName = 'Chat Note (You)'
          const selfMember = members.find(m => m.id === businessUserId)
          displayImage = selfMember?.avatar_url || ''
        }
      }

      // Get unread count for current user
      const selfMemberRecord = (c.conversation_members || []).find((cm: any) => cm.user_id === businessUserId)
      const unreadCount = selfMemberRecord?.unread_count || 0

      return {
        id: c.id,
        type: c.type,
        name: displayName,
        image: displayImage,
        created_by: c.created_by || undefined,
        created_at: c.created_at,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          conversation_id: lastMessage.conversation_id,
          sender_user_id: lastMessage.sender_user_id || 'system',
          message: lastMessage.message || '',
          message_type: lastMessage.message_type,
          file_url: lastMessage.file_url || undefined,
          file_name: lastMessage.file_name || undefined,
          file_size: lastMessage.file_size || undefined,
          mime_type: lastMessage.mime_type || undefined,
          duration: lastMessage.duration || undefined,
          created_at: lastMessage.created_at,
          deleted: !!lastMessage.deleted,
        } as Message : undefined,
        unreadCount,
        members,
      }
    })

    // Deduplicate direct conversations
    const seenDirectRecipients = new Set<string>()
    const deduplicated: Conversation[] = []

    // Sort by last message time DESC first to keep the most active direct conversation
    const sorted = [...mapped].sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : new Date(a.created_at).getTime()
      const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : new Date(b.created_at).getTime()
      return timeB - timeA
    })

    for (const convo of sorted) {
      if (convo.type === 'direct') {
        const otherMember = convo.members.find((m: any) => m.id !== businessUserId)
        const recipientId = otherMember ? otherMember.id : businessUserId
        
        if (seenDirectRecipients.has(recipientId)) {
          continue
        }
        seenDirectRecipients.add(recipientId)
      }
      deduplicated.push(convo)
    }

    return deduplicated
  } catch (err) {
    console.error('[Conversations API] Failed to get user conversations:', err)
    return []
  }
}

/**
 * Gets an existing direct conversation or creates a new one.
 */
export async function getOrCreateDirectConversation(userAId: string, userBId: string): Promise<string | null> {
  try {
    const businessUserAId = userAId
    const businessUserBId = userBId

    // 1. Fetch direct conversations userA belongs to
    const queryA = createQuery()
      .select('conversation_id, conversations!inner(*)')
      .eq('user_id', businessUserAId)
      .eq('conversations.type', 'direct')

    const membersA = await apiClient.get<any[]>(`/rest/v1/conversation_members${queryA.toString()}`)

    if (membersA && membersA.length > 0) {
      const convoIds = membersA.map((m: any) => m.conversation_id)

      // 2. See if userB belongs to any of those direct conversations
      const queryB = createQuery()
        .select('conversation_id')
        .in('conversation_id', convoIds)
        .eq('user_id', businessUserBId)

      const membersB = await apiClient.get<any[]>(`/rest/v1/conversation_members${queryB.toString()}`)

      if (membersB && membersB.length > 0) {
        return membersB[0].conversation_id
      }
    }

    // 3. Create a new direct conversation if none exists
    const insertedConvos = await apiClient.post<any[]>('/rest/v1/conversations', {
      type: 'direct',
      created_by: businessUserAId,
    })
    const newConvo = insertedConvos[0] || null

    if (!newConvo) {
      throw new Error('Failed to create conversation.')
    }

    // 4. Add both members
    const membersToInsert = [
      { conversation_id: newConvo.id, user_id: businessUserAId },
    ]
    if (businessUserAId !== businessUserBId) {
      membersToInsert.push({ conversation_id: newConvo.id, user_id: businessUserBId })
    }

    await apiClient.post('/rest/v1/conversation_members', membersToInsert)

    return newConvo.id
  } catch (err) {
    console.error('[Conversations API] Failed to get or create direct conversation:', err)
    return null
  }
}

/**
 * Creates a new group conversation and initializes system messages.
 */
export async function createGroupConversation(
  groupName: string,
  groupImage: string | null,
  memberIds: string[],
  creatorId: string,
  type: 'group' | 'channel_group' | 'message_group' = 'group'
): Promise<Conversation | null> {
  try {
    const businessCreatorId = creatorId
    const resolvedMemberIds = memberIds

    // 1. Insert Group Conversation
    const insertedConvos = await apiClient.post<any[]>('/rest/v1/conversations', {
      type,
      name: groupName,
      image: groupImage,
      created_by: businessCreatorId,
    })
    const newConvo = insertedConvos[0] || null

    if (!newConvo) {
      throw new Error('Failed to create group conversation.')
    }

    // 2. Add Members to Group
    const allMemberIds = Array.from(new Set([...resolvedMemberIds, businessCreatorId]))
    const membersToInsert = allMemberIds.map(userId => ({
      conversation_id: newConvo.id,
      user_id: userId,
    }))

    await apiClient.post('/rest/v1/conversation_members', membersToInsert)

    // 3. Insert initial system messages
    try {
      const creatorQuery = createQuery().select('name, email').eq('id', businessCreatorId).limit(1)
      const creatorProfiles = await apiClient.get<any[]>(`/rest/v1/profiles${creatorQuery.toString()}`)
      const creatorProfile = creatorProfiles[0] || null
      const creatorName = creatorProfile?.name || creatorProfile?.email?.split('@')[0] || 'Someone'

      // 3.1. Group Creation pill
      await createMessage({
        conversationId: newConvo.id,
        senderId: businessCreatorId,
        message: `${creatorName} created group "${groupName}"`,
        messageType: 'system',
        systemMetadata: {
          type: 'group_created',
          groupName,
          creatorName,
        }
      })

      // 3.2. Member Addition pill
      await createMessage({
        conversationId: newConvo.id,
        senderId: businessCreatorId,
        message: `${creatorName} added you`,
        messageType: 'system',
        systemMetadata: {
          type: 'members_added',
          creatorName,
        }
      })
    } catch (msgErr) {
      console.error('[Conversations API] Failed to create initial group system messages:', msgErr)
    }

    return {
      id: newConvo.id,
      type: newConvo.type,
      name: newConvo.name,
      image: newConvo.image || undefined,
      created_by: newConvo.created_by,
      created_at: newConvo.created_at,
      members: [],
    }
  } catch (err) {
    console.error('[Conversations API] Failed to create group conversation:', err)
    return null
  }
}

/**
 * Resets unread message counter for a member of a conversation.
 */
export async function clearConversationUnreadCount(conversationId: string, userId: string): Promise<boolean> {
  try {
    const query = createQuery().eq('conversation_id', conversationId).eq('user_id', userId)
    await apiClient.patch(`/rest/v1/conversation_members${query.toString()}`, { unread_count: 0 })
    return true
  } catch (err) {
    console.error('[Conversations API] Failed to clear unread count:', err)
    return false
  }
}

/**
 * Removes a member from a group conversation.
 */
export async function removeGroupMember(conversationId: string, memberId: string): Promise<boolean> {
  try {
    const query = createQuery()
      .eq('conversation_id', conversationId)
      .eq('user_id', memberId)

    await apiClient.delete(`/rest/v1/conversation_members${query.toString()}`)
    return true
  } catch (err) {
    console.error('[Conversations API] Failed to remove group member:', err)
    return false
  }
}

/**
 * Deletes a conversation for a specific user (removes membership and local message copies).
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<boolean> {
  try {
    // 1. Remove user from conversation_members
    const memberQuery = createQuery()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)

    await apiClient.delete(`/rest/v1/conversation_members${memberQuery.toString()}`)

    // 2. Delete message copies owned by this user for this conversation
    const msgQuery = createQuery()
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)

    await apiClient.delete(`/rest/v1/chat_messages${msgQuery.toString()}`)
    return true
  } catch (err) {
    console.error('[Conversations API] Failed to delete conversation:', err)
    return false
  }
}

