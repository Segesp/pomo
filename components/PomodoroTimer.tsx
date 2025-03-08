'use client'

import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiPause, FiSkipForward, FiSettings, FiX, FiCheck, FiVolume2, FiVolumeX, FiTag } from 'react-icons/fi'

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
  // Estados principales
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [notes, setNotes] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Configuración del temporizador
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [tempConfig, setTempConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  
  // Referencias para sonidos
  const workCompleteSound = useRef<HTMLAudioElement | null>(null)
  const breakCompleteSound = useRef<HTMLAudioElement | null>(null)

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const savedConfig = loadSavedConfig();
    setConfig(savedConfig);
    setTempConfig(savedConfig);
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
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Cuando el temporizador llega a cero
      if (mode === 'work') {
        // Reproducir sonido de finalización de trabajo
        if (soundEnabled && workCompleteSound.current) {
          workCompleteSound.current.play().catch(e => console.log('Error playing sound:', e))
        }
        
        // Incrementar sesiones completadas
        const newCompletedSessions = completedSessions + 1
        setCompletedSessions(newCompletedSessions)
        
        // Guardar la sesión completada
        saveSession()
        
        // Determinar si es hora de un descanso largo o corto
        if (newCompletedSessions % config.sessionsBeforeLongBreak === 0) {
          setMode('longBreak')
          setTimeLeft(config.longBreakTime)
        } else {
          setMode('break')
          setTimeLeft(config.breakTime)
        }
      } else {
        // Finalizar descanso, volver a modo trabajo
        if (soundEnabled && breakCompleteSound.current) {
          breakCompleteSound.current.play().catch(e => console.log('Error playing sound:', e))
        }
        setMode('work')
        setTimeLeft(config.workTime)
      }
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, completedSessions, config, soundEnabled])

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

  // Formatear tiempo en minutos:segundos
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Manejar inicio/pausa del temporizador
  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  // Saltar al siguiente modo
  const skipToNext = () => {
    setIsActive(false)
    
    if (mode === 'work') {
      // Si estamos en modo trabajo, considerar como no completado
      if (completedSessions % config.sessionsBeforeLongBreak === config.sessionsBeforeLongBreak - 1) {
        setMode('longBreak')
        setTimeLeft(config.longBreakTime)
      } else {
        setMode('break')
        setTimeLeft(config.breakTime)
      }
    } else {
      // Si estamos en descanso, volver a modo trabajo
      setMode('work')
      setTimeLeft(config.workTime)
    }
  }

  // Manejar cambios en la configuración temporal
  const handleConfigChange = (field: keyof TimerConfig, value: string) => {
    // Convertir a minutos y luego a segundos para los campos de tiempo
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return
    
    if (field === 'sessionsBeforeLongBreak') {
      setTempConfig({ ...tempConfig, [field]: numValue })
    } else {
      // Convertir minutos a segundos
      setTempConfig({ ...tempConfig, [field]: numValue * 60 })
    }
  }

  // Guardar cambios de configuración
  const saveConfig = () => {
    setConfig(tempConfig)
    
    // Guardar en localStorage
    localStorage.setItem('pomodoroConfig', JSON.stringify(tempConfig))
    
    // Si no está activo, actualizar el tiempo actual
    if (!isActive) {
      if (mode === 'work') {
        setTimeLeft(tempConfig.workTime)
      } else if (mode === 'break') {
        setTimeLeft(tempConfig.breakTime)
      } else {
        setTimeLeft(tempConfig.longBreakTime)
      }
    }
    
    setShowSettings(false)
  }

  // Cancelar cambios de configuración
  const cancelConfig = () => {
    setTempConfig(config)
    setShowSettings(false)
  }

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

  // Calcular progreso para el círculo
  const calculateProgress = () => {
    let totalTime
    
    if (mode === 'work') {
      totalTime = config.workTime
    } else if (mode === 'break') {
      totalTime = config.breakTime
    } else {
      totalTime = config.longBreakTime
    }
    
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  // Radio y circunferencia para el SVG
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const progress = calculateProgress()
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="max-w-3xl mx-auto">
      {/* Temporizador */}
      <div className="text-center mb-8">
        <h2 className="timer-label">
          {mode === 'work' ? 'Trabajando' : mode === 'break' ? 'Descanso Corto' : 'Descanso Largo'}
        </h2>
        
        <div className="w-72 h-72 mx-auto relative mb-4">
          {/* Círculo de progreso */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Círculo de fondo */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="hsl(var(--border))" 
              strokeWidth="8" 
            />
            
            {/* Círculo de progreso */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="hsl(var(--primary))" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeDasharray={`${calculateProgress() * 283} 283`}
              transform="rotate(-90 50 50)" 
              className="timer-circle" 
            />
          </svg>
          
          {/* Temporizador */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="timer-display">{formatTime(timeLeft)}</div>
          </div>
        </div>
        
        <div className="text-sm mb-6 text-muted-foreground">
          Sesiones completadas: <span className="font-medium">{completedSessions}</span>
          {config.sessionsBeforeLongBreak > 0 && (
            <> de <span className="font-medium">{config.sessionsBeforeLongBreak}</span></>
          )}
        </div>
        
        {/* Controles */}
        <div className="timer-control">
          <button 
            onClick={toggleTimer}
            className="bg-primary text-primary-foreground rounded-full p-4 hover:bg-primary/90 transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isActive ? <FiPause size={24} /> : <FiPlay size={24} />}
          </button>
          
          <button 
            onClick={skipToNext}
            className="bg-accent hover:bg-accent/90 rounded-full p-4 text-foreground transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <FiSkipForward size={24} />
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="bg-accent hover:bg-accent/90 rounded-full p-4 text-foreground transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <FiSettings size={24} />
          </button>
          
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-accent hover:bg-accent/90 rounded-full p-4 text-foreground transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {soundEnabled ? <FiVolume2 size={24} /> : <FiVolumeX size={24} />}
          </button>
        </div>
      </div>
      
      {/* Session tracking - Only show in work mode */}
      {mode === 'work' && (
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
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Configuración</h3>
              <button onClick={cancelConfig} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de trabajo (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempConfig.workTime / 60}
                  onChange={(e) => handleConfigChange('workTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de descanso corto (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempConfig.breakTime / 60}
                  onChange={(e) => handleConfigChange('breakTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de descanso largo (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempConfig.longBreakTime / 60}
                  onChange={(e) => handleConfigChange('longBreakTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sesiones antes de un descanso largo
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tempConfig.sessionsBeforeLongBreak}
                  onChange={(e) => handleConfigChange('sessionsBeforeLongBreak', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={cancelConfig}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <FiCheck className="mr-2" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 