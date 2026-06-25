'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Main } from '@/components/layout/main'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { users } from './data/users'
import { AppHeader } from '@/components/layout/app-header'
import type { NavigateFn } from '@/hooks/use-table-url-state'

export function Users() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Build search object from URL search params
  const search = Object.fromEntries(
    [...searchParams.entries()].map(([key, value]) => {
      // Try to parse numbers
      const asNum = Number(value)
      if (!isNaN(asNum) && value !== '') return [key, asNum]
      // Try to parse arrays (comma-separated)
      if (value.includes(',')) return [key, value.split(',')]
      return [key, value]
    })
  )

  // Navigate function compatible with useTableUrlState
  const navigate: NavigateFn = ({ search: searchUpdater, replace }) => {
    const currentSearch = Object.fromEntries(searchParams.entries())
    const next =
      typeof searchUpdater === 'function'
        ? searchUpdater(currentSearch)
        : searchUpdater === true
          ? currentSearch
          : searchUpdater

    // Build query string, omitting undefined values
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(next ?? {})) {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, Array.isArray(v) ? v.join(',') : String(v))
      }
    }
    const qs = params.toString()
    const url = qs ? `?${qs}` : window.location.pathname
    if (replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }

  return (
    <UsersProvider>
      <AppHeader title='Users' />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={users} search={search} navigate={navigate} />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
