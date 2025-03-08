import { NextResponse } from 'next/server'

interface PromptTemplate {
  context: string
  instruction: string
  format: string
  level: 'básico' | 'intermedio' | 'avanzado'
}

const createPrompt = (text: string, type: string, template: PromptTemplate) => {
  return `${template.context}
Texto base: "${text}"
${template.instruction}
Nivel: ${template.level}
${template.format}`
}

const questionTemplates = {
  conceptual: {
    context: "Actuando como un profesor experto, genera una pregunta conceptual que evalúe la comprensión profunda del siguiente texto.",
    instruction: "La pregunta debe enfocarse en los conceptos fundamentales, requiriendo que el estudiante demuestre su entendimiento a través de explicaciones claras y ejemplos.",
    format: "La pregunta debe comenzar con '¿Por qué...?', '¿Cómo...?' o '¿Qué relación existe...?'",
    level: 'intermedio' as const
  },
  aplicacion: {
    context: "Como experto en el tema, genera una pregunta que evalúe la capacidad de aplicar el conocimiento en situaciones prácticas.",
    instruction: "La pregunta debe requerir que el estudiante demuestre cómo el concepto se aplica en escenarios reales o profesionales.",
    format: "La pregunta debe comenzar con '¿Cómo aplicarías...?', '¿Qué ejemplo ilustra...?' o '¿De qué manera...?'",
    level: 'avanzado' as const
  },
  analisis: {
    context: "Como analista experto, genera una pregunta que requiera un análisis crítico y evaluación del contenido.",
    instruction: "La pregunta debe promover el pensamiento crítico y la capacidad de analizar las implicaciones más profundas del tema.",
    format: "La pregunta debe comenzar con '¿Qué implicaciones tiene...?', '¿Cómo se relaciona...?' o '¿Qué conclusiones...?'",
    level: 'avanzado' as const
  }
}

const answerTemplates = {
  conceptual: {
    context: "Como profesor experto, proporciona una respuesta detallada y educativa a la siguiente pregunta conceptual.",
    instruction: "La respuesta debe incluir: definición clara, explicación detallada, ejemplos relevantes y conexiones con otros conceptos relacionados.",
    format: "Estructura la respuesta en párrafos claros, comenzando con la explicación principal y seguida por ejemplos o casos prácticos.",
    level: 'intermedio' as const
  },
  aplicacion: {
    context: "Como experto en aplicaciones prácticas, proporciona una respuesta que demuestre la implementación real del concepto.",
    instruction: "La respuesta debe incluir: pasos prácticos, ejemplos concretos, casos de uso y posibles variaciones o adaptaciones.",
    format: "Estructura la respuesta con: 1) Explicación inicial, 2) Pasos de implementación, 3) Ejemplos prácticos, 4) Consideraciones importantes.",
    level: 'avanzado' as const
  },
  analisis: {
    context: "Como analista experto, proporciona una respuesta que demuestre un análisis profundo y crítico.",
    instruction: "La respuesta debe incluir: análisis detallado, evaluación de implicaciones, conexiones con otros conceptos y conclusiones fundamentadas.",
    format: "Estructura la respuesta con: análisis principal, evidencias/ejemplos, implicaciones y conclusión.",
    level: 'avanzado' as const
  }
}

