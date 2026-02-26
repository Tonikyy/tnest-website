import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

const DEFAULT_SETTINGS = {
  notifyBookingReminders: true,
  notifyCancellationAlerts: true,
  notifyMarketing: false,
  defaultMaxDistanceKm: 10,
  defaultServiceType: '',
  homeAddress: '',
  shareLocationOnSearch: false,
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role === 'BUSINESS') {
    return NextResponse.json({ error: 'Customer settings are only available for customer accounts' }, { status: 403 })
  }

  try {
    const settings = await (prisma as any).customerSettings.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
      select: {
        notifyBookingReminders: true,
        notifyCancellationAlerts: true,
        notifyMarketing: true,
        defaultMaxDistanceKm: true,
        defaultServiceType: true,
        homeAddress: true,
        shareLocationOnSearch: true,
      },
    })

    return NextResponse.json({
      ...settings,
      defaultServiceType: settings.defaultServiceType ?? '',
      homeAddress: settings.homeAddress ?? '',
    })
  } catch (error) {
    console.error('Error fetching customer settings:', error)
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role === 'BUSINESS') {
    return NextResponse.json({ error: 'Customer settings are only available for customer accounts' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data: {
      notifyBookingReminders?: boolean
      notifyCancellationAlerts?: boolean
      notifyMarketing?: boolean
      defaultMaxDistanceKm?: number
      defaultServiceType?: string | null
      homeAddress?: string | null
      shareLocationOnSearch?: boolean
    } = {}

    if (typeof body.notifyBookingReminders === 'boolean') {
      data.notifyBookingReminders = body.notifyBookingReminders
    }
    if (typeof body.notifyCancellationAlerts === 'boolean') {
      data.notifyCancellationAlerts = body.notifyCancellationAlerts
    }
    if (typeof body.notifyMarketing === 'boolean') {
      data.notifyMarketing = body.notifyMarketing
    }
    if (typeof body.shareLocationOnSearch === 'boolean') {
      data.shareLocationOnSearch = body.shareLocationOnSearch
    }
    if (body.defaultMaxDistanceKm !== undefined) {
      const parsedDistance = Number(body.defaultMaxDistanceKm)
      if (!Number.isFinite(parsedDistance) || parsedDistance < 1 || parsedDistance > 200) {
        return NextResponse.json({ error: 'defaultMaxDistanceKm must be a number between 1 and 200' }, { status: 400 })
      }
      data.defaultMaxDistanceKm = Math.round(parsedDistance)
    }
    if (body.defaultServiceType !== undefined) {
      const value = String(body.defaultServiceType).trim()
      data.defaultServiceType = value.length > 0 ? value : null
    }
    if (body.homeAddress !== undefined) {
      const value = String(body.homeAddress).trim()
      data.homeAddress = value.length > 0 ? value : null
    }

    const settings = await (prisma as any).customerSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: data,
      select: {
        notifyBookingReminders: true,
        notifyCancellationAlerts: true,
        notifyMarketing: true,
        defaultMaxDistanceKm: true,
        defaultServiceType: true,
        homeAddress: true,
        shareLocationOnSearch: true,
      },
    })

    return NextResponse.json({
      ...settings,
      defaultServiceType: settings.defaultServiceType ?? '',
      homeAddress: settings.homeAddress ?? '',
    })
  } catch (error) {
    console.error('Error updating customer settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
