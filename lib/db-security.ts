import { MongoClient, MongoClientOptions } from 'mongodb'
import { z } from 'zod'

// Esquema de validación para la URI de MongoDB
const mongoUriSchema = z.string().regex(/^mongodb(\+srv)?:\/\/[^\s]+$/)

// Opciones seguras para la conexión a MongoDB
const MONGO_OPTIONS: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  ssl: process.env.NODE_ENV === 'production',
  tls: process.env.NODE_ENV === 'production',
}

// Función para validar y sanitizar la URI de MongoDB
export function validateMongoUri(uri: string): string {
  try {
    return mongoUriSchema.parse(uri)
  } catch (error) {
    throw new Error('URI de MongoDB inválida')
  }
}

// Función para crear una conexión segura a MongoDB
export async function createSecureConnection(uri: string): Promise<MongoClient> {
  const validatedUri = validateMongoUri(uri)
  
  try {
    const client = new MongoClient(validatedUri, MONGO_OPTIONS)
    await client.connect()
    return client
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error)
    throw new Error('Error al establecer conexión segura con MongoDB')
  }
}

// Función para sanitizar consultas a la base de datos
export function sanitizeQuery(query: Record<string, any>): Record<string, any> {
  // Eliminar operadores de MongoDB potencialmente peligrosos
  const sanitized = { ...query }
  const dangerousOperators = ['$where', '$function', '$accumulator', '$function']
  
  function removeOperators(obj: Record<string, any>) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        removeOperators(obj[key])
      }
      if (dangerousOperators.includes(key)) {
        delete obj[key]
      }
    }
  }

  removeOperators(sanitized)
  return sanitized
}

// Función para validar y sanitizar IDs de documentos
export function validateDocumentId(id: string): string {
  const idSchema = z.string().regex(/^[a-f\d]{24}$/i)
  try {
    return idSchema.parse(id)
  } catch (error) {
    throw new Error('ID de documento inválido')
  }
}

// Función para validar y sanitizar campos de actualización
export function sanitizeUpdateFields(update: Record<string, any>): Record<string, any> {
  // Eliminar campos protegidos y operadores peligrosos
  const protectedFields = ['_id', 'password', 'role', 'permissions']
  const sanitized = { ...update }

  function removeProtectedFields(obj: Record<string, any>) {
    for (const key in obj) {
      if (protectedFields.includes(key)) {
        delete obj[key]
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        removeProtectedFields(obj[key])
      }
    }
  }

  removeProtectedFields(sanitized)
  return sanitized
}

// Función para validar y sanitizar operaciones de agregación
export function sanitizeAggregation(pipeline: any[]): any[] {
  const dangerousStages = ['$graphLookup', '$unionWith', '$merge', '$out']
  
  return pipeline.filter(stage => {
    const stageOperator = Object.keys(stage)[0]
    return !dangerousStages.includes(stageOperator)
  })
}

// Función para validar y sanitizar proyecciones
export function sanitizeProjection(projection: Record<string, any>): Record<string, any> {
  const protectedFields = ['password', 'tokens', 'securityQuestions']
  const sanitized = { ...projection }

  protectedFields.forEach(field => {
    delete sanitized[field]
  })

  return sanitized
}

// Función para validar límites de consultas
export function validateQueryLimits(limit: number, maxLimit: number = 100): number {
  return Math.min(Math.max(1, limit), maxLimit)
}

// Función para validar y sanitizar ordenamiento
export function sanitizeSort(sort: Record<string, 1 | -1>): Record<string, 1 | -1> {
  const validDirections = [1, -1]
  const sanitized: Record<string, 1 | -1> = {}

  for (const [key, value] of Object.entries(sort)) {
    if (validDirections.includes(value)) {
      sanitized[key] = value
    }
  }

  return sanitized
} 