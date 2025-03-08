import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'
import { sanitizeQuery, validateQueryLimits } from '@/lib/db-security'

// Obtener todas las sesiones del usuario actual
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Parámetros de consulta
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const skip = parseInt(url.searchParams.get('skip') || '0')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    // Validar límites de consulta
    validateQueryLimits(limit, skip)
    
    // Construir filtro
    let query: any = { userId: session.user.id || session.user.email }
    
    // Añadir filtros de fecha si están presentes
    if (startDate || endDate) {
      query.completed = {}
      
      if (startDate) {
        query.completed.$gte = new Date(startDate)
      }
      
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Final del día
        query.completed.$lte = end
      }
    }
    
    // Sanitizar consulta
    query = sanitizeQuery(query)
    
    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db()
    
    // Obtener sesiones
    const sessions = await db
      .collection('sessions')
      .find(query)
      .sort({ completed: -1 }) // Orden descendente por fecha
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Contar total para paginación
    const total = await db.collection('sessions').countDocuments(query)
    
    return NextResponse.json({
      sessions,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + sessions.length < total
      }
    })
  } catch (error) {
    console.error('Error al obtener sesiones:', error)
    return NextResponse.json(
      { error: 'Error al obtener sesiones' },
      { status: 500 }
    )
  }
}

// Crear una nueva sesión
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Validar el body de la petición
    const body = await req.json()
    
    // Validaciones básicas
    if (!body.duration || typeof body.duration !== 'number') {
      return NextResponse.json(
        { error: 'La duración es requerida y debe ser un número' },
        { status: 400 }
      )
    }
    
    // Asegurarse de que los campos tienen el formato correcto
    const sessionData = {
      userId: session.user.id || session.user.email,
      duration: body.duration,
      completed: body.completed ? new Date(body.completed) : new Date(),
      tags: Array.isArray(body.tags) ? body.tags : [],
      notes: body.notes || '',
      createdAt: new Date()
    }
    
    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db()
    
    // Insertar la sesión
    const result = await db.collection('sessions').insertOne(sessionData)
    
    // Devolver la sesión con su ID
    return NextResponse.json({
      ...sessionData,
      _id: result.insertedId
    })
  } catch (error) {
    console.error('Error al crear sesión:', error)
    return NextResponse.json(
      { error: 'Error al crear la sesión' },
      { status: 500 }
    )
  }
} 