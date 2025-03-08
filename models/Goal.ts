import mongoose, { Schema } from 'mongoose'

export interface IGoal {
  userId: string
  title: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  deadline?: Date
  progress: number // 0-100
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const GoalSchema = new Schema<IGoal>(
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
      trim: true,
      maxlength: 500
    },
    type: { 
      type: String, 
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    deadline: { 
      type: Date
    },
    progress: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100,
      default: 0
    },
    status: { 
      type: String, 
      required: true,
      enum: ['pending', 'in-progress', 'completed', 'overdue'],
      default: 'pending'
    },
    tags: [{ 
      type: String, 
      trim: true,
      maxlength: 30
    }]
  },
  { 
    timestamps: true 
  }
)

// Índices para búsquedas eficientes
GoalSchema.index({ userId: 1, type: 1 })
GoalSchema.index({ userId: 1, status: 1 })
GoalSchema.index({ userId: 1, tags: 1 })

// Métodos estáticos para operaciones comunes
GoalSchema.statics.findByUserAndStatus = async function(
  userId: string, 
  status: string
) {
  return this.find({
    userId,
    status
  }).sort({ deadline: 1, createdAt: -1 })
}

GoalSchema.statics.findActiveGoals = async function(
  userId: string
) {
  return this.find({
    userId,
    status: { $in: ['pending', 'in-progress'] }
  }).sort({ deadline: 1, createdAt: -1 })
}

// Antes de guardar, actualizar el estado según el progreso
GoalSchema.pre('save', function(next) {
  // Si el objetivo está completado o vencido, no cambiar el estado
  if (this.status === 'completed' || this.status === 'overdue') {
    return next()
  }
  
  // Actualizar estado según el progreso
  if (this.progress === 0) {
    this.status = 'pending'
  } else if (this.progress >= 100) {
    this.status = 'completed'
  } else {
    this.status = 'in-progress'
  }
  
  // Verificar si el objetivo está vencido
  if (this.deadline && new Date() > this.deadline && this.progress < 100) {
    this.status = 'overdue'
  }
  
  next()
})

const Goal = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema)

export default Goal 