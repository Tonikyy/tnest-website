'use client'

import { format } from 'date-fns'
import { TrashIcon } from '@heroicons/react/24/outline'
import { formatEur, businessReceivesCents, PLATFORM_FEE_EUR } from '@/lib/pricing'

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
}

export default function VacancyList({ vacancies, onDelete, loading }: VacancyListProps) {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (vacancies.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No active vacancies posted yet.</p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-md border border-gray-100">
            <ul className="divide-y divide-gray-200">
                {vacancies.map((vacancy) => (
                    <li key={vacancy.id}>
                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-primary truncate">
                                        {vacancy.serviceType}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(vacancy.startTime), 'p')} ({vacancy.duration} min)
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Customer pays {formatEur(vacancy.priceCents)} → You receive {formatEur(businessReceivesCents(vacancy.priceCents))} (fee €{PLATFORM_FEE_EUR})
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-medium text-gray-900">
                                            {format(new Date(vacancy.startTime), 'MMM d, yyyy')}
                                        </p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vacancy.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {vacancy.status}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onDelete(vacancy.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete vacancy"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            {vacancy.notes && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-400 italic">
                                        Note: {vacancy.notes}
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
