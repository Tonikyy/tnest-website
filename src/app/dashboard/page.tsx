'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import VacancyForm from '@/components/dashboard/VacancyForm'
import VacancyList from '@/components/dashboard/VacancyList'
import BusinessLocationForm from '@/components/dashboard/BusinessLocationForm'

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your cancellations and vacancies for {session.user.email}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Vacancy List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : business && business.latitude != null && business.longitude != null && !showLocationForm ? (
                <>
                  <VacancyForm
                    onSuccess={fetchVacancies}
                    onLocationRequired={() => {
                      fetchBusiness()
                      setShowLocationForm(true)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationForm(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit business location
                  </button>
                </>
              ) : (
                <>
                  {!business?.latitude && !business?.longitude && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-lg">
                      Set your business location below so customers can find you. You need to set it before posting vacancies.
                    </div>
                  )}
                  <BusinessLocationForm
                    onSuccess={() => {
                      fetchBusiness()
                      setShowLocationForm(false)
                    }}
                    initialAddress={business?.address}
                    initialLatitude={business?.latitude}
                    initialLongitude={business?.longitude}
                  />
                  {business?.latitude != null && business?.longitude != null && (
                    <button
                      type="button"
                      onClick={() => setShowLocationForm(false)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel edit location
                    </button>
                  )}
                </>
              )}

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                    <p className="text-sm text-gray-900">{session.user.email}</p>
                  </div>
                  {session.user.businessId && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Business ID</p>
                      <p className="text-sm font-mono text-gray-600 break-all">{session.user.businessId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}