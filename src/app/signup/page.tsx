'use client'

import Link from 'next/link'
import SignUpForm from '../components/SignUpForm'
import { useSearchParams } from 'next/navigation'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const defaultType = (searchParams.get('type') as 'business' | 'customer') || 'business'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {defaultType === 'business' ? 'Create your business account' : 'Create your customer account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href={`/login?type=${defaultType}`} className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm initialType={defaultType} />
        </div>
      </div>
    </div>
  )
}