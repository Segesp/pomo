import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import mongoose from 'mongoose'

// Definir el esquema para tarjetas Anki
const AnkiCardSetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  cards: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  originalText: { type: String }
})

// Crear o recuperar el modelo (evitando errores de redefinición)
const AnkiCardSet = mongoose.models.AnkiCardSet || mongoose.model('AnkiCardSet', AnkiCardSetSchema)

// GET: Obtener conjuntos de tarjetas del usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const userId = session.user.id
    
    // Obtener los conjuntos de tarjetas del usuario
    const cardSets = await AnkiCardSet.find({ userId })
      .select('_id title date')
      .sort({ date: -1 })
      .lean()
    
    return NextResponse.json({
      cardSets: cardSets.map((set: any) => ({
        id: set._id.toString(),
        title: set.title,
        date: set.date
      }))
    })
  } catch (error) {
    console.error('Error al obtener tarjetas Anki:', error)
    return NextResponse.json(
      { message: 'Error al obtener tarjetas' },
      { status: 500 }
    )
  }
}

// POST: Guardar un nuevo conjunto de tarjetas
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const data = await request.json()
    
    if (!data.title || !data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
      return NextResponse.json(
        { message: 'Datos inválidos. Se requiere título y tarjetas.' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Crear nuevo conjunto de tarjetas
    const cardSet = new AnkiCardSet({
      userId,
      title: data.title,
      cards: data.cards,
      originalText: data.originalText || ''
    })
    
    await cardSet.save()
    
    return NextResponse.json({
      message: 'Tarjetas guardadas correctamente',
      id: cardSet._id.toString()
    })
  } catch (error) {
    console.error('Error al guardar tarjetas Anki:', error)
    return NextResponse.json(
      { message: 'Error al guardar tarjetas' },
      { status: 500 }
    )
  }
} 