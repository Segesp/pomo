import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import * as eventService from '@/services/eventService'

/**
 * PATCH - Marcar un evento como completado
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
    
    // Marcar evento como completado
    const completedEvent = await eventService.markEventAsCompleted(eventId, userId)
    
    if (!completedEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ event: completedEvent })
  } catch (error) {
    console.error('Error al completar evento:', error)
    return NextResponse.json(
      { error: 'Error al completar evento' },
      { status: 500 }
    )
  }
} 