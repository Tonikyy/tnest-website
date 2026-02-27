'use client'

import { format } from 'date-fns'
import { TrashIcon } from '@heroicons/react/24/outline'
import { formatEur, businessReceivesCents, PLATFORM_FEE_EUR } from '@/lib/pricing'
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

interface VacancyListProps {
    vacancies: Vacancy[]
    onDelete: (id: string) => void
    loading: boolean
    businessLogo?: string | null
    businessName?: string
}

export default function VacancyList({ vacancies, onDelete, loading, businessLogo, businessName = 'Business' }: VacancyListProps) {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <BrandSpinner size={96} />
            </div>
        )
    }

    if (vacancies.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No active vacancies posted yet.</p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden bg-white dark:bg-gray-900 shadow sm:rounded-md border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {vacancies.map((vacancy) => (
                    <li key={vacancy.id}>
                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden border border-primary/20 flex-shrink-0">
                                        {businessLogo ? (
                                            <img src={businessLogo} alt="Business logo" className="h-full w-full object-cover" />
                                        ) : (
                                            businessName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-bold text-primary truncate">
                                            {vacancy.serviceType}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(vacancy.startTime), 'p')} ({vacancy.duration} min)
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                                            Customer pays {formatEur(vacancy.priceCents)} → You receive {formatEur(businessReceivesCents(vacancy.priceCents))} (fee €{PLATFORM_FEE_EUR})
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {format(new Date(vacancy.startTime), 'MMM d, yyyy')}
                                        </p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vacancy.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                            {vacancy.status}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onDelete(vacancy.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        title="Delete vacancy"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            {vacancy.notes && (
                                <div className="mt-2 text-gray-500 dark:text-gray-400">
                                    <p className="text-xs italic">
                                        {vacancy.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
