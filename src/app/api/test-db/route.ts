import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'

export async function GET() {
  try {
    await dbConnect()
    return NextResponse.json({ status: 'Connected to MongoDB successfully!' })
  } catch (error: any) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to MongoDB', details: error.message },
      { status: 500 }
    )
  }
} 