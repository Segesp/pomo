'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useSystemTheme } from '@/hooks/useSystemTheme'

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { state } = useAppContext()
  const systemTheme = useSystemTheme()
  const [mounted, setMounted] = useState(false)
  
  // Una vez que el componente se monta en el cliente, podemos mostrar el contenido
  // Esto evita diferencias de renderizado entre servidor y cliente (hidratación)
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Aplicar clase "dark" al elemento html cuando el tema es oscuro
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', state.theme === 'dark')
    }
  }, [state.theme, mounted])
  
  // Mientras no está montado, mostrar un placeholder con el mismo tamaño
  if (!mounted) {
    return <div className="min-h-screen" />
  }
  
  return <>{children}</>
} 