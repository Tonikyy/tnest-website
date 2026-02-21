import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.businessId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const vacancies = await prisma.vacancy.findMany({
            where: {
                businessId: session.user.businessId,
            },
            orderBy: {
                startTime: 'asc',
            },
        })

        return NextResponse.json(vacancies)
    } catch (error) {
        console.error('Error fetching vacancies:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.businessId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const business = await prisma.business.findUnique({
            where: { id: session.user.businessId },
        })
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        }
        if (business.latitude == null || business.longitude == null) {
            return NextResponse.json(
                {
                    error: 'Please set your business location before posting a vacancy.',
                    code: 'LOCATION_REQUIRED',
                },
                { status: 400 }
            )
        }

        const { startTime, duration, serviceType, notes, price } = await req.json()

        if (!startTime || !duration || !serviceType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const priceNum = price != null ? Number(price) : NaN
        if (Number.isNaN(priceNum) || priceNum < 5) {
            return NextResponse.json(
                { error: 'Price is required and must be at least €5 (platform fee).' },
                { status: 400 }
            )
        }
        const priceCents = Math.round(priceNum * 100)

        const vacancy = await prisma.vacancy.create({
            data: {
                businessId: session.user.businessId,
                startTime: new Date(startTime),
                duration: parseInt(duration),
                serviceType,
                priceCents,
                notes,
                status: 'ACTIVE',
            },
        })

        return NextResponse.json(vacancy, { status: 201 })
    } catch (error) {
        console.error('Error creating vacancy:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
