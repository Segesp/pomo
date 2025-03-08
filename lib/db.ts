import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Por favor defina la variable de entorno MONGODB_URI')
}

/**
 * Conexión global a la base de datos
 */
let cachedConnection: typeof mongoose | null = null

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection
  }

  console.log('Estado de MONGODB_URI:', MONGODB_URI ? 'Definida y con formato correcto' : 'No definida o formato incorrecto')

  try {
    // Opciones de conexión
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    }

    // Verificación adicional para entornos de desarrollo
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true)
    }

    // Configurar modo estricto para consultas
    mongoose.set('strictQuery', true)
    
    console.log('Estableciendo nueva conexión a MongoDB')
    
    // Conectar a MongoDB
    cachedConnection = await mongoose.connect(MONGODB_URI, opts)
    
    console.log('Conexión a MongoDB establecida correctamente')
    
    return cachedConnection
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error)
    throw error
  }
}

export default connectToDatabase 