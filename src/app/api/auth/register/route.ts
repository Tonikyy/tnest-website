import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db'
import { User } from '@/lib/models/user'
import { Business } from '@/lib/models/business'

export async function POST(req: Request) {
  try {
    const { businessName, businessType, email, password } = await req.json()

    if (!businessName || !businessType || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create business
    const business = await Business.create({
      name: businessName,
      type: businessType,
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      businessId: business._id,
      role: 'USER',
    })

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          businessId: user.businessId,
          role: user.role,
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