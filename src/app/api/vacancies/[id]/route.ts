import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.businessId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    try {
        // Check if the vacancy belongs to the business
        const vacancy = await prisma.vacancy.findUnique({
            where: { id },
        })

        if (!vacancy) {
            return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 })
        }

        if (vacancy.businessId !== session.user.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.vacancy.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Vacancy deleted successfully' })
    } catch (error) {
        console.error('Error deleting vacancy:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
