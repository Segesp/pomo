import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import mongoose from 'mongoose'

// Definir el esquema para peticiones especiales
const SpecialPetitionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  topic: { type: String, required: true },
  category: { type: String, required: true },
  detail: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pendiente', 'en proceso', 'completado', 'rechazado'],
    default: 'pendiente'
  },
  date: { type: Date, default: Date.now },
  attachmentUrl: { type: String },
  response: { type: String },
  responseDate: { type: Date }
})

// Crear o recuperar el modelo
const SpecialPetition = mongoose.models.SpecialPetition || 
  mongoose.model('SpecialPetition', SpecialPetitionSchema)

// GET: Obtener peticiones del usuario
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
    
    // Obtener las peticiones del usuario
    const petitions = await SpecialPetition.find({ userId })
      .sort({ date: -1 })
      .lean()
    
    return NextResponse.json({
      petitions: petitions.map((petition: any) => ({
        id: petition._id.toString(),
        topic: petition.topic,
        category: petition.category,
        detail: petition.detail,
        status: petition.status,
        date: petition.date,
        attachmentUrl: petition.attachmentUrl,
        response: petition.response,
        responseDate: petition.responseDate
      }))
    })
  } catch (error) {
    console.error('Error al obtener peticiones:', error)
    return NextResponse.json(
      { message: 'Error al obtener peticiones' },
      { status: 500 }
    )
  }
}

// POST: Crear una nueva petición
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
    const userName = session.user.name || 'Usuario'
    const data = await request.json()
    
    if (!data.topic || !data.category || !data.detail) {
      return NextResponse.json(
        { message: 'Datos inválidos. Se requieren topic, category y detail.' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Crear nueva petición
    const petition = new SpecialPetition({
      userId,
      userName,
      topic: data.topic,
      category: data.category,
      detail: data.detail,
      attachmentUrl: data.attachmentUrl || null
    })
    
    await petition.save()
    
    return NextResponse.json({
      message: 'Petición creada correctamente',
      id: petition._id.toString()
    })
  } catch (error) {
    console.error('Error al crear petición:', error)
    return NextResponse.json(
      { message: 'Error al crear petición' },
      { status: 500 }
    )
  }
} 