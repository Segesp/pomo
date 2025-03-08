'use client'

import React, { useState } from 'react'
import { 
  FiTarget, 
  FiCheck, 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiAlertCircle,
  FiCalendar,
  FiClock
} from 'react-icons/fi'

type GoalType = 'daily' | 'weekly' | 'monthly' | 'custom'
type GoalStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'

interface Goal {
  id: string
  title: string
  description?: string
  type: GoalType
  deadline?: Date
  progress: number // 0-100
  status: GoalStatus
  tags: string[]
  created: Date
}

// Datos de ejemplo
const SAMPLE_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Completar 5 sesiones Pomodoro',
    description: 'Concentración en matemáticas y física',
    type: 'daily',
    progress: 60,
    status: 'in-progress',
    tags: ['pomodoro', 'matemáticas', 'física'],
    created: new Date()
  },
  {
    id: '2',
    title: 'Crear 20 tarjetas de estudio',
    description: 'Tarjetas sobre historia y geografía',
    type: 'weekly',
    progress: 30,
    status: 'in-progress',
    tags: ['tarjetas', 'historia'],
    created: new Date(new Date().setDate(new Date().getDate() - 2))
  },
  {
    id: '3',
    title: 'Completar curso de programación',
    description: 'Finalizar todos los módulos del curso de React',
    type: 'monthly',
    deadline: new Date(new Date().setDate(new Date().getDate() + 20)),
    progress: 75,
    status: 'in-progress',
    tags: ['programación', 'curso'],
    created: new Date(new Date().setDate(new Date().getDate() - 10))
  }
]

