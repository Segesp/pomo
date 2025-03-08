'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

// Definir tipos para el tema
type Theme = 'light' | 'dark'

// Definir tipos para el estado global
interface AppState {
  theme: Theme
  sidebarOpen: boolean
  notifications: Notification[]
  userPreferences: UserPreferences
  lastVisitedTabs: Record<string, string>
}

// Definir tipos para notificaciones
interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  date: Date
}

// Definir tipos para preferencias de usuario
interface UserPreferences {
  pomodoroConfig: {
    workTime: number
    breakTime: number
    longBreakTime: number
    sessionsBeforeLongBreak: number
  }
  soundEnabled: boolean
  showTips: boolean
  dashboardLayout: string
}

// Definir tipos para el contexto
interface AppContextType {
  state: AppState
  toggleTheme: () => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  setLastVisitedTab: (category: string, tab: string) => void
}

// Valores predeterminados para el estado
const defaultState: AppState = {
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  userPreferences: {
    pomodoroConfig: {
      workTime: 25 * 60,
      breakTime: 5 * 60,
      longBreakTime: 15 * 60,
      sessionsBeforeLongBreak: 4
    },
    soundEnabled: true,
    showTips: true,
    dashboardLayout: 'default'
  },
  lastVisitedTabs: {}
}

// Crear el contexto
const AppContext = createContext<AppContextType | undefined>(undefined)

// Proveedor del contexto
export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [state, setState] = useState<AppState>(defaultState)
  
  // Cargar estado desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cargar tema
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme) {
        setState(prev => ({ ...prev, theme: savedTheme }))
        document.documentElement.classList.toggle('dark', savedTheme === 'dark')
      } else {
        // Usar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setState(prev => ({ ...prev, theme: prefersDark ? 'dark' : 'light' }))
        document.documentElement.classList.toggle('dark', prefersDark)
      }
      
      // Cargar otras preferencias
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences)
          setState(prev => ({ 
            ...prev, 
            userPreferences: { ...prev.userPreferences, ...parsedPreferences } 
          }))
        } catch (error) {
          console.error('Error parsing saved preferences:', error)
        }
      }
      
      // Cargar pestañas visitadas
      const savedTabs = localStorage.getItem('lastVisitedTabs')
      if (savedTabs) {
        try {
          setState(prev => ({ ...prev, lastVisitedTabs: JSON.parse(savedTabs) }))
        } catch (error) {
          console.error('Error parsing saved tabs:', error)
        }
      }
    }
  }, [])
  
  // Guardar cambios en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', state.theme)
      localStorage.setItem('userPreferences', JSON.stringify(state.userPreferences))
      localStorage.setItem('lastVisitedTabs', JSON.stringify(state.lastVisitedTabs))
    }
  }, [state.theme, state.userPreferences, state.lastVisitedTabs])
  
  // Aplicar tema al documento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', state.theme === 'dark')
    }
  }, [state.theme])
  
  // Funciones para manipular el estado
  const toggleTheme = () => {
    setState(prev => ({ 
      ...prev, 
      theme: prev.theme === 'light' ? 'dark' : 'light' 
    }))
  }
  
  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }
  
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false
    }
    
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications]
    }))
  }
  
  const markNotificationAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    }))
  }
  
  const clearNotifications = () => {
    setState(prev => ({ ...prev, notifications: [] }))
  }
  
  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }))
  }
  
  const setLastVisitedTab = (category: string, tab: string) => {
    setState(prev => ({
      ...prev,
      lastVisitedTabs: { ...prev.lastVisitedTabs, [category]: tab }
    }))
  }
  
  // Valor del contexto
  const contextValue: AppContextType = {
    state,
    toggleTheme,
    toggleSidebar,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    updateUserPreferences,
    setLastVisitedTab
  }
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
} 