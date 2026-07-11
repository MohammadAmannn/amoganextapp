import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getSharedFileMetadata } from './file.service'

describe('getSharedFileMetadata RPC Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('authorizes successfully — RPC returns out_ prefixed file metadata', async () => {
    const mockRpcData = {
      out_conversation_id: 'convo-123',
      out_file_url: 'https://abxwugpdvhmuxoesmumq.supabase.co/storage/v1/object/public/chat-files/documents/doc.pdf',
      out_file_name: 'doc.pdf',
      out_file_size: 500,
      out_mime_type: 'application/pdf',
      out_sender_user_id: 'sender-123',
      out_created_at: '2026-07-09T00:00:00Z',
    }

    const mockSupabase = {
      rpc: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: mockRpcData, error: null }),
      }),
    }

    const result = await getSharedFileMetadata(mockSupabase as any, 'file-123', 'viewer-123')
    
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_shared_file_metadata', {
      p_file_id: 'file-123',
      p_user_id: 'viewer-123',
    })
    expect(result.success).toBe(true)
    expect(result.data?.fileName).toBe('doc.pdf')
    expect(result.data?.fileSize).toBe(500)
    expect(result.data?.mimeType).toBe('application/pdf')
    expect(result.data?.conversationId).toBe('convo-123')
    expect(result.data?.ownerId).toBe('sender-123')
    expect(result.data?.bucket).toBe('chat-files')
    expect(result.data?.storagePath).toBe('documents/doc.pdf')
  })

  it('fails authorization — RPC returns null (file not found or not a member)', async () => {
    const mockSupabase = {
      rpc: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }

    const result = await getSharedFileMetadata(mockSupabase as any, 'file-123', 'viewer-123')
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('File not found or unauthorized')
  })

  it('fails authorization — RPC returns a database error with exact message', async () => {
    const mockSupabase = {
      rpc: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'permission denied for function get_shared_file_metadata' },
        }),
      }),
    }

    const result = await getSharedFileMetadata(mockSupabase as any, 'file-123', 'viewer-123')
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('permission denied for function get_shared_file_metadata')
  })
})
