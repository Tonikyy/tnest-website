import Logo from '@/components/Logo'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-[400px] max-w-full mx-auto mb-16">
            <Logo />
          </div>
          
          <h1 className="text-[40px] sm:text-[48px] font-serif mb-4 leading-tight">
            Smart Cancellation<br />
            Management for Your Business
          </h1>
          
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-12">
            Streamline your business operations with TimeNest. Manage cancellations,
            appointments, and customer communications all in one place.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="bg-gray-100 text-text-primary px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        <section className="mt-32">
          <h2 className="text-3xl font-serif text-center mb-12">
            Everything you need to manage cancellations
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
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
          </div>
        </section>
      </div>
    </main>
  )
} 