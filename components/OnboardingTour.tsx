'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi'

// Definir los pasos del tour
const tourSteps = [
  {
    id: 'welcome',
    title: 'Bienvenido a EstudioIntegral',
    description: 'Un sistema de estudio completo basado en técnicas científicamente comprobadas.',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    width: 450
  },
  {
    id: 'navigation',
    title: 'Navegación intuitiva',
    description: 'Usa el menú lateral para navegar entre las diferentes secciones del sistema. Las funciones están agrupadas por categorías para facilitar su acceso.',
    targetSelector: '.sidebar',
    position: { top: '30%', left: '280px' },
    width: 350
  },
  {
    id: 'pomodoro',
    title: 'Temporizador Pomodoro',
    description: 'Utiliza la técnica Pomodoro para estructurar tu tiempo de estudio en intervalos de alta concentración seguidos por breves descansos.',
    targetSelector: '[data-tour="pomodoro"]',
    position: { top: '15%', left: '280px' },
    width: 350
  },
  {
    id: 'apple',
    title: 'Apple Free Code',
    description: 'Genera tarjetas de estudio tipo Anki con IA a partir de tus textos de estudio para facilitar la retención mediante repetición espaciada.',
    targetSelector: '[data-tour="apple"]',
    position: { top: '25%', left: '280px' },
    width: 350
  },
  {
    id: 'planning',
    title: 'Planificación y seguimiento',
    description: 'Organiza tus sesiones de estudio, establece objetivos y haz seguimiento de tu progreso para mantener el enfoque y la motivación.',
    targetSelector: '[data-tour="planning"]',
    position: { top: '35%', left: '280px' },
    width: 350
  },
  {
    id: 'learning',
    title: 'Ruta de aprendizaje',
    description: 'Descubre el flujo óptimo de técnicas de estudio recomendadas por expertos en educación y neurociencia.',
    targetSelector: '[data-tour="learning"]',
    position: { top: '45%', left: '280px' },
    width: 350
  },
  {
    id: 'help',
    title: 'Ayuda disponible',
    description: 'Accede a la ayuda rápida en cualquier momento haciendo clic en el botón de ayuda en la barra superior.',
    targetSelector: 'button[title="Ayuda"]',
    position: { top: '70px', right: '100px' },
    width: 350
  },
  {
    id: 'finish',
    title: '¡Listo para empezar!',
    description: 'Ya estás preparado para usar EstudioIntegral. Puedes volver a ver este tour en cualquier momento desde el botón de información en la barra superior.',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    width: 450
  }
]

// Definir el tipo para las posiciones de los pasos
interface StepPosition {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform?: string;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position: StepPosition;
  width: number;
}

interface OnboardingTourProps {
  isOpen: boolean
  onComplete: () => void
}

export default function OnboardingTour({ isOpen, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Reiniciar el tour cuando se abre
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])
  
  const step = tourSteps[currentStep] as TourStep
  
  // Navegación entre pasos
  const goToNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete()
    }
  }
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const skipTour = () => {
    onComplete()
  }
  
  if (!mounted || !isOpen) return null
  
  // Determinar posición del tooltip
  const getTooltipStyle = () => {
    const stepPosition = step.position
    
    // Para posiciones absolutas (pasos de bienvenida y finalización)
    if (stepPosition.transform) {
      return {
        position: 'fixed',
        top: stepPosition.top,
        left: stepPosition.left,
        transform: stepPosition.transform,
        width: `${step.width}px`,
        maxWidth: '90vw'
      } as React.CSSProperties
    }
    
    // Para posiciones relativas a elementos
    let style: React.CSSProperties = {
      position: 'fixed',
      width: `${step.width}px`,
      maxWidth: '90vw'
    }
    
    if (stepPosition.top) style.top = stepPosition.top
    if (stepPosition.left) style.left = stepPosition.left
    if (stepPosition.right) style.right = stepPosition.right
    if (stepPosition.bottom) style.bottom = stepPosition.bottom
    
    return style
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay semitransparente */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={skipTour}
          />
          
          {/* Tooltip de información */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={getTooltipStyle()}
            className="bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Encabezado */}
            <div className="bg-red-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">{step.title}</h3>
              <button 
                onClick={skipTour}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Contenido */}
            <div className="p-5">
              <p className="text-gray-700">{step.description}</p>
              
              {/* Indicador de pasos */}
              <div className="flex justify-center my-4">
                {tourSteps.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-2 w-2 rounded-full mx-1 ${
                      index === currentStep ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {/* Botones de navegación */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                  className={`
                    flex items-center px-3 py-1.5 rounded
                    ${currentStep === 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <FiArrowLeft className="mr-2" />
                  Anterior
                </button>
                
                <button
                  onClick={skipTour}
                  className="text-gray-700 hover:text-gray-900 hover:underline px-3 py-1.5"
                >
                  Saltar
                </button>
                
                <button
                  onClick={goToNextStep}
                  className="flex items-center px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      Finalizar <FiCheck className="ml-2" />
                    </>
                  ) : (
                    <>
                      Siguiente <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 