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
  FiChevronDown
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

  // Loading state mientras verificamos la sesión
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-red-600 border-b-red-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
            >
              {showSidebar ? <FiX /> : <FiMenu />}
            </button>
            <h1 className="ml-2 text-xl font-bold text-gray-800">EstudioIntegral</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setShowQuickHelp(true)}
              title="Ayuda"
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
            >
              <FiHelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowTour(true)}
              title="Tour guiado"
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
            >
              <FiInfo className="w-5 h-5" />
            </button>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {session?.user?.name || 'Usuario'}
              </span>
              <button
                onClick={() => signOut()}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenido principal con sidebar y área de contenido */}
      <div className="flex pt-12 h-[calc(100vh-48px)]">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2 }}
              className="w-60 bg-white border-r border-gray-200 overflow-y-auto fixed left-0 top-12 bottom-0 sidebar"
            >
              <nav className="p-4 space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="space-y-1">
                    <button 
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-md transition-all ${
                        activeCategory === category.id ? 'bg-red-50 text-red-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {expandedCategories[category.id] ? (
                        <FiChevronDown className="h-4 w-4" />
                      ) : (
                        <FiChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Pestañas dentro de cada categoría */}
                    <AnimatePresence>
                      {expandedCategories[category.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 space-y-1 pt-1">
                            {category.tabs.map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                data-tour={tab.dataTour}
                                className={`w-full flex items-center p-2 rounded-md group relative ${
                                  activeTab === tab.id ? 'bg-red-100 text-red-700' : 'hover:bg-gray-50'
                                }`}
                              >
                                <span className="mr-2">{tab.icon}</span>
                                <span>{tab.name}</span>
                                
                                {/* Tooltip */}
                                <div className="absolute left-full ml-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap 
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 w-52">
                                  {tab.tooltip}
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Área de contenido principal */}
        <main 
          className={`bg-gray-50 flex-1 overflow-y-auto transition-all p-6 ${
            showSidebar ? 'ml-60' : 'ml-0'
          }`}
        >
          {/* Encabezado del contenido */}
          <div className="md:flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {activeCategoryObject ? activeCategoryObject.name : ''}
              </h2>
              <div className="flex items-center mt-4 space-x-1">
                {activeCategoryObject?.tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeTab === tab.id
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Botones de acción específicos (si se necesitan) */}
            <div className="mt-4 md:mt-0">
              {/* Aquí podrían ir botones contextuales según la pestaña activa */}
            </div>
          </div>
          
          {/* Contenido de la pestaña activa */}
          <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-180px)]">
            {activeTabComponent}
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