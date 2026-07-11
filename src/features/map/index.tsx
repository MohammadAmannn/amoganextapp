import { useRef } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { MapView, type MapViewRef } from './components/map-view'
import { MapSearchBar } from './components/map-search-bar'
import { useMapMarkers } from './hooks/use-map-markers'

export default function MapPage() {
  const mapViewRef = useRef<MapViewRef>(null)
  const { markers, loading, error } = useMapMarkers()

  return (
    <>
      <AppHeader title="Map Template" />

      <Main fixed>
        <div className="flex flex-col gap-4 w-full h-full">
          <MapSearchBar
            markers={markers}
            onSelectMarker={(marker) => mapViewRef.current?.handleSearchSelect(marker)}
          />
          <MapView
            ref={mapViewRef}
            markers={markers}
            loading={loading}
            error={error}
          />
        </div>
      </Main>
    </>
  )
}