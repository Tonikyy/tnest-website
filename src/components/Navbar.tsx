'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Logo from './Logo'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="w-[120px]">
            <Logo />
          </div>
          
          <div className="flex space-x-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-text-primary hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="text-text-primary hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-text-primary hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 