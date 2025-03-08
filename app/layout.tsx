import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/options'
import { SessionProvider } from 'next-auth/react'
import { AppProvider } from '@/context/AppContext'
import ThemeProvider from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '🍅 Pomodoro App',
  description: 'Aplicación de productividad basada en la técnica Pomodoro'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>🍅 Pomodoro App</title>
        <meta name="description" content="Aplicación de productividad basada en la técnica Pomodoro" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <SessionProvider session={session}>
          <AppProvider>
            <ThemeProvider>
              <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-200">
                {children}
              </div>
            </ThemeProvider>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 