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
        const { startTime, duration, serviceType, notes } = await req.json()

        if (!startTime || !duration || !serviceType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const vacancy = await prisma.vacancy.create({
            data: {
                businessId: session.user.businessId,
                startTime: new Date(startTime),
                duration: parseInt(duration),
                serviceType,
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
