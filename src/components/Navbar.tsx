'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Logo from './Logo'

export default function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white dark:bg-slate-500 shadow-sm border-b border-gray-200 dark:border-slate-400 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <div className="w-[120px]">
              <Logo />
            </div>
            {session?.user?.role && (
              <span className="hidden sm:block text-xs font-medium text-gray-400 uppercase tracking-widest border-l pl-4 border-gray-200 dark:border-gray-700">
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
                  className="text-text-primary dark:text-gray-100 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href={session.user.role === 'BUSINESS' ? '/dashboard/settings' : '/customer/settings'}
                  className="text-text-primary dark:text-gray-100 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Settings
                </Link>

                <div className="relative ml-3" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                      {session.user.email?.[0].toUpperCase()}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in duration-100">
                      <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                        <p className="text-xs text-gray-500 font-medium truncate">Logged in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {session.user.name || session.user.email}
                        </p>
                      </div>
                      <Link
                        href={session.user.role === 'BUSINESS' ? '/dashboard/settings' : '/customer/settings'}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>

                      {mounted && (
                        <div className="px-4 py-2 border-t border-gray-50 dark:border-gray-800">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
                            <button
                              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          signOut({ callbackUrl: '/login' })
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-50 dark:border-gray-800 transition-colors"
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
                  className="text-text-primary dark:text-gray-100 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
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
