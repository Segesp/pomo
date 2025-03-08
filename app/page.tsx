'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-secondary">
          Pomodoro Timer App
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Mejora tu productividad con la técnica Pomodoro. Registra tus sesiones y visualiza tu progreso en el tiempo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {status === 'loading' ? (
            <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-32"></div>
          ) : status === 'authenticated' ? (
            <Link href="/dashboard" className="btn btn-primary">
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Registrarse
              </Link>
            </>
          )}
        </div>
        
        <div className="mt-16 card max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">¿Qué es la técnica Pomodoro?</h2>
          <p className="mb-4">
            La técnica Pomodoro es un método de gestión del tiempo que te ayuda a mantener la concentración y evitar la fatiga mental.
          </p>
          <ol className="list-decimal list-inside text-left space-y-2 mb-4">
            <li>Elige una tarea a realizar</li>
            <li>Configura el temporizador (normalmente 25 minutos)</li>
            <li>Trabaja en la tarea hasta que suene el temporizador</li>
            <li>Toma un breve descanso (5 minutos)</li>
            <li>Después de cuatro pomodoros, toma un descanso más largo (15-30 minutos)</li>
          </ol>
        </div>
      </div>
    </main>
  )
} 