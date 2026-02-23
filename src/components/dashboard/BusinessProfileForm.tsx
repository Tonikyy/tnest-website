'use client'

import { useState } from 'react'

interface BusinessProfileFormProps {
    initialName?: string
    initialType?: string
    onSuccess: () => void
}

export default function BusinessProfileForm({
    initialName = '',
    initialType = '',
    onSuccess,
}: BusinessProfileFormProps) {
    const [name, setName] = useState(initialName)
    const [type, setType] = useState(initialType)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!name.trim() || !type.trim()) {
            setError('Both Name and Type are required.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/business', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    type: type.trim(),
                }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Failed to update profile')
            }

            onSuccess()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    // Filter out email addresses from initial state for the UI so they don't look locked in
    const cleanInitialName = initialName.includes('@') ? '' : initialName

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Business Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This is how you will appear to customers booking your services.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Business Name
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder={cleanInitialName || 'e.g. Toni\'s Barbershop'}
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Business Category
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Hair Salon, Massage Therapy, Consulting"
                        required
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading || !name.trim() || !type.trim() || (name === initialName && type === initialType)}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving…' : 'Save Profile'}
                </button>
            </div>
        </form>
    )
}
