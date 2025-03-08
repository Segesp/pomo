'use client'

import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiRepeat } from 'react-icons/fi'
import { videoSchema, validateYoutubeId, validateFilePath, validateMimeType } from '../lib/validation'
import { z } from 'zod'

// Declaración de tipo para la API de YouTube
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Video {
  title: string
  path: string
  type: 'local' | 'youtube'
  originalName?: string
  youtubeId?: string
}

// Constantes para estados del reproductor de YouTube
const YT_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const

// Constantes para errores del reproductor de YouTube
const YT_ERRORS = {
  INVALID_PARAM: 2,
  HTML5_ERROR: 5,
  NOT_FOUND: 100,
  NOT_ALLOWED: 101,
  NOT_ALLOWED_EMBED: 150
} as const

const DEFAULT_VIDEOS = [
  {
    title: 'Lofi Girl - Beats to Study',
    path: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk',
    type: 'youtube' as const,
    youtubeId: 'jfKfPfyJRdk'
  },
  {
    title: 'Study Music - Focus & Concentration',
    path: 'https://www.youtube-nocookie.com/embed/5qap5aO4i9A',
    type: 'youtube' as const,
    youtubeId: '5qap5aO4i9A'
  },
  {
    title: 'Relaxing Jazz Music',
    path: 'https://www.youtube-nocookie.com/embed/neV3EPgvZ3g',
    type: 'youtube' as const,
    youtubeId: 'neV3EPgvZ3g'
  }
].map((video) => {
  try {
    return videoSchema.parse(video) as Video
  } catch (error) {
    console.error('Error validando video por defecto:', error)
    throw new Error('Error en la configuración de videos por defecto')
  }
}) as Video[]

