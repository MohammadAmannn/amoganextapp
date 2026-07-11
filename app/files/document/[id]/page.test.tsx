import { describe, expect, it, vi, beforeEach } from 'vitest'
import SecureDocumentPage from './page'
import { createClient } from '@/lib/server'
import { getSharedFileMetadata, generateSignedUrl } from '@/services/file.service'

vi.mock('@/lib/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/services/file.service', () => ({
  getSharedFileMetadata: vi.fn(),
  generateSignedUrl: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirected to: ${url}`)
  }),
}))

describe('SecureDocumentPage Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects to sign-in if the user is unauthenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const params = Promise.resolve({ id: 'file-123' })
    await expect(SecureDocumentPage({ params })).rejects.toThrow('Redirected to: /sign-in?redirect=%2Ffiles%2Fdocument%2Ffile-123')
  })

  it('renders SecureDocumentClientPage successfully for authenticated authorized users', async () => {
    const mockUser = { id: 'user-123', email: 'user@example.com', user_metadata: { name: 'Aman' } }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }),
        }),
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const mockMetadata = {
      success: true,
      data: {
        id: 'file-123',
        bucket: 'chat-files',
        storagePath: 'path/to/file.pdf',
        fileName: 'file.pdf',
        mimeType: 'application/pdf',
        conversationId: 'convo-123',
        ownerId: 'user-123',
        createdAt: '2026-07-09T00:00:00Z',
      },
    }
    vi.mocked(getSharedFileMetadata).mockResolvedValue(mockMetadata as any)
    vi.mocked(generateSignedUrl).mockResolvedValue('https://example.com/signed-url')

    const params = Promise.resolve({ id: 'file-123' })
    const result = await SecureDocumentPage({ params })

    expect(result).toBeDefined()
    expect(result.props.fileName).toBe('file.pdf')
    expect(result.props.fileUrl).toBe('https://example.com/signed-url')
  })

  it('automatically recreates user profile if missing and then renders page', async () => {
    const mockUser = { id: 'user-123', email: 'user@example.com', user_metadata: { name: 'Aman' } }
    
    // Mock profiles check returning null (profile missing) and insert succeeding
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: mockInsert,
          }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const mockMetadata = {
      success: true,
      data: {
        id: 'file-123',
        bucket: 'chat-files',
        storagePath: 'path/to/file.pdf',
        fileName: 'file.pdf',
        mimeType: 'application/pdf',
        conversationId: 'convo-123',
        ownerId: 'user-123',
        createdAt: '2026-07-09T00:00:00Z',
      },
    }
    vi.mocked(getSharedFileMetadata).mockResolvedValue(mockMetadata as any)
    vi.mocked(generateSignedUrl).mockResolvedValue('https://example.com/signed-url')

    const params = Promise.resolve({ id: 'file-123' })
    const result = await SecureDocumentPage({ params })

    // Check that profile was inserted on demand
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'user-123',
      name: 'Aman',
      email: 'user@example.com',
      avatar: null,
    })
    expect(result).toBeDefined()
    expect(result.props.fileName).toBe('file.pdf')
  })

  it('renders Access Denied error for unauthorized users', async () => {
    const mockUser = { id: 'user-456', email: 'unauthorized@example.com' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-456' }, error: null }),
          }),
        }),
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const mockMetadata = {
      success: false,
      error: 'You do not have permission to view this file.',
    }
    vi.mocked(getSharedFileMetadata).mockResolvedValue(mockMetadata as any)

    const params = Promise.resolve({ id: 'file-123' })
    const result = await SecureDocumentPage({ params })

    expect(result).toBeDefined()
    // Verification: checks that the resulting component contains the Access Denied text
    const headers = result.props.children
    const accessDeniedHeader = headers.find((child: any) => child.type === 'h2')
    expect(accessDeniedHeader.props.children).toBe('Access Denied')
  })
})
