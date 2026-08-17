'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { createClient } from '@/lib/client'
import { useAuthStore } from '@/stores/auth-store'
import { signOut as nextAuthSignOut } from 'next-auth/react'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const handleSignOut = async () => {
    try {
      useAuthStore.getState().auth.reset()
    } catch (err) {
      // ignore
    }

    try {
      await nextAuthSignOut({ redirect: false })
    } catch (err) {
      // ignore
    }

    try {
      const supabase = createClient()
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {})
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
