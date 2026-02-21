'use client'

import { format } from 'date-fns'
import { formatEur } from '@/lib/pricing'

export interface VacancySearchItem {
  id: string
  startTime: string
  duration: number
  serviceType: string
  priceCents: number
  notes?: string | null
  status: string
  business: {
    id: string
    name: string
    type: string
    address: string | null
    latitude: number | null
    longitude: number | null
  }
  distanceKm: number | null
}

interface VacancyCardProps {
  vacancy: VacancySearchItem
  onBook: (id: string) => void
  isBooking?: boolean
  isLoggedIn?: boolean
}

export default function VacancyCard({ vacancy, onBook, isBooking, isLoggedIn }: VacancyCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{vacancy.business.name}</h3>
          <p className="text-sm text-primary font-medium mt-0.5">{vacancy.serviceType}</p>
          {vacancy.business.address && (
            <p className="text-sm text-gray-500 mt-1 truncate">{vacancy.business.address}</p>
          )}
          {vacancy.distanceKm != null && (
            <p className="text-sm text-gray-600 mt-1">
              {vacancy.distanceKm < 1
                ? `${Math.round(vacancy.distanceKm * 1000)} m away`
                : `${vacancy.distanceKm.toFixed(1)} km away`}
            </p>
          )}
          <p className="text-sm text-gray-700 mt-2">
            {format(new Date(vacancy.startTime), 'EEE, MMM d, yyyy')} at{' '}
            {format(new Date(vacancy.startTime), 'p')} ({vacancy.duration} min)
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {formatEur(vacancy.priceCents ?? 0)}
          </p>
          {vacancy.notes && (
            <p className="text-xs text-gray-400 italic mt-1">Note: {vacancy.notes}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => onBook(vacancy.id)}
              disabled={isBooking}
              className="btn-primary px-4 py-2 text-sm font-medium"
            >
              {isBooking ? 'Booking...' : 'Book'}
            </button>
          ) : (
            <p className="text-sm text-gray-500">Sign in to book</p>
          )}
        </div>
      </div>
    </div>
  )
}
