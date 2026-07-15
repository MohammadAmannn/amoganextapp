'use client'

import { Map, MapMarker, MarkerContent, MarkerPopup } from '@/components/ui/map'
import { MapPin } from 'lucide-react'

interface LeafletMapProps {
  latitude: number
  longitude: number
  type?: 'current' | 'live'
  address?: string
}

export default function LeafletMap({ latitude, longitude, type, address }: LeafletMapProps) {
  return (
    <Map
      center={[longitude, latitude]}
      zoom={14}
      className="h-full w-full"
    >
      <MapMarker longitude={longitude} latitude={latitude}>
        <MarkerContent>
          <div className="flex items-center justify-center p-2 rounded-full bg-emerald-500 text-white border-2 border-white shadow-md">
            <MapPin className="h-5 w-5" />
          </div>
        </MarkerContent>
        {address && (
          <MarkerPopup>
            <div className="p-2 text-xs font-medium max-w-[200px]">
              <p className="font-bold mb-1">{type === 'live' ? 'Live Location' : 'Current Location'}</p>
              <p className="text-muted-foreground">{address}</p>
            </div>
          </MarkerPopup>
        )}
      </MapMarker>
    </Map>
  )
}
