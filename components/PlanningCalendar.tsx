'use client'

import React, { useState, useEffect } from 'react'
import { 
  FiCalendar, 
  FiPlusCircle, 
  FiTrash2, 
  FiEdit2, 
  FiChevronLeft, 
  FiChevronRight,
  FiClock
} from 'react-icons/fi'

type Event = {
  id: string
  title: string
  date: Date
  duration: number // en minutos
  type: 'pomodoro' | 'study' | 'review' | 'test'
  completed: boolean
  timeStr?: string // Añadido para el manejo del formulario
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Eventos de ejemplo
const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Sesión Pomodoro - Matemáticas',
    date: new Date(new Date().setHours(new Date().getHours() + 2)),
    duration: 25,
    type: 'pomodoro',
    completed: false
  },
  {
    id: '2',
    title: 'Repaso de tarjetas',
    date: new Date(new Date().setHours(new Date().getHours() + 4)),
    duration: 15,
    type: 'review',
    completed: false
  },
  {
    id: '3',
    title: 'Estudio - Ciencias',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    duration: 45,
    type: 'study',
    completed: false
  }
]

export default function PlanningCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    duration: 25,
    type: 'pomodoro'
  })

  // Cargar eventos para el mes actual
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Calcular primer y último día del mes
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        
        // Extender el rango para incluir días que se muestran de meses adyacentes
        const prevMonthDays = firstDay.getDay()
        const nextMonthDays = 6 - lastDay.getDay()
        
        const startDate = new Date(year, month, 1 - prevMonthDays)
        const endDate = new Date(year, month + 1, nextMonthDays)
        
        // Formatear fechas para la consulta
        const startDateStr = startDate.toISOString().split('T')[0]
        const endDateStr = endDate.toISOString().split('T')[0]
        
        // Realizar la petición
        const response = await fetch(
          `/api/events?startDate=${startDateStr}&endDate=${endDateStr}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`Error al cargar eventos: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Transformar los eventos para su uso en el componente
        const formattedEvents: Event[] = data.events.map((event: any) => ({
          id: event._id,
          title: event.title,
          date: new Date(event.date),
          duration: event.duration,
          type: event.type,
          completed: event.completed,
          timeStr: new Date(event.date).toTimeString().substring(0, 5)
        }))
        
        setEvents(formattedEvents)
      } catch (err) {
        console.error('Error al cargar eventos:', err)
        setError('No se pudieron cargar los eventos. Por favor, intenta de nuevo.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvents()
  }, [currentDate])

  // Generar el calendario para el mes actual
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDay = firstDayOfMonth.getDay()
    
    const calendarDays = []
    
    // Añadir días anteriores al mes actual (del mes anterior)
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthDays - i,
        currentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      })
    }
    
    // Añadir días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        currentMonth: true,
        date: new Date(year, month, i)
      })
    }
    
    // Añadir días del mes siguiente si es necesario
    const remainingDays = 42 - calendarDays.length // 6 semanas * 7 días = 42
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i)
      })
    }
    
    return calendarDays
  }

  const calendarDays = generateCalendarDays()
  
  // Eventos para el día seleccionado
  const eventsForSelectedDate = selectedDate 
    ? events.filter(event => 
        event.date.getDate() === selectedDate.getDate() &&
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear()
      )
    : []
  
  // Navegación del calendario
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }
  
  // Manejar la adición de un nuevo evento
  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent.title || !newEvent.timeStr) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const eventDate = new Date(selectedDate)
      const [hours, minutes] = newEvent.timeStr.split(':')
      eventDate.setHours(Number(hours), Number(minutes))
      
      // Preparar datos para la API
      const eventData = {
        title: newEvent.title,
        date: eventDate.toISOString(),
        duration: newEvent.duration || 25,
        type: newEvent.type || 'pomodoro',
        notes: ''
      }
      
      // Enviar petición
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      
      if (!response.ok) {
        throw new Error(`Error al crear evento: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Añadir el nuevo evento a la lista
      const formattedEvent: Event = {
        id: data.event._id,
        title: data.event.title,
        date: new Date(data.event.date),
        duration: data.event.duration,
        type: data.event.type,
        completed: data.event.completed,
        timeStr: new Date(data.event.date).toTimeString().substring(0, 5)
      }
      
      setEvents([...events, formattedEvent])
      
      // Resetear formulario
      setNewEvent({
        title: '',
        duration: 25,
        type: 'pomodoro'
      })
      setShowEventForm(false)
    } catch (err) {
      console.error('Error al crear evento:', err)
      setError('No se pudo crear el evento. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Manejar la eliminación de un evento
  const handleDeleteEvent = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Enviar petición
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error al eliminar evento: ${response.status}`)
      }
      
      // Eliminar el evento de la lista
      setEvents(events.filter(event => event.id !== id))
    } catch (err) {
      console.error('Error al eliminar evento:', err)
      setError('No se pudo eliminar el evento. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Manejar completado de un evento
  const handleCompleteEvent = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Enviar petición
      const response = await fetch(`/api/events/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error al completar evento: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Actualizar el evento en la lista
      setEvents(events.map(event => 
        event.id === id ? { ...event, completed: data.event.completed } : event
      ))
    } catch (err) {
      console.error('Error al completar evento:', err)
      setError('No se pudo actualizar el evento. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Verificar si un día tiene eventos
  const hasEvents = (date: Date) => {
    return events.some(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    )
  }
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  // Mostrar mensaje de carga
  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Mostrar mensaje de error
  if (error && events.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Planificador de Estudio</h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            <FiChevronLeft />
          </button>
          <div className="px-4 py-2 bg-white rounded-md shadow-sm border border-gray-200 font-medium">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-md">
        {/* Días de la semana */}
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="p-2 text-center font-medium bg-red-600 text-white">
            {day}
          </div>
        ))}
        
        {/* Días del calendario */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => setSelectedDate(day.date)}
            className={`
              p-2 h-24 bg-white hover:bg-red-50 cursor-pointer transition-colors
              ${!day.currentMonth ? 'text-gray-400' : ''}
              ${
                selectedDate && 
                day.date.getDate() === selectedDate.getDate() &&
                day.date.getMonth() === selectedDate.getMonth() &&
                day.date.getFullYear() === selectedDate.getFullYear() 
                  ? 'bg-red-50 border-red-200 border-2' 
                  : ''
              }
            `}
          >
            <div className="flex justify-between">
              <span>{day.day}</span>
              {hasEvents(day.date) && (
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
              )}
            </div>
            <div className="mt-1 space-y-1 overflow-y-auto max-h-16 text-xs">
              {events
                .filter(event => 
                  event.date.getDate() === day.date.getDate() &&
                  event.date.getMonth() === day.date.getMonth() &&
                  event.date.getFullYear() === day.date.getFullYear()
                )
                .slice(0, 2) // Mostrar solo los primeros 2 eventos
                .map(event => (
                  <div 
                    key={event.id}
                    className={`
                      px-1 py-0.5 rounded truncate
                      ${event.type === 'pomodoro' ? 'bg-red-100 text-red-800' : ''}
                      ${event.type === 'study' ? 'bg-blue-100 text-blue-800' : ''}
                      ${event.type === 'review' ? 'bg-green-100 text-green-800' : ''}
                      ${event.type === 'test' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${event.completed ? 'line-through opacity-50' : ''}
                    `}
                  >
                    {formatTime(event.date)} {event.title}
                  </div>
                ))
              }
              {events.filter(event => 
                event.date.getDate() === day.date.getDate() &&
                event.date.getMonth() === day.date.getMonth() &&
                event.date.getFullYear() === day.date.getFullYear()
              ).length > 2 && (
                <div className="text-xs text-gray-500">
                  +{events.filter(event => 
                    event.date.getDate() === day.date.getDate() &&
                    event.date.getMonth() === day.date.getMonth() &&
                    event.date.getFullYear() === day.date.getFullYear()
                  ).length - 2} más
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de eventos para el día seleccionado */}
      {selectedDate && (
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]} de {selectedDate.getFullYear()}
            </h3>
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FiPlusCircle />
              <span>Añadir Evento</span>
            </button>
          </div>

          {showEventForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Ej: Sesión de estudio"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={newEvent.timeStr}
                      onChange={(e) => setNewEvent({...newEvent, timeStr: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración (min)
                    </label>
                    <input
                      type="number"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent({...newEvent, duration: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      min="5"
                      step="5"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de evento
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="pomodoro">Pomodoro</option>
                    <option value="study">Estudio</option>
                    <option value="review">Repaso</option>
                    <option value="test">Examen/Prueba</option>
                  </select>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleAddEvent}
                    disabled={!newEvent.title}
                    className={`
                      flex-1 px-4 py-2 text-white rounded-md
                      ${newEvent.title ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}
                      transition-colors
                    `}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-2">
              {eventsForSelectedDate.map(event => (
                <div
                  key={event.id}
                  className={`
                    p-3 border rounded-md flex items-center justify-between
                    ${event.type === 'pomodoro' ? 'border-red-200 bg-red-50' : ''}
                    ${event.type === 'study' ? 'border-blue-200 bg-blue-50' : ''}
                    ${event.type === 'review' ? 'border-green-200 bg-green-50' : ''}
                    ${event.type === 'test' ? 'border-yellow-200 bg-yellow-50' : ''}
                    ${event.completed ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={event.completed}
                      onChange={() => handleCompleteEvent(event.id)}
                      className="rounded text-red-600 focus:ring-red-500 h-5 w-5"
                    />
                    <div className={event.completed ? 'line-through' : ''}>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <FiClock className="mr-1" size={14} />
                        {formatTime(event.date)} · {event.duration} min
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {/* Editar evento */}}
                      className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiCalendar className="mx-auto h-10 w-10 mb-2" />
              <p>No hay eventos para este día</p>
              <p className="text-sm">Haz clic en "Añadir Evento" para crear uno nuevo</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 