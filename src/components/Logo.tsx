'use client'

import Link from 'next/link'

interface LogoProps {
  className?: string
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <img
        src="/images/logo.svg"
        alt="TimeNest Logo"
        className={`w-full h-auto ${className}`}
      />
    </Link>
  )
} 