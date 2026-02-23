'use client'

import { useState, useEffect } from 'react'
import LocationMapClient from './LocationMapClient'
import { searchAddress, reverseGeocode, getCurrentPositionAsync } from '@/lib/geocoding'
import { formatFinnishAddress } from '@/lib/address-utils'

interface BusinessLocationFormProps {
  onSuccess: () => void
  initialAddress?: string | null
  initialLatitude?: number | null
  initialLongitude?: number | null
}

export default function BusinessLocationForm({
  onSuccess,
  initialAddress,
  initialLatitude,
  initialLongitude,
}: BusinessLocationFormProps) {
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [address, setAddress] = useState(initialAddress ?? '')
  const [searchQuery, setSearchQuery] = useState('')
  const [latitude, setLatitude] = useState<number | null>(initialLatitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(initialLongitude ?? null)

  useEffect(() => {
    // Only attempt auto-location if the business doesn't already have one saved
    if (initialLatitude == null && initialLongitude == null) {
      let mounted = true
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (!mounted) return
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            setLatitude((prev) => (prev === null ? lat : prev))
            setLongitude((prev) => (prev === null ? lng : prev))
            try {
              const name = await reverseGeocode(lat, lng)
              if (name && mounted) {
                setAddress((prev) => (prev === '' ? formatFinnishAddress(name) : prev))
              }
            } catch {
              // ignore
            }
          },
          () => {
            // Silent failure
          }
        )
      }
      return () => { mounted = false }
    }
  }, [initialLatitude, initialLongitude])

  const handleSearchAddress = async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearching(true)
    setError(null)
    try {
      const result = await searchAddress(q)
      if (result) {
        setLatitude(result.lat)
        setLongitude(result.lng)
        setAddress(formatFinnishAddress(result.displayName))
      } else {
        setError('Address not found. Try a different search.')
      }
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handlePositionChange = async (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setError(null)
    try {
      const name = await reverseGeocode(lat, lng)
      if (name) setAddress(formatFinnishAddress(name))
    } catch {
      // keep existing address or leave blank
    }
  }

  const loadMyLocation = async () => {
    setError(null)
    try {
      const { lat, lng } = await getCurrentPositionAsync()
      setLatitude(lat)
      setLongitude(lng)
      try {
        const name = await reverseGeocode(lat, lng)
        if (name) setAddress(formatFinnishAddress(name))
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get your location')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (latitude == null || longitude == null) {
      setError('Please set a location: search for an address, click on the map, or use “Use my location”.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address || undefined,
          latitude,
          longitude,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update location')
      }

      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Business location</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Search for your address or click on the map to set your location. Customers will use this to find you.
      </p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">{error}</div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
          placeholder="Search address (e.g. Mannerheimintie 1, Helsinki)"
          className="flex-1 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border transition-colors"
        />
        <button
          type="button"
          onClick={handleSearchAddress}
          disabled={searching}
          className="btn-primary px-4 py-2 text-sm whitespace-nowrap disabled:opacity-50"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Map</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Click on the map to set your location, or drag the marker. Address updates automatically.
        </p>
        <LocationMapClient
          latitude={latitude}
          longitude={longitude}
          onPositionChange={handlePositionChange}
          height="280px"
        />
      </div>

      {address && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address (saved with location)</label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">{address}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={loadMyLocation}
          className="text-sm text-primary hover:underline"
        >
          Use my current location
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || latitude == null || longitude == null}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save location'}
      </button>
    </form>
  )
}
