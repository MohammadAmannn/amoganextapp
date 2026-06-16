import { NotFoundError } from '@/features/errors/not-found-error'
import { Main } from '@/components/layout/main'
import { DashboardHeader } from './dashboard-header'

export function DashboardNotFound() {
  return (
    <>
      <DashboardHeader />
      <Main>
        <NotFoundError embedded />
      </Main>
    </>
  )
}
