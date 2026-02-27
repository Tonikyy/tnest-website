'use client'

import { useState } from 'react'

interface AccountSettingsFormProps {
    initialName?: string | null
    initialEmail?: string
    initialImage?: string | null
    enableProfileImage?: boolean
    onSuccess: (updatedUser?: { name?: string | null; image?: string | null }) => void
}

export default function AccountSettingsForm({
    initialName = '',
    initialEmail = '',
    initialImage = null,
    enableProfileImage = false,
    onSuccess,
}: AccountSettingsFormProps) {
    const [name, setName] = useState(initialName || '')
    const [image, setImage] = useState(initialImage || '')
    const [imageError, setImageError] = useState<string | null>(null)
    // We make email explicitly read-only for now since changing it introduces auth complexities
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const imageChanged = (initialImage || '') !== image
    const nameChanged = name !== (initialName || '')

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError(null)
        const file = e.target.files?.[0]

        if (!file) {
            return
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setImageError('Unsupported image type. Use PNG, JPG, WEBP, or GIF.')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setImageError('Profile picture must be 2MB or smaller.')
            return
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result || ''))
            reader.onerror = () => reject(new Error('Failed to read image file'))
            reader.readAsDataURL(file)
        })

        setImage(dataUrl)
    }

    const removeImage = () => {
        setImageError(null)
        setImage('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    ...(enableProfileImage && imageChanged ? { image: image || null } : {}),
                }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Failed to update account')
            }

            const updatedUser = await response.json()
            onSuccess({ name: updatedUser.name ?? null, image: updatedUser.image ?? null })
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

            {enableProfileImage && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500">
                            {image ? (
                                <img src={image} alt="Profile preview" className="h-full w-full object-cover" />
                            ) : (
                                'No image'
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <label className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                            {image && (
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP or GIF. Max size 2MB.</p>
                    {imageError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{imageError}</p>
                    )}
                </div>
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
                    disabled={loading || (!nameChanged && !imageChanged) || !!imageError}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving…' : 'Save Account Settings'}
                </button>
            </div>
        </form>
    )
}
