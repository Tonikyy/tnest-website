'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import CustomerDashboard from '@/components/customer/CustomerDashboard'
import BrandSpinner from '@/components/BrandSpinner'

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession()

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
          <CustomerDashboard />
        </div>
      </main>
    </div>
  )
}
