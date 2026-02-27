import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authorizeUser } from '@/lib/auth-utils'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
      },
      async authorize(credentials) {
        return await authorizeUser(credentials)
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const { image: _image, picture: _picture, ...tokenWithoutImage } = token as any

      if (user) {
        return {
          ...tokenWithoutImage,
          id: user.id,
          role: user.role,
          name: user.name || (user as any).business?.name || null,
          businessId: user.businessId,
        }
      }

      if (trigger === 'update' && session) {
        const sessionUser = (session as any).user
        const nextName = sessionUser?.name ?? (session as any).name ?? token.name ?? null

        return {
          ...tokenWithoutImage,
          name: nextName,
        }
      }

      return tokenWithoutImage
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string | null
        session.user.businessId = token.businessId as string | undefined
      }
      return session
    },
  },
}
