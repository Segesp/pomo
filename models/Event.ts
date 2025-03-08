import mongoose, { Schema, Model } from 'mongoose'

export interface IEvent {
  userId: string
  title: string
  date: Date
  duration: number
  type: 'pomodoro' | 'study' | 'review' | 'test'
  completed: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Interfaz para métodos estáticos
interface EventModel extends Model<IEvent> {
  findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<IEvent[]>
  findUpcomingEvents(userId: string, limit?: number): Promise<IEvent[]>
  findCompletedEvents(userId: string, limit?: number): Promise<IEvent[]>
}

const EventSchema = new Schema<IEvent, EventModel>(
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
    date: { 
      type: Date, 
      required: true 
    },
    duration: { 
      type: Number, 
      required: true,
      min: 5,
      max: 240
    },
    type: { 
      type: String, 
      required: true,
      enum: ['pomodoro', 'study', 'review', 'test']
    },
    completed: { 
      type: Boolean, 
      default: false 
    },
    notes: { 
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { 
    timestamps: true 
  }
)

// Índices para búsquedas eficientes
EventSchema.index({ userId: 1, date: 1 })
EventSchema.index({ userId: 1, type: 1 })
EventSchema.index({ userId: 1, completed: 1 })

// Métodos estáticos para operaciones comunes
EventSchema.static('findByUserAndDateRange', async function(
  userId: string, 
  startDate: Date, 
  endDate: Date
) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 })
})

EventSchema.static('findUpcomingEvents', async function(
  userId: string,
  limit: number = 5
) {
  const currentDate = new Date()
  return this.find({
    userId,
    date: { $gte: currentDate },
    completed: false
  })
  .sort({ date: 1 })
  .limit(limit)
})

EventSchema.static('findCompletedEvents', async function(
  userId: string,
  limit: number = 10
) {
  return this.find({
    userId,
    completed: true
  })
  .sort({ date: -1 })
  .limit(limit)
})

const Event = (mongoose.models.Event || mongoose.model<IEvent, EventModel>('Event', EventSchema)) as EventModel

export default Event 