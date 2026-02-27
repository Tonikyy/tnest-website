import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function isValidDataUrlImage(value: string) {
    const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
    if (!match) {
        return { valid: false as const, error: 'Profile picture must be a valid base64 data URL' }
    }

    const mimeType = match[1].toLowerCase()
    const base64Data = match[2]
    const approxBytes = Math.floor((base64Data.length * 3) / 4)

    if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
        return { valid: false as const, error: 'Unsupported image type. Use PNG, JPG, WEBP, or GIF' }
    }

    if (approxBytes > MAX_IMAGE_BYTES) {
        return { valid: false as const, error: 'Profile picture must be 2MB or smaller' }
    }

    return { valid: true as const }
}

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, image } = body

        const data: { name?: string; image?: string | null } = {}
        if (typeof name === 'string' && name.trim().length > 0) data.name = name.trim()

        if (image !== undefined) {
            if (image === null || image === '') {
                data.image = null
            } else if (typeof image === 'string') {
                const validation = isValidDataUrlImage(image)
                if (!validation.valid) {
                    return NextResponse.json({ error: validation.error }, { status: 400 })
                }
                data.image = image
            } else {
                return NextResponse.json({ error: 'Invalid profile picture format' }, { status: 400 })
            }
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
