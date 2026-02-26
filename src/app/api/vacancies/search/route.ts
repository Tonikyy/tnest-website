import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { haversineDistanceKm } from '@/lib/haversine'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest | Request) {
  try {
    const searchParams =
      'nextUrl' in req && req.nextUrl
        ? req.nextUrl.searchParams
        : new URL(req.url).searchParams
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const maxDistanceKmParam = searchParams.get('maxDistanceKm')
    const serviceType = searchParams.get('serviceType')?.trim() || undefined

    const lat = latParam != null ? parseFloat(latParam) : NaN
    const lng = lngParam != null ? parseFloat(lngParam) : NaN
    const maxDistanceKm = maxDistanceKmParam != null ? parseFloat(maxDistanceKmParam) : undefined

    const vacancies = await prisma.vacancy.findMany({
      where: {
        status: 'ACTIVE',
        business: {
          latitude: { not: null },
          longitude: { not: null },
        },
        ...(serviceType ? { serviceType: { contains: serviceType } } : {}),
      },
      include: {
        business: {
          select: { id: true, name: true, type: true, address: true, latitude: true, longitude: true },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    let results = vacancies.map((v) => ({
      ...v,
      distanceKm:
        !Number.isNaN(lat) && !Number.isNaN(lng) && v.business.latitude != null && v.business.longitude != null
          ? haversineDistanceKm(lat, lng, v.business.latitude, v.business.longitude)
          : null,
    }))

    if (typeof maxDistanceKm === 'number' && !Number.isNaN(maxDistanceKm) && maxDistanceKm >= 0) {
      results = results.filter((r) => r.distanceKm != null && r.distanceKm <= maxDistanceKm)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching vacancies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
