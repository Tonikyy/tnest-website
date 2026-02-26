import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

export async function DELETE() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role === 'BUSINESS') {
    return NextResponse.json({ error: 'Customer account deletion endpoint is only available for customer accounts' }, { status: 403 })
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      await tx.vacancy.updateMany({
        where: { bookedById: session.user.id },
        data: {
          bookedById: null,
          bookedAt: null,
          status: 'ACTIVE',
        },
      })

      await tx.customerSettings.deleteMany({
        where: { userId: session.user.id },
      })

      await tx.user.delete({
        where: { id: session.user.id },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
