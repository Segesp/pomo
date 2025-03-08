import { AuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { Document } from 'mongoose'

// Definir la interfaz para el documento de usuario
interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
}

// Extender los tipos de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        try {
          await connectDB()
          
          const user = await User.findOne({ email: credentials.email }).lean<IUser>()
          
          if (!user) {
            throw new Error('Email o contraseña incorrectos')
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )
          
          if (!isPasswordValid) {
            throw new Error('Email o contraseña incorrectos')
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          }
        } catch (error: any) {
          console.error('Error en autenticación:', error)
          throw new Error(error.message || 'Error al intentar iniciar sesión')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 