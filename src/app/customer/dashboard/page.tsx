'use client'

import { useSession } from 'next-auth/react'

export default function CustomerDashboard() {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <h1 className="text-2xl font-serif mb-4">Welcome back!</h1>
                        <p className="text-gray-600 mb-8">
                            This is your blank customer dashboard. We'll design this separately soon.
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    📅
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">My Bookings</h3>
                                <p className="text-sm text-gray-500">Coming soon</p>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    🔔
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Notifications</h3>
                                <p className="text-sm text-gray-500">Coming soon</p>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    👤
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Profile Settings</h3>
                                <p className="text-sm text-gray-500">Coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
