import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    })

    if (!vacancy) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 })
    }

    if (vacancy.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Vacancy is no longer available' },
        { status: 400 }
      )
    }

    const updated = await prisma.vacancy.update({
      where: { id },
      data: {
        status: 'BOOKED',
        bookedById: session.user.id,
        bookedAt: new Date(),
      },
      include: {
        business: { select: { name: true, address: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error booking vacancy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
