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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? [] })
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
