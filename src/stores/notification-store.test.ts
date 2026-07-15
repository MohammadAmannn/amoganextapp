import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useNotificationStore, DbNotification } from './notification-store'

let lastAction: 'select' | 'update' | 'delete' = 'select'

// Chainable mock builder
const mockOrder = vi.fn().mockImplementation(() => mockChain)
const mockEq = vi.fn().mockImplementation(() => mockChain)
const mockSelect = vi.fn().mockImplementation(() => { lastAction = 'select'; return mockChain })
const mockUpdate = vi.fn().mockImplementation(() => { lastAction = 'update'; return mockChain })
const mockDelete = vi.fn().mockImplementation(() => { lastAction = 'delete'; return mockChain })

const mockChain = {
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  order: mockOrder,
  then: (onfulfilled: any) => {
    const result = lastAction === 'select' 
      ? { data: mockNotifications, error: null } 
      : { error: null }
    return Promise.resolve(result).then(onfulfilled)
  }
}

const mockChannel = {
  on: vi.fn().mockImplementation(() => mockChannel),
  subscribe: vi.fn().mockImplementation(() => mockChannel),
  unsubscribe: vi.fn(),
}

const mockSupabase = {
  from: vi.fn().mockImplementation(() => mockChain),
  channel: vi.fn().mockImplementation(() => mockChannel),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

const mockNotifications: DbNotification[] = [
  {
    id: 'n-1',
    user_id: 'user-123',
    sender_id: 'sender-456',
    message_id: 'msg-789',
    message_text: 'Aman send you a msg click to see',
    read: false,
    created_at: '2026-07-15T12:00:00Z',
  },
  {
    id: 'n-2',
    user_id: 'user-123',
    sender_id: 'sender-789',
    message_id: 'msg-999',
    message_text: 'Krishna send you a msg click to see',
    read: true,
    created_at: '2026-07-15T11:00:00Z',
  },
]

describe('NotificationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    lastAction = 'select'
    // Clear Zustand store state
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
    })
  })

  it('starts with default initial state', () => {
    const state = useNotificationStore.getState()
    expect(state.notifications).toEqual([])
    expect(state.unreadCount).toBe(0)
    expect(state.isLoading).toBe(false)
  })

  it('fetches notifications and updates unread count correctly', async () => {
    const store = useNotificationStore.getState()
    await store.fetchNotifications('user-123')

    expect(mockSupabase.from).toHaveBeenCalledWith('notifications')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
    
    const updatedState = useNotificationStore.getState()
    expect(updatedState.notifications).toEqual(mockNotifications)
    expect(updatedState.unreadCount).toBe(1) // n-1 is unread, n-2 is read
  })

  it('marks a single notification as read correctly', async () => {
    const store = useNotificationStore.getState()
    await store.fetchNotifications('user-123')

    expect(useNotificationStore.getState().unreadCount).toBe(1)

    // Mark n-1 as read
    await store.markAsRead('n-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('notifications')
    expect(useNotificationStore.getState().notifications.find(n => n.id === 'n-1')?.read).toBe(true)
    expect(useNotificationStore.getState().unreadCount).toBe(0)
  })

  it('marks all notifications as read correctly', async () => {
    const store = useNotificationStore.getState()
    await store.fetchNotifications('user-123')

    expect(useNotificationStore.getState().unreadCount).toBe(1)

    // Mark all read
    await store.markAllAsRead('user-123')

    expect(useNotificationStore.getState().unreadCount).toBe(0)
    expect(useNotificationStore.getState().notifications.every(n => n.read)).toBe(true)
  })

  it('deletes a single notification correctly', async () => {
    const store = useNotificationStore.getState()
    await store.fetchNotifications('user-123')

    expect(useNotificationStore.getState().notifications.length).toBe(2)

    // Delete n-2
    await store.deleteNotification('n-2')

    expect(mockSupabase.from).toHaveBeenCalledWith('notifications')
    expect(useNotificationStore.getState().notifications.length).toBe(1)
    expect(useNotificationStore.getState().notifications[0].id).toBe('n-1')
  })
})
