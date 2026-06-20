import { useState } from 'react'
import type { MapMarker as MapMarkerType } from '../types/marker'

interface MapSearchBarProps {
  markers: MapMarkerType[]
  onSelectMarker: (marker: MapMarkerType) => void
}

export function MapSearchBar({ markers, onSelectMarker }: MapSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Filter markers based on custom search input
  const filteredSearchMarkers = searchQuery.trim()
    ? markers.filter(
        (m) =>
          m.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleSearchSelect = (marker: MapMarkerType) => {
    onSelectMarker(marker)
    setSearchQuery('')
    setIsSearchFocused(false)
  }

  return (
    <div className="relative w-full z-20">
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/30">
        <div className="flex items-center px-3 py-2.5">
          <svg
            className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search locations or contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-0.5"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0 ml-1 border-0 bg-transparent cursor-pointer"
            >
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Dropdown Results */}
        {isSearchFocused && filteredSearchMarkers.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 z-30">
            {filteredSearchMarkers.map((marker) => (
              <button
                key={`search-loc-${marker.id}`}
                onMouseDown={() => handleSearchSelect(marker)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex flex-col gap-0.5 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                  {marker.locationName}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Contact: {marker.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {isSearchFocused && searchQuery.trim() && filteredSearchMarkers.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl px-3 py-3 text-xs text-gray-500 dark:text-gray-400 text-center z-30">
            No locations or contacts found
          </div>
        )}
      </div>
    </div>
  )
}
