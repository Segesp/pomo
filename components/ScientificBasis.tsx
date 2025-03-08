'use client'

import React, { useState } from 'react'
import { 
  FiBook, 
  FiExternalLink, 
  FiSearch, 
  FiFilter, 
  FiBarChart, 
  FiBookmark,
  FiClock,
  FiDownload,
  FiShare2,
  FiCheckCircle
} from 'react-icons/fi'

interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  year: number
  journal: string
  abstract: string
  url: string
  imageUrl: string
  techniques: string[]
  tags: string[]
  citations: number
  bookmarked: boolean
}

interface Technique {
  id: string
  name: string
  description: string
  papers: string[] // IDs of related papers
}

// Datos de muestra para la base científica
const SAMPLE_PAPERS: ResearchPaper[] = [
  {
    id: '1',
    title: 'The Pomodoro Technique: An Effective Time Management Tool',
    authors: ['Francesco Cirillo', 'John Smith'],
    year: 2019,
    journal: 'Journal of Productivity Science',
    abstract: 'Este estudio examina la eficacia de la Técnica Pomodoro como herramienta de gestión del tiempo. Los resultados sugieren que los ciclos de trabajo de 25 minutos seguidos de descansos de 5 minutos pueden aumentar la productividad y reducir la fatiga mental. Se discuten las implicaciones para estudiantes y profesionales.',
    url: 'https://example.com/pomodoro-study',
    imageUrl: 'https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0',
    techniques: ['pomodoro'],
    tags: ['gestión del tiempo', 'productividad', 'concentración'],
    citations: 124,
    bookmarked: true
  },
  {
    id: '2',
    title: 'Spaced Repetition and Retrieval Practice: A Review of Evidence',
    authors: ['Robert A. Bjork', 'Elizabeth L. Bjork'],
    year: 2014,
    journal: 'Psychological Science',
    abstract: 'Esta revisión evalúa la evidencia científica detrás de la repetición espaciada y la práctica de recuperación para el aprendizaje a largo plazo. Los datos de múltiples estudios confirman que espaciar las sesiones de estudio en el tiempo y practicar la recuperación activa de información mejora significativamente la retención en comparación con técnicas de estudio tradicionales.',
    url: 'https://example.com/spaced-repetition-study',
    imageUrl: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06',
    techniques: ['spaced-repetition', 'active-recall'],
    tags: ['memoria', 'retención', 'aprendizaje efectivo'],
    citations: 312,
    bookmarked: false
  },
  {
    id: '3',
    title: 'The Role of Self-Explanation in Learning and Knowledge Transfer',
    authors: ['Michelene T. H. Chi', 'James R. Davis'],
    year: 2021,
    journal: 'Cognitive Psychology',
    abstract: 'Este estudio investiga cómo la práctica de explicar conceptos en propias palabras (auto-explicación) afecta la comprensión y transferencia de conocimiento. Los resultados muestran que los estudiantes que utilizaron el método Feynman obtuvieron mejores resultados en pruebas de comprensión profunda y fueron capaces de aplicar conceptos a nuevos contextos más eficazmente.',
    url: 'https://example.com/self-explanation-study',
    imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e',
    techniques: ['feynman'],
    tags: ['comprensión', 'transferencia', 'metacognición'],
    citations: 187,
    bookmarked: false
  },
  {
    id: '4',
    title: 'Integration of Multiple Learning Techniques: Effects on Academic Performance',
    authors: ['Maria Rodriguez', 'David Chen', 'Sarah Johnson'],
    year: 2022,
    journal: 'Educational Psychology Review',
    abstract: 'Esta investigación examina cómo la integración de múltiples técnicas de estudio (Pomodoro, repetición espaciada, recuperación activa y auto-explicación) afecta el rendimiento académico en comparación con el uso de una sola técnica. Los resultados revelan un efecto sinérgico cuando se combinan métodos complementarios, con mejoras significativas en la retención a largo plazo y la profundidad de comprensión.',
    url: 'https://example.com/integrated-techniques-study',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765',
    techniques: ['pomodoro', 'spaced-repetition', 'active-recall', 'feynman'],
    tags: ['aprendizaje integrado', 'rendimiento académico', 'sinergias'],
    citations: 93,
    bookmarked: true
  }
]

const TECHNIQUES: Technique[] = [
  {
    id: 'pomodoro',
    name: 'Técnica Pomodoro',
    description: 'Método de gestión del tiempo que divide el trabajo en intervalos de 25 minutos, separados por breves descansos',
    papers: ['1', '4']
  },
  {
    id: 'spaced-repetition',
    name: 'Repetición Espaciada',
    description: 'Técnica que consiste en revisar el material a intervalos crecientes para optimizar la retención a largo plazo',
    papers: ['2', '4']
  },
  {
    id: 'active-recall',
    name: 'Active Recall',
    description: 'Práctica de recuperar activamente información de la memoria en lugar de releer pasivamente',
    papers: ['2', '4']
  },
  {
    id: 'feynman',
    name: 'Método Feynman',
    description: 'Técnica de explicación de conceptos en términos simples para identificar lagunas en la comprensión',
    papers: ['3', '4']
  }
]

