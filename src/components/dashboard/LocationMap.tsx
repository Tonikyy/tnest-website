'use client'

import { useEffect, useRef } from 'react'

const defaultCenter: [number, number] = [52.52, 13.405]
const defaultZoom = 10

export interface LocationMapProps {
  latitude: number | null
  longitude: number | null
  onPositionChange: (lat: number, lng: number) => void
  height?: string
}

export default function LocationMap({
  latitude,
  longitude,
  onPositionChange,
  height = '280px',
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)
  const onPositionChangeRef = useRef(onPositionChange)
  onPositionChangeRef.current = onPositionChange

  const hasPosition = latitude != null && longitude != null
  const center: [number, number] = hasPosition ? [latitude, longitude] : defaultCenter

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    const map = L.map(mapRef.current).setView(center, defaultZoom)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    })

    const updateMarker = (lat: number, lng: number) => {
      if (markerRef.current) {
        ;(markerRef.current as { setLatLng: (latlng: [number, number]) => void }).setLatLng([lat, lng])
      } else {
        const marker = L.marker([lat, lng], { icon, draggable: true })
          .addTo(map)
          .on('dragend', function (this: { getLatLng: () => { lat: number; lng: number } }) {
            const pos = this.getLatLng()
            onPositionChangeRef.current(pos.lat, pos.lng)
          })
        markerRef.current = marker
      }
    }

    map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng
      updateMarker(lat, lng)
      onPositionChangeRef.current(lat, lng)
    })

    if (hasPosition) {
      updateMarker(latitude, longitude)
      map.setView([latitude, longitude], map.getZoom())
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, []) // init once

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (hasPosition) {
      const L = require('leaflet')
      if (markerRef.current) {
        ;(markerRef.current as { setLatLng: (latlng: [number, number]) => void }).setLatLng([latitude!, longitude!])
      } else {
        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
        const marker = L.marker([latitude!, longitude!], { icon, draggable: true })
          .addTo(map)
          .on('dragend', function (this: { getLatLng: () => { lat: number; lng: number } }) {
            const pos = this.getLatLng()
            onPositionChangeRef.current(pos.lat, pos.lng)
          })
        markerRef.current = marker
      }
      map.setView([latitude!, longitude!], map.getZoom())
    } else if (markerRef.current) {
      ;(map as { removeLayer: (layer: unknown) => void }).removeLayer(markerRef.current)
      markerRef.current = null
    }
  }, [hasPosition, latitude, longitude])

  return (
    <div
      ref={mapRef}
      className="rounded-md overflow-hidden border border-gray-300 [&_.leaflet-container]:z-0"
      style={{ height }}
    />
  )
}
