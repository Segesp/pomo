import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos')
    
    // Verificar si el directorio existe, si no, crearlo
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true })
      console.log('Directorio de videos creado:', videosDir)
      return NextResponse.json({ 
        videos: [],
        message: 'No hay videos disponibles. Por favor, agrega archivos de video en la carpeta /public/videos' 
      })
    }

    // Leer el contenido del directorio
    const files = fs.readdirSync(videosDir)

    // Filtrar solo archivos de video y verificar que sean accesibles
    const videoFiles = files.filter(file => {
      const filePath = path.join(videosDir, file)
      const ext = path.extname(file).toLowerCase()
      try {
        // Verificar que el archivo existe y es accesible
        fs.accessSync(filePath, fs.constants.R_OK)
        return ['.mp4', '.webm', '.ogg'].includes(ext)
      } catch (error) {
        console.error(`Error accediendo al archivo ${file}:`, error)
        return false
      }
    })

    // Crear la lista de videos con información adicional
    const videos = videoFiles.map(file => {
      const filePath = path.join(videosDir, file)
      const stats = fs.statSync(filePath)
      
      // Codificar el nombre del archivo para la URL
      const encodedFileName = encodeURIComponent(file)
      const videoPath = `/videos/${encodedFileName}`
      
      console.log('Procesando video local:', {
        nombre: file,
        rutaCompleta: filePath,
        rutaServida: videoPath
      })
      
      return {
        title: path.parse(file).name,
        path: videoPath,
        type: 'local',
        size: stats.size,
        lastModified: stats.mtime,
        originalName: file
      }
    })

    console.log('Videos encontrados:', videos) // Para depuración

    if (videos.length === 0) {
      return NextResponse.json({ 
        videos: [],
        message: 'No hay videos disponibles. Por favor, agrega archivos de video en la carpeta /public/videos' 
      })
    }

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error al leer los videos:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener la lista de videos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
  }
} 