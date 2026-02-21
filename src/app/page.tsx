'use client'

import Logo from '@/components/Logo'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [userType, setUserType] = useState<'business' | 'customer'>('business')

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-[400px] max-w-full mx-auto mb-16">
            <Logo />
          </div>

          <div className="inline-flex rounded-full bg-gray-100 p-1 mb-12">
            <button
              onClick={() => setUserType('business')}
              className={`px-6 py-2 rounded-full transition-all ${userType === 'business'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              For Businesses
            </button>
            <button
              onClick={() => setUserType('customer')}
              className={`px-6 py-2 rounded-full transition-all ${userType === 'customer'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              For Customers
            </button>
          </div>

          <h1 className="text-[40px] sm:text-[48px] font-serif mb-4 leading-tight">
            {userType === 'business' ? (
              <>Smart Cancellation<br />Management for Your Business</>
            ) : (
              <>Never Miss a<br />Last-Minute Opening</>
            )}
          </h1>

          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-12">
            {userType === 'business' ? (
              "Streamline your business operations with TimeNest. Manage cancellations, appointments, and customer communications all in one place."
            ) : (
              "Get notified about cancellations and grab last-minute spots from your favorite local businesses. Simple, fast, and convenient."
            )}
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href={`/signup?type=${userType}`}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href={`/login?type=${userType}`}
              className="bg-gray-100 text-text-primary px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        <section className="mt-32">
          <h2 className="text-3xl font-serif text-center mb-12">
            {userType === 'business' ? "Everything you need to manage cancellations" : "Why customers love TimeNest"}
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {userType === 'business' ? (
              <>
                <div className="text-center">
                  <h3 className="text-xl font-serif mb-4">Smart Scheduling</h3>
                  <p className="text-text-secondary">
                    Automatically manage and optimize your schedule based on
                    cancellations and no-shows.
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-serif mb-4">Automated Notifications</h3>
                  <p className="text-text-secondary">
                    Send automated reminders and handle cancellation requests
                    through multiple channels.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-xl font-serif mb-4">Instant Alerts</h3>
                  <p className="text-text-secondary">
                    Get notified immediately when a spot opens up at your favorite salon, spa, or clinic.
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-serif mb-4">Easy Booking</h3>
                  <p className="text-text-secondary">
                    One-tap booking for newly available slots. No more calling around to check for openings.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
