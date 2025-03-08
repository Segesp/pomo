import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/options'
import SessionProvider from '@/components/SessionProvider'
import { AppProvider } from '@/context/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Estudio Integral - Sistema de Gestión de Estudio',
  description: 'Plataforma completa para gestionar tu estudio con técnicas científicamente probadas',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full`}>
        <SessionProvider session={session}>
          <AppProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
              {children}
            </div>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 