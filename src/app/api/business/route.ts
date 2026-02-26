import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.businessId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.businessId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { address, latitude, longitude, name, type } = body

    const data: { address?: string; latitude?: number; longitude?: number; name?: string; type?: string } = {}
    if (typeof address === 'string') data.address = address
    if (typeof latitude === 'number' && !Number.isNaN(latitude)) data.latitude = latitude
    if (typeof longitude === 'number' && !Number.isNaN(longitude)) data.longitude = longitude
    if (typeof name === 'string' && name.trim().length > 0) data.name = name.trim()
    if (typeof type === 'string' && type.trim().length > 0) data.type = type.trim()

    const business = await prisma.business.update({
      where: { id: session.user.businessId },
      data,
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
