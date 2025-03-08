'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSend, FiInfo, FiTag, FiAlertCircle, FiCheck, FiMessageSquare, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

// Estado del formulario
type FormStatus = 'idle' | 'sending' | 'success' | 'error'

// Categorías disponibles para peticiones
const CATEGORIES = [
  'Programación',
  'Matemáticas',
  'Ciencias',
  'Idiomas',
  'Humanidades',
  'Economía',
  'Artes',
  'Otro'
]

export default function SpecialPetition() {
  const { data: session } = useSession()
  const formRef = useRef<HTMLFormElement>(null)
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('')
  const [detail, setDetail] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [error, setError] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [previousRequests, setPreviousRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const MAX_CHAR_COUNT = 2000
  
  // Cargar peticiones anteriores
  useEffect(() => {
    fetchPreviousRequests()
  }, [])
  
  const fetchPreviousRequests = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/special-petitions')
      if (response.ok) {
        const data = await response.json()
        setPreviousRequests(data.petitions || [])
      }
    } catch (error) {
      console.error('Error al cargar peticiones anteriores:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Manejador de cambio en el detalle
  const handleDetailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setDetail(text)
    setCharCount(text.length)
  }
  
  // Manejador de cambio en el archivo adjunto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0])
    }
  }
  
  // Manejador del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!topic.trim() || !category || !detail.trim()) {
      setError('Por favor, completa todos los campos obligatorios.')
      return
    }
    
    setStatus('sending')
    setError('')
    
    try {
      // Preparar datos para enviar
      const petitionData = {
        topic,
        category,
        detail,
        attachmentUrl: attachment ? URL.createObjectURL(attachment) : null
      }
      
      // Enviar al servidor
      const response = await fetch('/api/special-petitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petitionData),
      })
      
      if (!response.ok) {
        throw new Error('Error al enviar la petición')
      }
      
      // Actualizar la lista de peticiones
      fetchPreviousRequests()
      
      // Restablecer el formulario
      setTopic('')
      setCategory('')
      setDetail('')
      setAttachment(null)
      setCharCount(0)
      formRef.current?.reset()
      
      setStatus('success')
      
      // Volver al estado inicial después de mostrar el mensaje de éxito
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (err) {
      console.error('Error al enviar la petición:', err)
      setStatus('error')
      setError('Hubo un error al enviar tu petición. Por favor, inténtalo de nuevo.')
    }
  }
  
  // Eliminar archivo adjunto
  const handleRemoveAttachment = () => {
    setAttachment(null)
    if (formRef.current) {
      const fileInput = formRef.current.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-start">
        <div className="bg-red-100 p-3 rounded-full mr-4 flex-shrink-0">
          <FiMessageSquare className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Special Petition</h2>
          <p className="text-gray-600">
            Utiliza este espacio para solicitar aclaraciones o información adicional sobre temas específicos. 
            Nuestro equipo preparará una respuesta detallada para ayudarte con tus dudas particulares.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulario de petición */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva Petición</h3>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Tema <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej. Algoritmos de ordenamiento, Mitología griega..."
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="" disabled>Selecciona una categoría</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="detail" className="block text-sm font-medium text-gray-700 mb-1">
                Detalle de tu petición <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">
                  {charCount}/{MAX_CHAR_COUNT} caracteres
                </span>
              </label>
              <textarea
                id="detail"
                value={detail}
                onChange={handleDetailChange}
                maxLength={MAX_CHAR_COUNT}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Describe tu petición con el mayor detalle posible..."
                required
              />
            </div>
            
            <div>
              <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                Archivo adjunto (opcional)
              </label>
              
              {attachment ? (
                <div className="flex items-center p-2 border border-gray-300 rounded-md">
                  <span className="text-sm text-gray-700 truncate flex-1">{attachment.name}</span>
                  <button 
                    type="button" 
                    onClick={handleRemoveAttachment}
                    className="text-gray-500 hover:text-red-600 p-1"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  id="attachment"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceptados: PDF, DOC, DOCX, JPG, PNG (máx. 5MB)
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
                <FiAlertCircle className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status === 'sending'}
                className={`
                  px-4 py-2 rounded-md flex items-center
                  ${status === 'sending' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'}
                  transition-colors
                `}
              >
                {status === 'sending' ? (
                  <>
                    <span className="mr-2">Enviando</span>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Enviar Petición
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Notificación de éxito */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-8 right-8 p-4 bg-green-100 border border-green-200 rounded-lg shadow-lg flex items-center text-green-700"
              >
                <FiCheck className="mr-2 h-5 w-5" />
                <span>¡Tu petición ha sido enviada con éxito!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Peticiones anteriores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peticiones Anteriores</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : previousRequests.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {previousRequests.map(request => (
                <div 
                  key={request.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{request.topic}</h4>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${request.status === 'completado' ? 'bg-green-100 text-green-800' : 
                        request.status === 'en proceso' ? 'bg-blue-100 text-blue-800' : 
                        request.status === 'rechazado' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}
                    `}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
                    <span className="flex items-center">
                      <FiTag className="mr-1" />
                      {request.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(request.date).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{request.detail}</p>
                  
                  {request.response && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-1">Respuesta:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{request.response}</p>
                      {request.responseDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.responseDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No tienes peticiones anteriores</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
        <FiInfo className="text-yellow-500 mr-3 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-medium text-yellow-800 mb-1">¿Cuándo usar Special Petition?</h4>
          <p className="text-sm text-yellow-700">
            Utiliza esta función cuando necesites profundizar en un tema específico, aclarar conceptos complejos o solicitar 
            explicaciones detalladas adaptadas a tu nivel. Las respuestas suelen estar disponibles en 24-48 horas.
          </p>
        </div>
      </div>
    </div>
  )
} 