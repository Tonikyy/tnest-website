'use client'

import Link from 'next/link'
import LoginForm from '../components/LoginForm'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginHeader() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')

  const title = type === 'customer'
    ? 'Sign in to your customer account'
    : type === 'business'
      ? 'Sign in to your business account'
      : 'Sign in to your account'

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Or{' '}
        <Link href={`/signup${type ? `?type=${type}` : ''}`} className="font-medium text-primary-600 hover:text-primary-500">
          create a new account
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="sm:mx-auto sm:w-full sm:max-w-md h-20 animate-pulse bg-gray-200 rounded-lg"></div>}>
        <LoginHeader />
      </Suspense>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}