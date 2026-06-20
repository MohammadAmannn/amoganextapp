import type { MapConfig } from '../types/marker'

export const DEFAULT_CENTER: [number, number] = [77.4126, 23.2599] // Bhopal, India
export const DEFAULT_ZOOM = 4

export const MAP_CONFIG: MapConfig = {
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  minZoom: 2,
  maxZoom: 18,
}

export const MARKER_ICON_CONFIG = {
  pin: {
    color: '#EF4444', // red-500
    size: 32,
  },
  store: {
    color: '#3B82F6', // blue-500
    size: 36,
  },
} as const

export const POPUP_CONFIG = {
  maxWidth: 300,
  closeButton: true,
  closeOnClick: true,
} as const