'use client'

import { format } from 'date-fns'
import { formatEur } from '@/lib/pricing'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { formatFinnishAddress } from '@/lib/address-utils'

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
  const businessInitial = vacancy.business.name ? vacancy.business.name.charAt(0).toUpperCase() : 'B'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        {/* Business Header + Vacancy Details */}
        <div className="flex-1 min-w-0">

          {/* Business Info Header */}
          <div className="flex items-center gap-3 mb-4">
            {/* Avatar Placeholder */}
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
              {businessInitial}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {vacancy.business.name.includes('@')
                  ? vacancy.business.name.split('@')[0]
                  : vacancy.business.name}
              </h3>
              {vacancy.business.address && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  <MapPinIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {formatFinnishAddress(vacancy.business.address)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div className="ml-13 border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
            <p className="text-sm text-primary font-medium">{vacancy.serviceType}</p>

            {vacancy.distanceKm != null && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {vacancy.distanceKm < 1
                  ? `${Math.round(vacancy.distanceKm * 1000)} m away`
                  : `${vacancy.distanceKm.toFixed(1)} km away`}
              </p>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {format(new Date(vacancy.startTime), 'EEE, MMM d, yyyy')} at{' '}
              {format(new Date(vacancy.startTime), 'p')} ({vacancy.duration} min)
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {formatEur(vacancy.priceCents ?? 0)}
            </p>
            {vacancy.notes && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">Note: {vacancy.notes}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 sm:mt-0 mt-2">
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to book</p>
          )}
        </div>
      </div>
    </div>
  )
}
