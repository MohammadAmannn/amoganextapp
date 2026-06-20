import { X, Navigation } from 'lucide-react'
import type { MapMarker } from '../types/marker'

interface MapPopupProps {
  marker: MapMarker
  onClose: () => void
}

export function MapPopup({ marker, onClose }: MapPopupProps) {
  return (
    <div className="relative animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="w-[300px] sm:w-[340px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100/20 dark:border-gray-800/50 overflow-hidden">
        
        {/* Colorful accent based on marker type */}
        <div className={`h-1 ${marker.icon === 'pin' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {marker.locationName}
              </h3>
              {marker.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {marker.description}
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

          {/* Info items - Clean grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Contact</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{marker.name}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{marker.mobile}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">ZIP Code</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{marker.zipCode}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Coordinates</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xs font-medium text-gray-600 dark:text-gray-300"
            onClick={() => window.open(`https://www.google.com/maps?q=${marker.lat},${marker.lng}`, '_blank')}
          >
            <Navigation className="h-3 w-3" />
            View in Google Maps
          </button>
        </div>
      </div>
    </div>
  )
}