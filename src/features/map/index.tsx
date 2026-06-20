import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { MapView } from './components/map-view'

export default function MapPage() {
  return (
    <>
      <AppHeader title="Map Template" />

      <Main fixed>
        <section className="space-y-6">
          <MapView />
        </section>
      </Main>
    </>
  )
}