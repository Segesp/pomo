import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import mongoose from 'mongoose'

// Definir una interfaz para el modelo de tarjetas
interface IAnkiCardSet {
  _id: mongoose.Types.ObjectId
  userId: string
  title: string
  date: Date
  cards: Array<{ question: string, answer: string }>
  originalText?: string
}

// Recuperar el modelo (evitando errores de redefinición)
const AnkiCardSet = mongoose.models.AnkiCardSet || 
  mongoose.model('AnkiCardSet', new mongoose.Schema({
    userId: String,
    title: String,
    date: Date,
    cards: [{ question: String, answer: String }],
    originalText: String
  }))

// GET: Obtener un conjunto específico de tarjetas por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const cardSetId = params.id
    
    if (!cardSetId) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Buscar conjunto de tarjetas por ID y verificar que pertenezca al usuario
    const cardSet = await AnkiCardSet.findOne({
      _id: cardSetId,
      userId
    }).lean() as IAnkiCardSet | null
    
    if (!cardSet) {
      return NextResponse.json(
        { message: 'Conjunto de tarjetas no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: cardSet._id.toString(),
      title: cardSet.title,
      cards: cardSet.cards,
      originalText: cardSet.originalText,
      date: cardSet.date
    })
  } catch (error) {
    console.error('Error al obtener conjunto de tarjetas:', error)
    return NextResponse.json(
      { message: 'Error al obtener conjunto de tarjetas' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un conjunto de tarjetas
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const cardSetId = params.id
    
    if (!cardSetId) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Buscar y eliminar conjunto de tarjetas (verificando propiedad)
    const result = await AnkiCardSet.deleteOne({
      _id: cardSetId,
      userId
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Conjunto de tarjetas no encontrado o no autorizado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Conjunto de tarjetas eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar conjunto de tarjetas:', error)
    return NextResponse.json(
      { message: 'Error al eliminar conjunto de tarjetas' },
      { status: 500 }
    )
  }
} 