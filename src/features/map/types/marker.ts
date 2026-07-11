export interface MapMarker {
  id: string
  locationName: string
  description?: string
  name: string
  mobile: string
  zipCode: string
  lat: number
  lng: number
  icon: 'pin' | 'store'
  population?: string
}

export interface ExploreLocation {
  lat: number
  lng: number
  locationName: string
  description?: string
  placeType?: string
  address?: string
}

export type MarkerIconType = 'pin' | 'store'

export interface MapConfig {
  center: [number, number]
  zoom: number
  minZoom?: number
  maxZoom?: number
}