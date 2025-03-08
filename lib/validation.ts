import { z } from 'zod'

// Esquema para validar videos
export const videoSchema = z.object({
  title: z.string().min(1).max(100),
  path: z.string(),
  type: z.enum(['local', 'youtube']),
  originalName: z.string().optional(),
  youtubeId: z.string().optional()
}).refine(data => {
  // Para videos de YouTube, la ruta debe ser una URL válida
  if (data.type === 'youtube') {
    try {
      new URL(data.path);
      return true;
    } catch (e) {
      return false;
    }
  }
  return true;
}, {
  message: "La ruta del video debe ser válida",
  path: ["path"]
})

// Esquema para validar la entrada de texto para generar tarjetas Anki
export const ankiInputSchema = z.object({
  text: z.string().min(10).max(5000)
})

// Esquema para validar credenciales de usuario
export const userCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial')
})

// Función para sanitizar texto
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Eliminar etiquetas HTML
    .replace(/[^\w\s.,!?-]/g, '') // Permitir solo caracteres seguros
    .trim()
}

// Función para validar y sanitizar IDs de YouTube
export function validateYoutubeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id)
}

// Función para validar rutas de archivos
export function validateFilePath(path: string): boolean {
  // Prevenir path traversal
  const normalizedPath = path.replace(/\\/g, '/').toLowerCase()
  
  // Permitir rutas que comienzan con /videos/
  if (normalizedPath.startsWith('/videos/')) {
    return true;
  }
  
  return !normalizedPath.includes('../') && 
         !normalizedPath.includes('..\\');
}

// Función para validar tipos MIME
export function validateMimeType(mimeType: string): boolean {
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav'
  ]
  return allowedTypes.includes(mimeType)
}

// Función para validar tamaño de archivo
export function validateFileSize(size: number): boolean {
  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  return size <= MAX_FILE_SIZE
}

// Función para validar nombres de archivo
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres no seguros
    .replace(/\.{2,}/g, '.') // Prevenir múltiples puntos consecutivos
} 