'use client'

import { useState } from 'react'
import { PLATFORM_FEE_EUR, businessReceivesCents, formatEur } from '@/lib/pricing'

interface VacancyFormProps {
    onSuccess: () => void
    onLocationRequired?: () => void
}

export default function VacancyForm({ onSuccess, onLocationRequired }: VacancyFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [priceEur, setPriceEur] = useState<string>('')

    const priceNum = priceEur !== '' ? parseFloat(priceEur) : NaN
    const priceCents = !Number.isNaN(priceNum) && priceNum >= 0 ? Math.round(priceNum * 100) : 0
    const youReceiveCents = priceCents >= 0 ? businessReceivesCents(priceCents) : 0

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            startTime: formData.get('startTime'),
            duration: formData.get('duration'),
            serviceType: formData.get('serviceType'),
            notes: formData.get('notes'),
            price: priceEur ? parseFloat(priceEur) : undefined,
        }

        try {
            const response = await fetch('/api/vacancies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const result = await response.json()
                if (result.code === 'LOCATION_REQUIRED' && onLocationRequired) {
                  onLocationRequired()
                  return
                }
                throw new Error(result.error || 'Failed to create vacancy')
            }

            onSuccess()
            ;(e.target as HTMLFormElement).reset()
            setPriceEur('')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create vacancy')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post a Cancellation</h3>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        id="startTime"
                        name="startTime"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                        Duration (minutes)
                    </label>
                    <input
                        type="number"
                        id="duration"
                        name="duration"
                        required
                        min="5"
                        step="5"
                        defaultValue="60"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                        Service Type
                    </label>
                    <input
                        type="text"
                        id="serviceType"
                        name="serviceType"
                        required
                        placeholder="e.g. Haircut, Massage, Consulting"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Price (customer pays)
                    </label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        required
                        min="5"
                        step="0.01"
                        value={priceEur}
                        onChange={(e) => setPriceEur(e.target.value)}
                        placeholder="e.g. 60"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Minimum €5. TimeNest fee: €{PLATFORM_FEE_EUR} per booking.
                    </p>
                    {!Number.isNaN(priceNum) && priceNum >= 5 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                            <p className="text-gray-700">Customer pays {formatEur(priceCents)}.</p>
                            <p className="font-medium text-gray-900">You receive {formatEur(youReceiveCents)}.</p>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    ></textarea>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
                {loading ? 'Posting...' : 'Post Vacancy'}
            </button>
        </form>
    )
}
