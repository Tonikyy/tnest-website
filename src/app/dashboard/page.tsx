'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import VacancyForm from '@/components/dashboard/VacancyForm'
import VacancyList from '@/components/dashboard/VacancyList'
import BrandSpinner from '@/components/BrandSpinner'

interface Vacancy {
  id: string
  startTime: string
  duration: number
  serviceType: string
  status: string
  priceCents: number
  notes?: string
}

interface Business {
  id: string
  name: string
  type: string
  address: string | null
  latitude: number | null
  longitude: number | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loadingVacancies, setLoadingVacancies] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const [showLocationForm, setShowLocationForm] = useState(false)

  const fetchBusiness = async () => {
    try {
      const response = await fetch('/api/business')
      if (response.ok) {
        const data = await response.json()
        setBusiness(data)
      }
    } catch (error) {
      console.error('Failed to fetch business:', error)
    } finally {
      setLoadingBusiness(false)
    }
  }

  const fetchVacancies = async () => {
    try {
      const response = await fetch('/api/vacancies')
      if (response.ok) {
        const data = await response.json()
        setVacancies(data)
      }
    } catch (error) {
      console.error('Failed to fetch vacancies:', error)
    } finally {
      setLoadingVacancies(false)
    }
  }

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchBusiness()
      fetchVacancies()
    }
  }, [session])

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vacancy?')) return

    try {
      const response = await fetch(`/api/vacancies/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setVacancies(vacancies.filter((v) => v.id !== id))
      } else {
        alert('Failed to delete vacancy')
      }
    } catch (error) {
      console.error('Error deleting vacancy:', error)
      alert('Error deleting vacancy')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <BrandSpinner size={148} />
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/login?type=business')
  }

  if (session.user.role !== 'BUSINESS') {
    redirect('/customer/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-4xl sm:truncate">
              Business Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your cancellations and vacancies for {session?.user?.email}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Vacancy List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center justify-between text-gray-900 dark:text-gray-100">
                Active Vacancies
                <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full">
                  {vacancies.length} Total
                </span>
              </h2>
              <VacancyList
                vacancies={vacancies}
                onDelete={handleDeleteVacancy}
                loading={loadingVacancies}
              />
            </div>
          </div>

          {/* Sidebar - Actions & Stats */}
          <div className="space-y-6">
            {loadingBusiness ? (
              <div className="bg-white shadow rounded-lg p-6 flex justify-center">
                <BrandSpinner size={96} />
              </div>
            ) : business && business.latitude != null && business.longitude != null ? (
              <VacancyForm
                onSuccess={fetchVacancies}
                onLocationRequired={() => {
                  // Using redirect instead of showing LocationForm locally
                  window.location.href = '/dashboard/settings'
                }}
              />
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg text-center">
                <h3 className="text-amber-800 dark:text-amber-400 font-semibold mb-2">Location Required</h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                  You need to set your business location in your settings before you can post vacancies to customers.
                </p>
                <Link
                  href="/dashboard/settings"
                  className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Go to Settings
                </Link>
              </div>
            )}

            {/* Business Info / Status Card */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Business Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">{session?.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business ID</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 font-mono break-all">{session?.user?.businessId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
