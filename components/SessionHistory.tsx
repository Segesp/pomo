'use client'

import { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiTag, FiAlertCircle, FiDownload } from 'react-icons/fi'
import { useSession } from 'next-auth/react'

// Tipos para las sesiones
interface Session {
  _id: string
  userId: string
  duration: number
  completed: string
  tags: string[]
  notes?: string
}

// Clave para almacenar sesiones en localStorage
const LOCAL_STORAGE_KEY = 'pomodoro_sessions_cache'

export default function SessionHistory() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<{
    startDate: string | null, 
    endDate: string | null, 
    tags: string[]
  }>({
    startDate: null,
    endDate: null,
    tags: []
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  
  // Cargar las sesiones cuando el componente se monta
  useEffect(() => {
    if (session?.user?.email) {
      fetchSessions()
    }
  }, [session])

  // Función para obtener sesiones del usuario
  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Primero intentar cargar desde localStorage como backup
      const cachedData = loadSessionsFromLocalStorage()
      if (cachedData && cachedData.length > 0) {
        setSessions(cachedData)
        setLoading(false)
      }
      
      // Luego hacer la petición a la API
      const response = await fetch('/api/sessions')
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        setSessions(data)
        
        // Extraer etiquetas únicas
        const tags = new Set<string>()
        data.forEach(session => {
          if (session.tags && Array.isArray(session.tags)) {
            session.tags.forEach((tag: string) => tags.add(tag))
          }
        })
        setAvailableTags(Array.from(tags))
        
        // Guardar en localStorage como backup
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
      setLoading(false)
    }
  }
  
  // Guardar sesiones en localStorage
  const saveSessionsToLocalStorage = (data: Session[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
      } catch (err) {
        console.error('Error saving sessions to localStorage:', err)
      }
    }
  }
  
  // Cargar sesiones desde localStorage
  const loadSessionsFromLocalStorage = (): Session[] | null => {
    if (typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY)
        return cachedData ? JSON.parse(cachedData) : null
      } catch (err) {
        console.error('Error loading sessions from localStorage:', err)
        return null
      }
    }
    return null
  }

  // Aplicar filtros a las sesiones
  const filteredSessions = sessions.filter(session => {
    // Filtrar por fecha
    if (filter.startDate) {
      const sessionDate = new Date(session.completed)
      const startDate = new Date(filter.startDate)
      if (sessionDate < startDate) return false
    }
    
    if (filter.endDate) {
      const sessionDate = new Date(session.completed)
      const endDate = new Date(filter.endDate)
      endDate.setHours(23, 59, 59, 999) // Establecer al final del día
      if (sessionDate > endDate) return false
    }
    
    // Filtrar por etiquetas
    if (filter.tags.length > 0) {
      if (!session.tags || !session.tags.some(tag => filter.tags.includes(tag))) {
        return false
      }
    }
    
    return true
  })

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  // Formatear duración (de segundos a minutos)
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  // Calcular estadísticas
  const totalSessions = filteredSessions.length
  const totalTimeInMinutes = filteredSessions.reduce((acc, session) => 
    acc + (session.duration / 60), 0
  )
  
  // Agrupar sesiones por día para las estadísticas
  const sessionsByDay = filteredSessions.reduce((acc, session) => {
    const date = new Date(session.completed).toLocaleDateString('es-ES')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(session)
    return acc
  }, {} as Record<string, Session[]>)
  
  // Obtener el día con más sesiones
  let mostProductiveDay = { date: '', count: 0 }
  Object.entries(sessionsByDay).forEach(([date, sessions]) => {
    if (sessions.length > mostProductiveDay.count) {
      mostProductiveDay = { date, count: sessions.length }
    }
  })

  // Manejar cambios en los filtros
  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }))
  }

  // Manejar selección/deselección de etiquetas
  const toggleTagFilter = (tag: string) => {
    setFilter(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) }
      } else {
        return { ...prev, tags: [...prev.tags, tag] }
      }
    })
  }
  
  // Exportar sesiones a CSV
  const exportToCSV = () => {
    // Cabeceras del CSV
    const headers = ['Fecha', 'Duración (min)', 'Etiquetas', 'Notas']
    
    // Convertir las sesiones filtradas a filas CSV
    const rows = filteredSessions.map(session => [
      formatDate(session.completed),
      Math.floor(session.duration / 60),
      session.tags?.join(', ') || '',
      session.notes || ''
    ])
    
    // Combinar cabeceras y filas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(','))
    ].join('\n')
    
    // Crear un enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `pomodoro_sessions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Historial de Sesiones</h2>
          <p className="text-gray-600">Visualiza y analiza tu trabajo con Pomodoro</p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          disabled={filteredSessions.length === 0}
        >
          <FiDownload className="mr-2" />
          Exportar CSV
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin
            </label>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        {/* Filtro por etiquetas */}
        {availableTags.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter.tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total de sesiones</h3>
          <p className="text-3xl font-bold text-gray-800">{totalSessions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Tiempo total</h3>
          <p className="text-3xl font-bold text-gray-800">
            {Math.floor(totalTimeInMinutes)} min
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Día más productivo</h3>
          <p className="text-3xl font-bold text-gray-800">
            {mostProductiveDay.count > 0 ? `${mostProductiveDay.date} (${mostProductiveDay.count})` : 'N/A'}
          </p>
        </div>
      </div>
      
      {/* Lista de sesiones */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="bg-red-50 p-4 border-b border-red-200 text-red-700 flex items-start">
            <FiAlertCircle className="mt-1 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-t-red-600 border-red-200 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando tus sesiones...</p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etiquetas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map(session => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" />
                        <span>{formatDate(session.completed)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiClock className="text-gray-400 mr-2" />
                        <span>{formatDuration(session.duration)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {session.tags && session.tags.length > 0 ? (
                          session.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <FiTag className="mr-1" size={10} />
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {session.notes || <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No hay sesiones que coincidan con los filtros.</p>
            {filter.startDate || filter.endDate || filter.tags.length > 0 ? (
              <button
                onClick={() => setFilter({ startDate: null, endDate: null, tags: [] })}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
} 