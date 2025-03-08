'use client'

import { useState, useEffect } from 'react'

type ThemePreference = 'light' | 'dark'

/**
 * Hook personalizado para detectar la preferencia de tema del sistema
 * @returns El tema preferido del sistema (light o dark)
 */
export function useSystemTheme(): ThemePreference {
  const [systemTheme, setSystemTheme] = useState<ThemePreference>('light')

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    // Función para detectar el tema del sistema
    const detectTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setSystemTheme(prefersDark ? 'dark' : 'light')
    }

    // Detectar tema inicial
    detectTheme()

    // Crear listener para cambios en el tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Agregar listener para detectar cambios
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange)
    }

    // Limpiar listener
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Fallback para navegadores antiguos
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return systemTheme
} 