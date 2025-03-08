import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PomodoroSession from '@/models/PomodoroSession'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

// Endpoint para obtener sesiones
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const filter = searchParams.get('filter') || ''
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    
    if (!userId) {
      return NextResponse.json(
        { message: 'ID de usuario requerido' },
        { status: 400 }
      )
    }
    
    // Verificar que el usuario solo acceda a sus propias sesiones
    if (session.user && userId !== session.user.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 403 }
      )
    }
    
    await connectDB()
    
    const limit = 10
    const skip = (page - 1) * limit
    
    // Construir la consulta
    let query: any = { userId }
    
    if (filter) {
      query.$or = [
        { label: { $regex: filter, $options: 'i' } },
        { notes: { $regex: filter, $options: 'i' } },
      ]
    }
    
    if (from || to) {
      query.startTime = {}
      
      if (from) {
        query.startTime.$gte = new Date(from)
      }
      
      if (to) {
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        query.startTime.$lte = toDate
      }
    }
    
    // Obtener el total de documentos para la paginación
    const total = await PomodoroSession.countDocuments(query)
    
    // Obtener las sesiones
    const sessions = await PomodoroSession.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
    
    return NextResponse.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalSessions: total,
    })
  } catch (error) {
    console.error('Error al obtener sesiones:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

// Endpoint para crear una sesión
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { userId, startTime, endTime, duration, label, notes } = await request.json()
    
    // Verificar que el usuario solo cree sesiones para sí mismo
    if (session.user && userId !== session.user.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 403 }
      )
    }
    
    // Validaciones básicas
    if (!userId || !startTime || !endTime || !duration) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Crear la sesión
    const newSession = new PomodoroSession({
      userId,
      startTime,
      endTime,
      duration,
      label: label || 'Trabajo',
      notes: notes || '',
    })
    
    await newSession.save()
    
    return NextResponse.json(
      { message: 'Sesión guardada correctamente', session: newSession },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al guardar sesión:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
} 