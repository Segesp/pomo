import mongoose, { Schema } from 'mongoose'

export interface IBookmark {
  userId: string
  paperId: string
  paperTitle: string
  authors: string[]
  year: number
  journal: string
  url: string
  techniques: string[]
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { 
      type: String, 
      required: true,
      index: true
    },
    paperId: { 
      type: String, 
      required: true 
    },
    paperTitle: { 
      type: String, 
      required: true,
      trim: true
    },
    authors: [{ 
      type: String,
      required: true 
    }],
    year: { 
      type: Number, 
      required: true 
    },
    journal: { 
      type: String, 
      required: true,
      trim: true
    },
    url: { 
      type: String, 
      required: true,
      trim: true
    },
    techniques: [{ 
      type: String,
      enum: ['pomodoro', 'spaced-repetition', 'active-recall', 'feynman']
    }],
    tags: [{ 
      type: String,
      trim: true 
    }],
    notes: { 
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { 
    timestamps: true 
  }
)

// Índices para búsquedas eficientes
BookmarkSchema.index({ userId: 1, paperId: 1 }, { unique: true })
BookmarkSchema.index({ userId: 1, techniques: 1 })
BookmarkSchema.index({ userId: 1, tags: 1 })

// Métodos estáticos para operaciones comunes
BookmarkSchema.statics.findByUserAndTechnique = async function(
  userId: string, 
  technique: string
) {
  return this.find({
    userId,
    techniques: technique
  }).sort({ createdAt: -1 })
}

BookmarkSchema.statics.findByUserAndTag = async function(
  userId: string, 
  tag: string
) {
  return this.find({
    userId,
    tags: tag
  }).sort({ createdAt: -1 })
}

BookmarkSchema.statics.addOrUpdate = async function(
  userId: string,
  paperData: Omit<IBookmark, 'userId' | 'createdAt' | 'updatedAt'>
) {
  const { paperId } = paperData
  
  // Buscar si ya existe
  const existingBookmark = await this.findOne({
    userId,
    paperId
  })
  
  if (existingBookmark) {
    // Actualizar
    return this.findOneAndUpdate(
      { userId, paperId },
      { $set: paperData },
      { new: true }
    )
  } else {
    // Crear nuevo
    return this.create({
      userId,
      ...paperData
    })
  }
}

const Bookmark = mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema)

export default Bookmark 