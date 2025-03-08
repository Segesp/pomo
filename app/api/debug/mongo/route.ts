import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET() {
  try {
    // Obtener la cadena de conexión
    let mongoUri = process.env.MONGODB_URI || ''
    
    // Eliminar comillas si están presentes
    mongoUri = mongoUri.replace(/["']/g, '')
    
    // Verificar el formato
    const hasValidPrefix = mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')
    
    // Intentar la conexión (pero no almacenarla)
    let connectionResult = 'No intentado'
    
    if (hasValidPrefix) {
      try {
        const connection = await mongoose.connect(mongoUri)
        connectionResult = 'Conexión exitosa'
        await mongoose.disconnect()
      } catch (connError: any) {
        connectionResult = `Error al conectar: ${connError.message}`
      }
    }
    
    // Preparar respuesta (ocultando información sensible)
    const safeUri = mongoUri 
      ? mongoUri.replace(/\/\/([^:]+):[^@]+@/, '//[USERNAME]:[PASSWORD]@')
      : 'No definida'
    
    return NextResponse.json({
      success: true,
      env: process.env.NODE_ENV,
      mongoUri: {
        defined: !!mongoUri,
        hasValidPrefix,
        safeUri,
      },
      connectionResult,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
} 