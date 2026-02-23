'use client'

import { useState } from 'react'

interface AccountSettingsFormProps {
    initialName?: string | null
    initialEmail?: string
    onSuccess: () => void
}

export default function AccountSettingsForm({
    initialName = '',
    initialEmail = '',
    onSuccess,
}: AccountSettingsFormProps) {
    const [name, setName] = useState(initialName || '')
    // We make email explicitly read-only for now since changing it introduces auth complexities
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Failed to update account')
            }

            onSuccess()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Account Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage your personal account information and login details.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">{error}</div>
            )}

            <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Name
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="ownerName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Toni H."
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Login Email
                </label>
                <div className="mt-1">
                    <input
                        type="email"
                        id="email"
                        value={initialEmail}
                        readOnly
                        disabled
                        className="input-field bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-700"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Your login email cannot be changed at this time.</p>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading || name === (initialName || '')}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving…' : 'Save Account Settings'}
                </button>
            </div>
        </form>
    )
}
