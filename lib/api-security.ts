import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { createHash } from 'crypto'

// Tipos de roles y permisos
export type UserRole = 'user' | 'admin'
export type Permission = 'read' | 'write' | 'delete' | 'admin'

// Interfaz para el token JWT extendido
interface ExtendedToken {
  id: string
  email: string
  role: UserRole
  permissions: Permission[]
}

// Configuración del rate limiting
const createRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana por IP
  message: { error: 'Demasiadas solicitudes, por favor intente más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Función para validar el token JWT
export async function validateToken(req: NextApiRequest): Promise<ExtendedToken | null> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return null

    // Validar la estructura del token
    const tokenSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      role: z.enum(['user', 'admin']),
      permissions: z.array(z.enum(['read', 'write', 'delete', 'admin']))
    })

    return tokenSchema.parse(token) as ExtendedToken
  } catch (error) {
    console.error('Error validando token:', error)
    return null
  }
}

// Middleware para verificar permisos
export function withPermissions(permissions: Permission[]) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      const token = await validateToken(req)
      
      if (!token) {
        return res.status(401).json({ error: 'No autorizado' })
      }

      const hasPermission = token.role === 'admin' || 
        permissions.every(p => token.permissions.includes(p))

      if (!hasPermission) {
        return res.status(403).json({ error: 'Permisos insuficientes' })
      }

      next()
    } catch (error) {
      console.error('Error en verificación de permisos:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

// Función para validar y sanitizar parámetros de consulta
export function validateQueryParams(params: Record<string, any>, schema: z.ZodSchema) {
  try {
    return schema.parse(params)
  } catch (error) {
    throw new Error('Parámetros de consulta inválidos')
  }
}

// Función para generar hash seguro
export function generateSecureHash(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

// Función para validar origen de la solicitud
export function validateOrigin(req: NextApiRequest): boolean {
  const origin = req.headers.origin
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`
  ].filter(Boolean)

  return origin ? allowedOrigins.includes(origin) : false
}

// Middleware para validar método HTTP
export function validateMethod(req: NextApiRequest, res: NextApiResponse, allowedMethods: string[]) {
  if (!allowedMethods.includes(req.method || '')) {
    return res.status(405).json({ error: 'Método no permitido' })
  }
}

// Middleware para validar contenido JSON
export function validateJsonBody(req: NextApiRequest, res: NextApiResponse, schema: z.ZodSchema) {
  try {
    const validatedBody = schema.parse(req.body)
    req.body = validatedBody
  } catch (error) {
    return res.status(400).json({ error: 'Cuerpo de la solicitud inválido' })
  }
}

// Función para sanitizar respuestas
export function sanitizeResponse(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret']
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponse(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      if (!sensitiveFields.includes(key)) {
        sanitized[key] = sanitizeResponse(value)
      }
    }
    return sanitized
  }
  
  return data
}

// Middleware de seguridad para API
export function withApiSecurity(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Validar origen
      if (!validateOrigin(req)) {
        return res.status(403).json({ error: 'Origen no permitido' })
      }

      // Aplicar rate limiting
      await new Promise((resolve) => createRateLimiter(req, res, resolve))

      // Establecer headers de seguridad
      res.setHeader('Content-Security-Policy', "default-src 'self'")
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')

      // Ejecutar el handler
      await handler(req, res)
    } catch (error) {
      console.error('Error en API:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
} 