'use client'

import { useState, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { FiSun, FiMoon, FiMonitor, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeSettings() {
  const { state, toggleTheme } = useAppContext()
  const [isOpen, setIsOpen] = useState(false)
  const [followSystem, setFollowSystem] = useState(false)
  const systemTheme = useSystemTheme()
  
  // Efecto para sincronizar con el tema del sistema si está activada la opción
  useEffect(() => {
    if (followSystem && state.theme !== systemTheme) {
      toggleTheme()
    }
    
    // Guardar preferencia en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('followSystemTheme', followSystem ? 'true' : 'false')
    }
  }, [followSystem, systemTheme, state.theme, toggleTheme])
  
  // Cargar preferencia al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('followSystemTheme')
      if (savedPreference === 'true') {
        setFollowSystem(true)
      }
    }
  }, [])
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      setFollowSystem(true)
      // Aplicar inmediatamente el tema del sistema
      if (state.theme !== systemTheme) {
        toggleTheme()
      }
    } else {
      setFollowSystem(false)
      if ((theme === 'dark' && state.theme === 'light') || 
          (theme === 'light' && state.theme === 'dark')) {
        toggleTheme()
      }
    }
    setIsOpen(false)
  }
  
  return (
    <div className="relative">
      {/* Botón para abrir el menú */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label="Configuración de tema"
      >
        <FiMonitor className="w-5 h-5" />
      </button>
      
      {/* Menú desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border"
          >
            <div className="p-2 flex justify-between items-center border-b border-border">
              <h3 className="font-medium">Tema</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Cerrar"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center w-full p-2 rounded-md ${state.theme === 'light' && !followSystem ? 'bg-primary/10' : 'hover:bg-secondary'}`}
              >
                <FiSun className="w-5 h-5 mr-2" />
                <span>Claro</span>
                {state.theme === 'light' && !followSystem && (
                  <span className="ml-auto text-xs font-medium text-primary">Activo</span>
                )}
              </button>
              
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center w-full p-2 rounded-md ${state.theme === 'dark' && !followSystem ? 'bg-primary/10' : 'hover:bg-secondary'}`}
              >
                <FiMoon className="w-5 h-5 mr-2" />
                <span>Oscuro</span>
                {state.theme === 'dark' && !followSystem && (
                  <span className="ml-auto text-xs font-medium text-primary">Activo</span>
                )}
              </button>
              
              <button
                onClick={() => handleThemeChange('system')}
                className={`flex items-center w-full p-2 rounded-md ${followSystem ? 'bg-primary/10' : 'hover:bg-secondary'}`}
              >
                <FiMonitor className="w-5 h-5 mr-2" />
                <span>Sistema</span>
                {followSystem && (
                  <span className="ml-auto text-xs font-medium text-primary">Activo</span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 