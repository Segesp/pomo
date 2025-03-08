'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FiPlay, FiPause, FiSkipForward, FiSettings, FiX, FiCheck, FiVolume2, FiVolumeX, FiTag } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface TimerConfig {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  sessionsBeforeLongBreak: number;
}

// Configuración predeterminada
const DEFAULT_CONFIG: TimerConfig = {
  workTime: 25 * 60, // 25 minutos en segundos
  breakTime: 5 * 60,  // 5 minutos en segundos
  longBreakTime: 15 * 60, // 15 minutos en segundos
  sessionsBeforeLongBreak: 4 // Número de sesiones antes de un descanso largo
}

// Cargar la configuración guardada o usar la predeterminada
const loadSavedConfig = (): TimerConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }
  
  const savedConfig = localStorage.getItem('pomodoroConfig');
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch (error) {
      console.error('Error parsing saved config:', error);
    }
  }
  
  return DEFAULT_CONFIG;
};

export default function PomodoroTimer() {
  // Estados para el temporizador
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutos por defecto
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [notes, setNotes] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Configuración del temporizador
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);

  // Referencias para sonidos
  const workCompleteSound = useRef<HTMLAudioElement | null>(null)
  const breakCompleteSound = useRef<HTMLAudioElement | null>(null)

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const savedConfig = loadSavedConfig();
    setConfig(savedConfig);
    setTimeLeft(savedConfig.workTime);
    
    // Inicializar sonidos
    if (typeof window !== 'undefined') {
      workCompleteSound.current = new Audio('/sounds/work-complete.mp3')
      breakCompleteSound.current = new Audio('/sounds/break-complete.mp3')
    }
  }, []);

  // Guardar configuración cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroConfig', JSON.stringify(config));
    }
  }, [config]);

  // Efecto para el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Reproducir sonido de notificación
      const audio = new Audio('/notification.mp3')
      audio.play()

      // Cambiar entre trabajo y descanso
      if (!isBreak) {
        const newSessionCount = sessionCount + 1
        setSessionCount(newSessionCount)
        
        if (newSessionCount % config.sessionsBeforeLongBreak === 0) {
          setTimeLeft(config.longBreakTime)
        } else {
          setTimeLeft(config.breakTime)
        }
      } else {
        setTimeLeft(config.workTime)
      }
      
      setIsBreak(!isBreak)
      setIsRunning(false)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isBreak, config, sessionCount])

  // Guardar una sesión completada
  const saveSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: config.workTime,
          tags,
          notes: notes.trim() ? notes : undefined,
          completed: new Date().toISOString()
        }),
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar la sesión')
      }
      
      // Limpiar tags y notas para la siguiente sesión
      setTags([])
      setNotes('')
      
    } catch (error) {
      console.error('Error guardando la sesión:', error)
    }
  }

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calcular progreso para el círculo
  const calculateProgress = () => {
    const total = isBreak 
      ? (sessionCount % config.sessionsBeforeLongBreak === 0 ? config.longBreakTime : config.breakTime)
      : config.workTime
    return ((total - timeLeft) / total) * 100
  }

  // Manejar inicio/pausa del temporizador
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Manejar cambios en la configuración temporal
  const handleConfigChange = (field: keyof TimerConfig, value: string) => {
    // Convertir a minutos y luego a segundos para los campos de tiempo
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return
    
    if (field === 'sessionsBeforeLongBreak') {
      setConfig({ ...config, [field]: numValue })
    } else {
      // Convertir minutos a segundos
      setConfig({ ...config, [field]: numValue * 60 })
    }
  }

  // Guardar cambios de configuración
  const saveConfig = useCallback((newConfig: TimerConfig) => {
    localStorage.setItem('pomodoroConfig', JSON.stringify(newConfig))
    setConfig(newConfig)
    setTimeLeft(newConfig.workTime)
    setIsRunning(false)
  }, [])

  // Añadir una etiqueta
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  // Eliminar una etiqueta
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Manejar la tecla Enter en el input de etiquetas
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Radio y circunferencia para el SVG
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const progress = calculateProgress()
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="card">
      <div className="flex flex-col items-center">
        {/* Título y estado */}
        <h2 className="timer-label">
          {isBreak 
            ? (sessionCount % config.sessionsBeforeLongBreak === 0 
              ? 'Descanso Largo' 
              : 'Descanso Corto')
            : 'Tiempo de Trabajo'}
        </h2>

        {/* Círculo del temporizador */}
        <div className="relative w-64 h-64 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            {/* Círculo de fondo */}
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              className="stroke-muted fill-none"
              strokeWidth="4"
            />
            {/* Círculo de progreso */}
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              className="stroke-primary fill-none transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={`${calculateProgress() * 3.14}, 314`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Tiempo restante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="timer-display">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className="timer-button"
          >
            {isRunning ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setTimeLeft(isBreak ? config.workTime : config.breakTime)
              setIsRunning(false)
            }}
            className="timer-button"
          >
            <FiSkipForward className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="timer-button"
          >
            <FiSettings className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Sesiones completadas */}
        <div className="mt-6 flex items-center space-x-2">
          {Array.from({ length: config.sessionsBeforeLongBreak }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                i < (sessionCount % config.sessionsBeforeLongBreak)
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Panel de configuración */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 w-full"
            >
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Tiempo de trabajo (minutos)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.workTime / 60}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                        workTime: parseInt(e.target.value) * 60
                      }
                      saveConfig(newConfig)
                    }}
                    className="input w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tiempo de descanso corto (minutos)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={config.breakTime / 60}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                        breakTime: parseInt(e.target.value) * 60
                      }
                      saveConfig(newConfig)
                    }}
                    className="input w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tiempo de descanso largo (minutos)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.longBreakTime / 60}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                        longBreakTime: parseInt(e.target.value) * 60
                      }
                      saveConfig(newConfig)
                    }}
                    className="input w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sesiones antes del descanso largo</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={config.sessionsBeforeLongBreak}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                        sessionsBeforeLongBreak: parseInt(e.target.value)
                      }
                      saveConfig(newConfig)
                    }}
                    className="input w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session tracking - Only show in work mode */}
        {config.workTime === timeLeft && (
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Seguimiento de sesión</h3>
              <button 
                onClick={() => setShowTagInput(!showTagInput)}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <FiTag className="mr-1" />
                {showTagInput ? 'Ocultar etiquetas' : 'Añadir etiquetas'}
              </button>
            </div>
            
            {/* Tags section */}
            {showTagInput && (
              <div className="mb-4">
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Añadir etiqueta (ej: matemáticas, historia...)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    Añadir
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-700 hover:text-blue-900"
                      >
                        <FiX size={16} />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-sm text-gray-500">No hay etiquetas</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Notes section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas sobre lo que estás trabajando..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 