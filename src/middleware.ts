import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isBusinessArea = req.nextUrl.pathname.startsWith('/dashboard')
    const isCustomerArea = req.nextUrl.pathname.startsWith('/customer')
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/signup') ||
      req.nextUrl.pathname.startsWith('/forgot-password')

    if (isAuthPage) {
      if (isAuth) {
        const dashboard = token.role === 'BUSINESS' ? '/dashboard' : '/customer/dashboard'
        return NextResponse.redirect(new URL(dashboard, req.url))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      const loginType = isBusinessArea ? 'business' : isCustomerArea ? 'customer' : undefined
      const loginPath = loginType
        ? `/login?type=${loginType}&from=${encodeURIComponent(from)}`
        : `/login?from=${encodeURIComponent(from)}`

      return NextResponse.redirect(
        new URL(loginPath, req.url)
      )
    }

    if (isBusinessArea && token.role !== 'BUSINESS') {
      return NextResponse.redirect(new URL('/customer/dashboard', req.url))
    }

    if (isCustomerArea && token.role === 'BUSINESS') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customer/:path*',
    '/settings/:path*'
  ]
} 
