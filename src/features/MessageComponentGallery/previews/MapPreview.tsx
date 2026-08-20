'use client'

import React, { useRef } from 'react'
import { MapView, type MapViewRef } from '@/features/map/components/map-view'
import { MapSearchBar } from '@/features/map/components/map-search-bar'
import { useMapMarkers } from '@/features/map/hooks/use-map-markers'

export function MapPreview({ stateIndex = 0 }: { stateIndex?: number }) {
  const mapViewRef = useRef<MapViewRef>(null)
  const { markers, loading, error } = useMapMarkers()

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-3 md:p-6 overflow-hidden font-sans select-none gap-3">
      <MapSearchBar
        markers={markers}
        onSelectMarker={(marker) => mapViewRef.current?.handleSearchSelect(marker)}
      />
      <div className="flex-1 min-h-0 w-full rounded-2xl border border-border/80 overflow-hidden shadow-2xs relative">
        <MapView
          ref={mapViewRef}
          markers={markers}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}

export default MapPreview
