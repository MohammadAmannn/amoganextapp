import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/vouchers
 * Fetch all vouchers for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: true, data: [] })
    }

    // 1. Fetch vouchers table strictly belonging to logged-in user
    let voucherRows: any[] = []
    try {
      const { data: vData } = await supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
      if (vData) voucherRows = vData
    } catch (e) {
      console.warn('Vouchers table fetch error:', e)
    }

    // 2. Fetch chat_messages table attachments strictly belonging to logged-in user
    let chatFileRows: any[] = []
    try {
      const { data: cData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('owner_user_id', user.id)
        .or('file_name.neq.null,file_url.neq.null')
        .order('created_at', { ascending: false })
        .limit(100)

      if (cData) {
        chatFileRows = cData.map((msg: any) => ({
          id: `chat-file-${msg.id}`,
          voucher_no: msg.id ? String(msg.id).slice(0, 8) : 'file',
          file_name: msg.file_name || msg.message || 'Attached File',
          original_file_url: msg.file_url || undefined,
          edited_file_url: msg.file_url || undefined,
          vendor_name: msg.sender_name || 'Uploaded Document',
          customer_name: user?.email ? user.email.split('@')[0] : 'Aman',
          user_name: user?.email ? user.email.split('@')[0] : 'Aman',
          created_at: msg.created_at || new Date().toISOString(),
          status: msg.processing_status || 'Active',
          edited_json: msg.file_content_json || null,
        }))
      }
    } catch (e) {
      console.warn('Chat files fetch error:', e)
    }

    // Combine all user files and sort by created_at DESC (newest first)
    const allFiles = [...voucherRows, ...chatFileRows]
    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Deduplicate by filename + url
    const uniqueFiles: any[] = []
    const seen = new Set<string>()
    for (const f of allFiles) {
      const key = (f.file_name || '') + (f.original_file_url || '')
      if (!seen.has(key)) {
        seen.add(key)
        uniqueFiles.push(f)
      }
    }

    return NextResponse.json({ success: true, data: uniqueFiles })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

/**
 * POST /api/vouchers
 * Save a new voucher record to the database.
 * Body JSON: { voucher_no, file_name, original_file_url?, edited_file_url?, edited_json, vendor_name?, customer_name?, invoice_date?, total?, currency? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        user_id: user.id,
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
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
