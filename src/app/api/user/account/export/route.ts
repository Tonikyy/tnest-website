import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role === 'BUSINESS') {
    return NextResponse.json({ error: 'Account export here is only available for customer accounts' }, { status: 403 })
  }

  try {
    const [user, settings, bookings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      (prisma as any).customerSettings.findUnique({
        where: { userId: session.user.id },
        select: {
          notifyBookingReminders: true,
          notifyCancellationAlerts: true,
          notifyMarketing: true,
          defaultMaxDistanceKm: true,
          defaultServiceType: true,
          homeAddress: true,
          shareLocationOnSearch: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.vacancy.findMany({
        where: { bookedById: session.user.id },
        select: {
          id: true,
          startTime: true,
          duration: true,
          serviceType: true,
          status: true,
          bookedAt: true,
          business: {
            select: {
              id: true,
              name: true,
              type: true,
              address: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      user,
      settings,
      bookings,
    })
  } catch (error) {
    console.error('Error exporting account data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
