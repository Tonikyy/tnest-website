import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { name, businessName, businessType, email, password, role } = await req.json()

    console.log('Registration attempt for email:', email, 'role:', role)

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (role === 'BUSINESS' && (!businessName || !businessType)) {
      return NextResponse.json(
        { error: 'Missing business information' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (and business if applicable) in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let businessId = null

      if (role === 'BUSINESS') {
        const business = await tx.business.create({
          data: {
            name: businessName,
            type: businessType,
          }
        })
        businessId = business.id
      }

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name || null,
          businessId: businessId,
          role: role as any, // Using any here to avoid TS enum mismatch if prisma client isn't fully regenerated
        }
      })

      return user
    })

    console.log('User registered successfully:', result.email)

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          businessId: result.businessId,
          role: result.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}