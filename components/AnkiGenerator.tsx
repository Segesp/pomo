'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiSave, FiLoader, FiCheck } from 'react-icons/fi'

interface AnkiCard {
  question: string
  answer: string
}

export default function AnkiGenerator() {
  const [text, setText] = useState('')
  const [cards, setCards] = useState<AnkiCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedCardSets, setSavedCardSets] = useState<{id: string, title: string, date: string}[]>([])
  const [showSavedSets, setShowSavedSets] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [selectedCard, setSelectedCard] = useState<number | null>(null)

  // Cargar tarjetas guardadas
  useEffect(() => {
    fetchSavedCardSets()
  }, [])

  const fetchSavedCardSets = async () => {
    try {
      const response = await fetch('/api/anki-cards')
      if (response.ok) {
        const data = await response.json()
        setSavedCardSets(data.cardSets)
      }
    } catch (error) {
      console.error('Error al cargar tarjetas guardadas:', error)
    }
  }

  const generateCards = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-anki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Error al generar las tarjetas')
      }

      const data = await response.json()
      setCards(data.cards)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!cards.length) return
    
    if (!saveTitle.trim()) {
      alert('Por favor, ingresa un título para este conjunto de tarjetas')
      return
    }
    
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      const response = await fetch('/api/anki-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: saveTitle,
          cards,
          originalText: text
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar las tarjetas')
      }

      setSaveSuccess(true)
      fetchSavedCardSets() // Actualizar la lista de conjuntos guardados
      
      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar las tarjetas')
    } finally {
      setIsSaving(false)
    }
  }

  const loadCardSet = async (id: string) => {
    try {
      const response = await fetch(`/api/anki-cards/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
        setText(data.originalText)
        setShowSavedSets(false)
      }
    } catch (error) {
      console.error('Error al cargar el conjunto de tarjetas:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Generador de Tarjetas Anki</h2>
        <p className="text-gray-600">
          Ingresa el texto que deseas convertir en tarjetas de estudio. La IA generará preguntas y respuestas relevantes.
        </p>
        
        <div className="flex justify-between">
          <button
            onClick={() => setShowSavedSets(!showSavedSets)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {showSavedSets ? 'Ocultar conjuntos guardados' : 'Ver conjuntos guardados'}
          </button>
        </div>
        
        {showSavedSets && savedCardSets.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-2">Conjuntos guardados</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedCardSets.map(set => (
                <div 
                  key={set.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => loadCardSet(set.id)}
                >
                  <span className="font-medium">{set.title}</span>
                  <span className="text-xs text-gray-500">{new Date(set.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input de texto */}
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ingresa el texto para generar las tarjetas..."
          className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={generateCards}
            disabled={isLoading || !text.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <FiPlus />
                <span>Generar Tarjetas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lista de tarjetas */}
      {cards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Tarjetas Generadas ({cards.length})
          </h3>
          
          {/* Formulario para guardar */}
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Título del conjunto de tarjetas"
              className="flex-grow p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !saveTitle.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <FiLoader className="animate-spin" />
              ) : saveSuccess ? (
                <FiCheck />
              ) : (
                <FiSave />
              )}
              <span>{isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar'}</span>
            </button>
          </div>
          
          {/* Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCard(selectedCard === index ? null : index)}
              >
                <div className="space-y-2">
                  <div className="font-medium text-gray-800">
                    P: {card.question}
                  </div>
                  {selectedCard === index && (
                    <div className="text-gray-600 pt-2 border-t">
                      R: {card.answer}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 