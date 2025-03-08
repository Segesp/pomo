'use client'

import React, { useState } from 'react'
import { 
  FiClock, 
  FiCalendar, 
  FiFlag, 
  FiTrello, 
  FiRepeat, 
  FiCheck, 
  FiBarChart2,
  FiLifeBuoy,
  FiBox,
  FiChevronRight,
  FiInfo
} from 'react-icons/fi'
import { RiAppleFill, RiMailSendLine, RiRouteLine } from 'react-icons/ri'

interface Technique {
  id: string
  name: string
  icon: JSX.Element
  description: string
  benefits: string[]
  duration: string
  nextTechniques: string[]
}

interface TechniqueNode {
  technique: Technique
  level: number
  position: number
}

const TECHNIQUES: Technique[] = [
  {
    id: 'planning',
    name: 'Planificación Inicial',
    icon: <FiCalendar className="h-6 w-6 text-purple-600" />,
    description: 'Define objetivos claros y establece un plan de estudio',
    benefits: [
      'Claridad en los objetivos',
      'Optimización del tiempo',
      'Reducción de la procrastinación'
    ],
    duration: '15-30 minutos',
    nextTechniques: ['pomodoro']
  },
  {
    id: 'pomodoro',
    name: 'Técnica Pomodoro',
    icon: <FiClock className="h-6 w-6 text-red-600" />,
    description: 'Ciclos de concentración intensa seguidos de descansos breves',
    benefits: [
      'Mayor concentración',
      'Menos fatiga mental',
      'Optimización del tiempo de estudio'
    ],
    duration: '25 minutos + 5 de descanso',
    nextTechniques: ['apple-free-code']
  },
  {
    id: 'apple-free-code',
    name: 'Apple Free Code',
    icon: <RiAppleFill className="h-6 w-6 text-red-600" />,
    description: 'Generación de tarjetas de estudio basadas en el contenido estudiado',
    benefits: [
      'Sistematización del conocimiento',
      'Refuerzo de conceptos clave',
      'Preparación para el repaso espaciado'
    ],
    duration: '15-20 minutos',
    nextTechniques: ['spaced-repetition']
  },
  {
    id: 'spaced-repetition',
    name: 'Repetición Espaciada',
    icon: <FiRepeat className="h-6 w-6 text-green-600" />,
    description: 'Repaso de material a intervalos optimizados para la retención',
    benefits: [
      'Mejora de la memoria a largo plazo',
      'Eficiencia en el aprendizaje',
      'Retención duradera del conocimiento'
    ],
    duration: '10-15 minutos (varias veces al día)',
    nextTechniques: ['active-recall', 'feynman']
  },
  {
    id: 'active-recall',
    name: 'Active Recall',
    icon: <FiTrello className="h-6 w-6 text-blue-600" />,
    description: 'Técnica para recuperar activamente información de la memoria',
    benefits: [
      'Fortalecimiento de conexiones neuronales',
      'Mejora de la recuperación de información',
      'Identificación de lagunas de conocimiento'
    ],
    duration: '15-20 minutos',
    nextTechniques: ['special-petition', 'feynman']
  },
  {
    id: 'special-petition',
    name: 'Special Petition',
    icon: <RiMailSendLine className="h-6 w-6 text-yellow-600" />,
    description: 'Solicitud de revisión o profundización de temas específicos',
    benefits: [
      'Refuerzo de áreas débiles',
      'Personalización del estudio',
      'Resolución de dudas pendientes'
    ],
    duration: '15-30 minutos',
    nextTechniques: ['feynman']
  },
  {
    id: 'feynman',
    name: 'Método Feynman',
    icon: <FiLifeBuoy className="h-6 w-6 text-indigo-600" />,
    description: 'Explicación de conceptos en términos simples para solidificar el conocimiento',
    benefits: [
      'Identificación de lagunas en la comprensión',
      'Consolidación del conocimiento',
      'Desarrollo de habilidades explicativas'
    ],
    duration: '20-30 minutos',
    nextTechniques: ['reflection']
  },
  {
    id: 'reflection',
    name: 'Reflexión y Análisis',
    icon: <FiBarChart2 className="h-6 w-6 text-gray-600" />,
    description: 'Evaluación del progreso y ajuste de la estrategia de estudio',
    benefits: [
      'Optimización continua del proceso',
      'Identificación de fortalezas y debilidades',
      'Refinamiento de técnicas'
    ],
    duration: '10-15 minutos',
    nextTechniques: ['planning']
  }
]

