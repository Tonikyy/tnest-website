'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import CustomerDashboard from '@/components/customer/CustomerDashboard'
import BrandSpinner from '@/components/BrandSpinner'

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!session?.user?.id) {
        setProfileImage(null)
        return
      }

      try {
        const response = await fetch('/api/user/profile')
        if (!response.ok) return
        const data = await response.json()
        setProfileImage(data.image || null)
      } catch {
        setProfileImage(null)
      }
    }

    fetchProfileImage()
  }, [session?.user?.id])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 transition-colors duration-200">
        <div className="flex justify-center">
          <BrandSpinner size={148} />
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/login?type=customer')
  }

  if (session.user.role === 'BUSINESS') {
    redirect('/dashboard')
  }

  const userInitial = (session.user.name?.[0] || session.user.email?.[0] || '?').toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Find & book</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Search for available slots by location and service. Sign in to book and manage your bookings.
            </p>
          </div>

          <div className="mb-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden border border-primary/20">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{session.user.name || 'Customer'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>

          <CustomerDashboard />
        </div>
      </main>
    </div>
  )
}
