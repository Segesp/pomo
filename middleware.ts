import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Obtener la respuesta
  const response = NextResponse.next()

  // Headers de seguridad básicos
  const headers = response.headers

  // Prevenir clickjacking
  headers.set('X-Frame-Options', 'DENY')

  // Prevenir MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Política de seguridad de contenido
  headers.set(
    'Content-Security-Policy',
    "default-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com; " +
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' blob: data: https://i.ytimg.com; " +
    "media-src 'self' blob: data:; " +
    "connect-src 'self' https://api-inference.huggingface.co;"
  )

  // Prevenir XSS
  headers.set('X-XSS-Protection', '1; mode=block')

  // Política de referencias
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Política de permisos
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}

// Configurar las rutas que deben usar el middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 