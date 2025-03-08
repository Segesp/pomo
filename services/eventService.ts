import connectToDatabase from '@/lib/db'
import Event, { IEvent } from '@/models/Event'

/**
 * Interfaz para crear un nuevo evento
 */
export interface EventCreate {
  userId: string
  title: string
  date: Date
  duration: number
  type: 'pomodoro' | 'study' | 'review' | 'test'
  notes?: string
}

/**
 * Interfaz para actualizar un evento
 */
export interface EventUpdate {
  title?: string
  date?: Date
  duration?: number
  type?: 'pomodoro' | 'study' | 'review' | 'test'
  completed?: boolean
  notes?: string
}

/**
 * Obtener eventos de un usuario para un rango de fechas
 */
export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<IEvent[]> {
  await connectToDatabase()
  return Event.findByUserAndDateRange(userId, startDate, endDate)
}

/**
 * Obtener eventos próximos de un usuario
 */
export async function getUpcomingEvents(
  userId: string,
  limit: number = 5
): Promise<IEvent[]> {
  await connectToDatabase()
  return Event.findUpcomingEvents(userId, limit)
}

/**
 * Obtener eventos completados de un usuario
 */
export async function getCompletedEvents(
  userId: string,
  limit: number = 10
): Promise<IEvent[]> {
  await connectToDatabase()
  return Event.findCompletedEvents(userId, limit)
}

/**
 * Crear un nuevo evento
 */
export async function createEvent(eventData: EventCreate): Promise<IEvent> {
  await connectToDatabase()
  return Event.create(eventData)
}

/**
 * Actualizar un evento existente
 */
export async function updateEvent(
  eventId: string,
  userId: string,
  updateData: EventUpdate
): Promise<IEvent | null> {
  await connectToDatabase()
  
  return Event.findOneAndUpdate(
    { _id: eventId, userId },
    { $set: updateData },
    { new: true }
  )
}

/**
 * Marcar un evento como completado
 */
export async function markEventAsCompleted(
  eventId: string,
  userId: string
): Promise<IEvent | null> {
  await connectToDatabase()
  
  return Event.findOneAndUpdate(
    { _id: eventId, userId },
    { $set: { completed: true } },
    { new: true }
  )
}

/**
 * Eliminar un evento
 */
export async function deleteEvent(
  eventId: string,
  userId: string
): Promise<boolean> {
  await connectToDatabase()
  
  const result = await Event.deleteOne({ _id: eventId, userId })
  return result.deletedCount === 1
}

/**
 * Obtener un evento específico por ID
 */
export async function getEventById(
  eventId: string,
  userId: string
): Promise<IEvent | null> {
  await connectToDatabase()
  return Event.findOne({ _id: eventId, userId })
} 