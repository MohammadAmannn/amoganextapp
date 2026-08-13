'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { createClient } from '@/lib/client'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const handleSignOut = () => {
    try {
      const supabase = createClient()
      supabase.auth.signOut().catch(() => {})
    } catch (err) {
      // ignore
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
    } catch (e) {
      // ignore
    }

    // Direct window location navigation to server-side logout route.
    // Purges session cookies on response and redirects instantly to /sign-in (zero blank screen).
    window.location.href = '/api/auth/mobile-logout'
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