export default function ScientificBasis() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState<string | 'all'>('all')
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null)
  
  // Filtrar papers basados en búsqueda, técnica seleccionada y bookmarks
  const filteredPapers = SAMPLE_PAPERS.filter(paper => {
    const matchesSearch = searchTerm === '' || 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTechnique = selectedTechnique === 'all' || 
      paper.techniques.includes(selectedTechnique)
    
    const matchesBookmark = !bookmarkedOnly || paper.bookmarked
    
    return matchesSearch && matchesTechnique && matchesBookmark
  })
  
  // Ordenar por año (más reciente primero)
  const sortedPapers = [...filteredPapers].sort((a, b) => b.year - a.year)
  
  // Manejar el toggle de bookmark
  const handleToggleBookmark = (id: string) => {
    // En una implementación real, esto actualizaría el estado en la base de datos
    // Aquí solo actualizamos el estado local
    SAMPLE_PAPERS.forEach(paper => {
      if (paper.id === id) {
        paper.bookmarked = !paper.bookmarked
      }
    })
    // Forzar actualización de la UI
    setBookmarkedOnly(bookmarkedOnly)
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Base Científica</h2>
        <p className="text-gray-600">
          Explora la evidencia científica detrás de las técnicas de estudio integradas en nuestra plataforma.
          Estos estudios respaldan la eficacia de los métodos que proponemos.
        </p>
      </div>
      
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, autor o palabra clave..."
            className="pl-10 w-full rounded-md border border-gray-300 shadow-sm py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTechnique}
            onChange={(e) => setSelectedTechnique(e.target.value)}
            className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Todas las técnicas</option>
            {TECHNIQUES.map(technique => (
              <option key={technique.id} value={technique.id}>
                {technique.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
              bookmarkedOnly 
                ? 'bg-red-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
            title={bookmarkedOnly ? 'Ver todos' : 'Ver solo guardados'}
          >
            <FiBookmark />
            <span className="hidden md:inline">Guardados</span>
          </button>
        </div>
      </div>
      
      {/* Lista de papers */}
      <div className="space-y-6">
        {sortedPapers.length > 0 ? (
          sortedPapers.map(paper => (
            <div 
              key={paper.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 bg-gray-100">
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${paper.imageUrl})` }}
                  ></div>
                </div>
                <div className="p-5 md:w-3/4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{paper.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {paper.authors.join(', ')} • {paper.year} • {paper.journal}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleBookmark(paper.id)}
                      className={`p-1.5 rounded-full ${
                        paper.bookmarked 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={paper.bookmarked ? 'Quitar de guardados' : 'Guardar'}
                    >
                      <FiBookmark 
                        className={paper.bookmarked ? 'fill-current' : ''} 
                        size={18}
                      />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {paper.techniques.map(techId => {
                      const technique = TECHNIQUES.find(t => t.id === techId)
                      return technique ? (
                        <span 
                          key={techId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {technique.name}
                        </span>
                      ) : null
                    })}
                    
                    {paper.tags.map(tag => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className={expandedPaper === paper.id ? 'mb-4' : 'line-clamp-2 mb-4 text-gray-700'}>
                    {paper.abstract}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setExpandedPaper(expandedPaper === paper.id ? null : paper.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {expandedPaper === paper.id ? 'Mostrar menos' : 'Leer más'}
                      </button>
                      <a 
                        href={paper.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      >
                        <FiExternalLink className="mr-1" size={14} />
                        Fuente original
                      </a>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <FiBarChart className="mr-1" />
                      <span>{paper.citations} citaciones</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              No se encontraron artículos
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No hay artículos que coincidan con tu búsqueda. Intenta cambiar tus criterios de filtrado.
            </p>
          </div>
        )}
      </div>
      
      {/* Sección de recursos adicionales */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recursos Adicionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a 
            href="#"
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <div className="bg-red-100 p-3 rounded-md mr-3">
                <FiBook className="text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Guía de Técnicas de Estudio</h4>
                <p className="text-sm text-gray-600">Manual completo con explicaciones detalladas de cada técnica</p>
              </div>
            </div>
          </a>
          
          <a 
            href="#"
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <div className="bg-red-100 p-3 rounded-md mr-3">
                <FiDownload className="text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Bibliografía Completa</h4>
                <p className="text-sm text-gray-600">Descarga la lista completa de referencias científicas</p>
              </div>
            </div>
          </a>
          
          <a 
            href="#"
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <div className="bg-red-100 p-3 rounded-md mr-3">
                <FiShare2 className="text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Comunidad Científica</h4>
                <p className="text-sm text-gray-600">Conecta con investigadores y comparte experiencias</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
} 