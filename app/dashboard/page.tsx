'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PomodoroTimer from '@/components/PomodoroTimer'
import SessionHistory from '@/components/SessionHistory'
import VideoPlayer from '@/components/VideoPlayer'
import AnkiGenerator from '@/components/AnkiGenerator'
import PlanningCalendar from '@/components/PlanningCalendar'
import StudyGoals from '@/components/StudyGoals'
import LearningPath from '@/components/LearningPath'
import SpecialPetition from '@/components/SpecialPetition'
import ScientificBasis from '@/components/ScientificBasis'
import OnboardingTour from '@/components/OnboardingTour'
import QuickHelp from '@/components/QuickHelp'
import ThemeToggle from '@/components/ThemeToggle'
import ThemeSettings from '@/components/ThemeSettings'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiClock, 
  FiCalendar, 
  FiPlusCircle, 
  FiList, 
  FiBookOpen, 
  FiHelpCircle,
  FiMenu,
  FiX,
  FiInfo,
  FiChevronRight,
  FiChevronDown,
  FiPlayCircle,
  FiLogOut
} from 'react-icons/fi'
import { 
  RiAppleFill, 
  RiRouteLine, 
  RiMailSendLine, 
  RiVideoLine,
  RiTeamLine
} from 'react-icons/ri'

// Definir las categorías y tabs
interface Tab {
  id: string
  name: string
  icon: React.ReactNode
  tooltip: string
  dataTour?: string
  component: React.ReactNode
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  tabs: Tab[]
}

