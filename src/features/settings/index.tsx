import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { NotFoundError } from '@/features/errors/not-found-error'

export function Settings() {
  return (
    <>
      <AppHeader title='Settings' />

      <Main fixed>
        <NotFoundError embedded />
      </Main>
    </>
  )
}
