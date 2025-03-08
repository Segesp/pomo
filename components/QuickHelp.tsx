'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiClock, 
  FiCalendar, 
  FiList, 
  FiBookOpen, 
  FiInfo, 
  FiPlusCircle,
  FiLayout
} from 'react-icons/fi'
import { RiAppleFill, RiMailSendLine, RiRouteLine } from 'react-icons/ri'

// Definir elementos de ayuda
interface HelpItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  topics: string[]
  tips: string[]
}

const helpItems: HelpItem[] = [
  {
    id: 'pomodoro',
    title: 'Temporizador Pomodoro',
    description: 'Estructura tu tiempo de estudio para maximizar la concentración y productividad utilizando ciclos de trabajo y descanso.',
    icon: <FiClock className="h-8 w-8 text-red-600" />,
    topics: [
      'Ciclos de trabajo (25 minutos) seguidos de descansos cortos (5 minutos)',
      'Cada 4 ciclos, toma un descanso largo (15-30 minutos)',
      'El temporizador te notificará cuando cada fase termine',
      'Puedes personalizar la duración de cada fase'
    ],
    tips: [
      'Elimina distracciones durante los ciclos de concentración',
      'Durante los descansos, aléjate de la pantalla',
      'Usa el temporizador para cualquier tipo de tarea que requiera concentración',
      'Registra tus ciclos completados para ver tu progreso'
    ]
  },
  {
    id: 'anki',
    title: 'Apple Free Code (Tarjetas de Estudio)',
    description: 'Genera tarjetas de estudio tipo Anki utilizando inteligencia artificial para mejorar tu retención y comprensión.',
    icon: <RiAppleFill className="h-8 w-8 text-red-600" />,
    topics: [
      'Pega cualquier texto que quieras convertir en tarjetas',
      'El sistema generará preguntas y respuestas automáticamente',
      'Visualiza las tarjetas en formato pregunta/respuesta',
      'Puedes editar o eliminar tarjetas si lo necesitas'
    ],
    tips: [
      'Las mejores tarjetas son las que te hacen pensar profundamente',
      'Revisa las tarjetas periódicamente para aprovechar la repetición espaciada',
      'Combina tarjetas de diferentes temas para conexiones multidisciplinarias',
      'Genera tarjetas después de cada sesión de estudio para reforzar lo aprendido'
    ]
  },
  {
    id: 'planning',
    title: 'Planificación y Calendario',
    description: 'Organiza tus sesiones de estudio con anticipación para mantener la consistencia y seguimiento de objetivos.',
    icon: <FiCalendar className="h-8 w-8 text-red-600" />,
    topics: [
      'Programa sesiones de estudio en el calendario',
      'Establece recordatorios para tus sesiones planificadas',
      'Visualiza tu planificación semanal o mensual',
      'Integra tus objetivos de estudio con tu calendario'
    ],
    tips: [
      'Programa las tareas más difíciles para tus horas de mayor energía',
      'Deja tiempo entre sesiones para descansar',
      'Revisa y ajusta tu planificación semanalmente',
      'Celebra cuando cumplas con tu planificación'
    ]
  },
  {
    id: 'goals',
    title: 'Objetivos de Estudio',
    description: 'Define metas claras para guiar tus sesiones de estudio y medir tu progreso de forma efectiva.',
    icon: <FiPlusCircle className="h-8 w-8 text-red-600" />,
    topics: [
      'Crea objetivos SMART (Específicos, Medibles, Alcanzables, Relevantes, Temporales)',
      'Divide objetivos grandes en subobjetivos manejables',
      'Controla el progreso de cada objetivo',
      'Visualiza estadísticas de cumplimiento'
    ],
    tips: [
      'Concéntrate en el proceso más que en el resultado',
      'Ajusta tus objetivos si son demasiado fáciles o difíciles',
      'Comparte tus objetivos para aumentar la responsabilidad',
      'Recompénsate cuando alcances hitos importantes'
    ]
  },
  {
    id: 'learning',
    title: 'Ruta de Aprendizaje',
    description: 'Descubre el flujo ideal de técnicas de estudio recomendadas por expertos en educación y neurociencia.',
    icon: <RiRouteLine className="h-8 w-8 text-red-600" />,
    topics: [
      'Secuencia optimizada de técnicas de estudio',
      'Combinación de métodos activos y pasivos',
      'Adaptación según el tipo de contenido',
      'Enfoque progresivo desde conceptos básicos hasta avanzados'
    ],
    tips: [
      'Adapta la ruta según tu estilo de aprendizaje personal',
      'Alterna entre diferentes técnicas para mantener el interés',
      'Involucra más sentidos para mejorar la retención',
      'La explicación a otros (método Feynman) es clave para la comprensión profunda'
    ]
  },
  {
    id: 'petition',
    title: 'Special Petition',
    description: 'Solicita aclaraciones o información adicional sobre temas específicos que quieras profundizar.',
    icon: <RiMailSendLine className="h-8 w-8 text-red-600" />,
    topics: [
      'Envía consultas específicas sobre cualquier tema',
      'Recibe explicaciones detalladas adaptadas a tu nivel',
      'Solicita ejemplos adicionales o ejercicios',
      'Pide recomendaciones de recursos complementarios'
    ],
    tips: [
      'Sé específico en tus preguntas para obtener respuestas más útiles',
      'Indica tu nivel de conocimiento para contextualizar mejor la respuesta',
      'Utiliza esta función cuando tengas dudas persistentes',
      'Revisa respuestas anteriores antes de hacer nuevas preguntas similares'
    ]
  },
  {
    id: 'history',
    title: 'Historial y Estadísticas',
    description: 'Revisa tu historial de sesiones y analiza tu progreso para identificar patrones y áreas de mejora.',
    icon: <FiList className="h-8 w-8 text-red-600" />,
    topics: [
      'Visualiza todas tus sesiones de estudio completadas',
      'Analiza estadísticas de tiempo dedicado por tema',
      'Observa tendencias de productividad por día/hora',
      'Consulta tu historial de uso de todas las herramientas'
    ],
    tips: [
      'Identifica tus horas más productivas revisando el historial',
      'Observa qué técnicas te han dado mejores resultados',
      'Celebra tus rachas de consistencia',
      'Usa los datos para optimizar tu planificación futura'
    ]
  },
  {
    id: 'science',
    title: 'Base Científica',
    description: 'Explora la evidencia científica detrás de las técnicas de estudio implementadas en el sistema.',
    icon: <FiBookOpen className="h-8 w-8 text-red-600" />,
    topics: [
      'Fundamentos de neurociencia del aprendizaje',
      'Investigaciones sobre la técnica Pomodoro',
      'Estudios sobre repetición espaciada y tarjetas de memoria',
      'Evidencia de la efectividad de las diferentes técnicas'
    ],
    tips: [
      'Comprender el "por qué" detrás de cada técnica mejora su aplicación',
      'Adapta las técnicas según tu experiencia personal',
      'La consistencia es más importante que la perfección',
      'Combina técnicas para potenciar sus beneficios'
    ]
  },
  {
    id: 'ui',
    title: 'Uso de la Interfaz',
    description: 'Aprende a navegar y utilizar todas las funciones del sistema de forma eficiente.',
    icon: <FiLayout className="h-8 w-8 text-red-600" />,
    topics: [
      'Navegación por categorías en el menú lateral',
      'Acceso a herramientas desde cualquier lugar',
      'Personalización de la interfaz',
      'Atajos de teclado disponibles'
    ],
    tips: [
      'Utiliza el tour guiado para familiarizarte con todas las secciones',
      'Personaliza tu flujo de trabajo según tus necesidades',
      'Mantén abierta solo la herramienta que estés utilizando',
      'Usa la búsqueda para encontrar rápidamente lo que necesitas'
    ]
  }
]

