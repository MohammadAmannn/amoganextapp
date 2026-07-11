import { X, MapPin, Navigation, ExternalLink, Building2 } from 'lucide-react'
import type { ExploreLocation } from '../types/marker'

interface ExplorePopupProps {
  location: ExploreLocation
  onClose: () => void
  onExplore?: (lat: number, lng: number) => void
}

export function ExplorePopup({ location, onClose, onExplore }: ExplorePopupProps) {
  return (
    <div className="relative animate-in slide-in-from-bottom-2 fade-in duration-300">
      {/* Clean Card - No heavy glass effect, just clean design */}
      <div className="w-[300px] sm:w-[340px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100/20 dark:border-gray-800/50 overflow-hidden">
        
        {/* Subtle accent line */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-4">
          {/* Header with close button */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {location.locationName}
                </h3>
              </div>
              {location.placeType && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {location.placeType}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors shrink-0 mt-0.5"
            >
              <X className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Address with icon */}
          {location.address && (
            <div className="flex items-start gap-2 mt-2.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {location.address}
              </p>
            </div>
          )}

          {/* Coordinates */}
          <div className="flex items-center gap-1.5 mt-2">
            <Navigation className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>

          {/* Action Buttons - Clean, minimal */}
          <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-xs font-medium text-blue-600 dark:text-blue-400"
              onClick={() => window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
              Maps
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
              onClick={() => onExplore?.(location.lat, location.lng)}
            >
              <Navigation className="h-3 w-3" />
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}