export default function StudyGoals() {
  const [goals, setGoals] = useState<Goal[]>(SAMPLE_GOALS)
  const [showForm, setShowForm] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    type: 'daily',
    progress: 0,
    status: 'pending',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  
  // Filtros
  const [filter, setFilter] = useState<GoalType | 'all'>('all')
  
  // Manejar la adición de un nuevo objetivo
  const handleAddGoal = () => {
    if (!newGoal.title) return
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title || '',
      description: newGoal.description,
      type: newGoal.type || 'daily',
      deadline: newGoal.deadline,
      progress: newGoal.progress || 0,
      status: newGoal.status || 'pending',
      tags: newGoal.tags || [],
      created: new Date()
    }
    
    if (editingGoalId) {
      setGoals(goals.map(g => g.id === editingGoalId ? goal : g))
      setEditingGoalId(null)
    } else {
      setGoals([...goals, goal])
    }
    
    setNewGoal({
      title: '',
      description: '',
      type: 'daily',
      progress: 0,
      status: 'pending',
      tags: []
    })
    setShowForm(false)
  }
  
  // Editar un objetivo existente
  const handleEditGoal = (goal: Goal) => {
    setNewGoal({
      ...goal
    })
    setEditingGoalId(goal.id)
    setShowForm(true)
  }
  
  // Eliminar un objetivo
  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }
  
  // Actualizar progreso de un objetivo
  const handleUpdateProgress = (id: string, progress: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        const newStatus = progress >= 100 ? 'completed' : goal.status
        return { ...goal, progress, status: newStatus }
      }
      return goal
    }))
  }
  
  // Añadir etiqueta al objetivo actual
  const handleAddTag = () => {
    if (!tagInput.trim()) return
    
    if (!newGoal.tags?.includes(tagInput.trim())) {
      setNewGoal({
        ...newGoal,
        tags: [...(newGoal.tags || []), tagInput.trim()]
      })
    }
    
    setTagInput('')
  }
  
  // Eliminar etiqueta del objetivo actual
  const handleRemoveTag = (tag: string) => {
    setNewGoal({
      ...newGoal,
      tags: newGoal.tags?.filter(t => t !== tag)
    })
  }
  
  // Filtrar objetivos según el tipo
  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(goal => goal.type === filter)
  
  // Ordenar objetivos: primero los pendientes, luego en progreso, luego completados
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    const statusOrder = { 
      'overdue': 0, 
      'pending': 1, 
      'in-progress': 2, 
      'completed': 3 
    }
    return statusOrder[a.status] - statusOrder[b.status]
  })
  
  // Formatear fecha
  const formatDate = (date?: Date) => {
    if (!date) return ''
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Mis Objetivos de Estudio</h2>
        <button
          onClick={() => {
            setEditingGoalId(null)
            setNewGoal({
              title: '',
              description: '',
              type: 'daily',
              progress: 0,
              status: 'pending',
              tags: []
            })
            setShowForm(!showForm)
          }}
          className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <FiPlus />
          <span>Nuevo Objetivo</span>
        </button>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md ${
            filter === 'all' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('daily')}
          className={`px-3 py-1.5 rounded-md ${
            filter === 'daily' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Diarios
        </button>
        <button
          onClick={() => setFilter('weekly')}
          className={`px-3 py-1.5 rounded-md ${
            filter === 'weekly' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Semanales
        </button>
        <button
          onClick={() => setFilter('monthly')}
          className={`px-3 py-1.5 rounded-md ${
            filter === 'monthly' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Mensuales
        </button>
        <button
          onClick={() => setFilter('custom')}
          className={`px-3 py-1.5 rounded-md ${
            filter === 'custom' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Personalizados
        </button>
      </div>
      
      {/* Formulario de nuevo objetivo o edición */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingGoalId ? 'Editar Objetivo' : 'Nuevo Objetivo'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: Completar 5 sesiones Pomodoro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Detalles adicionales sobre tu objetivo"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de objetivo
                </label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({...newGoal, type: e.target.value as GoalType})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              
              {newGoal.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={newGoal.deadline ? new Date(newGoal.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined
                      setNewGoal({...newGoal, deadline: date})
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progreso ({newGoal.progress || 0}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newGoal.progress}
                onChange={(e) => setNewGoal({...newGoal, progress: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <div className="flex space-x-2 mb-2">
                {newGoal.tags?.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Añadir etiqueta"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 transition-colors"
                >
                  Añadir
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title}
                className={`
                  flex-1 px-4 py-2 text-white rounded-md
                  ${newGoal.title ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}
                  transition-colors
                `}
              >
                {editingGoalId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de objetivos */}
      <div className="space-y-4">
        {sortedGoals.length > 0 ? (
          sortedGoals.map(goal => (
            <div 
              key={goal.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold mr-2">{goal.title}</h3>
                    <span 
                      className={`
                        text-xs px-2 py-0.5 rounded-full 
                        ${goal.type === 'daily' ? 'bg-blue-100 text-blue-800' : ''}
                        ${goal.type === 'weekly' ? 'bg-purple-100 text-purple-800' : ''}
                        ${goal.type === 'monthly' ? 'bg-green-100 text-green-800' : ''}
                        ${goal.type === 'custom' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}
                    >
                      {
                        goal.type === 'daily' ? 'Diario' :
                        goal.type === 'weekly' ? 'Semanal' :
                        goal.type === 'monthly' ? 'Mensual' : 'Personalizado'
                      }
                    </span>
                  </div>
                  
                  {goal.description && (
                    <p className="text-gray-600 mt-1">{goal.description}</p>
                  )}
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <FiCalendar className="mr-1" />
                    <span>Creado: {formatDate(goal.created)}</span>
                    
                    {goal.deadline && (
                      <>
                        <span className="mx-2">•</span>
                        <FiClock className="mr-1" />
                        <span>Límite: {formatDate(goal.deadline)}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {goal.tags.map(tag => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                    title="Editar"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md"
                    title="Eliminar"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Progreso</span>
                  <span 
                    className={`
                      text-xs font-semibold px-2 py-0.5 rounded-full
                      ${goal.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                      ${goal.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                      ${goal.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                    `}
                  >
                    {
                      goal.status === 'completed' ? 'Completado' :
                      goal.status === 'in-progress' ? 'En Progreso' :
                      goal.status === 'pending' ? 'Pendiente' : 'Vencido'
                    }
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`
                      h-2.5 rounded-full
                      ${goal.status === 'completed' ? 'bg-green-600' : ''}
                      ${goal.status === 'in-progress' ? 'bg-blue-600' : ''}
                      ${goal.status === 'pending' ? 'bg-gray-500' : ''}
                      ${goal.status === 'overdue' ? 'bg-red-600' : ''}
                    `} 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{goal.progress}% completado</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleUpdateProgress(goal.id, Math.max(0, goal.progress - 10))}
                      className="px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200"
                      disabled={goal.progress <= 0}
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 10))}
                      className="px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200"
                      disabled={goal.progress >= 100}
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(goal.id, 100)}
                      className="px-2 py-0.5 bg-green-100 text-green-800 rounded hover:bg-green-200"
                      disabled={goal.progress >= 100}
                    >
                      Completar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FiTarget className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No hay objetivos {filter !== 'all' ? `${filter}es` : ''}
            </h3>
            <p className="text-gray-500 mb-4">
              Crea un nuevo objetivo para empezar a organizar tu estudio
            </p>
            <button
              onClick={() => {
                setEditingGoalId(null)
                setNewGoal({
                  title: '',
                  description: '',
                  type: filter !== 'all' ? filter : 'daily',
                  progress: 0,
                  status: 'pending',
                  tags: []
                })
                setShowForm(true)
              }}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Nuevo Objetivo
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 