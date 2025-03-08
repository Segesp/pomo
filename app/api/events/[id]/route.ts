import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import * as eventService from '@/services/eventService'
import { z } from 'zod'

// Esquema de validación para la actualización de eventos
const updateEventSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha inválida',
  }).optional(),
  duration: z.number().min(5).max(240).optional(),
  type: z.enum(['pomodoro', 'study', 'review', 'test']).optional(),
  completed: z.boolean().optional(),
  notes: z.string().max(500).optional(),
})

/**
 * GET - Obtener un evento específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const eventId = params.id
    
    // Obtener evento
    const event = await eventService.getEventById(eventId, userId)
    
    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error al obtener evento:', error)
    return NextResponse.json(
      { error: 'Error al obtener evento' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Actualizar un evento
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const eventId = params.id
    
    // Obtener y validar datos
    const data = await req.json()
    
    const result = updateEventSchema.safeParse(data)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.format() },
        { status: 400 }
      )
    }
    
    // Preparar datos para actualizar
    const { date, ...restData } = result.data
    
    // Crear objeto de actualización con tipado correcto
    const updateData: eventService.EventUpdate = {
      ...restData
    }
    
    // Convertir fecha a Date si está presente
    if (date) {
      updateData.date = new Date(date)
    }
    
    // Actualizar evento
    const updatedEvent = await eventService.updateEvent(
      eventId,
      userId,
      updateData
    )
    
    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar evento' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar un evento
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const eventId = params.id
    
    // Eliminar evento
    const success = await eventService.deleteEvent(eventId, userId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Evento eliminado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar evento' },
      { status: 500 }
    )
  }
} 