export default function LearningPath() {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const [hoveredTechnique, setHoveredTechnique] = useState<string | null>(null)
  
  // Organizar las técnicas en niveles para la visualización del flujo
  const organizeByLevels = (): TechniqueNode[] => {
    const nodes: TechniqueNode[] = []
    const processed = new Set<string>()
    
    // Empezar con la planificación (nivel 0)
    const startTechnique = TECHNIQUES.find(t => t.id === 'planning')
    if (startTechnique) {
      nodes.push({
        technique: startTechnique,
        level: 0,
        position: 0
      })
      processed.add(startTechnique.id)
      
      // Procesar nodos por niveles
      let currentLevel = 0
      let hasNewNodes = true
      
      while (hasNewNodes) {
        hasNewNodes = false
        const currentLevelNodes = nodes.filter(n => n.level === currentLevel)
        
        let nextPosition = 0
        currentLevelNodes.forEach(node => {
          node.technique.nextTechniques.forEach(nextId => {
            if (!processed.has(nextId)) {
              const nextTechnique = TECHNIQUES.find(t => t.id === nextId)
              if (nextTechnique) {
                nodes.push({
                  technique: nextTechnique,
                  level: currentLevel + 1,
                  position: nextPosition++
                })
                processed.add(nextId)
                hasNewNodes = true
              }
            }
          })
        })
        
        currentLevel++
      }
    }
    
    return nodes
  }
  
  const techniqueNodes = organizeByLevels()
  const maxLevel = Math.max(...techniqueNodes.map(n => n.level))
  
  // Agrupar nodos por nivel
  const nodesByLevel = techniqueNodes.reduce((acc, node) => {
    if (!acc[node.level]) acc[node.level] = []
    acc[node.level].push(node)
    return acc
  }, {} as Record<number, TechniqueNode[]>)
  
  // Verificar si dos técnicas están conectadas
  const isConnected = (sourceId: string, targetId: string): boolean => {
    const source = TECHNIQUES.find(t => t.id === sourceId)
    return source?.nextTechniques.includes(targetId) || false
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ruta de Aprendizaje Integral</h2>
        <p className="text-gray-600">
          Este diagrama muestra el flujo óptimo de técnicas de estudio basadas en evidencia científica,
          diseñadas para trabajar en conjunto y potenciar tu aprendizaje.
        </p>
      </div>

      {/* Diagrama de flujo */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Técnicas organizadas por niveles */}
          <div className="relative">
            {/* Conectores */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0 }}
            >
              {/* Dibujar líneas entre técnicas conectadas */}
              {techniqueNodes.map(source => (
                source.technique.nextTechniques.map(targetId => {
                  const target = techniqueNodes.find(n => n.technique.id === targetId)
                  if (target) {
                    const isHighlighted = 
                      (hoveredTechnique === source.technique.id || hoveredTechnique === targetId)
                      
                    return (
                      <path
                        key={`${source.technique.id}-${targetId}`}
                        d={`M ${source.level * 200 + 100} ${source.position * 120 + 50} 
                           C ${source.level * 200 + 175} ${source.position * 120 + 50},
                             ${target.level * 200 + 25} ${target.position * 120 + 50},
                             ${target.level * 200 + 75} ${target.position * 120 + 50}`}
                        stroke={isHighlighted ? "#e11d48" : "#d1d5db"}
                        strokeWidth={isHighlighted ? 3 : 2}
                        fill="none"
                        strokeDasharray={isHighlighted ? "none" : "5,5"}
                      />
                    )
                  }
                  return null
                })
              ))}
            </svg>
            
            {/* Renderizar niveles y nodos */}
            <div className="flex justify-start space-x-24 relative z-10">
              {Array.from({ length: maxLevel + 1 }).map((_, level) => (
                <div key={level} className="space-y-8">
                  {(nodesByLevel[level] || []).map(node => (
                    <div 
                      key={node.technique.id}
                      className={`
                        w-40 p-4 rounded-lg shadow-md border transition-all duration-200
                        ${
                          hoveredTechnique === node.technique.id || 
                          (hoveredTechnique && node.technique.nextTechniques.includes(hoveredTechnique)) ||
                          (hoveredTechnique && TECHNIQUES.find(t => t.id === hoveredTechnique)?.nextTechniques.includes(node.technique.id))
                            ? 'border-red-300 bg-red-50 shadow-lg' 
                            : 'border-gray-200 bg-white'
                        }
                        ${selectedTechnique?.id === node.technique.id ? 'ring-2 ring-red-500' : ''}
                      `}
                      onMouseEnter={() => setHoveredTechnique(node.technique.id)}
                      onMouseLeave={() => setHoveredTechnique(null)}
                      onClick={() => setSelectedTechnique(node.technique)}
                    >
                      <div className="flex justify-center mb-3">
                        {node.technique.icon}
                      </div>
                      <h3 className="text-center font-medium">{node.technique.name}</h3>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de la técnica seleccionada */}
      {selectedTechnique ? (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="mr-3">
                {selectedTechnique.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedTechnique.name}</h3>
                <p className="text-gray-600">{selectedTechnique.description}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {selectedTechnique.duration}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Beneficios:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {selectedTechnique.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Siguiente(s) Técnica(s):</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTechnique.nextTechniques.map(nextId => {
                  const next = TECHNIQUES.find(t => t.id === nextId)
                  return next ? (
                    <button
                      key={nextId}
                      onClick={() => setSelectedTechnique(next)}
                      className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-800 rounded-md hover:bg-red-100 transition-colors"
                    >
                      {next.name}
                      <FiChevronRight className="ml-1" />
                    </button>
                  ) : null
                })}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 flex items-start">
              <FiInfo className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Para obtener mejores resultados, sigue la ruta sugerida e integra cada técnica en tu flujo de estudio. 
                Recuerda que la combinación de varias técnicas produce un efecto sinérgico.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md text-center">
          <FiBox className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            Selecciona una técnica para ver detalles
          </h3>
          <p className="text-gray-500">
            Haz clic en cualquiera de las técnicas para ver información detallada y recomendaciones
          </p>
        </div>
      )}
    </div>
  )
} 