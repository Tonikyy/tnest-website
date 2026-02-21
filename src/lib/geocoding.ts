const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'
const USER_AGENT = 'TimeNest (location)'

export async function searchAddress(
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
  })
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return null
  const data = await res.json()
  const first = data[0]
  if (!first) return null
  return {
    lat: parseFloat(first.lat),
    lng: parseFloat(first.lon),
    displayName: first.display_name || '',
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
  })
  const res = await fetch(`${NOMINATIM_REVERSE}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.display_name || null
}

export interface Coords {
  lat: number
  lng: number
}

/**
 * Get current position with options tuned for mobile (GPS, longer timeout).
 * Throws with a user-friendly message on permission denied, unavailable, or timeout.
 */
export function getCurrentPositionAsync(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location is not supported by your browser. Try searching by address or use the map.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(
              new Error(
                'Location access was denied. Allow location in your browser or device settings, or search by address / tap the map instead.'
              )
            )
            break
          case err.POSITION_UNAVAILABLE:
            reject(
              new Error(
                'Location is unavailable. Try searching by address or tap the map to set your area.'
              )
            )
            break
          case err.TIMEOUT:
            reject(
              new Error(
                'Location request timed out. Try again, or search by address / tap the map.'
              )
            )
            break
          default:
            reject(new Error('Could not get your location. Try search or the map.'))
        }
      },
      {
        enableHighAccuracy: true, // Prefer GPS on phones
        timeout: 20000, // 20s for GPS to fix
        maximumAge: 300000, // Accept cached position up to 5 min
      }
    )
  })
}