async function queryHuggingFace(inputs: string, maxLength: number = 150) {
  try {
    console.log('Enviando consulta a HuggingFace:', { inputs, maxLength })
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          inputs,
          parameters: {
            max_length: maxLength,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            num_return_sequences: 1,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Respuesta de HuggingFace:', result)

    if (Array.isArray(result) && result.length > 0) {
      return result[0].generated_text || ''
    } else if (result.error) {
      throw new Error(`Error de HuggingFace: ${result.error}`)
    }

    return ''
  } catch (error) {
    console.error('Error en queryHuggingFace:', error)
    throw error
  }
}

async function generateQuestionsFromText(text: string): Promise<{ question: string; answer: string }[]> {
  const cards: { question: string; answer: string }[] = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  console.log('Procesando texto:', { text, sentences })

  try {
    for (const sentence of sentences) {
      if (sentence.trim().length < 10) continue

      // Generar pregunta conceptual
      const conceptualPrompt = createPrompt(sentence, 'conceptual', questionTemplates.conceptual)
      let question = await queryHuggingFace(conceptualPrompt, 100)
      
      if (question) {
        const answerPrompt = createPrompt(
          `${sentence}\nPregunta: ${question}`,
          'conceptual',
          answerTemplates.conceptual
        )
        const answer = await queryHuggingFace(answerPrompt, 200)
        
        if (answer) {
          cards.push({
            question: question.trim(),
            answer: answer.trim()
          })
          console.log('Tarjeta conceptual generada:', { question: question.trim(), answer: answer.trim() })
        }
      }

      // Si tenemos menos de 5 tarjetas, intentar con una pregunta de aplicación
      if (cards.length < 5) {
        const applicationPrompt = createPrompt(sentence, 'aplicacion', questionTemplates.aplicacion)
        question = await queryHuggingFace(applicationPrompt, 100)
        
        if (question) {
          const answerPrompt = createPrompt(
            `${sentence}\nPregunta: ${question}`,
            'aplicacion',
            answerTemplates.aplicacion
          )
          const answer = await queryHuggingFace(answerPrompt, 200)
          
          if (answer) {
            cards.push({
              question: question.trim(),
              answer: answer.trim()
            })
            console.log('Tarjeta de aplicación generada:', { question: question.trim(), answer: answer.trim() })
          }
        }
      }

      // Si aún tenemos menos de 5 tarjetas, intentar con una pregunta de análisis
      if (cards.length < 5) {
        const analysisPrompt = createPrompt(sentence, 'analisis', questionTemplates.analisis)
        question = await queryHuggingFace(analysisPrompt, 100)
        
        if (question) {
          const answerPrompt = createPrompt(
            `${sentence}\nPregunta: ${question}`,
            'analisis',
            answerTemplates.analisis
          )
          const answer = await queryHuggingFace(answerPrompt, 200)
          
          if (answer) {
            cards.push({
              question: question.trim(),
              answer: answer.trim()
            })
            console.log('Tarjeta de análisis generada:', { question: question.trim(), answer: answer.trim() })
          }
        }
      }
    }

    console.log('Total de tarjetas generadas:', cards.length)

    // Si no se generaron tarjetas con el modelo, usar el generador local
    if (cards.length === 0) {
      console.log('Usando generador local como respaldo')
      return generateLocalQuestions(text)
    }

    // Limitar a 5 tarjetas y mezclarlas
    return shuffleArray(cards).slice(0, 5)
  } catch (error) {
    console.error('Error al generar preguntas:', error)
    // Si hay un error con la API, usar el generador local como respaldo
    return generateLocalQuestions(text)
  }
}

function generateLocalQuestions(text: string): { question: string; answer: string }[] {
  console.log('Generando preguntas localmente para:', text)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const cards: { question: string; answer: string }[] = []

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (trimmedSentence.length < 10) continue

    // 1. Preguntas conceptuales
    if (trimmedSentence.toLowerCase().includes(' es ') || trimmedSentence.toLowerCase().includes(' son ')) {
      const parts = trimmedSentence.split(/ es | son /i)
      if (parts.length === 2) {
        cards.push({
          question: `¿Por qué es importante comprender ${parts[0].trim()}? Explica su significado y relevancia.`,
          answer: `${parts[1].trim()}. Este concepto es fundamental porque ${parts[0].trim()} es clave para entender el tema en su conjunto. Su importancia radica en que permite comprender mejor los procesos y relaciones dentro del campo de estudio.`
        })
      }
    }

    // 2. Preguntas de aplicación
    cards.push({
      question: `¿Cómo se puede aplicar el siguiente concepto en un contexto profesional o académico: "${trimmedSentence}"?`,
      answer: `Este concepto se puede aplicar de varias formas:\n
1. Implementación práctica: ${trimmedSentence}\n
2. Contexto profesional: Utilizar este conocimiento para resolver problemas específicos del campo.\n
3. Aplicación académica: Desarrollar investigaciones o proyectos basados en estos principios.\n
4. Mejora continua: Usar este concepto como base para el desarrollo de nuevas ideas y soluciones.`
    })

    // 3. Preguntas de análisis
    cards.push({
      question: `Analiza críticamente las implicaciones y relaciones del siguiente concepto: "${trimmedSentence}"`,
      answer: `Análisis del concepto:\n
1. Fundamentos teóricos: ${trimmedSentence}\n
2. Implicaciones principales: Este concepto influye en múltiples aspectos del campo de estudio.\n
3. Relaciones con otros conceptos: Se conecta con diversos principios y teorías relacionadas.\n
4. Conclusiones: La comprensión de este concepto es esencial para un entendimiento profundo del tema.`
    })
  }

  console.log('Tarjetas generadas localmente:', cards.length)
  return shuffleArray(cards).slice(0, 5)
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'El texto es requerido' },
        { status: 400 }
      )
    }

    console.log('Recibida solicitud POST con texto:', text)
    const cards = await generateQuestionsFromText(text)
    console.log('Tarjetas generadas:', cards)

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Error en el endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Error al generar las tarjetas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 