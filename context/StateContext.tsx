'use client'

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react'
import { useSession } from 'next-auth/react'

// Definir los tipos de datos
interface TimerConfig {
  workTime: number
  breakTime: number
  longBreakTime: number
  sessionsBeforeLongBreak: number
}

interface Session {
  _id: string
  userId: string
  duration: number
  completed: string
  tags: string[]
  notes?: string
}

interface AppState {
  // Configuración del temporizador
  timerConfig: TimerConfig
  updateTimerConfig: (config: TimerConfig) => void
  
  // Sesiones del usuario
  sessions: Session[]
  fetchSessions: () => Promise<void>
  addSession: (session: Omit<Session, '_id' | 'userId'>) => Promise<void>
  
  // Preferencias de usuario
  isDarkMode: boolean
  toggleDarkMode: () => void
  
  // Estado de carga
  loading: {
    sessions: boolean
    user: boolean
  }
  
  // Errores
  error: string | null
  setError: (error: string | null) => void
  
  // Categoría y pestaña activa
  activeCategory: string
  activeTab: string
  setActiveCategory: (category: string) => void
  setActiveTab: (tab: string) => void
}

// Valores por defecto
const DEFAULT_TIMER_CONFIG: TimerConfig = {
  workTime: 25 * 60, // 25 minutos en segundos
  breakTime: 5 * 60,  // 5 minutos en segundos
  longBreakTime: 15 * 60, // 15 minutos en segundos
  sessionsBeforeLongBreak: 4 // Número de sesiones antes de un descanso largo
}

// Crear el contexto
const StateContext = createContext<AppState | undefined>(undefined)

// Proveedor del contexto
export const StateProvider = ({ children }: { children: ReactNode }) => {
  const { data: sessionData, status } = useSession()
  
  // Estados para temporizador
  const [timerConfig, setTimerConfig] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG)
  
  // Estados para sesiones
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState({
    sessions: false,
    user: status === 'loading'
  })
  
  // Estado para errores
  const [error, setError] = useState<string | null>(null)
  
  // Estado para tema
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Estados para navegación
  const [activeCategory, setActiveCategory] = useState('estudio')
  const [activeTab, setActiveTab] = useState('pomodoro')
  
  // Cargar configuración guardada al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cargar configuración del temporizador
      const savedConfig = localStorage.getItem('pomodoroConfig')
      if (savedConfig) {
        try {
          setTimerConfig(JSON.parse(savedConfig))
        } catch (e) {
          console.error('Error parsing saved timer config:', e)
        }
      }
      
      // Cargar preferencia de tema
      const savedTheme = localStorage.getItem('darkMode') === 'true'
      setIsDarkMode(savedTheme)
      if (savedTheme) {
        document.documentElement.classList.add('dark')
      }
      
      // Cargar configuración de navegación
      const savedCategory = localStorage.getItem('activeCategory')
      const savedTab = localStorage.getItem('activeTab')
      
      if (savedCategory) setActiveCategory(savedCategory)
      if (savedTab) setActiveTab(savedTab)
    }
  }, [])
  
  // Actualizar estado de carga cuando cambia el estado de la sesión
  useEffect(() => {
    setLoading(prev => ({
      ...prev,
      user: status === 'loading'
    }))
  }, [status])
  
  // Cargar sesiones del usuario cuando la sesión está autenticada
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSessions()
    }
  }, [status])
  
  // Guardar configuración del temporizador cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroConfig', JSON.stringify(timerConfig))
    }
  }, [timerConfig])
  
  // Guardar preferencia de tema cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', isDarkMode.toString())
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])
  
  // Guardar configuración de navegación cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCategory', activeCategory)
      localStorage.setItem('activeTab', activeTab)
    }
  }, [activeCategory, activeTab])
  
  // Actualizar la configuración del temporizador
  const updateTimerConfig = (config: TimerConfig) => {
    setTimerConfig(config)
  }
  
  // Cambiar tema
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }
  
  // Función para obtener sesiones del usuario
  const fetchSessions = async () => {
    if (!sessionData?.user) return
    
    setLoading(prev => ({ ...prev, sessions: true }))
    setError(null)
    
    try {
      // Primero intentar cargar desde localStorage como backup
      const cachedData = loadSessionsFromLocalStorage()
      if (cachedData && cachedData.length > 0) {
        setSessions(cachedData)
      }
      
      // Luego hacer la petición a la API
      const response = await fetch('/api/sessions')
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        setSessions(data)
        saveSessionsToLocalStorage(data)
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('No se pudieron cargar las sesiones. Por favor, intenta de nuevo.')
      
      // Si hay un error pero tenemos datos del caché, mantener esos datos
      const cachedData = loadSessionsFromLocalStorage()
      if (!sessions.length && cachedData && cachedData.length > 0) {
        setSessions(cachedData)
      }
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }))
    }
  }
  
  // Añadir una nueva sesión
  const addSession = async (sessionData: Omit<Session, '_id' | 'userId'>) => {
    // No es necesario verificar sessionData.user porque no está en la interfaz Session
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar la sesión')
      }
      
      const newSession = await response.json()
      
      // Actualizar el estado y el localStorage
      const updatedSessions = [...sessions, newSession]
      setSessions(updatedSessions)
      saveSessionsToLocalStorage(updatedSessions)
      
      return newSession
    } catch (error) {
      console.error('Error adding session:', error)
      setError('Error al guardar la sesión')
      
      // Opcionalmente, podríamos guardar la sesión localmente para intentar sincronizarla más tarde
      throw error
    }
  }
  
  // Guardar sesiones en localStorage
  const saveSessionsToLocalStorage = (data: Session[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pomodoro_sessions_cache', JSON.stringify(data))
      } catch (err) {
        console.error('Error saving sessions to localStorage:', err)
      }
    }
  }
  
  // Cargar sesiones desde localStorage
  const loadSessionsFromLocalStorage = (): Session[] | null => {
    if (typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem('pomodoro_sessions_cache')
        return cachedData ? JSON.parse(cachedData) : null
      } catch (err) {
        console.error('Error loading sessions from localStorage:', err)
        return null
      }
    }
    return null
  }
  
  // Valor del contexto
  const value: AppState = {
    timerConfig,
    updateTimerConfig,
    sessions,
    fetchSessions,
    addSession,
    isDarkMode,
    toggleDarkMode,
    loading,
    error,
    setError,
    activeCategory,
    activeTab,
    setActiveCategory,
    setActiveTab
  }
  
  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useAppState = (): AppState => {
  const context = useContext(StateContext)
  
  if (context === undefined) {
    throw new Error('useAppState debe ser usado dentro de un StateProvider')
  }
  
  return context
}

// Exportar un componente para envolver toda la aplicación
export const withAppState = (Component: React.ComponentType) => {
  return function WithAppState(props: any) {
    return (
      <StateProvider>
        <Component {...props} />
      </StateProvider>
    )
  }
} 