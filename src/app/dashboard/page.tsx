'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to your Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Logged in as: {session.user.email}
            </p>
            {session.user.businessId && (
              <p className="mt-1 text-gray-600">
                Business ID: {session.user.businessId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 