import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'
import { validateDocumentId } from '@/lib/db-security'
import { ObjectId } from 'mongodb'

// Obtener una sesión específica por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const { id } = params
    
    // Validar ID
    validateDocumentId(id)
    
    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db()
    
    // Buscar la sesión asegurándose de que pertenece al usuario
    const sessionData = await db.collection('sessions').findOne({
      _id: new ObjectId(id),
      userId: session.user.id || session.user.email
    })
    
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(sessionData)
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return NextResponse.json(
      { error: 'Error al obtener la sesión' },
      { status: 500 }
    )
  }
}

// Actualizar una sesión específica
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const { id } = params
    
    // Validar ID
    validateDocumentId(id)
    
    // Validar el body
    const body = await req.json()
    
    // Campos actualizables
    const updateData: any = {}
    
    if (body.duration !== undefined) updateData.duration = body.duration
    if (body.completed !== undefined) updateData.completed = new Date(body.completed)
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.notes !== undefined) updateData.notes = body.notes
    
    // Añadir fecha de actualización
    updateData.updatedAt = new Date()
    
    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db()
    
    // Actualizar la sesión asegurándose de que pertenece al usuario
    const result = await db.collection('sessions').updateOne(
      {
        _id: new ObjectId(id),
        userId: session.user.id || session.user.email
      },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, updated: result.modifiedCount })
  } catch (error) {
    console.error('Error al actualizar sesión:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la sesión' },
      { status: 500 }
    )
  }
}

// Eliminar una sesión específica
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const { id } = params
    
    // Validar ID
    validateDocumentId(id)
    
    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db()
    
    // Eliminar la sesión asegurándose de que pertenece al usuario
    const result = await db.collection('sessions').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id || session.user.email
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar sesión:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la sesión' },
      { status: 500 }
    )
  }
} 