import { createClient } from '@/lib/supabase/client'

export interface VoucherRecord {
  id: string
  user_id: string
  voucher_no: string
  file_name: string
  original_file_url?: string
  edited_file_url?: string
  edited_json?: any
  vendor_name?: string
  customer_name?: string
  invoice_date?: string
  total?: number
  currency?: string
  status?: string
  created_at: string
  updated_at: string
}

/** Upload a file to Supabase Storage under `vouchers/${userId}/` folder in `chat-files` bucket */
export async function uploadVoucherFile(
  file: File,
  subfolder: 'originals' | 'edited' = 'originals'
): Promise<string> {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()
  const userId = user?.user?.id || 'anonymous'

  const fileExt = file.name.split('.').pop() || 'bin'
  const uniqueName = `${crypto.randomUUID()}.${fileExt}`
  const path = `vouchers/${userId}/${subfolder}/${uniqueName}`

  const { error } = await supabase.storage
    .from('chat-files')
    .upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(path)
  return urlData.publicUrl
}

/** Upload a Blob (generated invoice file) to Supabase Storage */
export async function uploadVoucherBlob(
  blob: Blob,
  fileName: string
): Promise<string> {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()
  const userId = user?.user?.id || 'anonymous'

  const uniqueName = `${crypto.randomUUID()}_${fileName}`
  const path = `vouchers/${userId}/edited/${uniqueName}`

  const { error } = await supabase.storage
    .from('chat-files')
    .upload(path, blob, { upsert: false, contentType: blob.type || 'application/octet-stream' })

  if (error) {
    throw new Error(`Invoice storage upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(path)
  return urlData.publicUrl
}

/** Insert a new voucher record into the database */
export async function saveVoucher(data: {
  voucher_no: string
  file_name: string
  original_file_url?: string
  edited_file_url?: string
  edited_json?: any
  vendor_name?: string
  customer_name?: string
  invoice_date?: string
  total?: number
  currency?: string
}): Promise<VoucherRecord | null> {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user?.user?.id) {
    throw new Error('Not authenticated')
  }

  const { data: row, error } = await supabase
    .from('vouchers')
    .insert({
      ...data,
      user_id: user.user.id,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`DB save failed: ${error.message}`)
  }

  return row as VoucherRecord
}

/** Fetch all vouchers for the current user */
export async function getUserVouchers(): Promise<VoucherRecord[]> {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user?.user?.id) return []

  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch vouchers:', error.message)
    return []
  }

  return (data ?? []) as VoucherRecord[]
}