interface QuickHelpProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuickHelp({ isOpen, onClose }: QuickHelpProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filtrar ítems según la búsqueda
  const filteredItems = searchQuery
    ? helpItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tips.some(tip => tip.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : helpItems

  // Obtener el ítem seleccionado
  const currentItem = selectedItem 
    ? helpItems.find(item => item.id === selectedItem)
    : null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl z-10 w-full max-w-4xl max-h-[80vh] overflow-hidden"
          >
            {/* Encabezado */}
            <div className="bg-red-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Guía Rápida</h2>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Contenido */}
            <div className="flex flex-col md:flex-row h-[calc(80vh-64px)]">
              {/* Barra lateral de temas */}
              <div className="w-full md:w-64 border-r border-gray-200 overflow-y-auto p-4 bg-gray-50">
                {/* Búsqueda */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                {/* Lista de temas */}
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`
                        w-full text-left p-2 rounded-md flex items-start
                        ${selectedItem === item.id ? 'bg-red-100 text-red-800' : 'hover:bg-gray-100'}
                      `}
                    >
                      <div className="mr-3 mt-0.5">
                        {item.icon ? (
                          <div className="h-5 w-5 text-red-600">{item.icon}</div>
                        ) : (
                          <FiInfo className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{item.description}</div>
                      </div>
                    </button>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <p className="text-gray-500 text-sm p-2">No se encontraron resultados para "{searchQuery}"</p>
                  )}
                </div>
              </div>
              
              {/* Contenido principal */}
              <div className="flex-1 overflow-y-auto p-6">
                {currentItem ? (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="mr-4">
                        {currentItem.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{currentItem.title}</h3>
                        <p className="text-gray-600">{currentItem.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Qué puedes hacer</h4>
                      <ul className="space-y-2">
                        {currentItem.topics.map((topic, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block h-5 w-5 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">
                              {index + 1}
                            </span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Consejos útiles</h4>
                      <ul className="space-y-2">
                        {currentItem.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-600 mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <FiInfo className="h-16 w-16 text-red-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Selecciona un tema</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      Explora la guía seleccionando un tema de la lista para obtener información detallada y consejos útiles.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Pie de página */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 text-center text-gray-500 text-sm">
              Recuerda que puedes acceder a esta guía en cualquier momento desde el botón de ayuda en la barra superior.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 