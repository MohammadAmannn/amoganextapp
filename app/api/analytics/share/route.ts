import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
    }

    const { linkId, platform } = await request.json()
    if (!linkId || !platform) {
      return NextResponse.json({ error: 'linkId and platform are required' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') || ''

    const { error } = await supabase
      .from('shares')
      .insert({
        link_id: linkId,
        platform: platform,
        user_agent: userAgent || null
      })

    if (error) {
      console.error('Error logging share to Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Share analytics API exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
