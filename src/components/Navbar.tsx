'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Logo from './Logo'

export default function Navbar() {
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <div className="w-[120px]">
              <Logo />
            </div>
            {session?.user?.role && (
              <span className="hidden sm:block text-xs font-medium text-gray-400 uppercase tracking-widest border-l pl-4 border-gray-200">
                {session.user.role === 'BUSINESS'
                  ? (session.user.name || 'Business Side')
                  : (session.user.name || 'Customer')}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href={session.user.role === 'BUSINESS' ? '/dashboard' : '/customer/dashboard'}
                  className="text-text-primary hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="text-text-primary hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Settings
                </Link>

                <div className="relative ml-3" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                      {session.user.email?.[0].toUpperCase()}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in duration-100">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs text-gray-500 font-medium truncate">Logged in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {session.user.name || session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          signOut({ callbackUrl: '/login' })
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
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
                  className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
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