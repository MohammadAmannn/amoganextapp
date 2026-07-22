import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/features/chattemplate/shared/api/apiClient'
import { createQuery } from '@/features/chattemplate/shared/api/queryBuilder'
import { updateProfile } from '@/features/chattemplate/chat/repositories/profile-repository'

export const runtime = 'nodejs'

/**
 * GET /api/profiles/[id]
 * Fetches a single profile by its UUID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = createQuery().select('*').eq('id', id).limit(1)
    const profiles = await apiClient.get<any[]>(`/rest/v1/profiles${query.toString()}`)
    const profile = profiles[0] || null

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || null,
      company: profile.company || null,
      mobile: profile.mobile || null,
      status: profile.status,
      online: profile.online,
      last_seen: profile.last_seen,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    })
  } catch (err) {
    console.error('GET profile by id error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/profiles/[id]
 * Updates profile details or presence.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const success = await updateProfile(id, body)
    if (!success) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('PATCH profile error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

