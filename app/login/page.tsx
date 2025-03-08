'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRegistered = searchParams.get('registered')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Todos los campos son obligatorios')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      
      if (result?.error) {
        setError('Credenciales inválidas')
        return
      }
      
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError('Ha ocurrido un error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {isRegistered && (
          <div className="success-message mb-6">
            ¡Registro exitoso! Por favor, inicia sesión.
          </div>
        )}
        
        <div className="card space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-gray-600">
              Inicia sesión para continuar con tu progreso
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <FiArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                ¿No tienes una cuenta?
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/register" 
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              Crear cuenta
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de carga para el Suspense
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  )
} 