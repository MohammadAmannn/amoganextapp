import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions, stringToUuid } from '@/lib/auth'

/**
 * GET /api/vouchers
 * Fetch all vouchers AND chat file attachments for the authenticated user (with automatic fallbacks).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const supabase = await createClient()

    let userId: string | null = null
    let userEmail: string | null = null

    if (session?.user) {
      const user = session.user as any
      userEmail = user.email ? user.email.toLowerCase() : null
      userId = stringToUuid(user.id || user.email)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        userId = user.id
        userEmail = user.email ? user.email.toLowerCase() : null
      }
    }

    // ── 1. Fetch Vouchers ───────────────────────────────────────────────────────
    let voucherRows: any[] = []
    try {
      if (userId) {
        // Try exact NextAuth UUID match
        const { data: vData } = await supabase
          .from('vouchers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100)

        if (vData && vData.length > 0) {
          voucherRows = vData
        } else if (userEmail) {
          // Profile lookup by email fallback (migration safety)
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', userEmail)
            .maybeSingle()

          if (profileRow?.id) {
            const { data: vByProfile } = await supabase
              .from('vouchers')
              .select('*')
              .eq('user_id', profileRow.id)
              .order('created_at', { ascending: false })
              .limit(100)
            if (vByProfile && vByProfile.length > 0) {
              voucherRows = vByProfile
            }
          }
        }
      }

      // Final fallback if no user-specific vouchers found: return all recent vouchers
      if (voucherRows.length === 0) {
        const { data: fallbackVData } = await supabase
          .from('vouchers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
        if (fallbackVData) voucherRows = fallbackVData
      }
    } catch (e) {
      console.warn('[GET /api/vouchers] Vouchers table fetch warning:', e)
    }

    // ── 2. Fetch Chat File Attachments ──────────────────────────────────────────
    let chatFileRows: any[] = []
    try {
      if (userId) {
        const [rOwner, rSender] = await Promise.all([
          supabase
            .from('chat_messages')
            .select('*')
            .eq('owner_user_id', userId)
            .not('file_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(100),
          supabase
            .from('chat_messages')
            .select('*')
            .eq('sender_user_id', userId)
            .not('file_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(100),
        ])

        const userMsgs = [...(rOwner.data ?? []), ...(rSender.data ?? [])]
        if (userMsgs.length > 0) {
          chatFileRows = userMsgs.map((msg: any) => ({
            id: `chat-file-${msg.id}`,
            voucher_no: msg.id ? String(msg.id).slice(0, 8) : 'file',
            file_name: msg.file_name || 'Attached File',
            original_file_url: msg.file_url ?? undefined,
            edited_file_url: msg.file_url ?? undefined,
            vendor_name: msg.sender_name || 'Uploaded Document',
            customer_name: userEmail ? userEmail.split('@')[0] : 'User',
            user_name: userEmail ? userEmail.split('@')[0] : 'User',
            created_at: msg.created_at || new Date().toISOString(),
            status: msg.processing_status || 'Active',
            edited_json: msg.file_content_json || null,
          }))
        }
      }

      // Fallback: fetch all recent chat files if none found for user
      if (chatFileRows.length === 0) {
        const { data: fallbackMsgs } = await supabase
          .from('chat_messages')
          .select('*')
          .not('file_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100)

        if (fallbackMsgs && fallbackMsgs.length > 0) {
          chatFileRows = fallbackMsgs.map((msg: any) => ({
            id: `chat-file-${msg.id}`,
            voucher_no: msg.id ? String(msg.id).slice(0, 8) : 'file',
            file_name: msg.file_name || 'Attached File',
            original_file_url: msg.file_url ?? undefined,
            edited_file_url: msg.file_url ?? undefined,
            vendor_name: msg.sender_name || 'Uploaded Document',
            customer_name: userEmail ? userEmail.split('@')[0] : 'User',
            user_name: userEmail ? userEmail.split('@')[0] : 'User',
            created_at: msg.created_at || new Date().toISOString(),
            status: msg.processing_status || 'Active',
            edited_json: msg.file_content_json || null,
          }))
        }
      }
    } catch (e) {
      console.warn('[GET /api/vouchers] Chat files fetch warning:', e)
    }

    // ── 3. Merge, Deduplicate, Sort ─────────────────────────────────────────────
    const allFiles = [...voucherRows, ...chatFileRows]
    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const seen = new Set<string>()
    const uniqueFiles: any[] = []
    for (const f of allFiles) {
      const key = `${f.id}|${f.file_name ?? ''}|${f.original_file_url ?? ''}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueFiles.push(f)
      }
    }

    return NextResponse.json({ success: true, data: uniqueFiles })
  } catch (err: any) {
    console.error('[GET /api/vouchers] Internal error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

/**
 * POST /api/vouchers
 * Save a new voucher record to the database.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const supabase = await createClient()

    let userId: string | null = null
    let userEmail: string | null = null

    if (session?.user) {
      const user = session.user as any
      userEmail = user.email ? user.email.toLowerCase() : null
      userId = stringToUuid(user.id || user.email)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        userId = user.id
        userEmail = user.email?.toLowerCase() ?? null
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve profile ID by email to keep DB foreign key consistent
    if (userEmail) {
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle()
      if (profileRow?.id) userId = profileRow.id
    }

    const body = await request.json()
    const {
      voucher_no,
      file_name,
      original_file_url,
      edited_file_url,
      edited_json,
      vendor_name,
      customer_name,
      invoice_date,
      total,
      currency,
    } = body

    if (!voucher_no || !file_name) {
      return NextResponse.json({ error: 'voucher_no and file_name are required' }, { status: 400 })
    }

    const { data: row, error } = await supabase
      .from('vouchers')
      .insert({
        user_id: userId,
        voucher_no,
        file_name,
        original_file_url: original_file_url || null,
        edited_file_url: edited_file_url || null,
        edited_json: edited_json || null,
        vendor_name: vendor_name || null,
        customer_name: customer_name || null,
        invoice_date: invoice_date || null,
        total: total || null,
        currency: currency || 'USD',
        status: 'Active',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: row }, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/vouchers] Internal error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
