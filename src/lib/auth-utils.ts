import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function authorizeUser(credentials: Record<string, string> | undefined) {
    if (!credentials?.email || !credentials?.password) {
        throw new Error('Please enter an email and password')
    }

    const normalizedEmail = credentials.email.toLowerCase()

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { business: true }
    })

    if (!user) {
        throw new Error('No user found with this email')
    }

    const passwordMatch = await bcrypt.compare(credentials.password, user.password)

    if (!passwordMatch) {
        throw new Error('Incorrect password')
    }

    // Enforce role separation if userType is provided
    if (credentials.userType) {
        const requiredRole = credentials.userType.toUpperCase()
        // Allow legacy 'USER' role for both contexts, otherwise strictly check role
        if (user.role !== requiredRole && user.role !== 'USER') {
            if (requiredRole === 'BUSINESS') {
                throw new Error('This account is not registered as a business account')
            } else if (requiredRole === 'CUSTOMER') {
                throw new Error('This account is not registered as a customer account')
            }
        }
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        businessId: user.businessId || undefined,
        role: user.role,
        business: user.business || undefined
    }
}
