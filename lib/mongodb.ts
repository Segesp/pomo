import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, agrega MONGODB_URI a tus variables de entorno')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// En entorno de desarrollo, usa una variable global
// para preservar la conexión a través de recargas del módulo
if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usamos una variable global para que la conexión
  // persista entre las recargas provocadas por HMR (Hot Module Replacement)
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
    mongoose?: typeof mongoose
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
  
  // Mantener conexión de Mongoose para modelos
  if (!globalWithMongo.mongoose) {
    globalWithMongo.mongoose = mongoose
    mongoose.connect(uri)
  }
} else {
  // En producción, es mejor no usar una variable global
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Función para conectar a MongoDB usando mongoose
export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }
    return await mongoose.connect(uri)
  } catch (error) {
    console.error('Error conectando a MongoDB con mongoose:', error)
    throw error
  }
}

// Exportar clientPromise como default export
export default clientPromise

// Console.log para depuración durante la inicialización
console.log('Configuración de Next.js cargada. MONGODB_URI definido:', !!process.env.MONGODB_URI) 