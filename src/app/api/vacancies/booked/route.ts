import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const vacancies = await prisma.vacancy.findMany({
      where: { bookedById: session.user.id },
      include: {
        business: {
          select: { id: true, name: true, type: true, address: true },
        },
      },
      orderBy: { bookedAt: 'desc' },
    })

    return NextResponse.json(vacancies)
  } catch (error) {
    console.error('Error fetching booked vacancies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
