import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import clientPromise from './db'
import { User, isCustomerUser, isWorkshopUser } from '../models/User'
import { LoginSchema } from './validations'

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required')
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required')
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          // Validate input
          const validatedFields = LoginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          })

          if (!validatedFields.success) {
            console.log('Invalid input format:', validatedFields.error)
            return null
          }

          const client = await clientPromise
          const db = client.db('repair-connect')
          const usersCollection = db.collection<User>('users')

          // Find user by email
          const user = await usersCollection.findOne({
            email: credentials.email.toLowerCase(),
          })

          if (!user) {
            console.log('No user found with email:', credentials.email)
            return null
          }

          if (!user.isActive) {
            console.log('Account deactivated:', credentials.email)
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('Invalid password for:', credentials.email)
            return null
          }

          // Return user object for session
          const sessionUser = {
            id: user._id!.toString(),
            email: user.email,
            role: user.role,
            emailVerified: Boolean(user.emailVerified),
            name: isCustomerUser(user)
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : isWorkshopUser(user)
              ? user.businessInfo.businessName
              : 'Unknown User',
            image: isCustomerUser(user)
              ? user.profile.avatar
              : isWorkshopUser(user)
              ? user.ownerInfo.avatar
              : undefined,
          }

          console.log('User authenticated successfully:', sessionUser.email)
          return sessionUser

        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.role = user.role
          token.emailVerified = Boolean(user.emailVerified)
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.sub!
          session.user.role = token.role as 'customer' | 'workshop'
          session.user.emailVerified = Boolean(token.emailVerified)
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Allows relative callback URLs
        if (url.startsWith('/')) return `${baseUrl}${url}`
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url
        return baseUrl
      } catch (error) {
        console.error('Redirect callback error:', error)
        return baseUrl
      }
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email)
    },
    async signOut({ session }) {
      console.log('User signed out:', session?.user?.email)
    },
  },
  debug: process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_DEBUG === 'true',
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role: 'customer' | 'workshop'
    emailVerified: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: 'customer' | 'workshop'
      emailVerified: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'customer' | 'workshop'
    emailVerified: boolean
  }
}