export default function VideoPlayer() {
  const [videos, setVideos] = useState<Video[]>(DEFAULT_VIDEOS)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true)
  const [youtubeApiReady, setYoutubeApiReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const youtubePlayer = useRef<any>(null)
  const previousVideoType = useRef<'local' | 'youtube'>(videos[0].type)

  // Cargar la lista de videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos', {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin'
        })

        if (!response.ok) {
          throw new Error('Error al cargar los videos')
        }

        const data = await response.json()

        if (data.videos && Array.isArray(data.videos)) {
          const validatedVideos = data.videos
            .map((video: unknown) => {
              try {
                if (typeof video !== 'object' || video === null) {
                  console.error('Video inválido:', video)
                  return null
                }

                const videoData = video as Record<string, unknown>

                // Validar la ruta del archivo para videos locales
                if (videoData.type === 'local' && typeof videoData.path === 'string') {
                  // Asegurarse de que la ruta comience con /videos/
                  const path = videoData.path.startsWith('/videos/') 
                    ? videoData.path 
                    : `/videos/${videoData.path.split('/').pop()}`
                  
                  return videoSchema.parse({
                    ...videoData,
                    path,
                    type: 'local' as const
                  })
                }

                // Validar ID de YouTube para videos de YouTube
                if (videoData.type === 'youtube' && typeof videoData.youtubeId === 'string' && validateYoutubeId(videoData.youtubeId)) {
                  return videoSchema.parse({
                    ...videoData,
                    type: 'youtube' as const
                  })
                }

                return null
              } catch (error) {
                console.error('Error validando video:', error)
                return null
              }
            })
            .filter((video: unknown): video is Video => video !== null)

          console.log('Videos validados:', validatedVideos)
          setVideos([...validatedVideos, ...DEFAULT_VIDEOS])
        }
      } catch (error) {
        console.error('Error:', error)
        setError(error instanceof Error ? error.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  // Cargar la API de YouTube de forma segura
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        
        // Validar el origen del script
        if (!tag.src.startsWith('https://www.youtube.com/')) {
          console.error('Origen no permitido para el script de YouTube')
          return
        }

        const firstScriptTag = document.getElementsByTagName('script')[0]
        if (firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        }

        window.onYouTubeIframeAPIReady = () => {
          setYoutubeApiReady(true)
        }
      } else {
        setYoutubeApiReady(true)
      }
    }

    loadYouTubeAPI()

    return () => {
      cleanupYouTubePlayer()
    }
  }, [])

  const cleanupYouTubePlayer = () => {
    try {
      if (youtubePlayer.current) {
        youtubePlayer.current.destroy()
        youtubePlayer.current = null
      }
      // Limpiar el contenedor de forma segura
      if (playerContainerRef.current) {
        while (playerContainerRef.current.firstChild) {
          const child = playerContainerRef.current.firstChild
          if (child instanceof Node) {
            playerContainerRef.current.removeChild(child)
          }
        }
      }
    } catch (error) {
      console.error('Error al limpiar el reproductor de YouTube:', error)
    }
  }

  // Inicializar el reproductor de YouTube cuando la API está lista
  useEffect(() => {
    const initializeYouTubePlayer = () => {
      if (!youtubeApiReady || !videos[currentVideoIndex] || !playerContainerRef.current) return

      const currentVideo = videos[currentVideoIndex]

      // Validar el video actual
      try {
        videoSchema.parse(currentVideo)
      } catch (error) {
        console.error('Video inválido:', error)
        setError('Error: Video inválido')
        return
      }

      // Si cambiamos de tipo de video, limpiar el reproductor anterior
      if (previousVideoType.current !== currentVideo.type) {
        cleanupYouTubePlayer()
      }

      if (currentVideo.type === 'youtube' && currentVideo.youtubeId) {
        try {
          // Validar el ID de YouTube
          if (!validateYoutubeId(currentVideo.youtubeId)) {
            throw new Error('ID de YouTube inválido')
          }

          // Crear un nuevo div para el reproductor con ID único
          const playerDiv = document.createElement('div')
          const uniqueId = `youtube-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          playerDiv.id = uniqueId
          
          // Limpiar el contenedor antes de agregar el nuevo div
          while (playerContainerRef.current.firstChild) {
            playerContainerRef.current.removeChild(playerContainerRef.current.firstChild)
          }
          
          playerContainerRef.current.appendChild(playerDiv)

          youtubePlayer.current = new window.YT.Player(uniqueId, {
            videoId: currentVideo.youtubeId,
            playerVars: {
              autoplay: isAutoplayEnabled ? 1 : 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              origin: window.location.origin,
              enablejsapi: 1,
              widget_referrer: window.location.origin,
              host: 'https://www.youtube-nocookie.com',
              playsinline: 1,
              loop: 0
            },
            events: {
              onStateChange: (event: any) => {
                switch (event.data) {
                  case YT_STATES.ENDED:
                    if (isAutoplayEnabled) {
                      handleVideoEnd()
                    }
                    setIsPlaying(false)
                    break
                  case YT_STATES.PLAYING:
                    setIsPlaying(true)
                    break
                  case YT_STATES.PAUSED:
                    setIsPlaying(false)
                    break
                  case YT_STATES.BUFFERING:
                    // Opcional: Mostrar indicador de carga
                    break
                  case YT_STATES.UNSTARTED:
                    if (isAutoplayEnabled) {
                      event.target.playVideo()
                    }
                    setIsPlaying(false)
                    break
                }
              },
              onError: (error: any) => {
                console.error('Error en YouTube Player:', error)
                let errorMessage = 'Error al reproducir el video de YouTube'
                
                switch (error.data) {
                  case YT_ERRORS.INVALID_PARAM:
                    errorMessage = 'Error: Parámetros de video inválidos'
                    break
                  case YT_ERRORS.HTML5_ERROR:
                    errorMessage = 'Error: El video no puede ser reproducido en HTML5'
                    break
                  case YT_ERRORS.NOT_FOUND:
                    errorMessage = 'Error: Video no encontrado'
                    break
                  case YT_ERRORS.NOT_ALLOWED:
                  case YT_ERRORS.NOT_ALLOWED_EMBED:
                    errorMessage = 'Error: La reproducción de este video no está permitida'
                    break
                }
                
                setError(errorMessage)
              },
              onReady: (event: any) => {
                // Restaurar el estado de mute y autoplay
                if (isMuted) {
                  event.target.mute()
                }
                if (isAutoplayEnabled) {
                  event.target.playVideo()
                }
              }
            }
          })
        } catch (error) {
          console.error('Error al inicializar el reproductor de YouTube:', error)
          setError('Error al inicializar el reproductor de YouTube')
        }
      }

      previousVideoType.current = currentVideo.type
    }

    initializeYouTubePlayer()

    return () => {
      if (videos[currentVideoIndex]?.type !== 'youtube') {
        cleanupYouTubePlayer()
      }
    }
  }, [youtubeApiReady, currentVideoIndex, videos, isAutoplayEnabled, isMuted])

  const handleVideoEnd = () => {
    if (isAutoplayEnabled) {
      if (currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(prev => prev + 1)
      } else {
        // Volver al primer video cuando se termina la lista
        setCurrentVideoIndex(0)
      }
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Error en el video:', e)
    const videoElement = e.target as HTMLVideoElement
    setError(`Error al cargar el video: ${videoElement.error?.message || 'Error desconocido'}`)
  }

  const togglePlay = () => {
    try {
      if (videos[currentVideoIndex].type === 'local' && videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause()
        } else {
          const playPromise = videoRef.current.play()
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error al reproducir:', error)
              setError('Error al reproducir el video')
            })
          }
        }
        setIsPlaying(!isPlaying)
      } else if (videos[currentVideoIndex].type === 'youtube' && youtubePlayer.current) {
        if (isPlaying) {
          youtubePlayer.current.pauseVideo()
        } else {
          youtubePlayer.current.playVideo()
        }
      }
    } catch (error) {
      console.error('Error al controlar la reproducción:', error)
      setError('Error al controlar la reproducción')
    }
  }

  const toggleMute = () => {
    try {
      if (videos[currentVideoIndex].type === 'local' && videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted
        setIsMuted(!isMuted)
      } else if (videos[currentVideoIndex].type === 'youtube' && youtubePlayer.current) {
        if (isMuted) {
          youtubePlayer.current.unMute()
        } else {
          youtubePlayer.current.mute()
        }
        setIsMuted(!isMuted)
      }
    } catch (error) {
      console.error('Error al controlar el audio:', error)
      setError('Error al controlar el audio')
    }
  }

  const toggleAutoplay = () => {
    setIsAutoplayEnabled(!isAutoplayEnabled)
  }

  const playNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1)
    }
  }

  const playPrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const currentVideo = videos[currentVideoIndex]

  // Validar el video actual antes de renderizar
  try {
    videoSchema.parse(currentVideo)
  } catch (error) {
    console.error('Video actual inválido:', error)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">Error: Video inválido</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <button
            onClick={() => setError('')}
            className="absolute top-0 right-0 p-2"
            type="button"
            aria-label="Cerrar mensaje de error"
          >
            <span className="text-xl">&times;</span>
          </button>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Video actual */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {currentVideo.type === 'youtube' ? (
          <div ref={playerContainerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full">
            <video
              ref={videoRef}
              key={currentVideo.path + Date.now()}
              className="w-full h-full"
              onEnded={handleVideoEnd}
              onError={handleVideoError}
              controls
              controlsList="nodownload noremoteplayback"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
            >
              <source 
                src={currentVideo.path} 
                type="video/mp4" 
                onError={(e) => {
                  console.error('Error en source:', e)
                  setError('Formato de video no soportado o ruta incorrecta')
                }}
              />
              <source 
                src={currentVideo.path} 
                type="video/webm" 
              />
              Tu navegador no soporta el elemento de video.
            </video>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Debug: {currentVideo.path}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={playPrevious}
            disabled={currentVideoIndex === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Video anterior"
            type="button"
          >
            <FiSkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="p-2 rounded-full hover:bg-gray-100"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
            type="button"
          >
            {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
          </button>
          <button
            onClick={playNext}
            disabled={currentVideoIndex === videos.length - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Siguiente video"
            type="button"
          >
            <FiSkipForward size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleAutoplay}
            className={`p-2 rounded-full hover:bg-gray-100 ${
              isAutoplayEnabled ? 'text-red-600' : 'text-gray-400'
            }`}
            title="Reproducción automática"
            type="button"
          >
            <FiRepeat size={20} />
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-gray-100"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            type="button"
          >
            {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Lista de reproducción */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Lista de reproducción</h3>
          <div className="space-y-2">
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentVideoIndex === index
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-gray-100'
                }`}
                type="button"
              >
                <div className="flex items-center space-x-2">
                  <span className="flex-1">{video.title}</span>
                  <span className="text-xs text-gray-500">
                    {video.type === 'youtube' ? 'YouTube' : 'Local'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 