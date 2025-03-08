import mongoose, { Schema } from 'mongoose'

export interface IPetition {
  userId: string
  title: string
  description: string
  status: 'pending' | 'in-review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  type: 'clarification' | 'deepening' | 'example' | 'resources'
  tags: string[]
  response?: string
  responseDate?: Date
  createdAt: Date
  updatedAt: Date
}

const PetitionSchema = new Schema<IPetition>(
  {
    userId: { 
      type: String, 
      required: true, 
      index: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100
    },
    description: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 2000
    },
    status: { 
      type: String, 
      required: true,
      enum: ['pending', 'in-review', 'completed', 'cancelled'],
      default: 'pending'
    },
    priority: { 
      type: String, 
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    type: { 
      type: String, 
      required: true,
      enum: ['clarification', 'deepening', 'example', 'resources']
    },
    tags: [{ 
      type: String, 
      trim: true,
      maxlength: 30
    }],
    response: { 
      type: String,
      trim: true,
      maxlength: 5000
    },
    responseDate: { 
      type: Date
    }
  },
  { 
    timestamps: true 
  }
)

// Índices para búsquedas eficientes
PetitionSchema.index({ userId: 1, status: 1 })
PetitionSchema.index({ userId: 1, priority: 1 })
PetitionSchema.index({ userId: 1, type: 1 })

// Actualizar responseDate cuando se añade una respuesta
PetitionSchema.pre('save', function(next) {
  if (this.isModified('response') && this.response) {
    this.responseDate = new Date()
    if (this.status === 'pending' || this.status === 'in-review') {
      this.status = 'completed'
    }
  }
  next()
})

// Métodos estáticos para operaciones comunes
PetitionSchema.statics.findByUserAndStatus = async function(
  userId: string, 
  status: string | string[]
) {
  const statusFilter = Array.isArray(status) 
    ? { $in: status } 
    : status
    
  return this.find({
    userId,
    status: statusFilter
  }).sort({ priority: 1, createdAt: -1 })
}

PetitionSchema.statics.findActivePetitions = async function(
  userId: string
) {
  return this.find({
    userId,
    status: { $in: ['pending', 'in-review'] }
  }).sort({ priority: 1, createdAt: -1 })
}

PetitionSchema.statics.findRecentlyCompleted = async function(
  userId: string,
  limit: number = 5
) {
  return this.find({
    userId,
    status: 'completed'
  })
  .sort({ responseDate: -1 })
  .limit(limit)
}

const Petition = mongoose.models.Petition || mongoose.model<IPetition>('Petition', PetitionSchema)

export default Petition 