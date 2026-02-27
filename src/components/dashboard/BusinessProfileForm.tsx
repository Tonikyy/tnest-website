'use client'

import { useState } from 'react'

interface BusinessProfileFormProps {
    initialName?: string
    initialType?: string
    initialLogo?: string | null
    onSuccess: () => void
}

export default function BusinessProfileForm({
    initialName = '',
    initialType = '',
    initialLogo = null,
    onSuccess,
}: BusinessProfileFormProps) {
    const [name, setName] = useState(initialName)
    const [type, setType] = useState(initialType)
    const [logo, setLogo] = useState(initialLogo || '')
    const [logoError, setLogoError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const logoChanged = (initialLogo || '') !== logo

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setLogoError(null)
        const file = e.target.files?.[0]

        if (!file) {
            return
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setLogoError('Unsupported image type. Use PNG, JPG, WEBP, or GIF.')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setLogoError('Logo must be 2MB or smaller.')
            return
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result || ''))
            reader.onerror = () => reject(new Error('Failed to read image file'))
            reader.readAsDataURL(file)
        })

        setLogo(dataUrl)
    }

    const removeLogo = () => {
        setLogoError(null)
        setLogo('')
    }

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
                    ...(logoChanged ? { logo: logo || null } : {}),
                }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Failed to update profile')
            }

            window.dispatchEvent(new Event('branding-updated'))
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

            <div>
                <label className="block text-sm font-medium text-gray-700">Business Logo</label>
                <div className="mt-2 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                        {logo ? (
                            <img src={logo} alt="Business logo preview" className="h-full w-full object-cover" />
                        ) : (
                            'No logo'
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <label className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                            Upload Logo
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </label>
                        {logo && (
                            <button
                                type="button"
                                onClick={removeLogo}
                                className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP or GIF. Max size 2MB.</p>
                {logoError && (
                    <p className="mt-2 text-sm text-red-600">{logoError}</p>
                )}
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading || !!logoError || !name.trim() || !type.trim() || (name === initialName && type === initialType && !logoChanged)}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving…' : 'Save Profile'}
                </button>
            </div>
        </form>
    )
}
