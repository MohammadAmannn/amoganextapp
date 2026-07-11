import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { getSharedFileMetadata, generateSignedUrl } from '@/services/file.service'
import SecureDocumentClientPage from '@/components/document/SecureDocumentClientPage'

export const metadata = {
  title: 'Secure Document Viewer',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SecureDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login page and redirect back to this page
    redirect(`/sign-in?redirect=${encodeURIComponent(`/files/document/${id}`)}`)
  }

  console.log(`[DEBUG server] SecureDocumentPage loaded for file ID: ${id}`)
  console.log(`[DEBUG server] Current Auth User: ${user.id} (${user.email})`)

  // 2. Ensure profile exists on the server side to prevent race conditions with client-side registration
  let profileExists = false
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) throw profileError

    if (profile) {
      profileExists = true
      console.log(`[DEBUG server] Profile Exists: true for user ID: ${user.id}`)
    } else {
      console.log(`[DEBUG server] Profile Exists: false. Creating profile for user ID: ${user.id}...`)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email!.split('@')[0],
          email: user.email!,
          avatar: user.user_metadata?.avatar_url || null,
        })
      
      if (insertError) {
        console.error(`[DEBUG server] Profile Created: false (error: ${insertError.message})`)
      } else {
        console.log(`[DEBUG server] Profile Created: true for user ID: ${user.id}`)
      }
    }
  } catch (err: any) {
    console.error(`[DEBUG server] Error checking/creating profile on server:`, err.message || err)
  }

  // 3. Load file and check authorization
  const result = await getSharedFileMetadata(supabase, id, user.id)
  console.log(`[DEBUG server] getSharedFileMetadata success: ${result.success}`)
  
  if (result.success && result.data) {
    console.log(`[DEBUG server] Authorization Decision: Access Granted (File: ${result.data.fileName}, Owner: ${result.data.ownerId})`)
  } else {
    console.warn(`[DEBUG server] Authorization Decision: Access Denied (Reason: ${result.error || 'Unknown'})`)
  }

  if (!result.success || !result.data) {
    // Render a professional "Access Denied" page
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 mb-4 select-none">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0zM10 9a2 2 0 114 0 2 2 0 01-4 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-sm select-none">
          {result.error || "You do not have permission to view this file."}
        </p>
      </div>
    )
  }

  // 3. Generate signed URL securely
  let signedUrl: string
  try {
    signedUrl = await generateSignedUrl(supabase, result.data.bucket, result.data.storagePath)
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <h2 className="text-xl font-bold text-foreground mb-2">Error Loading File</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{err.message || "Failed to load document preview."}</p>
      </div>
    )
  }

  // 4. Render client viewer page
  return (
    <SecureDocumentClientPage
      fileName={result.data.fileName}
      fileUrl={signedUrl}
      mimeType={result.data.mimeType}
      messageId={id}
    />
  )
}
