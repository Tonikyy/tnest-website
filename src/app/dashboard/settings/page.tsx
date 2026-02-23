'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import BusinessLocationForm from '@/components/dashboard/BusinessLocationForm'
import BusinessProfileForm from '@/components/dashboard/BusinessProfileForm'
import AccountSettingsForm from '@/components/dashboard/AccountSettingsForm'

interface Business {
    id: string
    name: string
    type: string
    address: string | null
    latitude: number | null
    longitude: number | null
}

interface UserProfile {
    id: string
    name: string | null
    email: string
}

export default function SettingsPage() {
    const { data: session, status, update } = useSession()
    const [business, setBusiness] = useState<Business | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    const [loadingBusiness, setLoadingBusiness] = useState(true)
    const [loadingUser, setLoadingUser] = useState(true)

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

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/user/profile')
            if (response.ok) {
                const data = await response.json()
                setUserProfile(data)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setLoadingUser(false)
        }
    }

    useEffect(() => {
        if (session?.user?.businessId) {
            fetchBusiness()
            fetchUser()
        }
    }, [session])

    if (status === 'loading' || (status === 'authenticated' && (loadingBusiness || loadingUser))) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!session || !session.user.businessId) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage your business presence and personal account details.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Section 1: Business Profile */}
                        <section>
                            <BusinessProfileForm
                                initialName={business?.name}
                                initialType={business?.type}
                                onSuccess={() => {
                                    fetchBusiness()
                                    alert('Business profile updated successfully!')
                                }}
                            />
                        </section>

                        {/* Section 2: Location */}
                        <section>
                            <BusinessLocationForm
                                initialAddress={business?.address}
                                initialLatitude={business?.latitude}
                                initialLongitude={business?.longitude}
                                onSuccess={() => {
                                    fetchBusiness()
                                    alert('Business location updated successfully!')
                                }}
                            />
                        </section>

                        {/* Section 3: Account */}
                        <section>
                            <AccountSettingsForm
                                initialName={userProfile?.name}
                                initialEmail={userProfile?.email}
                                onSuccess={async () => {
                                    await fetchUser()
                                    await update() // Force NextAuth to refresh the session so NavBar updates
                                    alert('Account settings updated successfully!')
                                }}
                            />
                        </section>
                    </div>

                </div>
            </main>
        </div>
    )
}
