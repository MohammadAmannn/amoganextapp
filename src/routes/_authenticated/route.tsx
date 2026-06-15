import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { auth } = useAuthStore.getState()
    const redirectTo = location.href

    if (!auth.accessToken || !auth.user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: redirectTo,
        },
      })
    }

    if (auth.user.exp && auth.user.exp < Date.now()) {
      auth.reset()
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: redirectTo,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
