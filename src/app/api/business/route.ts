import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function isValidDataUrlImage(value: string) {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) {
    return { valid: false as const, error: 'Logo must be a valid base64 data URL' }
  }

  const mimeType = match[1].toLowerCase()
  const base64Data = match[2]
  const approxBytes = Math.floor((base64Data.length * 3) / 4)

  if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
    return { valid: false as const, error: 'Unsupported image type. Use PNG, JPG, WEBP, or GIF' }
  }

  if (approxBytes > MAX_IMAGE_BYTES) {
    return { valid: false as const, error: 'Logo must be 2MB or smaller' }
  }

  return { valid: true as const }
}

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
    const { address, latitude, longitude, name, type, logo } = body

    const data: { address?: string; latitude?: number; longitude?: number; name?: string; type?: string; logo?: string | null } = {}
    if (typeof address === 'string') data.address = address
    if (typeof latitude === 'number' && !Number.isNaN(latitude)) data.latitude = latitude
    if (typeof longitude === 'number' && !Number.isNaN(longitude)) data.longitude = longitude
    if (typeof name === 'string' && name.trim().length > 0) data.name = name.trim()
    if (typeof type === 'string' && type.trim().length > 0) data.type = type.trim()

    if (logo !== undefined) {
      if (logo === null || logo === '') {
        data.logo = null
      } else if (typeof logo === 'string') {
        const validation = isValidDataUrlImage(logo)
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        data.logo = logo
      } else {
        return NextResponse.json({ error: 'Invalid logo format' }, { status: 400 })
      }
    }

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
