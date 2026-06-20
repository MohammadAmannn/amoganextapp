import type { MapMarker, ExploreLocation } from '../types/marker'
import markersData from '../data/markers.json'

export class MapService {
  /**
   * Fetches all markers
   * Simulates async loading from JSON
   */
  static async fetchMarkers(): Promise<MapMarker[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return markersData as MapMarker[]
  }

  /**
   * Fetches a single marker by ID
   */
  static async fetchMarkerById(id: string): Promise<MapMarker | undefined> {
    const markers = await this.fetchMarkers()
    return markers.find((marker) => marker.id === id)
  }

  /**
   * Gets current user location using Geolocation API
   */
  static async getCurrentLocation(): Promise<[number, number] | null> {
    const getPosition = (options: PositionOptions): Promise<[number, number]> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve([position.coords.longitude, position.coords.latitude]),
          (error) => reject(error),
          options
        )
      })
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser.')
    }

    try {
      // First try with high accuracy and moderate timeout
      return await getPosition({
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0,
      })
    } catch (error: any) {
      // If permission is denied (code 1), don't retry, throw directly
      if (error.code === 1) {
        throw new Error('Location permission denied. Please enable location access in your browser settings.')
      }

      // For timeout (code 3) or position unavailable (code 2), retry with low accuracy
      console.warn('High accuracy geolocation failed, retrying with low accuracy...', error.message)
      try {
        return await getPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 10000,
        })
      } catch (innerError: any) {
        throw new Error(innerError.message || 'Failed to retrieve location')
      }
    }
  }

  /**
   * Reverse geocoding - Get location info from coordinates
   * Using OpenStreetMap Nominatim API (free, no API key required)
   */
  static async reverseGeocode(lat: number, lng: number): Promise<ExploreLocation | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MapApplication/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch location data')
      }

      const data = await response.json()
      
      if (!data || !data.address) {
        return null
      }

      const address = data.address
      
      // Build location name from address components
      const locationName = 
        address.city || 
        address.town || 
        address.village || 
        address.county || 
        address.state || 
        'Unknown Location'

      // Get place type
      const placeType = 
        address.amenity || 
        address.building || 
        address.shop || 
        address.tourism ||
        address.leisure ||
        'Location'

      // Build full address
      const addressParts = [
        address.road || '',
        address.house_number || '',
        address.suburb || '',
        address.city || address.town || address.village || '',
        address.state || '',
        address.country || '',
      ].filter(Boolean)

      const fullAddress = addressParts.join(', ')

      return {
        lat,
        lng,
        locationName: locationName,
        description: placeType,
        placeType: placeType,
        address: fullAddress || `${locationName}, ${address.country || ''}`,
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Fallback: Create a basic location info
      return {
        lat,
        lng,
        locationName: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        description: 'Click to explore',
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }
    }
  }

  /**
   * Search for nearby places (using Overpass API)
   */
  static async searchNearbyPlaces(lat: number, lng: number, radius: number = 500): Promise<any[]> {
    try {
      const query = `
        [out:json];
        (
          node["amenity"](around:${radius},${lat},${lng});
          node["shop"](around:${radius},${lat},${lng});
          node["tourism"](around:${radius},${lat},${lng});
          node["leisure"](around:${radius},${lat},${lng});
        );
        out body;
      `

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch nearby places')
      }

      const data = await response.json()
      return data.elements || []
    } catch (error) {
      console.error('Nearby places error:', error)
      return []
    }
  }

  /**
   * Filters markers by search term
   */
  static filterMarkersBySearch(markers: MapMarker[], searchTerm: string): MapMarker[] {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return markers

    return markers.filter(
      (marker) =>
        marker.locationName.toLowerCase().includes(term) ||
        marker.name.toLowerCase().includes(term) ||
        marker.zipCode.includes(term)
    )
  }
}