const categories: Category[] = [
  {
    id: 'estudio',
    name: 'Estudio',
    icon: <FiClock className="h-5 w-5" />,
    tabs: [
      {
        id: 'pomodoro',
        name: 'Pomodoro',
        icon: <FiClock className="h-5 w-5" />,
        tooltip: 'Técnica de gestión del tiempo para aumentar la productividad',
        dataTour: 'pomodoro',
        component: <PomodoroTimer />
      },
      {
        id: 'apple',
        name: 'Apple Free Code',
        icon: <RiAppleFill className="h-5 w-5" />,
        tooltip: 'Genera tarjetas de estudio tipo Anki con IA',
        dataTour: 'apple',
        component: <AnkiGenerator />
      },
      {
        id: 'video',
        name: 'Video Learning',
        icon: <RiVideoLine className="h-5 w-5" />,
        tooltip: 'Aprende con videos organizados por temas',
        component: <VideoPlayer />
      }
    ]
  },
  {
    id: 'planificacion',
    name: 'Planificación',
    icon: <FiCalendar className="h-5 w-5" />,
    tabs: [
      {
        id: 'calendario',
        name: 'Calendario',
        icon: <FiCalendar className="h-5 w-5" />,
        tooltip: 'Organiza tu estudio con un calendario personalizado',
        dataTour: 'planning',
        component: <PlanningCalendar />
      },
      {
        id: 'objetivos',
        name: 'Objetivos',
        icon: <FiPlusCircle className="h-5 w-5" />,
        tooltip: 'Establece y haz seguimiento de objetivos de estudio',
        component: <StudyGoals />
      }
    ]
  },
  {
    id: 'aprendizaje',
    name: 'Aprendizaje',
    icon: <FiBookOpen className="h-5 w-5" />,
    tabs: [
      {
        id: 'ruta',
        name: 'Ruta de Aprendizaje',
        icon: <RiRouteLine className="h-5 w-5" />,
        tooltip: 'Descubre el flujo ideal de técnicas de estudio',
        dataTour: 'learning',
        component: <LearningPath />
      },
      {
        id: 'petition',
        name: 'Special Petition',
        icon: <RiMailSendLine className="h-5 w-5" />,
        tooltip: 'Solicita aclaraciones o contenido específico',
        component: <SpecialPetition />
      }
    ]
  },
  {
    id: 'analisis',
    name: 'Análisis',
    icon: <FiList className="h-5 w-5" />,
    tabs: [
      {
        id: 'historial',
        name: 'Historial',
        icon: <FiList className="h-5 w-5" />,
        tooltip: 'Visualiza y analiza tu progreso de estudio',
        component: <SessionHistory />
      },
      {
        id: 'ciencia',
        name: 'Base Científica',
        icon: <RiTeamLine className="h-5 w-5" />,
        tooltip: 'Conoce la ciencia detrás de las técnicas de estudio',
        component: <ScientificBasis />
      }
    ]
  }
]

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Estudio')
  const [activeTab, setActiveTab] = useState('Timer')
  const [showSidebar, setShowSidebar] = useState(true)
  const [showTour, setShowTour] = useState(false)
  const [showQuickHelp, setShowQuickHelp] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Estudio: true,
    Planificación: false,
    Aprendizaje: false,
    Análisis: false
  })
  const { data: session, status } = useSession()
  const [windowWidth, setWindowWidth] = useState(0)
  const router = useRouter()

  // Detectar si es la primera visita
  const isFirstVisit = () => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('hasVisitedBefore') === null) {
        localStorage.setItem('hasVisitedBefore', 'true')
        return true
      }
    }
    return false
  }

  // Detectar el tamaño de la pantalla y ajustar la visibilidad del sidebar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth)
        setShowSidebar(window.innerWidth >= 768)
      }
      
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Cargar la última categoría y pestaña visitada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCategory = localStorage.getItem('activeCategory')
      const savedTab = localStorage.getItem('activeTab')
      const savedExpandedCategories = localStorage.getItem('expandedCategories')
      
      if (savedCategory) setActiveCategory(savedCategory)
      if (savedTab) setActiveTab(savedTab)
      if (savedExpandedCategories) {
        try {
          setExpandedCategories(JSON.parse(savedExpandedCategories))
        } catch (e) {
          console.error('Error al parsear las categorías expandidas:', e)
        }
      }
    }
  }, [])

  // Guardar la categoría y pestaña activa
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCategory', activeCategory)
      localStorage.setItem('activeTab', activeTab)
      localStorage.setItem('expandedCategories', JSON.stringify(expandedCategories))
    }
  }, [activeCategory, activeTab, expandedCategories])

  // Mostrar el tour en la primera visita
  useEffect(() => {
    if (isFirstVisit()) {
      setShowTour(true)
    }
  }, [])

  // Redireccionar si no hay sesión
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      setIsLoading(false)
    }
  }, [status, router])

  // Cambiar la categoría activa
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Expandir la categoría seleccionada y contraer las demás
    const newExpandedState = { ...expandedCategories };
    Object.keys(newExpandedState).forEach(cat => {
      newExpandedState[cat] = (cat === categoryId);
    });
    setExpandedCategories(newExpandedState);
    
    // Seleccionar la primera pestaña de la categoría
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.tabs.length > 0) {
      setActiveTab(category.tabs[0].id);
    }
  };

  // Cambiar la pestaña activa
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Encontrar y expandir la categoría que contiene esta pestaña
    for (const category of categories) {
      const tabInCategory = category.tabs.find(tab => tab.id === tabId);
      if (tabInCategory) {
        setActiveCategory(category.id);
        setExpandedCategories({...expandedCategories, [category.id]: true});
        break;
      }
    }
  };

  // Maneja el final del tour guiado
  const handleTourComplete = () => {
    setShowTour(false);
  };

  // Toggle para expandir/contraer categorías
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId]
    });
  };

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Cargando tu espacio de estudio...</p>
        </div>
      </div>
    )
  }

  // Encontrar la pestaña activa
  const activeTabComponent = (() => {
    for (const category of categories) {
      const tab = category.tabs.find(tab => tab.id === activeTab);
      if (tab) return tab.component;
    }
    return <div>Selecciona una pestaña</div>;
  })();

  // Encontrar la categoría que contiene la pestaña activa
  const activeCategoryObject = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Barra de navegación superior */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            {windowWidth < 768 && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="mr-4 p-2 text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showSidebar ? 'Cerrar menú' : 'Abrir menú'}
              >
                {showSidebar ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold">Estudio Integral</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Opciones de tema */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <ThemeSettings />
            </div>
            
            {/* Botón de ayuda rápida */}
            <button
              onClick={() => setShowQuickHelp(true)}
              className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Ayuda rápida"
              title="Ayuda rápida"
            >
              <FiHelpCircle className="w-5 h-5" />
            </button>
            
            {/* Botón para reiniciar el tour */}
            <button
              onClick={() => setShowTour(true)}
              className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Reiniciar tour guiado"
              title="Reiniciar tour guiado"
            >
              <FiPlayCircle className="w-5 h-5" />
            </button>
            
            {/* Información del usuario */}
            <div className="flex items-center">
              <span className="hidden md:inline text-sm mr-2">{session?.user?.name || 'Usuario'}</span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            {/* Botón para cerrar sesión */}
            <button
              onClick={() => signOut()}
              className="p-2 text-muted-foreground hover:text-destructive focus:outline-none"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside className={`fixed inset-y-16 left-0 z-20 w-64 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}>
          <nav className="pt-4 pb-16 h-full flex flex-col">
            {/* Categorías */}
            <div className="px-3 space-y-1 flex-1 overflow-y-auto">
              {categories.map(category => (
                <div key={category.id} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium rounded-md transition-colors duration-200 ${activeCategory === category.id ? 'bg-red-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500'}`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <span>
                      {expandedCategories[category.id] ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                  </button>
                  
                  {/* Pestañas de la categoría */}
                  <AnimatePresence>
                    {expandedCategories[category.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-2 mt-1 overflow-hidden"
                      >
                        {category.tabs.map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            data-tour={tab.dataTour}
                            className={`w-full flex items-center pl-8 pr-4 py-2 text-sm transition-colors duration-200 ${activeTab === tab.id ? 'text-red-600 dark:text-red-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500'}`}
                          >
                            <span className="mr-2">{tab.icon}</span>
                            <span>{tab.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </nav>
        </aside>
        
        {/* Contenido principal */}
        <main className={`flex-grow transition-all duration-300 ${showSidebar ? 'md:ml-64' : 'ml-0'}`}>
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Título de la pestaña activa */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeCategoryObject ? activeCategoryObject.name : 'Dashboard'}
              </h2>
            </div>
            
            {/* Contenido de la pestaña activa */}
            <div>
              {activeTabComponent}
            </div>
          </div>
        </main>
      </div>
      
      {/* Tour guiado */}
      <OnboardingTour isOpen={showTour} onComplete={handleTourComplete} />
      
      {/* Guía rápida */}
      <QuickHelp isOpen={showQuickHelp} onClose={() => setShowQuickHelp(false)} />
    </div>
  )
}

export default Dashboard; 