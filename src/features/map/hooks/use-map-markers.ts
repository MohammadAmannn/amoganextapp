import { useState, useEffect, useCallback } from 'react'
import type { MapMarker } from '../types/marker'
import { MapService } from '../services/map.service'

interface UseMapMarkersReturn {
  markers: MapMarker[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getMarkerById: (id: string) => MapMarker | undefined
}

export function useMapMarkers(): UseMapMarkersReturn {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMarkers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MapService.fetchMarkers()
      setMarkers(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load markers'
      setError(errorMessage)
      console.error('Error fetching markers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getMarkerById = useCallback(
    (id: string): MapMarker | undefined => {
      return markers.find((marker) => marker.id === id)
    },
    [markers]
  )

  useEffect(() => {
    fetchMarkers()
  }, [fetchMarkers])

  return {
    markers,
    loading,
    error,
    refetch: fetchMarkers,
    getMarkerById,
  }
}