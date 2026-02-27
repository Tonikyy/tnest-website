'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import BrandSpinner from '@/components/BrandSpinner'
import AccountSettingsForm from '@/components/dashboard/AccountSettingsForm'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface CustomerSettings {
  notifyBookingReminders: boolean
  notifyCancellationAlerts: boolean
  notifyMarketing: boolean
  defaultMaxDistanceKm: number
  defaultServiceType: string
  homeAddress: string
  shareLocationOnSearch: boolean
}

const DEFAULT_SETTINGS: CustomerSettings = {
  notifyBookingReminders: true,
  notifyCancellationAlerts: true,
  notifyMarketing: false,
  defaultMaxDistanceKm: 10,
  defaultServiceType: '',
  homeAddress: '',
  shareLocationOnSearch: false,
}

export default function CustomerSettingsPage() {
  const { data: session, status, update } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<CustomerSettings>(DEFAULT_SETTINGS)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [dangerLoading, setDangerLoading] = useState(false)

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoadingUser(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/customer-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch customer settings:', error)
    } finally {
      setLoadingSettings(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchUser()
      fetchSettings()
    }
  }, [session?.user?.id])

  if (status === 'loading' || (status === 'authenticated' && (loadingUser || loadingSettings))) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 transition-colors duration-200">
        <div className="flex justify-center">
          <BrandSpinner size={148} />
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/login?type=customer')
  }

  if (session.user.role === 'BUSINESS') {
    redirect('/dashboard/settings')
  }

  const userInitial = (session.user.name?.[0] || session.user.email?.[0] || '?').toUpperCase()

  const savePreferences = async () => {
    setSavingSettings(true)
    setSettingsError(null)
    try {
      const response = await fetch('/api/user/customer-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to save preferences')
      }

      const data = await response.json()
      setSettings(data)
      alert('Preferences saved successfully!')
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Failed to save preferences')
    } finally {
      setSavingSettings(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/user/account/export')
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to export account data')
      }
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'timenest-account-export.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to export account data')
    }
  }

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'This will permanently delete your customer account and remove your booking links. This cannot be undone. Continue?'
    )
    if (!confirmed) return

    setDangerLoading(true)
    try {
      const response = await fetch('/api/user/account', { method: 'DELETE' })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete account')
      }
      await signOut({ callbackUrl: '/login?type=customer' })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete account')
      setDangerLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customer Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account, notifications, booking defaults, and privacy controls.
          </p>
        </div>

        <div className="mb-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm p-4 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden border border-primary/20">
              {userProfile?.image ? (
                <img src={userProfile.image} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{userProfile?.name || session.user.name || 'Customer'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userProfile?.email || session.user.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <AccountSettingsForm
              initialName={userProfile?.name}
              initialEmail={userProfile?.email}
              initialImage={userProfile?.image}
              enableProfileImage
              onSuccess={async (updatedUser) => {
                await fetchUser()
                await update({
                  user: {
                    name: updatedUser?.name ?? userProfile?.name ?? null,
                  },
                })
                alert('Account settings updated successfully!')
              }}
            />
          </section>

          <section className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage login safety and password recovery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/forgot-password" className="btn-primary">
                Reset Password
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login?type=customer' })}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </section>

          <section className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Notification Preferences</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose what customer emails you want from TimeNest.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyBookingReminders}
                onChange={(e) => setSettings((prev) => ({ ...prev, notifyBookingReminders: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Booking reminders for upcoming appointments.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyCancellationAlerts}
                onChange={(e) => setSettings((prev) => ({ ...prev, notifyCancellationAlerts: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Cancellation and schedule change alerts.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyMarketing}
                onChange={(e) => setSettings((prev) => ({ ...prev, notifyMarketing: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Product updates and occasional promotions.</span>
            </label>
          </section>

          <section className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Booking Preferences</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set defaults used in your customer vacancy search.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-gray-700 dark:text-gray-300">Default max distance (km)</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={settings.defaultMaxDistanceKm}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      defaultMaxDistanceKm: Number.isFinite(Number(e.target.value))
                        ? Number(e.target.value)
                        : prev.defaultMaxDistanceKm,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label text-gray-700 dark:text-gray-300">Default service type</label>
                <input
                  type="text"
                  value={settings.defaultServiceType}
                  onChange={(e) => setSettings((prev) => ({ ...prev, defaultServiceType: e.target.value }))}
                  placeholder="e.g. Haircut"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-gray-700 dark:text-gray-300">Home address (optional)</label>
              <input
                type="text"
                value={settings.homeAddress}
                onChange={(e) => setSettings((prev) => ({ ...prev, homeAddress: e.target.value }))}
                placeholder="e.g. Mannerheimintie 1, Helsinki"
                className="input-field"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.shareLocationOnSearch}
                onChange={(e) => setSettings((prev) => ({ ...prev, shareLocationOnSearch: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Automatically apply my saved home address when searching vacancies.
              </span>
            </label>
          </section>

          <section className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export your customer data or permanently delete your account.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportData}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Export My Data
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                disabled={dangerLoading}
                className="px-4 py-2 rounded-md border border-red-300 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {dangerLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </section>

          {(settingsError || savingSettings) && (
            <div className="text-sm">
              {settingsError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">{settingsError}</div>
              )}
              {!settingsError && savingSettings && (
                <div className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-3 rounded-md">Saving preferences...</div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={savePreferences}
              disabled={savingSettings}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
