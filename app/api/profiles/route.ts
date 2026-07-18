import { NextRequest, NextResponse } from 'next/server'
import {
  getAllProfiles,
  getProfileByEmail,
} from '@/features/chattemplate/chat/repositories/profile-repository'

export const runtime = 'nodejs'

/**
 * GET /api/profiles
 * Fetches all profiles sorted by name.
 * Optional: ?email=user@example.com to fetch a single profile by email.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const profile = await getProfileByEmail(email)
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      return NextResponse.json(profile)
    }

    const profiles = await getAllProfiles()
    return NextResponse.json(profiles)
  } catch (err) {
    console.error('GET profiles error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
