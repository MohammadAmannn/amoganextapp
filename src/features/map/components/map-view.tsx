import { useState, useCallback, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Map, MapMarker, MarkerContent, MarkerPopup } from '@/components/ui/map'
import { useMapMarkers } from '../hooks/use-map-markers'
import { MapPopup } from './map-popup'
import { ExplorePopup } from './explore-popup'
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_CONFIG } from '../constants/map-config'
import { MapService } from '../services/map.service'
import type { MapMarker as MapMarkerType, ExploreLocation } from '../types/marker'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate, useRouterState } from '@tanstack/react-router'

// using any for maplibre map methods to avoid importing heavy types
interface MapInstance {
  getZoom: () => number
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  flyTo: (options: any) => void
  on: (event: string, callback: (e: any) => void) => void
  off: (event: string, callback: (e: any) => void) => void
}

export function MapView() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerType | null>(null)
  const [exploreLocation, setExploreLocation] = useState<ExploreLocation | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isExploring, setIsExploring] = useState(false)
  const mapRef = useRef<MapInstance | null>(null)
  const { markers, loading, error } = useMapMarkers()

  const search = routerState.location.search as Record<string, any>
  const markerId = search.markerId

  // Handle marker query parameter search from header search
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !markers.length || !markerId) return

    const marker = markers.find((m) => m.id === String(markerId))
    if (marker) {
      setSelectedMarker(marker)
      setExploreLocation(null)
      
      // Fly to marker coordinates
      mapRef.current.flyTo({
        center: [marker.lng, marker.lat],
        zoom: 14,
        essential: true
      })

      // Clean up search query param from URL so it doesn't trigger on subsequent re-renders
      navigate({ to: '/map', search: {} as any, replace: true })
    }
  }, [mapLoaded, markers, markerId, navigate])

  // Handle marker click
  const handleMarkerClick = useCallback((marker: MapMarkerType) => {
    if (selectedMarker?.id === marker.id) {
      setSelectedMarker(null)
      setExploreLocation(null)
    } else {
      setSelectedMarker(marker)
      setExploreLocation(null)
    }
  }, [selectedMarker])

  // Handle map click/tap - explore location
  const handleMapClick = useCallback(async (event: any) => {
    const { lng, lat } = event.lngLat || event

    if (!lat || !lng) return

    setIsExploring(true)
    setSelectedMarker(null)

    try {
      const locationInfo = await MapService.reverseGeocode(lat, lng)
      if (locationInfo) {
        setExploreLocation(locationInfo)
      }
    } catch (error) {
      console.error('Error exploring location:', error)
    } finally {
      setIsExploring(false)
    }
  }, [])

  // Close popups
  const handleClosePopup = useCallback(() => {
    setSelectedMarker(null)
    setExploreLocation(null)
  }, [])

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }, [])

  // Reset view
  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      })
      handleClosePopup()
    }
  }, [handleClosePopup])

  // Fullscreen
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen error:', err)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err)
      })
      setIsFullscreen(false)
    }
  }, [])

  // Current location
  const handleCurrentLocation = useCallback(async () => {
    setIsLocating(true)
    try {
      const location = await MapService.getCurrentLocation()
      if (location && mapRef.current) {
        mapRef.current.flyTo({
          center: location,
          zoom: 14,
        })
        // Auto-explore the current location
        await handleMapClick({ lng: location[0], lat: location[1] })
        toast.success('Successfully located your position!')
      } else {
        toast.error('Unable to retrieve location. Please make sure location services are enabled.')
      }
    } catch (err: any) {
      console.error('Failed to get location:', err)
      toast.error(err.message || 'Failed to get location. Please check your browser permissions.')
    } finally {
      setIsLocating(false)
    }
  }, [handleMapClick])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Map callback ref to handle instance events
  const handleMapRef = useCallback((mapInstance: any) => {
    if (mapInstance) {
      mapRef.current = mapInstance
      setMapLoaded(true)
    } else {
      mapRef.current = null
      setMapLoaded(false)
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <Card className="overflow-hidden p-0 h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading map data...</p>
        </div>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="overflow-hidden p-0 h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-2 max-w-sm text-center px-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Failed to load markers</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-xl">
      <Card className="overflow-hidden p-0 h-full w-full relative border-0 rounded-2xl">
        <Map
          ref={handleMapRef}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={MAP_CONFIG.minZoom}
          maxZoom={MAP_CONFIG.maxZoom}
          className="h-full w-full"
        >
          {/* Render markers */}
          {markers.map((marker) => (
            <MapMarker
              key={marker.id}
              longitude={marker.lng}
              latitude={marker.lat}
              onClick={(e) => {
                // Prevent map click from firing
                e.stopPropagation?.()
                handleMarkerClick(marker)
              }}
            >
              <MarkerContent>
                <div
                  className={`
                    relative flex items-center justify-center
                    transition-all duration-300 ease-in-out
                    hover:scale-110
                    ${selectedMarker?.id === marker.id ? 'scale-125 z-10' : 'scale-100'}
                  `}
                >
                  <div className={`
                    p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800
                    ${marker.icon === 'pin' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}
                  `}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {marker.icon === 'pin' ? (
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      ) : (
                        <>
                          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                          <path d="M2 7h20" />
                          <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
                        </>
                      )}
                    </svg>
                  </div>
                  {/* Subtle pulse for active marker */}
                  {selectedMarker?.id === marker.id && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-current opacity-20" />
                  )}
                </div>
              </MarkerContent>

              {/* Marker Popup */}
              {selectedMarker?.id === marker.id && (
                <MarkerPopup className="p-0 border-0 shadow-lg rounded-xl overflow-hidden min-w-[240px] max-w-none">
                  <MapPopup marker={selectedMarker} onClose={handleClosePopup} />
                </MarkerPopup>
              )}
            </MapMarker>
          ))}

          {/* Invisible MapMarker for map click ExploreLocation */}
          {exploreLocation && mapLoaded && (
            <MapMarker
              key={`explore-${exploreLocation.lat}-${exploreLocation.lng}`}
              longitude={exploreLocation.lng}
              latitude={exploreLocation.lat}
            >
              <MarkerPopup className="p-0 border-0 shadow-lg rounded-xl overflow-hidden min-w-[240px] max-w-none">
                <ExplorePopup location={exploreLocation} onClose={handleClosePopup} />
              </MarkerPopup>
            </MapMarker>
          )}
        </Map>

        {/* Exploring overlay */}
        {isExploring && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-xs">
              <Loader2 className="h-3 w-3 animate-spin" />
              Finding location...
            </div>
          </div>
        )}
      </Card>

      {/* Clean Controls - Minimal and Modern */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        {/* Zoom Controls */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 dark:border-gray-800/50 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center border-b border-gray-100 dark:border-gray-800"
            aria-label="Zoom In"
          >
            <span className="text-lg font-light text-gray-700 dark:text-gray-300">+</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            aria-label="Zoom Out"
          >
            <span className="text-lg font-light text-gray-700 dark:text-gray-300">−</span>
          </button>
        </div>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="h-9 w-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
          aria-label="Reset View"
        >
          <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* My Location */}
        <button
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="h-9 w-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50"
          aria-label="My Location"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="h-9 w-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
          aria-label="Fullscreen"
        >
          {isFullscreen ? (
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          )}
        </button>
      </div>

      {/* Clean info badge */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border border-gray-100/20 dark:border-gray-800/50">
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {markers.length} locations
        </span>
      </div>
    </div>
  )
}