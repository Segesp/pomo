'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">Pomodoro</span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            {session ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 text-secondary hover:text-primary">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-secondary hover:text-primary"
                >
                  Cerrar Sesión
                </button>
                <div className="ml-4 flex items-center">
                  <div className="text-sm font-medium text-secondary">
                    {session.user?.name || session.user?.email}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 text-secondary hover:text-primary">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-primary"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {session ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-secondary hover:text-primary"
                >
                  Cerrar Sesión
                </button>
                <div className="px-3 py-2 text-base font-medium text-secondary">
                  {session.user?.name || session.user?.email}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="block px-3 py-2 btn btn-primary w-full text-center mt-2">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 