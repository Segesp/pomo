import { useEffect, useRef } from 'react'

export default function BackgroundPattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar el tamaño del canvas
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Dibujar tomates estilizados
    const drawTomato = (x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      
      // Cuerpo del tomate
      ctx.beginPath()
      ctx.fillStyle = 'rgba(229, 62, 62, 0.1)' // Rojo suave y transparente
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fill()
      
      // Hojas
      ctx.beginPath()
      ctx.fillStyle = 'rgba(104, 211, 145, 0.1)' // Verde suave y transparente
      ctx.moveTo(-size/2, -size/2)
      ctx.quadraticCurveTo(-size/4, -size, 0, -size/2)
      ctx.quadraticCurveTo(size/4, -size, size/2, -size/2)
      ctx.fill()
      
      ctx.restore()
    }

    // Animación
    let frame = 0
    const animate = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dibujar patrón de tomates
      for (let i = 0; i < canvas.width; i += 200) {
        for (let j = 0; j < canvas.height; j += 200) {
          const offset = Math.sin(frame * 0.02 + i * 0.1 + j * 0.1) * 20
          drawTomato(
            i + offset,
            j + offset,
            30,
            Math.sin(frame * 0.01 + i * 0.05 + j * 0.05) * 0.2
          )
        }
      }

      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-50"
    />
  )
} 