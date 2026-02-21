import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
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

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      )
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
    '/customer/dashboard/:path*',
    '/settings/:path*'
  ]
} 