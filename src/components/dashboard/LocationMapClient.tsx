'use client'

import dynamic from 'next/dynamic'
import type { LocationMapProps } from './LocationMap'

const LocationMap = dynamic(
  () => import('./LocationMap').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-md border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
        style={{ height: 280 }}
      >
        Loading map…
      </div>
    ),
  }
)

export default function LocationMapClient(props: LocationMapProps) {
  return <LocationMap {...props} />
}
