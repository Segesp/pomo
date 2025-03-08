import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import * as eventService from '@/services/eventService'
import { z } from 'zod'

// Esquema de validación para la creación de eventos
const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha inválida',
  }),
  duration: z.number().min(5).max(240),
  type: z.enum(['pomodoro', 'study', 'review', 'test']),
  notes: z.string().max(500).optional(),
})

// Esquema para la consulta de eventos
const getEventsQuerySchema = z.object({
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida',
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida',
  }),
})

/**
 * GET - Obtener eventos del usuario actual
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Obtener parámetros de consulta
    const url = new URL(req.url)
    const startDateParam = url.searchParams.get('startDate')
    const endDateParam = url.searchParams.get('endDate')
    
    // Si no hay fechas, devolver eventos próximos
    if (!startDateParam || !endDateParam) {
      const events = await eventService.getUpcomingEvents(userId)
      return NextResponse.json({ events })
    }
    
    // Validar parámetros
    const result = getEventsQuerySchema.safeParse({
      startDate: startDateParam,
      endDate: endDateParam,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: result.error.format() },
        { status: 400 }
      )
    }
    
    // Convertir fechas a objetos Date
    const startDate = new Date(result.data.startDate)
    const endDate = new Date(result.data.endDate)
    
    // Obtener eventos para el rango de fechas
    const events = await eventService.getEventsByDateRange(
      userId,
      startDate,
      endDate
    )
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    return NextResponse.json(
      { error: 'Error al obtener eventos' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crear un nuevo evento
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Obtener y validar datos
    const data = await req.json()
    
    const result = createEventSchema.safeParse(data)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.format() },
        { status: 400 }
      )
    }
    
    // Preparar datos para crear el evento
    const eventData = {
      ...result.data,
      userId,
      date: new Date(result.data.date),
    }
    
    // Crear evento
    const event = await eventService.createEvent(eventData)
    
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error al crear evento:', error)
    return NextResponse.json(
      { error: 'Error al crear evento' },
      { status: 500 }
    )
  }
} 