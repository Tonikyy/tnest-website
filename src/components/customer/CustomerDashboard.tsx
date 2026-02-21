'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import VacancyCard, { type VacancySearchItem } from './VacancyCard'
import LocationMapClient from '@/components/dashboard/LocationMapClient'
import { searchAddress, reverseGeocode, getCurrentPositionAsync } from '@/lib/geocoding'

interface BookedVacancy {
  id: string
  startTime: string
  duration: number
  serviceType: string
  notes?: string | null
  status: string
  bookedAt: string | null
  business: {
    id: string
    name: string
    type: string
    address: string | null
  }
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [maxDistanceKm, setMaxDistanceKm] = useState('10')
  const [serviceType, setServiceType] = useState('')
  const [results, setResults] = useState<VacancySearchItem[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [booked, setBooked] = useState<BookedVacancy[]>([])
  const [loadingBooked, setLoadingBooked] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const runSearch = async () => {
    if (latitude == null || longitude == null) {
      setLocationError('Set your location first: use “Use my location”, search an address, or tap the map.')
      return
    }
    setLoadingSearch(true)
    setLocationError(null)
    try {
      const params = new URLSearchParams()
      params.set('lat', String(latitude))
      params.set('lng', String(longitude))
      if (maxDistanceKm.trim()) params.set('maxDistanceKm', maxDistanceKm.trim())
      if (serviceType.trim()) params.set('serviceType', serviceType.trim())
      const res = await fetch(`/api/vacancies/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSearch(false)
    }
  }

  const fetchBooked = async () => {
    setLoadingBooked(true)
    try {
      const res = await fetch('/api/vacancies/booked')
      if (res.ok) {
        const data = await res.json()
        setBooked(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingBooked(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchBooked()
    }
  }, [status, session])

  const handleSearchAddress = async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearchingAddress(true)
    setLocationError(null)
    try {
      const result = await searchAddress(q)
      if (result) {
        setLatitude(result.lat)
        setLongitude(result.lng)
        setAddress(result.displayName)
      } else {
        setLocationError('Address not found. Try a different search.')
      }
    } catch {
      setLocationError('Search failed. Please try again.')
    } finally {
      setSearchingAddress(false)
    }
  }

  const handlePositionChange = async (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setLocationError(null)
    try {
      const name = await reverseGeocode(lat, lng)
      if (name) setAddress(name)
    } catch {
      // keep existing or leave blank
    }
  }

  const useMyLocation = async () => {
    setGettingLocation(true)
    setLocationError(null)
    try {
      const { lat, lng } = await getCurrentPositionAsync()
      setLatitude(lat)
      setLongitude(lng)
      try {
        const name = await reverseGeocode(lat, lng)
        if (name) setAddress(name)
      } catch {
        // ignore
      }
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Could not get your location')
    } finally {
      setGettingLocation(false)
    }
  }

  const handleBook = async (id: string) => {
    setBookingId(id)
    try {
      const res = await fetch(`/api/vacancies/${id}/book`, { method: 'POST' })
      if (res.ok) {
        setResults((prev) => prev.filter((v) => v.id !== id))
        fetchBooked()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to book')
      }
    } catch (e) {
      alert('Failed to book')
    } finally {
      setBookingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Find vacancies</h2>
        <p className="text-sm text-gray-600 mb-4">
          Set your location with “Use my location”, search an address, or tap the map. Then choose max distance and search.
        </p>

        {locationError && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-md">
            {locationError}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
            placeholder="Search address (e.g. 123 Main St, Berlin)"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          />
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={searchingAddress}
            className="btn-primary px-4 py-2 text-sm whitespace-nowrap disabled:opacity-50"
          >
            {searchingAddress ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Map</p>
          <p className="text-xs text-gray-500 mb-2">
            Tap the map to set your location, or drag the marker. Great on mobile.
          </p>
          <LocationMapClient
            latitude={latitude}
            longitude={longitude}
            onPositionChange={handlePositionChange}
            height="280px"
          />
        </div>

        {address && (
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mb-4">
            {address}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={gettingLocation}
            className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {gettingLocation ? 'Getting location…' : 'Use my location'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="form-label">Max distance (km)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="form-label">Service type (optional)</label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g. Haircut"
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={runSearch}
            disabled={loadingSearch || latitude == null || longitude == null}
            className="btn-primary"
          >
            {loadingSearch ? 'Searching…' : 'Search'}
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
          <ul className="space-y-4">
            {results.map((v) => (
              <li key={v.id}>
                <VacancyCard
                  vacancy={v}
                  onBook={handleBook}
                  isBooking={bookingId === v.id}
                  isLoggedIn={!!session?.user}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {session?.user && (
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Bookings</h2>
          {loadingBooked ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : booked.length === 0 ? (
            <p className="text-gray-500">You have no bookings yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {booked.map((v) => (
                <li key={v.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{v.business.name}</p>
                      <p className="text-sm text-primary">{v.serviceType}</p>
                      {v.business.address && (
                        <p className="text-sm text-gray-500">{v.business.address}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(v.startTime), 'EEE, MMM d, yyyy')} at{' '}
                        {format(new Date(v.startTime), 'p')} ({v.duration} min)
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Booked
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!session?.user && (
        <p className="text-center text-gray-500 text-sm">
          Sign in to book vacancies and see your bookings.
        </p>
      )}
    </div>
  )
}
