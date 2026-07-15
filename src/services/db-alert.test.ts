import { describe, expect, it, vi, beforeEach } from 'vitest'
import { triggerContactAlert, triggerGroupAlert, getOrCreateAlertConversation } from './db-alert.service'
import { createMessage } from '../features/chattemplate/chat/repositories/message-repository'

// Mock createMessage
vi.mock('../features/chattemplate/chat/repositories/message-repository', () => ({
  createMessage: vi.fn().mockResolvedValue({ id: 'mock-msg-id' }),
}))

// Chainable mock builder
const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()
const mockThen = vi.fn()

const mockChain = {
  select: vi.fn().mockImplementation(() => mockChain),
  insert: vi.fn().mockImplementation(() => mockChain),
  update: vi.fn().mockImplementation(() => mockChain),
  delete: vi.fn().mockImplementation(() => mockChain),
  eq: vi.fn().mockImplementation(() => mockChain),
  in: vi.fn().mockImplementation(() => mockChain),
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  then: mockThen,
}

const mockSupabase = {
  from: vi.fn().mockImplementation(() => mockChain),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } } }),
  },
}

vi.mock('../lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

describe('DBAlertService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockReset()
    mockMaybeSingle.mockReset()
    mockThen.mockReset()

    // Setup standard defaults
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockThen.mockImplementation((onfulfilled) => {
      return Promise.resolve({ data: null, error: null }).then(onfulfilled)
    })
  })

  describe('getOrCreateAlertConversation', () => {
    it('returns existing conversation ID if found', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'existing-alert-group-id' }, error: null })

      const id = await getOrCreateAlertConversation()

      expect(id).toBe('existing-alert-group-id')
      expect(mockSupabase.from).toHaveBeenCalledWith('conversations')
    })

    it('creates new conversation and adds members if not found', async () => {
      // 1. Existing check returns null
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
      // 2. Insert conversation returns new convo
      mockSingle.mockResolvedValueOnce({ data: { id: 'new-alert-group-id' }, error: null })
      // 3. Resolve admin profiles returns IDs via .then()
      mockThen.mockImplementationOnce((onfulfilled) => {
        return Promise.resolve({
          data: [{ id: 'admin-1', email: 'admin1@example.com' }, { id: 'admin-2', email: 'admin2@example.com' }],
          error: null,
        }).then(onfulfilled)
      })

      const id = await getOrCreateAlertConversation()

      expect(id).toBe('new-alert-group-id')
      expect(mockSupabase.from).toHaveBeenCalledWith('conversations')
      expect(mockSupabase.from).toHaveBeenCalledWith('conversation_members')
    })
  })

  describe('triggerContactAlert', () => {
    it('creates a system message for Contact Created event', async () => {
      // 1. Conversation lookup
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'alert-convo-id' }, error: null })
      // 2. Owner name resolution
      mockMaybeSingle.mockResolvedValueOnce({ data: { name: 'Rahul', email: 'rahul@example.com' }, error: null })
      // 3. Contact name resolution
      mockMaybeSingle.mockResolvedValueOnce({ data: { name: 'Aman', email: 'aman@example.com' }, error: null })

      await triggerContactAlert('create', 'owner-id', 'contact-id')

      expect(createMessage).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(createMessage).mock.calls[0][0]
      expect(callArgs.conversationId).toBe('alert-convo-id')
      expect(callArgs.messageType).toBe('system')
      expect(callArgs.message).toContain('Contact Created')
      expect(callArgs.message).toContain('🟢 Contact Added')
      expect(callArgs.message).toContain('By: Rahul')
      expect(callArgs.message).toContain('Contact: Aman')
      expect(callArgs.message).toContain('Time:')
    })

    it('creates a system message for Contact Deleted event', async () => {
      // 1. Conversation lookup
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'alert-convo-id' }, error: null })
      // 2. Owner name resolution
      mockMaybeSingle.mockResolvedValueOnce({ data: { name: 'Rahul', email: 'rahul@example.com' }, error: null })
      // 3. Contact name resolution
      mockMaybeSingle.mockResolvedValueOnce({ data: { name: 'Aman', email: 'aman@example.com' }, error: null })

      await triggerContactAlert('delete', 'owner-id', 'contact-id')

      expect(createMessage).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(createMessage).mock.calls[0][0]
      expect(callArgs.message).toContain('Contact Deleted')
      expect(callArgs.message).toContain('🔴 Contact Deleted')
      expect(callArgs.message).toContain('By: Rahul')
      expect(callArgs.message).toContain('Contact: Aman')
      expect(callArgs.message).not.toContain('Time:')
    })
  })

  describe('triggerGroupAlert', () => {
    it('creates a system message for Group Created event', async () => {
      // 1. Conversation lookup
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'alert-convo-id' }, error: null })
      // 2. Actor name resolution
      mockMaybeSingle.mockResolvedValueOnce({ data: { name: 'Krishna', email: 'krishna@example.com' }, error: null })

      await triggerGroupAlert('create', 'actor-id', 'Developers')

      expect(createMessage).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(createMessage).mock.calls[0][0]
      expect(callArgs.message).toContain('Group Created')
      expect(callArgs.message).toContain('🟢 Group Created')
      expect(callArgs.message).toContain('By: Krishna')
      expect(callArgs.message).toContain('Group: Developers')
    })

    it('creates a system message for Group Deleted event', async () => {
      // 1. Conversation lookup
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'alert-convo-id' }, error: null })
      // 2. Actor name resolution
      mockMaybeSingle.mockResolvedValueOnce({ data: { name: 'Krishna', email: 'krishna@example.com' }, error: null })

      await triggerGroupAlert('delete', 'actor-id', 'Developers')

      expect(createMessage).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(createMessage).mock.calls[0][0]
      expect(callArgs.message).toContain('Group Deleted')
      expect(callArgs.message).toContain('🔴 Group Deleted')
      expect(callArgs.message).toContain('By: Krishna')
      expect(callArgs.message).toContain('Group: Developers')
    })
  })
})
